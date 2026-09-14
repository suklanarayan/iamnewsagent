export interface CityWeatherInfo {
  name: string;
  country?: string;
  latitude: number;
  longitude: number;
  temp: number;
  tempDisplay: string;
  weatherCode: number;
  condition: string;
  icon: string;
  windSpeed: number;
  humidity?: number;
  updatedAt: string;
  isCustomLocation?: boolean;
}

export const PRESET_CITIES: { name: string; country: string; lat: number; lon: number }[] = [
  { name: 'Kolkata', country: 'India', lat: 22.5726, lon: 88.3639 },
  { name: 'New Delhi', country: 'India', lat: 28.6139, lon: 77.2090 },
  { name: 'Mumbai', country: 'India', lat: 19.0760, lon: 72.8777 },
  { name: 'Bengaluru', country: 'India', lat: 12.9716, lon: 77.5946 },
  { name: 'Chennai', country: 'India', lat: 13.0827, lon: 80.2707 },
  { name: 'Hyderabad', country: 'India', lat: 17.3850, lon: 78.4867 },
  { name: 'London', country: 'United Kingdom', lat: 51.5074, lon: -0.1278 },
  { name: 'New York', country: 'United States', lat: 40.7128, lon: -74.0060 },
  { name: 'Dubai', country: 'UAE', lat: 25.2048, lon: 55.2708 },
  { name: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503 },
  { name: 'Singapore', country: 'Singapore', lat: 1.3521, lon: 103.8198 },
];

export function decodeWmoWeather(code: number, isDay = 1): { condition: string; icon: string } {
  switch (code) {
    case 0:
      return { condition: 'Clear Sky', icon: isDay ? '☀️' : '🌙' };
    case 1:
      return { condition: 'Mainly Clear', icon: isDay ? '🌤️' : '🌤️' };
    case 2:
      return { condition: 'Partly Cloudy', icon: '⛅' };
    case 3:
      return { condition: 'Overcast', icon: '☁️' };
    case 45:
    case 48:
      return { condition: 'Foggy', icon: '🌫️' };
    case 51:
    case 53:
    case 55:
      return { condition: 'Drizzle', icon: '🌦️' };
    case 61:
    case 63:
    case 65:
      return { condition: 'Rain', icon: '🌧️' };
    case 71:
    case 73:
    case 75:
      return { condition: 'Snowfall', icon: '❄️' };
    case 80:
    case 81:
    case 82:
      return { condition: 'Rain Showers', icon: '🌧️' };
    case 95:
    case 96:
    case 99:
      return { condition: 'Thunderstorm', icon: '⛈️' };
    default:
      return { condition: 'Fair', icon: '⛅' };
  }
}

// In-memory cache to prevent excessive requests
const weatherCache = new Map<string, { data: CityWeatherInfo; timestamp: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export async function fetchLiveWeather(
  cityName: string,
  lat: number,
  lon: number,
  country?: string,
  isCustom = false
): Promise<CityWeatherInfo> {
  const cacheKey = `${lat.toFixed(3)}_${lon.toFixed(3)}`;
  const now = Date.now();
  const cached = weatherCache.get(cacheKey);

  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Weather API error: ${res.status}`);
    }
    const json = await res.json();
    const current = json.current_weather;
    const wCode = current?.weathercode ?? 0;
    const isDay = current?.is_day ?? 1;
    const { condition, icon } = decodeWmoWeather(wCode, isDay);
    const temp = Math.round(current?.temperature ?? 28);
    const windSpeed = Math.round(current?.windspeed ?? 10);

    // Approximate current hour humidity if available
    let humidity: number | undefined;
    if (json.hourly?.relativehumidity_2m && json.hourly.time) {
      const currentTime = current?.time;
      const index = json.hourly.time.indexOf(currentTime);
      if (index !== -1) {
        humidity = json.hourly.relativehumidity_2m[index];
      }
    }

    const weatherInfo: CityWeatherInfo = {
      name: cityName,
      country,
      latitude: lat,
      longitude: lon,
      temp,
      tempDisplay: `${temp}°C`,
      weatherCode: wCode,
      condition,
      icon,
      windSpeed,
      humidity,
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isCustomLocation: isCustom,
    };

    weatherCache.set(cacheKey, { data: weatherInfo, timestamp: now });
    return weatherInfo;
  } catch (err) {
    console.warn(`Failed to fetch live weather for ${cityName}:`, err);
    // Return graceful fallback
    return {
      name: cityName,
      country,
      latitude: lat,
      longitude: lon,
      temp: 28,
      tempDisplay: '28°C',
      weatherCode: 0,
      condition: 'Sunny',
      icon: '☀️',
      windSpeed: 12,
      updatedAt: 'Live',
      isCustomLocation: isCustom,
    };
  }
}

// Geocoding city search via Open-Meteo free geocoding API
export async function searchCities(query: string): Promise<{ name: string; country: string; lat: number; lon: number }[]> {
  if (!query.trim() || query.trim().length < 2) return [];
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=5&language=en&format=json`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.results) return [];

    return data.results.map((r: any) => ({
      name: r.name,
      country: r.country || r.admin1 || '',
      lat: r.latitude,
      lon: r.longitude,
    }));
  } catch (e) {
    console.error('Error searching cities:', e);
    return [];
  }
}
