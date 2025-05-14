import axios from 'axios'
import React, { useState, useEffect } from 'react'
import { FaTemperatureHigh, FaWind, FaTint, FaLocationArrow, FaSpinner } from 'react-icons/fa'
import { WiDaySunny, WiRain, WiSnow, WiThunderstorm, WiFog, WiCloudy } from 'react-icons/wi'

interface Props {
  name: string;
  main: {
    temp: number;
    humidity: number;
    feels_like: number;
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
  };
}

interface ForecastProps {
  dt: number;
  main: {
    temp: number;
  };
  weather: {
    icon: string;
    main: string;
  }[];
}

function Weather() {
  const [weather, setWeather] = useState<Props | null>(null);
  const [forecast, setForecast] = useState<ForecastProps[]>([]);
  const [city, setCity] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isCelsius, setIsCelsius] = useState<boolean>(true);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const apiKey = '83c432e9428909741098643d5a4bc8d5';

  const getWeatherIcon = (weatherMain: string) => {
    switch (weatherMain) {
      case 'Clear': return <WiDaySunny className="text-5xl text-yellow-500" />;
      case 'Rain': return <WiRain className="text-5xl text-blue-500" />;
      case 'Snow': return <WiSnow className="text-5xl text-blue-300" />;
      case 'Thunderstorm': return <WiThunderstorm className="text-5xl text-purple-500" />;
      case 'Fog': return <WiFog className="text-5xl text-gray-400" />;
      default: return <WiCloudy className="text-5xl text-gray-500" />;
    }
  };

  const convertTemp = (temp: number) => {
    return isCelsius ? temp : (temp * 9/5) + 32;
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
    } catch (err) {
      setError("City not found. Please try again.");
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
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (city.trim()) {
      fetchWeatherData(city);
      setCity("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-blue-600 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Weather Forecast</h1>
            <button
              onClick={() => setIsCelsius(!isCelsius)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              {isCelsius ? '°C' : '°F'}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex gap-4">   
            <input 
              type='text' 
              placeholder='Enter city name' 
              value={city} 
              onChange={(e) => setCity(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button 
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              disabled={loading}
            >
              {loading ? <FaSpinner className="animate-spin" /> : 'Search'}
            </button>
            <button
              type="button"
              onClick={getCurrentLocation}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              disabled={loading}
            >
              <FaLocationArrow />
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {searchHistory.length > 0 && (
            <div className="mt-4">
              <h2 className="text-sm font-semibold text-gray-600 mb-2">Recent Searches</h2>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((city, index) => (
                  <button
                    key={index}
                    onClick={() => fetchWeatherData(city)}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors duration-200"
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {weather && (
          <>
            <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-4xl font-bold text-gray-800 mb-2">
                    {weather.name}, {weather.sys.country}
                  </h1>
                  <p className="text-xl text-gray-600 capitalize">
                    {weather.weather[0].description}
                  </p>
                </div>
                <div className="text-6xl">
                  {getWeatherIcon(weather.weather[0].main)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-blue-50 rounded-lg p-6 flex items-center space-x-4">
                  <FaTemperatureHigh className="text-3xl text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">Temperature</p>
                    <p className="text-2xl font-semibold text-gray-800">
                      {Math.round(convertTemp(weather.main.temp))}°{isCelsius ? 'C' : 'F'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Feels like: {Math.round(convertTemp(weather.main.feels_like))}°{isCelsius ? 'C' : 'F'}
                    </p>
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-6 flex items-center space-x-4">
                  <FaTint className="text-3xl text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">Humidity</p>
                    <p className="text-2xl font-semibold text-gray-800">{weather.main.humidity}%</p>
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-6 flex items-center space-x-4">
                  <FaWind className="text-3xl text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">Wind Speed</p>
                    <p className="text-2xl font-semibold text-gray-800">{weather.wind.speed} m/s</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">5-Hour Forecast</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {forecast.map((item, index) => (
                  <div key={index} className="bg-blue-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-500">
                      {new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <div className="my-2">
                      {getWeatherIcon(item.weather[0].main)}
                    </div>
                    <p className="text-lg font-semibold text-gray-800">
                      {Math.round(convertTemp(item.main.temp))}°{isCelsius ? 'C' : 'F'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Weather;