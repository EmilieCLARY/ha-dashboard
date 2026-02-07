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
import {
  Widget,
  WidgetHeader,
  WidgetTitle,
  WidgetContent,
  WidgetFooter,
} from '../ui/widget';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';

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
  const forecast = entity.attributes.forecast;

  const getWeatherIcon = () => {
    const iconClass = 'h-10 w-10';
    switch (condition) {
      case 'sunny':
      case 'clear':
        return <Sun className={`${iconClass} text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]`} />;
      case 'cloudy':
      case 'partlycloudy':
        return <Cloud className={`${iconClass} text-slate-400`} />;
      case 'rainy':
        return <CloudRain className={`${iconClass} text-blue-500`} />;
      case 'snowy':
        return <CloudSnow className={`${iconClass} text-sky-300`} />;
      case 'fog':
      case 'hazy':
        return <CloudDrizzle className={`${iconClass} text-slate-500`} />;
      default:
        return <Cloud className={`${iconClass} text-slate-400`} />;
    }
  };

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
    <Widget
      variant="weather"
      design="default"
      className="cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all group"
      onClick={() => navigate(`/entity/${entity.entity_id}`)}
    >
      <WidgetHeader>
        <WidgetTitle className="truncate">
          {friendlyName}
        </WidgetTitle>
        {getWeatherIcon()}
      </WidgetHeader>

      <WidgetContent className="flex-col gap-2 items-start w-full">
        <div className="flex items-center justify-between w-full">
          <div>
            {temperature !== undefined && (
              <div className="flex items-baseline gap-0.5">
                <Label size="5xl" weight="bold" className="tracking-tight">
                  {Math.round(temperature)}
                </Label>
                <Label size="2xl" weight="medium" variant="muted">
                  °C
                </Label>
              </div>
            )}
            <Label size="sm" weight="medium" className="text-sky-700 dark:text-sky-300">
              {translateCondition(condition)}
            </Label>
          </div>

          <div className="flex flex-col gap-2 text-right">
            {humidity !== undefined && (
              <div className="flex items-center gap-1.5 justify-end">
                <Droplets className="h-3.5 w-3.5 text-blue-400" />
                <Label size="xs">{humidity}%</Label>
              </div>
            )}
            {windSpeed !== undefined && (
              <div className="flex items-center gap-1.5 justify-end">
                <Wind className="h-3.5 w-3.5 text-slate-400" />
                <Label size="xs">
                  {windSpeed} {entity.attributes.wind_speed_unit || 'km/h'}
                </Label>
              </div>
            )}
          </div>
        </div>

        {/* Forecast Preview */}
        {forecast && forecast.length > 0 && (
          <>
            <Separator className="my-1" />
            <div className="flex gap-3 w-full overflow-x-auto">
              {forecast.slice(0, 4).map((day: any, idx: number) => (
                <div
                  key={idx}
                  className="flex-shrink-0 text-center rounded-xl bg-white/50 dark:bg-white/5 px-3 py-1.5"
                >
                  <Label size="xs" variant="muted" className="block">
                    {new Date(day.datetime).toLocaleDateString('fr-FR', {
                      weekday: 'short',
                    })}
                  </Label>
                  <Label size="sm" weight="bold" className="block">
                    {Math.round(day.temperature)}°
                  </Label>
                </div>
              ))}
            </div>
          </>
        )}
      </WidgetContent>

      <WidgetFooter>
        <Label size="xs" variant="muted">
          {new Date(entity.last_updated).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Label>
        <Label
          size="xs"
          variant="muted"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          Détails →
        </Label>
      </WidgetFooter>
    </Widget>
  );
}
