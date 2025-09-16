import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CloudRain, Sun, Cloud, CloudSnow, MapPin, Plus, Trash2, RefreshCw, Brain, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface WeatherData {
  location: string;
  current: {
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    pressure: number;
    visibility: number;
    uvIndex: number;
  };
  forecast: Array<{
    date: string;
    high: number;
    low: number;
    condition: string;
    precipitation: number;
    windSpeed: number;
  }>;
  alerts: Array<{
    type: string;
    title: string;
    message: string;
    priority: string;
  }>;
  farmingInsights: {
    irrigation: string;
    planting: string;
    harvesting: string;
    pestManagement: string;
  };
  aiPredictions?: {
    summary: string;
    confidence: number;
    recommendations: string[];
  };
}

interface WeatherWidgetProps {
  isPremium: boolean;
}

const WeatherWidget = ({ isPremium }: WeatherWidgetProps) => {
  const { toast } = useToast();
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(false);
  const [newLocation, setNewLocation] = useState('');

  useEffect(() => {
    loadWeatherData('Main Farm Location');
  }, []);

  const loadWeatherData = async (location: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('get-weather', {
        body: { location }
      });

      if (error) throw error;

      setWeatherData(prev => {
        const existing = prev.find(w => w.location === location);
        if (existing) {
          return prev.map(w => w.location === location ? data : w);
        }
        return [...prev, data];
      });
    } catch (error) {
      console.error('Error loading weather:', error);
      toast({
        title: 'Error',
        description: 'Failed to load weather data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
        return <Sun className="w-8 h-8 text-yellow-500" />;
      case 'rainy':
        return <CloudRain className="w-8 h-8 text-blue-500" />;
      case 'cloudy':
      case 'partly cloudy':
        return <Cloud className="w-8 h-8 text-gray-500" />;
      case 'snowy':
        return <CloudSnow className="w-8 h-8 text-blue-300" />;
      default:
        return <Sun className="w-8 h-8 text-yellow-500" />;
    }
  };

  const handleAddLocation = async () => {
    if (!isPremium) {
      toast({
        title: 'Premium Feature',
        description: 'Upgrade to Premium to add multiple locations',
        variant: 'destructive'
      });
      return;
    }

    if (!newLocation.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a location name',
        variant: 'destructive'
      });
      return;
    }

    await loadWeatherData(newLocation);
    setNewLocation('');
    toast({
      title: 'Location Added',
      description: `Weather data for ${newLocation} has been added`
    });
  };

  const handleRemoveLocation = (index: number) => {
    if (index === 0) {
      toast({
        title: 'Cannot Remove',
        description: 'Cannot remove your primary location',
        variant: 'destructive'
      });
      return;
    }

    const newData = weatherData.filter((_, i) => i !== index);
    setWeatherData(newData);
    toast({
      title: 'Location Removed',
      description: 'Weather location has been removed'
    });
  };

  const refreshAllWeather = async () => {
    setLoading(true);
    for (const weather of weatherData) {
      await loadWeatherData(weather.location);
    }
    setLoading(false);
    toast({
      title: 'Weather Updated',
      description: 'All weather data has been refreshed'
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Weather Predictions</h2>
          <p className="text-muted-foreground">
            AI-powered weather forecasting for your farm locations
          </p>
        </div>
        <Button onClick={refreshAllWeather} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh All
        </Button>
      </div>

      {/* Add Location */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Location</CardTitle>
          <CardDescription>
            {isPremium 
              ? 'Add multiple farm locations for comprehensive weather predictions'
              : 'Upgrade to Premium to monitor multiple locations with AI predictions'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              placeholder="Enter location name..."
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              disabled={!isPremium}
              onKeyPress={(e) => e.key === 'Enter' && handleAddLocation()}
            />
            <Button onClick={handleAddLocation} disabled={!isPremium || loading}>
              <Plus className="w-4 h-4 mr-2" />
              Add Location
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Weather Prediction Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {weatherData.map((weather, index) => (
          <Card key={index} className="relative">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <CardTitle className="text-lg">{weather.location}</CardTitle>
                  {index === 0 && <Badge variant="outline">Primary</Badge>}
                </div>
                {index > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveLocation(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Weather */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {getWeatherIcon(weather.current.condition)}
                  <div>
                    <div className="text-3xl font-bold">{weather.current.temperature}°C</div>
                    <div className="text-sm text-muted-foreground">{weather.current.condition}</div>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Humidity:</span> {weather.current.humidity}%
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Wind:</span> {weather.current.windSpeed} km/h
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">UV Index:</span> {weather.current.uvIndex}
                  </div>
                </div>
              </div>

              {/* AI Predictions */}
              {weather.aiPredictions && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center space-x-2 mb-2">
                    <Brain className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      AI Weather Prediction (Confidence: {weather.aiPredictions.confidence}%)
                    </span>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                    {weather.aiPredictions.summary}
                  </p>
                  <div className="space-y-1">
                    {weather.aiPredictions.recommendations.map((rec, idx) => (
                      <div key={idx} className="text-xs text-blue-600 dark:text-blue-400">
                        • {rec}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 14-Day Forecast */}
              <div>
                <h4 className="font-semibold mb-3">14-Day Weather Prediction</h4>
                <div className="grid grid-cols-7 gap-2">
                  {weather.forecast.slice(0, 7).map((day, dayIndex) => (
                    <div key={dayIndex} className="text-center p-2 bg-muted rounded">
                      <div className="text-xs font-medium mb-1">{formatDate(day.date)}</div>
                      <div className="flex justify-center mb-1 scale-75">
                        {getWeatherIcon(day.condition)}
                      </div>
                      <div className="text-xs">
                        <div className="font-semibold">{day.high}°</div>
                        <div className="text-muted-foreground">{day.low}°</div>
                        <div className="text-blue-600">{day.precipitation}%</div>
                      </div>
                    </div>
                  ))}
                </div>
                {weather.forecast.length > 7 && (
                  <div className="grid grid-cols-7 gap-2 mt-2">
                    {weather.forecast.slice(7, 14).map((day, dayIndex) => (
                      <div key={dayIndex + 7} className="text-center p-2 bg-muted/50 rounded">
                        <div className="text-xs font-medium mb-1">{formatDate(day.date)}</div>
                        <div className="flex justify-center mb-1 scale-75">
                          {getWeatherIcon(day.condition)}
                        </div>
                        <div className="text-xs">
                          <div className="font-semibold">{day.high}°</div>
                          <div className="text-muted-foreground">{day.low}°</div>
                          <div className="text-blue-600">{day.precipitation}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Weather Alerts */}
              {weather.alerts.map((alert, alertIndex) => (
                <div key={alertIndex} className={`p-3 rounded-lg border ${
                  alert.priority === 'high' 
                    ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800'
                    : alert.priority === 'medium'
                    ? 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800'
                    : 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'
                }`}>
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className={`w-4 h-4 ${
                      alert.priority === 'high' ? 'text-red-600' : 
                      alert.priority === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                    }`} />
                    <span className={`text-sm font-medium ${
                      alert.priority === 'high' ? 'text-red-800 dark:text-red-200' : 
                      alert.priority === 'medium' ? 'text-yellow-800 dark:text-yellow-200' : 'text-blue-800 dark:text-blue-200'
                    }`}>
                      {alert.title}
                    </span>
                  </div>
                  <p className={`text-sm mt-1 ${
                    alert.priority === 'high' ? 'text-red-700 dark:text-red-300' : 
                    alert.priority === 'medium' ? 'text-yellow-700 dark:text-yellow-300' : 'text-blue-700 dark:text-blue-300'
                  }`}>
                    {alert.message}
                  </p>
                </div>
              ))}

              {/* Farming Insights */}
              <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                <h5 className="font-medium text-green-800 dark:text-green-200 mb-2">Farming Insights</h5>
                <div className="space-y-2 text-sm text-green-700 dark:text-green-300">
                  <div><strong>Irrigation:</strong> {weather.farmingInsights.irrigation}</div>
                  <div><strong>Planting:</strong> {weather.farmingInsights.planting}</div>
                  <div><strong>Harvesting:</strong> {weather.farmingInsights.harvesting}</div>
                  <div><strong>Pest Management:</strong> {weather.farmingInsights.pestManagement}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Premium Feature Promotion */}
      {!isPremium && weatherData.length <= 1 && (
        <Card className="border-2 border-dashed border-muted-foreground/20">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex items-center space-x-2 mb-4">
              <Brain className="w-12 h-12 text-muted-foreground" />
              <MapPin className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Unlock Advanced Weather Predictions</h3>
            <p className="text-muted-foreground mb-4">
              Get AI-powered forecasts, multiple locations, and detailed farming insights with Premium
            </p>
            <Button variant="outline">Upgrade to Premium</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WeatherWidget;