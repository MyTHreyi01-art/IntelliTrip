const describeWeatherCode = (code) => {
  if (code === 0) return 'Clear';
  if (code <= 3) return 'Cloudy';
  if (code <= 48) return 'Fog';
  if (code <= 57) return 'Drizzle';
  if (code <= 67) return 'Rain';
  if (code <= 77) return 'Snow';
  if (code <= 82) return 'Rain showers';
  if (code <= 86) return 'Snow showers';
  return 'Thunderstorm';
};

export const weatherService = {
  getCurrentWeather: async (place) => {
    const search = new URLSearchParams({ name: place, count: '10', language: 'en', format: 'json' });
    const locationResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${search}`);
    if (!locationResponse.ok) throw new Error('Could not locate destination for weather');

    const locationData = await locationResponse.json();
    const location = locationData.results?.find((result) => result.country_code === 'IN') || locationData.results?.[0];
    if (!location) throw new Error('No weather location found');

    const params = new URLSearchParams({
      latitude: location.latitude,
      longitude: location.longitude,
      current: 'temperature_2m,precipitation,weather_code,wind_speed_10m',
      timezone: 'auto'
    });
    const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
    if (!weatherResponse.ok) throw new Error('Current weather is unavailable');

    const weatherData = await weatherResponse.json();
    const current = weatherData.current;
    return {
      place: location.name,
      condition: describeWeatherCode(current.weather_code),
      temperature: Math.round(current.temperature_2m),
      precipitation: current.precipitation,
      windSpeed: Math.round(current.wind_speed_10m),
      observedAt: current.time
    };
  }
};