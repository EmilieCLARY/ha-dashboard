import { useNavigate } from 'react-router-dom';
import {
  Server,
  Cpu,
  HardDrive,
  Activity,
  Wifi,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import type { HomeAssistantEntity } from '../../types/homeAssistant';
import { useEntitiesStore } from '../../stores/entities.store';
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
import { Separator } from '../ui/separator';

interface SystemStatusWidgetProps {
  entity?: HomeAssistantEntity;
}

export function SystemStatusWidget({ entity }: SystemStatusWidgetProps) {
  const navigate = useNavigate();
  const { entities, haConnected, wsConnected } = useEntitiesStore();

  const cpuEntity = entities.find(
    (e) => e.entity_id.includes('cpu') && e.entity_id.includes('use')
  );
  const memoryEntity = entities.find(
    (e) => e.entity_id.includes('memory') && e.entity_id.includes('use')
  );
  const diskEntity = entities.find(
    (e) => e.entity_id.includes('disk') && e.entity_id.includes('use')
  );

  const cpuUsage = cpuEntity ? parseFloat(cpuEntity.state) : null;
  const memoryUsage = memoryEntity ? parseFloat(memoryEntity.state) : null;
  const diskUsage = diskEntity ? parseFloat(diskEntity.state) : null;

  const isHealthy = haConnected && wsConnected;
  const totalEntities = entities.length;

  const getProgressColor = (value: number | null) => {
    if (value === null) return 'bg-muted';
    if (value < 50) return 'bg-emerald-500';
    if (value < 75) return 'bg-yellow-500';
    if (value < 90) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const handleClick = () => {
    if (entity) {
      navigate(`/entity/${entity.entity_id}`);
    }
  };

  return (
    <Widget
      variant={isHealthy ? 'system' : 'destructive'}
      design="default"
      className={`transition-all group ${
        entity ? 'cursor-pointer hover:shadow-lg hover:scale-[1.02]' : ''
      }`}
      onClick={handleClick}
    >
      <WidgetHeader>
        <WidgetTitle className="flex items-center gap-2">
          <Server className={`h-4 w-4 flex-shrink-0 ${isHealthy ? 'text-emerald-500' : 'text-red-500'}`} />
          Home Assistant
        </WidgetTitle>
        {isHealthy ? (
          <Badge variant="success">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            OK
          </Badge>
        ) : (
          <Badge variant="error">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Erreur
          </Badge>
        )}
      </WidgetHeader>

      <WidgetContent className="flex-col gap-3 items-stretch w-full">
        {/* Connection Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Wifi className={`h-3.5 w-3.5 ${haConnected ? 'text-emerald-500' : 'text-red-500'}`} />
            <Label size="xs" weight="medium">
              API {haConnected ? '✓' : '✗'}
            </Label>
          </div>
          <div className="flex items-center gap-1.5">
            <Activity className={`h-3.5 w-3.5 ${wsConnected ? 'text-emerald-500' : 'text-red-500'}`} />
            <Label size="xs" weight="medium">
              WS {wsConnected ? '✓' : '✗'}
            </Label>
          </div>
          <Label size="xs" variant="muted" className="ml-auto">
            {totalEntities} entités
          </Label>
        </div>

        {/* System Resources */}
        {(cpuUsage !== null || memoryUsage !== null || diskUsage !== null) && (
          <>
            <Separator />
            <div className="space-y-2.5 w-full">
              {cpuUsage !== null && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Cpu className="h-3 w-3 text-muted-foreground" />
                      <Label size="xs" variant="muted">CPU</Label>
                    </div>
                    <Label size="xs" weight="semibold">{cpuUsage.toFixed(1)}%</Label>
                  </div>
                  <Progress
                    value={cpuUsage}
                    max={100}
                    indicatorClassName={getProgressColor(cpuUsage)}
                  />
                </div>
              )}

              {memoryUsage !== null && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Activity className="h-3 w-3 text-muted-foreground" />
                      <Label size="xs" variant="muted">Mémoire</Label>
                    </div>
                    <Label size="xs" weight="semibold">{memoryUsage.toFixed(1)}%</Label>
                  </div>
                  <Progress
                    value={memoryUsage}
                    max={100}
                    indicatorClassName={getProgressColor(memoryUsage)}
                  />
                </div>
              )}

              {diskUsage !== null && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <HardDrive className="h-3 w-3 text-muted-foreground" />
                      <Label size="xs" variant="muted">Disque</Label>
                    </div>
                    <Label size="xs" weight="semibold">{diskUsage.toFixed(1)}%</Label>
                  </div>
                  <Progress
                    value={diskUsage}
                    max={100}
                    indicatorClassName={getProgressColor(diskUsage)}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </WidgetContent>

      <WidgetFooter>
        <Label size="xs" variant="muted">
          {isHealthy ? 'Opérationnel' : 'Problème détecté'}
        </Label>
        {entity && (
          <Label size="xs" variant="muted">
            {new Date(entity.last_updated).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Label>
        )}
      </WidgetFooter>
    </Widget>
  );
}
