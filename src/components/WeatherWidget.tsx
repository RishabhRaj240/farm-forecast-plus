import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CloudRain, Sun, Cloud, CloudSnow, MapPin, Plus, Trash2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  forecast: Array<{
    day: string;
    high: number;
    low: number;
    condition: string;
  }>;
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
    // Load default weather data
    setWeatherData([
      {
        location: 'Main Farm Location',
        temperature: 22,
        condition: 'Partly Cloudy',
        humidity: 65,
        windSpeed: 12,
        forecast: [
          { day: 'Today', high: 24, low: 18, condition: 'Partly Cloudy' },
          { day: 'Tomorrow', high: 26, low: 19, condition: 'Sunny' },
          { day: 'Thursday', high: 23, low: 17, condition: 'Rainy' },
          { day: 'Friday', high: 25, low: 20, condition: 'Sunny' },
          { day: 'Saturday', high: 27, low: 21, condition: 'Cloudy' }
        ]
      }
    ]);
  }, []);

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

  const handleAddLocation = () => {
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

    // Mock adding new location
    const newWeatherData: WeatherData = {
      location: newLocation,
      temperature: Math.floor(Math.random() * 15) + 15,
      condition: ['Sunny', 'Cloudy', 'Partly Cloudy', 'Rainy'][Math.floor(Math.random() * 4)],
      humidity: Math.floor(Math.random() * 30) + 50,
      windSpeed: Math.floor(Math.random() * 20) + 5,
      forecast: [
        { day: 'Today', high: 24, low: 18, condition: 'Sunny' },
        { day: 'Tomorrow', high: 26, low: 19, condition: 'Cloudy' },
        { day: 'Thursday', high: 23, low: 17, condition: 'Rainy' },
        { day: 'Friday', high: 25, low: 20, condition: 'Sunny' },
        { day: 'Saturday', high: 27, low: 21, condition: 'Partly Cloudy' }
      ]
    };

    setWeatherData([...weatherData, newWeatherData]);
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

  const refreshWeather = () => {
    setLoading(true);
    // Mock refresh delay
    setTimeout(() => {
      setLoading(false);
      toast({
        title: 'Weather Updated',
        description: 'Latest weather data has been loaded'
      });
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Weather Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor weather conditions across your farm locations
          </p>
        </div>
        <Button onClick={refreshWeather} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Add Location */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Location</CardTitle>
          <CardDescription>
            {isPremium 
              ? 'Add multiple farm locations to monitor weather conditions'
              : 'Upgrade to Premium to monitor multiple locations'
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
            />
            <Button onClick={handleAddLocation} disabled={!isPremium}>
              <Plus className="w-4 h-4 mr-2" />
              Add Location
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Weather Cards */}
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
            <CardContent className="space-y-4">
              {/* Current Weather */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {getWeatherIcon(weather.condition)}
                  <div>
                    <div className="text-3xl font-bold">{weather.temperature}°C</div>
                    <div className="text-sm text-muted-foreground">{weather.condition}</div>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Humidity:</span> {weather.humidity}%
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Wind:</span> {weather.windSpeed} km/h
                  </div>
                </div>
              </div>

              {/* 5-Day Forecast */}
              <div>
                <h4 className="font-semibold mb-3">5-Day Forecast</h4>
                <div className="grid grid-cols-5 gap-2">
                  {weather.forecast.map((day, dayIndex) => (
                    <div key={dayIndex} className="text-center p-2 bg-muted rounded">
                      <div className="text-xs font-medium mb-1">{day.day}</div>
                      <div className="flex justify-center mb-1">
                        {getWeatherIcon(day.condition)}
                      </div>
                      <div className="text-xs">
                        <div className="font-semibold">{day.high}°</div>
                        <div className="text-muted-foreground">{day.low}°</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weather Alerts */}
              <div className="p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Weather Alert
                  </span>
                </div>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Rain expected tomorrow evening. Consider adjusting irrigation schedule.
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Premium Feature Promotion */}
      {!isPremium && weatherData.length === 1 && (
        <Card className="border-2 border-dashed border-muted-foreground/20">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <MapPin className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Add More Locations</h3>
            <p className="text-muted-foreground mb-4">
              Monitor weather across multiple farm locations with Premium
            </p>
            <Button variant="outline">Upgrade to Premium</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WeatherWidget;