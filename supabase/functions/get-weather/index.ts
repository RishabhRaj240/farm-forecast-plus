import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { location } = await req.json();
    
    if (!location) {
      throw new Error('Location is required');
    }

    // Mock weather data for demo (in production, you'd use a real weather API)
    const mockWeatherData = {
      location: location,
      current: {
        temperature: Math.floor(Math.random() * 20) + 15, // 15-35°C
        condition: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy'][Math.floor(Math.random() * 4)],
        humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
        windSpeed: Math.floor(Math.random() * 25) + 5, // 5-30 km/h
        pressure: Math.floor(Math.random() * 100) + 1000, // 1000-1100 hPa
        visibility: Math.floor(Math.random() * 15) + 5, // 5-20 km
        uvIndex: Math.floor(Math.random() * 11), // 0-10
      },
      forecast: Array.from({ length: 14 }, (_, i) => ({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        high: Math.floor(Math.random() * 15) + 20,
        low: Math.floor(Math.random() * 10) + 10,
        condition: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy'][Math.floor(Math.random() * 4)],
        precipitation: Math.floor(Math.random() * 10),
        windSpeed: Math.floor(Math.random() * 20) + 5,
      })),
      alerts: [
        {
          type: 'info',
          title: 'Optimal Irrigation Time',
          message: 'Current conditions are ideal for watering crops. Humidity and temperature are in optimal range.',
          priority: 'low'
        }
      ],
      farmingInsights: {
        irrigation: 'Recommended between 6-8 AM based on current humidity levels',
        planting: 'Good conditions for planting cool-season crops',
        harvesting: 'Dry conditions expected - good for harvesting grains',
        pestManagement: 'Low pest activity expected due to weather conditions'
      }
    };

    return new Response(JSON.stringify(mockWeatherData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error in get-weather function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});