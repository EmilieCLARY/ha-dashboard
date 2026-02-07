import { useNavigate } from 'react-router-dom';
import { Droplets } from 'lucide-react';
import type { HomeAssistantEntity } from '../../types/homeAssistant';
import {
  Widget,
  WidgetHeader,
  WidgetTitle,
  WidgetContent,
  WidgetFooter,
} from '../ui/widget';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';

interface HumidityWidgetProps {
  entity: HomeAssistantEntity;
}

export function HumidityWidget({ entity }: HumidityWidgetProps) {
  const navigate = useNavigate();
  const humidity = parseFloat(entity.state);
  const friendlyName = entity.attributes.friendly_name || entity.entity_id;
  const lastUpdated = new Date(entity.last_updated);

  const getHumidityColor = () => {
    if (humidity < 30) return 'text-orange-500';
    if (humidity > 60) return 'text-blue-600';
    return 'text-emerald-500';
  };

  const getHumidityBadge = () => {
    if (humidity < 30) return { label: 'Trop sec', variant: 'warning' as const };
    if (humidity > 60) return { label: 'Trop humide', variant: 'info' as const };
    return { label: 'Optimal', variant: 'success' as const };
  };

  const getProgressColor = () => {
    if (humidity < 30) return 'bg-orange-500';
    if (humidity > 60) return 'bg-blue-500';
    return 'bg-emerald-500';
  };

  const badge = getHumidityBadge();

  return (
    <Widget
      variant="humidity"
      design="default"
      className="cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all group"
      onClick={() => navigate(`/entity/${entity.entity_id}`)}
    >
      <WidgetHeader>
        <WidgetTitle className="truncate flex items-center gap-2">
          <Droplets className="h-4 w-4 text-cyan-500 flex-shrink-0" />
          {friendlyName}
        </WidgetTitle>
        <Badge variant={badge.variant}>{badge.label}</Badge>
      </WidgetHeader>

      <WidgetContent className="flex-col gap-3">
        <div className="flex items-baseline gap-1">
          <Label size="5xl" weight="bold" className={`tracking-tight ${getHumidityColor()}`}>
            {humidity.toFixed(1)}
          </Label>
          <Label size="2xl" weight="medium" variant="muted">
            {entity.attributes.unit_of_measurement || '%'}
          </Label>
        </div>
        <Progress
          value={humidity}
          max={100}
          className="w-full"
          indicatorClassName={getProgressColor()}
        />
      </WidgetContent>

      <WidgetFooter>
        <Label size="xs" variant="muted">
          {lastUpdated.toLocaleTimeString('fr-FR', {
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
