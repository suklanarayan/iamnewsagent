import React, { useState, useEffect, useRef } from 'react';
import {
  CloudSun,
  MapPin,
  RefreshCw,
  Search,
  Wind,
  Droplets,
  ChevronDown,
  Navigation,
  Check,
} from 'lucide-react';
import {
  PRESET_CITIES,
  fetchLiveWeather,
  searchCities,
  type CityWeatherInfo,
} from '../services/weatherService';

export const LiveWeatherDropdown: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState(PRESET_CITIES[0]);
  const [weather, setWeather] = useState<CityWeatherInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ name: string; country: string; lat: number; lon: number }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load weather when selectedCity changes
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await fetchLiveWeather(
          selectedCity.name,
          selectedCity.lat,
          selectedCity.lon,
          selectedCity.country
        );
        if (isMounted) {
          setWeather(data);
        }
      } catch (err) {
        console.error('Weather load error:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [selectedCity]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search for custom cities
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchCities(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Browser Geolocation Detection
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser');
      return;
    }
    setIsLoading(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const userWeather = await fetchLiveWeather('My Location', lat, lon, undefined, true);
          setWeather(userWeather);
          setSelectedCity({
            name: 'My Location',
            country: 'Local',
            lat,
            lon,
          });
          setIsOpen(false);
        } catch (e) {
          setGeoError('Failed to fetch weather for your coordinates');
        } finally {
          setIsLoading(false);
        }
      },
      (err) => {
        setIsLoading(false);
        setGeoError('Location permission denied or unavailable');
      },
      { timeout: 8000 }
    );
  };

  // Manual refresh
  const handleRefresh = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);
    try {
      const data = await fetchLiveWeather(
        selectedCity.name,
        selectedCity.lat,
        selectedCity.lon,
        selectedCity.country
      );
      setWeather(data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Trigger Button in Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer group text-xs text-slate-700 font-medium"
        title="Click to view live weather station & change city"
      >
        <span className="text-sm">{weather?.icon || '☀️'}</span>
        <span className="group-hover:text-red-700 transition-colors font-semibold">
          {weather?.name || selectedCity.name}
        </span>
        <span className="font-bold text-slate-900 font-mono">
          {isLoading ? '...' : (weather?.tempDisplay || '28°C')}
        </span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-red-700' : ''}`} />
      </button>

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 p-4 space-y-3 animate-in fade-in zoom-in-95">
          {/* Header of popover */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <CloudSun className="w-4 h-4 text-red-600" />
              <span className="text-xs font-bold text-slate-900 tracking-tight">
                Live Meteorology Desk
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleRefresh}
                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                title="Refresh Live Data"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin text-red-600' : ''}`} />
              </button>
              <span className="text-[10px] text-emerald-600 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </div>
          </div>

          {/* Active City Weather Highlight Box */}
          <div className="p-3 rounded-lg bg-gradient-to-br from-slate-50 to-slate-100/70 border border-slate-200/80 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1 text-xs font-bold text-slate-900">
                <MapPin className="w-3.5 h-3.5 text-red-600" />
                <span>{weather?.name || selectedCity.name}</span>
                {selectedCity.country && (
                  <span className="text-[10px] text-slate-500 font-normal">
                    ({selectedCity.country})
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-600 mt-0.5 flex items-center gap-1.5">
                <span>{weather?.condition || 'Clear Sky'}</span>
                <span className="text-slate-300">&bull;</span>
                <span className="text-[10px] text-slate-500">Updated {weather?.updatedAt}</span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold font-mono text-slate-900 flex items-center justify-end gap-1">
                <span>{weather?.icon}</span>
                <span>{weather?.tempDisplay}</span>
              </div>
            </div>
          </div>

          {/* Extra Metrics: Wind & Humidity */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
            <div className="flex items-center gap-1.5 p-2 rounded bg-slate-50 border border-slate-100">
              <Wind className="w-3.5 h-3.5 text-slate-400" />
              <span>Wind: {weather?.windSpeed || 10} km/h</span>
            </div>
            <div className="flex items-center gap-1.5 p-2 rounded bg-slate-50 border border-slate-100">
              <Droplets className="w-3.5 h-3.5 text-slate-400" />
              <span>Humidity: {weather?.humidity ? `${weather.humidity}%` : '55%'}</span>
            </div>
          </div>

          {/* Detect User Location Button */}
          <button
            type="button"
            onClick={handleDetectLocation}
            className="w-full py-1.5 px-2.5 rounded-lg border border-slate-200 hover:border-red-300 bg-white hover:bg-red-50/50 text-slate-700 hover:text-red-700 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5 text-red-600" />
            <span>Detect My Current Location</span>
          </button>
          {geoError && (
            <p className="text-[10px] text-red-600 text-center">{geoError}</p>
          )}

          {/* City Search Bar */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search any global city (e.g. Pune, Paris)..."
              className="w-full pl-7 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2 pointer-events-none" />
          </div>

          {/* Search Results if any */}
          {searchResults.length > 0 && (
            <div className="space-y-1 max-h-28 overflow-y-auto border border-slate-100 rounded-lg p-1 bg-white">
              {searchResults.map((city, idx) => (
                <button
                  key={`${city.name}-${city.lat}-${idx}`}
                  type="button"
                  onClick={() => {
                    setSelectedCity(city);
                    setSearchQuery('');
                    setSearchResults([]);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-2 py-1 rounded text-xs text-slate-700 hover:bg-slate-100 flex items-center justify-between"
                >
                  <span className="font-medium truncate">{city.name}</span>
                  <span className="text-[10px] text-slate-400 shrink-0">{city.country}</span>
                </button>
              ))}
            </div>
          )}

          {/* Quick Preset City Chips */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Major Editorial Desks
            </span>
            <div className="flex flex-wrap gap-1">
              {PRESET_CITIES.map((c) => {
                const isSelected = selectedCity.name === c.name;
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => {
                      setSelectedCity(c);
                      setIsOpen(false);
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                      isSelected
                        ? 'bg-red-700 text-white font-semibold shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isSelected && <Check className="w-2.5 h-2.5" />}
                    <span>{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
