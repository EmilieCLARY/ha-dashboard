import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Thermometer } from 'lucide-react';
import { HomeAssistantEntity } from '../../types/homeAssistant';
import {
  Widget,
  WidgetHeader,
  WidgetTitle,
  WidgetContent,
  WidgetFooter,
} from '../ui/widget';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';

interface TemperatureWidgetProps {
  entity: HomeAssistantEntity;
  showUnit?: boolean;
  className?: string;
}

export const TemperatureWidget: React.FC<TemperatureWidgetProps> = ({
  entity,
  showUnit = true,
  className = '',
}) => {
  const navigate = useNavigate();
  const [temperature, setTemperature] = useState<string>('--');
  const [unit, setUnit] = useState<string>('°C');

  useEffect(() => {
    if (entity) {
      setTemperature(parseFloat(entity.state).toFixed(1));
      setUnit(entity.attributes.unit_of_measurement || '°C');
    }
  }, [entity]);

  const tempValue = parseFloat(temperature);

  const getTempColor = (temp: number): string => {
    if (temp < 15) return 'text-blue-500';
    if (temp < 20) return 'text-cyan-500';
    if (temp < 25) return 'text-green-500';
    if (temp < 30) return 'text-amber-500';
    return 'text-red-500';
  };

  const getTempBadge = (temp: number) => {
    if (isNaN(temp)) return { label: '--', variant: 'outline' as const };
    if (temp < 15) return { label: 'Froid', variant: 'info' as const };
    if (temp < 20) return { label: 'Frais', variant: 'info' as const };
    if (temp < 25) return { label: 'Confort', variant: 'success' as const };
    if (temp < 30) return { label: 'Chaud', variant: 'warning' as const };
    return { label: 'Très chaud', variant: 'error' as const };
  };

  const tempColor = isNaN(tempValue) ? 'text-muted-foreground' : getTempColor(tempValue);
  const badge = getTempBadge(tempValue);

  return (
    <Widget
      variant="temperature"
      design="default"
      className={`cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all group ${className}`}
      onClick={() => navigate(`/entity/${entity.entity_id}`)}
    >
      <WidgetHeader>
        <WidgetTitle className="truncate flex items-center gap-2">
          <Thermometer className="h-4 w-4 text-orange-500 flex-shrink-0" />
          {entity.attributes.friendly_name || entity.entity_id}
        </WidgetTitle>
        <Badge variant={badge.variant}>{badge.label}</Badge>
      </WidgetHeader>

      <WidgetContent className="flex-col gap-1">
        <div className="flex items-baseline gap-1">
          <Label size="5xl" weight="bold" className={`tracking-tight ${tempColor}`}>
            {temperature}
          </Label>
          {showUnit && (
            <Label size="2xl" weight="medium" variant="muted">
              {unit}
            </Label>
          )}
        </div>
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
};
