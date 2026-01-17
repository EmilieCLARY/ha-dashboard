import { useNavigate } from 'react-router-dom';
import {
  Server,
  Cpu,
  HardDrive,
  Activity,
  Wifi,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import type { HomeAssistantEntity } from '../../types/homeAssistant';
import { useEntitiesStore } from '../../stores/entities.store';

interface SystemStatusWidgetProps {
  entity?: HomeAssistantEntity; // Optionnel, peut afficher l'état général
}

export function SystemStatusWidget({ entity }: SystemStatusWidgetProps) {
  const navigate = useNavigate();
  const { entities, haConnected, wsConnected } = useEntitiesStore();

  // Récupérer les entités système si disponibles
  const cpuEntity = entities.find((e) =>
    e.entity_id.includes('cpu') && e.entity_id.includes('use')
  );
  const memoryEntity = entities.find((e) =>
    e.entity_id.includes('memory') && e.entity_id.includes('use')
  );
  const diskEntity = entities.find((e) =>
    e.entity_id.includes('disk') && e.entity_id.includes('use')
  );

  const cpuUsage = cpuEntity ? parseFloat(cpuEntity.state) : null;
  const memoryUsage = memoryEntity ? parseFloat(memoryEntity.state) : null;
  const diskUsage = diskEntity ? parseFloat(diskEntity.state) : null;

  // Statut général
  const isHealthy = haConnected && wsConnected;
  const totalEntities = entities.length;

  const getStatusColor = (value: number | null) => {
    if (value === null) return 'bg-gray-300';
    if (value < 50) return 'bg-green-500';
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
    <div
      onClick={handleClick}
      className={`rounded-lg border p-6 shadow-sm hover:shadow-md transition-all ${
        entity ? 'cursor-pointer hover:scale-105' : ''
      } ${
        isHealthy
          ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
          : 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Server
            className={`h-6 w-6 ${
              isHealthy ? 'text-green-600' : 'text-red-600'
            }`}
          />
          <h4 className="text-sm font-medium text-gray-700">
            Home Assistant
          </h4>
        </div>
        {isHealthy ? (
          <CheckCircle className="h-6 w-6 text-green-500" />
        ) : (
          <AlertCircle className="h-6 w-6 text-red-500" />
        )}
      </div>

      {/* Status */}
      <div className="mb-4">
        <div
          className={`text-2xl font-bold ${
            isHealthy ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {isHealthy ? 'Opérationnel' : 'Problème détecté'}
        </div>
        <div className="text-sm text-gray-600 mt-1">
          {totalEntities} entités chargées
        </div>
      </div>

      {/* Connection Status */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Wifi
            className={`h-4 w-4 ${
              haConnected ? 'text-green-500' : 'text-red-500'
            }`}
          />
          <span className="text-gray-600">
            API: {haConnected ? 'OK' : 'KO'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Activity
            className={`h-4 w-4 ${
              wsConnected ? 'text-green-500' : 'text-red-500'
            }`}
          />
          <span className="text-gray-600">
            WS: {wsConnected ? 'OK' : 'KO'}
          </span>
        </div>
      </div>

      {/* System Resources (if available) */}
      {(cpuUsage !== null || memoryUsage !== null || diskUsage !== null) && (
        <div className="space-y-3 pt-3 border-t border-gray-200">
          {cpuUsage !== null && (
            <div>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <div className="flex items-center gap-1">
                  <Cpu className="h-3 w-3" />
                  <span>CPU</span>
                </div>
                <span className="font-medium">{cpuUsage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${getStatusColor(
                    cpuUsage
                  )}`}
                  style={{ width: `${cpuUsage}%` }}
                ></div>
              </div>
            </div>
          )}

          {memoryUsage !== null && (
            <div>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <div className="flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  <span>Mémoire</span>
                </div>
                <span className="font-medium">{memoryUsage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${getStatusColor(
                    memoryUsage
                  )}`}
                  style={{ width: `${memoryUsage}%` }}
                ></div>
              </div>
            </div>
          )}

          {diskUsage !== null && (
            <div>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <div className="flex items-center gap-1">
                  <HardDrive className="h-3 w-3" />
                  <span>Disque</span>
                </div>
                <span className="font-medium">{diskUsage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${getStatusColor(
                    diskUsage
                  )}`}
                  style={{ width: `${diskUsage}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Uptime (if entity provided) */}
      {entity && (
        <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
          Dernière mise à jour:{' '}
          {new Date(entity.last_updated).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      )}
    </div>
  );
}
