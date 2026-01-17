import { useNavigate } from 'react-router-dom';
import {
  Cloud,
  CloudRain,
  CloudSnow,
  Sun,
  CloudDrizzle,
  Wind,
  Droplets,
} from 'lucide-react';
import type { HomeAssistantEntity } from '../../types/homeAssistant';

interface WeatherWidgetProps {
  entity: HomeAssistantEntity;
}

export function WeatherWidget({ entity }: WeatherWidgetProps) {
  const navigate = useNavigate();

  const condition = entity.state.toLowerCase();
  const friendlyName = entity.attributes.friendly_name || entity.entity_id;
  const temperature = entity.attributes.temperature;
  const humidity = entity.attributes.humidity;
  const windSpeed = entity.attributes.wind_speed;
  const pressure = entity.attributes.pressure;
  const forecast = entity.attributes.forecast;

  // Icône météo selon condition
  const getWeatherIcon = () => {
    const iconClass = 'h-12 w-12';
    
    switch (condition) {
      case 'sunny':
      case 'clear':
        return <Sun className={`${iconClass} text-yellow-500`} />;
      case 'cloudy':
      case 'partlycloudy':
        return <Cloud className={`${iconClass} text-gray-400`} />;
      case 'rainy':
        return <CloudRain className={`${iconClass} text-blue-500`} />;
      case 'snowy':
        return <CloudSnow className={`${iconClass} text-blue-300`} />;
      case 'fog':
      case 'hazy':
        return <CloudDrizzle className={`${iconClass} text-gray-500`} />;
      default:
        return <Cloud className={`${iconClass} text-gray-400`} />;
    }
  };

  // Couleur de fond selon condition
  const getBackgroundColor = () => {
    switch (condition) {
      case 'sunny':
      case 'clear':
        return 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200';
      case 'rainy':
        return 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200';
      case 'snowy':
        return 'bg-gradient-to-br from-blue-50 to-gray-50 border-blue-300';
      case 'cloudy':
      case 'partlycloudy':
        return 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200';
      default:
        return 'bg-gradient-to-br from-gray-50 to-blue-50 border-gray-200';
    }
  };

  // Traduction de la condition
  const translateCondition = (cond: string) => {
    const translations: Record<string, string> = {
      sunny: 'Ensoleillé',
      clear: 'Dégagé',
      cloudy: 'Nuageux',
      partlycloudy: 'Partiellement nuageux',
      rainy: 'Pluvieux',
      snowy: 'Neigeux',
      fog: 'Brouillard',
      hazy: 'Brumeux',
      windy: 'Venteux',
    };
    return translations[cond] || cond.charAt(0).toUpperCase() + cond.slice(1);
  };

  return (
    <div
      onClick={() => navigate(`/entity/${entity.entity_id}`)}
      className={`rounded-lg border p-6 shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-105 ${getBackgroundColor()}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-gray-700 truncate">
          {friendlyName}
        </h4>
        {getWeatherIcon()}
      </div>

      {/* Temperature */}
      {temperature !== undefined && (
        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-5xl font-bold text-gray-800">
            {Math.round(temperature)}
          </span>
          <span className="text-3xl font-medium text-gray-600">°C</span>
        </div>
      )}

      {/* Condition */}
      <div className="text-lg font-medium text-gray-700 mb-4">
        {translateCondition(condition)}
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        {humidity !== undefined && (
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-blue-500" />
            <span className="text-gray-600">{humidity}%</span>
          </div>
        )}
        
        {windSpeed !== undefined && (
          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">
              {windSpeed} {entity.attributes.wind_speed_unit || 'km/h'}
            </span>
          </div>
        )}

        {pressure !== undefined && (
          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-medium">P:</span>
            <span className="text-gray-600">
              {pressure} {entity.attributes.pressure_unit || 'hPa'}
            </span>
          </div>
        )}
      </div>

      {/* Forecast Preview (if available) */}
      {forecast && forecast.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex gap-2 overflow-x-auto">
            {forecast.slice(0, 3).map((day: any, idx: number) => (
              <div
                key={idx}
                className="flex-shrink-0 text-center bg-white bg-opacity-50 rounded px-3 py-2"
              >
                <div className="text-xs text-gray-600 mb-1">
                  {new Date(day.datetime).toLocaleDateString('fr-FR', {
                    weekday: 'short',
                  })}
                </div>
                <div className="text-sm font-bold text-gray-800">
                  {Math.round(day.temperature)}°
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
