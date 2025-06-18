import axios from 'axios'
import React, { useState, useEffect } from 'react'
import { FaWind, FaTint, FaLocationArrow, FaSpinner, FaSearch, FaThermometerHalf, FaEye } from 'react-icons/fa'
import { WiDaySunny, WiRain, WiSnow, WiThunderstorm, WiFog, WiCloudy, WiDayCloudy } from 'react-icons/wi'

interface Props {
  name: string;
  main: {
    temp: number;
    humidity: number;
    feels_like: number;
    pressure: number;
  };
  weather: {
    description: string;
    icon: string;
    main: string;
  }[];
  wind: {
    speed: number;
  };
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
  visibility: number;
}

interface ForecastProps {
  dt: number;
  main: {
    temp: number;
    humidity: number;
  };
  weather: {
    icon: string;
    main: string;
    description: string;
  }[];
  wind: {
    speed: number;
  };
}

function Weather() {
  const [weather, setWeather] = useState<Props | null>(null);
  const [forecast, setForecast] = useState<ForecastProps[]>([]);
  const [city, setCity] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isCelsius, setIsCelsius] = useState<boolean>(true);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const apiKey = '83c432e9428909741098643d5a4bc8d5';

  const getWeatherIcon = (weatherMain: string) => {
    switch (weatherMain) {
      case 'Clear': return <WiDaySunny className="text-5xl text-yellow-400" />;
      case 'Rain': return <WiRain className="text-5xl text-blue-400" />;
      case 'Snow': return <WiSnow className="text-5xl text-blue-300" />;
      case 'Thunderstorm': return <WiThunderstorm className="text-5xl text-purple-500" />;
      case 'Fog': return <WiFog className="text-5xl text-gray-400" />;
      case 'Clouds': return <WiDayCloudy className="text-5xl text-gray-100" />;
      default: return <WiCloudy className="text-5xl text-gray-300" />;
    }
  };

  const getLargeWeatherIcon = (weatherMain: string) => {
    switch (weatherMain) {
      case 'Clear': return <WiDaySunny className="text-8xl text-yellow-400" />;
      case 'Rain': return <WiRain className="text-8xl text-blue-400" />;
      case 'Snow': return <WiSnow className="text-8xl text-blue-300" />;
      case 'Thunderstorm': return <WiThunderstorm className="text-8xl text-purple-500" />;
      case 'Fog': return <WiFog className="text-8xl text-gray-400" />;
      case 'Clouds': return <WiDayCloudy className="text-8xl text-gray-100" />;
      default: return <WiCloudy className="text-8xl text-gray-300" />;
    }
  };

  const convertTemp = (temp: number) => {
    return isCelsius ? temp : (temp * 9/5) + 32;
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    if (hour >= 17 && hour < 21) return 'Good Evening';
    return 'Good Night';
  };

  const fetchWeatherData = async (cityName: string) => {
    try {
      setLoading(true);
      setError("");
      const [weatherRes, forecastRes] = await Promise.all([
        axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`),
        axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=metric`)
      ]);
      
      setWeather(weatherRes.data);
      setForecast(forecastRes.data.list.slice(0, 5));
      
      // Update search history
      setSearchHistory(prev => {
        const newHistory = [cityName, ...prev.filter(c => c !== cityName)].slice(0, 5);
        localStorage.setItem('searchHistory', JSON.stringify(newHistory));
        return newHistory;
      });
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError("City not found. Please check the spelling and try again.");
      } else if (err.response?.status === 429) {
        setError("Too many requests. Please wait a moment and try again.");
      } else {
        setError("Network error. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            setLoading(true);
            setError("");
            const { latitude, longitude } = position.coords;
            const [weatherRes, forecastRes] = await Promise.all([
              axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`),
              axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`)
            ]);
            setWeather(weatherRes.data);
            setForecast(forecastRes.data.list.slice(0, 5));
          } catch (err) {
            setError("Error fetching weather data for your location.");
          } finally {
            setLoading(false);
          }
        },
        () => setError("Unable to get your location. Please enable location services.")
      );
    }
  };

  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
    
    // Initial weather fetch for a default city
    if (!weather) {
      fetchWeatherData('New York');
    }
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (city.trim()) {
      fetchWeatherData(city);
      setCity("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-6">
          <div className="text-center mb-4">
            <h1 className="text-white text-sm opacity-80">{getTimeOfDay()}</h1>
          </div>

          <form onSubmit={handleSubmit} className="flex mb-6 bg-white/20 backdrop-blur-sm rounded-full overflow-hidden border border-white/30">   
            <input 
              type='text' 
              placeholder='Search for a city...' 
              value={city} 
              onChange={(e) => setCity(e.target.value)}
              className="flex-1 px-4 py-3 bg-transparent text-white placeholder-white/70 border-none focus:outline-none"
            />
            <button 
              type="submit"
              className="px-4 py-3 focus:outline-none hover:bg-white/10 transition-colors"
              disabled={loading}
            >
              {loading ? <FaSpinner className="text-white animate-spin" /> : <FaSearch className="text-white" />}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-500/20 backdrop-blur-sm text-red-100 rounded-lg border border-red-400/30">
              {error}
            </div>
          )}

          {weather && (
            <>
              <div className="flex flex-col items-center">
                <div className="mb-2 animate-pulse">
                  {getLargeWeatherIcon(weather.weather[0].main)}
                </div>
                <h1 className="text-6xl font-bold text-white mb-1">
                  {Math.round(convertTemp(weather.main.temp))}°{isCelsius ? 'C' : 'F'}
                </h1>
                <h2 className="text-2xl text-white mb-2">{weather.name}</h2>
                <p className="text-white/80 capitalize mb-6">{weather.weather[0].description}</p>
                
                <div className="flex justify-between w-full mb-4">
                  <div className="flex items-center text-white">
                    <FaTint className="mr-2" />
                    <div>
                      <p className="font-semibold">{weather.main.humidity}%</p>
                      <p className="text-sm text-white/70">Humidity</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-white">
                    <FaWind className="mr-2" />
                    <div>
                      <p className="font-semibold">{weather.wind.speed} km/h</p>
                      <p className="text-sm text-white/70">Wind Speed</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-white/80 text-sm hover:text-white transition-colors"
                >
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </button>

                {showDetails && (
                  <div className="w-full mt-4 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                    <div className="grid grid-cols-2 gap-4 text-white">
                      <div className="flex items-center">
                        <FaThermometerHalf className="mr-2" />
                        <div>
                          <p className="text-sm text-white/70">Feels Like</p>
                          <p className="font-semibold">{Math.round(convertTemp(weather.main.feels_like))}°</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <FaEye className="mr-2" />
                        <div>
                          <p className="text-sm text-white/70">Visibility</p>
                          <p className="font-semibold">{(weather.visibility / 1000).toFixed(1)} km</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-white/70">Sunrise</p>
                        <p className="font-semibold">{formatTime(weather.sys.sunrise)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-white/70">Sunset</p>
                        <p className="font-semibold">{formatTime(weather.sys.sunset)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        
        {searchHistory.length > 0 && (
          <div className="p-4 bg-indigo-700/50 backdrop-blur-sm">
            <h2 className="text-sm font-semibold text-indigo-200 mb-2">Recent Searches</h2>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((city, index) => (
                <button
                  key={index}
                  onClick={() => fetchWeatherData(city)}
                  className="px-3 py-1 bg-indigo-500/50 text-white rounded-full text-sm hover:bg-indigo-400/50 transition-colors duration-200 backdrop-blur-sm"
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {forecast.length > 0 && (
          <div className="p-4 bg-indigo-500/50 backdrop-blur-sm">
            <h2 className="text-sm font-semibold text-white mb-2">5-Hour Forecast</h2>
            <div className="grid grid-cols-5 gap-2">
              {forecast.map((item, index) => (
                <div key={index} className="text-center">
                  <p className="text-xs text-indigo-200">
                    {new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <div className="my-1">
                    {getWeatherIcon(item.weather[0].main)}
                  </div>
                  <p className="text-sm font-semibold text-white">
                    {Math.round(convertTemp(item.main.temp))}°
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="p-3 bg-indigo-800/50 backdrop-blur-sm flex justify-center gap-2">
          <button
            onClick={() => setIsCelsius(!isCelsius)}
            className="px-4 py-1 bg-indigo-600/50 text-white rounded-full text-sm hover:bg-indigo-500/50 transition-colors duration-200 backdrop-blur-sm"
          >
            Switch to {isCelsius ? '°F' : '°C'}
          </button>
          <button
            onClick={getCurrentLocation}
            className="px-4 py-1 bg-indigo-600/50 text-white rounded-full text-sm hover:bg-indigo-500/50 transition-colors duration-200 backdrop-blur-sm"
          >
            <FaLocationArrow className="inline mr-1" /> My Location
          </button>
        </div>
      </div>
    </div>
  );
}

export default Weather;