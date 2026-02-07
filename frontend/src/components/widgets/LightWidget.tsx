import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lightbulb, Power } from 'lucide-react';
import type { HomeAssistantEntity } from '../../types/homeAssistant';
import { apiService } from '../../services/api.service';
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

interface LightWidgetProps {
  entity: HomeAssistantEntity;
}

export function LightWidget({ entity }: LightWidgetProps) {
  const navigate = useNavigate();
  const [isToggling, setIsToggling] = useState(false);

  const isOn = entity.state === 'on';
  const friendlyName = entity.attributes.friendly_name || entity.entity_id;
  const brightness = entity.attributes.brightness;
  const brightnessPercent = brightness ? Math.round((brightness / 255) * 100) : 100;

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();

    setIsToggling(true);
    try {
      const service = isOn ? 'turn_off' : 'turn_on';
      await apiService.callService('light', service, {
        entity_id: entity.entity_id,
      });
    } catch (error) {
      console.error('Error toggling light:', error);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <Widget
      variant="light"
      design="default"
      className={`cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all group ${
        !isOn ? 'opacity-75 grayscale-[30%]' : ''
      }`}
      onClick={() => navigate(`/entity/${entity.entity_id}`)}
    >
      <WidgetHeader>
        <WidgetTitle className="truncate flex items-center gap-2">
          <Lightbulb
            className={`h-4 w-4 flex-shrink-0 ${
              isOn ? 'text-yellow-500 drop-shadow-[0_0_6px_rgba(234,179,8,0.5)]' : 'text-muted-foreground'
            }`}
          />
          {friendlyName}
        </WidgetTitle>
        <button
          onClick={handleToggle}
          disabled={isToggling}
          className={`p-1.5 rounded-full transition-all ${
            isToggling ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
          } ${
            isOn
              ? 'bg-yellow-500 text-white shadow-md shadow-yellow-500/30'
              : 'bg-secondary text-muted-foreground'
          }`}
        >
          <Power className="h-4 w-4" />
        </button>
      </WidgetHeader>

      <WidgetContent className="flex-col gap-2">
        <Label
          size="3xl"
          weight="bold"
          className={isOn ? 'text-yellow-600 dark:text-yellow-400' : 'text-muted-foreground'}
        >
          {isOn ? 'Allumée' : 'Éteinte'}
        </Label>

        {isOn && brightness !== undefined && (
          <div className="w-full space-y-1">
            <div className="flex items-center justify-between">
              <Label size="xs" variant="muted">
                Luminosité
              </Label>
              <Label size="xs" weight="semibold">
                {brightnessPercent}%
              </Label>
            </div>
            <Progress
              value={brightnessPercent}
              max={100}
              indicatorClassName="bg-yellow-500"
            />
          </div>
        )}
      </WidgetContent>

      <WidgetFooter>
        <Badge variant={isOn ? 'success' : 'secondary'}>
          {isOn ? 'ON' : 'OFF'}
        </Badge>
        <Label size="xs" variant="muted">
          {new Date(entity.last_updated).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Label>
      </WidgetFooter>
    </Widget>
  );
}
