import { useNavigate } from 'react-router-dom';
import { Zap, TrendingUp, TrendingDown } from 'lucide-react';
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

interface EnergyWidgetProps {
  entity: HomeAssistantEntity;
}

export function EnergyWidget({ entity }: EnergyWidgetProps) {
  const navigate = useNavigate();

  const power = parseFloat(entity.state);
  const friendlyName = entity.attributes.friendly_name || entity.entity_id;
  const unit = entity.attributes.unit_of_measurement || 'W';
  const lastUpdated = new Date(entity.last_updated);

  const getPowerColor = () => {
    if (power < 100) return 'text-emerald-500';
    if (power < 500) return 'text-yellow-500';
    if (power < 1000) return 'text-orange-500';
    return 'text-red-500';
  };

  const getProgressColor = () => {
    if (power < 100) return 'bg-emerald-500';
    if (power < 500) return 'bg-yellow-500';
    if (power < 1000) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getTrendIcon = () => {
    if (power < 100) return <TrendingDown className="h-4 w-4 text-emerald-500" />;
    if (power > 500) return <TrendingUp className="h-4 w-4 text-red-500" />;
    return <Zap className="h-4 w-4 text-yellow-500" />;
  };

  const getPowerBadge = () => {
    if (power < 100) return { label: 'Faible', variant: 'success' as const };
    if (power < 500) return { label: 'Normale', variant: 'warning' as const };
    if (power < 1000) return { label: 'Élevée', variant: 'warning' as const };
    return { label: 'Très élevée', variant: 'error' as const };
  };

  const formatPower = () => {
    if (unit.toLowerCase() === 'w' || unit.toLowerCase() === 'wh') {
      if (power >= 1000) {
        return {
          value: (power / 1000).toFixed(2),
          unit: unit.toLowerCase() === 'w' ? 'kW' : 'kWh',
        };
      }
    }
    return { value: power.toFixed(1), unit };
  };

  const formattedPower = formatPower();
  const badge = getPowerBadge();

  return (
    <Widget
      variant="energy"
      design="default"
      className="cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all group"
      onClick={() => navigate(`/entity/${entity.entity_id}`)}
    >
      <WidgetHeader>
        <WidgetTitle className="truncate flex items-center gap-2">
          <Zap className="h-4 w-4 text-violet-500 flex-shrink-0" />
          {friendlyName}
        </WidgetTitle>
        <div className="flex items-center gap-2">
          {getTrendIcon()}
          <Badge variant={badge.variant}>{badge.label}</Badge>
        </div>
      </WidgetHeader>

      <WidgetContent className="flex-col gap-3">
        <div className="flex items-baseline gap-1">
          <Label size="4xl" weight="bold" className={`tracking-tight ${getPowerColor()}`}>
            {formattedPower.value}
          </Label>
          <Label size="xl" weight="medium" variant="muted">
            {formattedPower.unit}
          </Label>
        </div>

        <Progress
          value={Math.min((power / 2000) * 100, 100)}
          max={100}
          className="w-full"
          indicatorClassName={getProgressColor()}
        />

        {unit.toLowerCase().includes('w') && (
          <Label size="xs" variant="muted" className="text-center">
            ≈ {((power / 1000) * 0.15).toFixed(2)} €/h
          </Label>
        )}
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
