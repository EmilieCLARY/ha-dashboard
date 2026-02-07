import { useNavigate } from 'react-router-dom';
import { BatteryFull, BatteryLow, BatteryMedium, BatteryWarning } from 'lucide-react';
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

interface BatteryWidgetProps {
  entity: HomeAssistantEntity;
}

export function BatteryWidget({ entity }: BatteryWidgetProps) {
  const navigate = useNavigate();
  const battery = parseInt(entity.state);
  const friendlyName = entity.attributes.friendly_name || entity.entity_id;
  const lastUpdated = new Date(entity.last_updated);

  const getBatteryColor = () => {
    if (battery > 75) return 'text-emerald-500';
    if (battery > 50) return 'text-yellow-500';
    if (battery > 25) return 'text-orange-500';
    return 'text-red-500';
  };

  const getProgressColor = () => {
    if (battery > 75) return 'bg-emerald-500';
    if (battery > 50) return 'bg-yellow-500';
    if (battery > 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getBatteryIcon = () => {
    const iconClass = 'h-4 w-4 flex-shrink-0';
    if (battery > 75) return <BatteryFull className={`${iconClass} text-emerald-500`} />;
    if (battery > 50) return <BatteryMedium className={`${iconClass} text-yellow-500`} />;
    if (battery > 25) return <BatteryLow className={`${iconClass} text-orange-500`} />;
    return <BatteryWarning className={`${iconClass} text-red-500`} />;
  };

  const getBatteryBadge = () => {
    if (battery > 75) return { label: 'Excellent', variant: 'success' as const };
    if (battery > 50) return { label: 'Bon', variant: 'warning' as const };
    if (battery > 25) return { label: 'Moyen', variant: 'warning' as const };
    return { label: 'Faible', variant: 'error' as const };
  };

  const getWidgetVariant = () => {
    if (battery > 25) return 'battery' as const;
    return 'destructive' as const;
  };

  const badge = getBatteryBadge();

  return (
    <Widget
      variant={getWidgetVariant()}
      design="default"
      className="cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all group"
      onClick={() => navigate(`/entity/${entity.entity_id}`)}
    >
      <WidgetHeader>
        <WidgetTitle className="truncate flex items-center gap-2">
          {getBatteryIcon()}
          {friendlyName}
        </WidgetTitle>
        <Badge variant={badge.variant}>{badge.label}</Badge>
      </WidgetHeader>

      <WidgetContent className="flex-col gap-3">
        <div className="flex items-baseline gap-1">
          <Label size="5xl" weight="bold" className={`tracking-tight ${getBatteryColor()}`}>
            {battery}
          </Label>
          <Label size="2xl" weight="medium" variant="muted">
            %
          </Label>
        </div>
        <Progress
          value={battery}
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
