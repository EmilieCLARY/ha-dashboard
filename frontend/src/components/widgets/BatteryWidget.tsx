import { useNavigate } from 'react-router-dom';
import type { HomeAssistantEntity } from '../../types/homeAssistant';

interface BatteryWidgetProps {
  entity: HomeAssistantEntity;
}

export function BatteryWidget({ entity }: BatteryWidgetProps) {
  const navigate = useNavigate();
  const battery = parseInt(entity.state);
  const friendlyName = entity.attributes.friendly_name || entity.entity_id;
  const lastUpdated = new Date(entity.last_updated);

  // Déterminer la couleur en fonction du niveau de batterie
  const getBatteryColor = () => {
    if (battery > 75) return 'text-green-500';
    if (battery > 50) return 'text-yellow-500';
    if (battery > 25) return 'text-orange-500';
    return 'text-red-500';
  };

  // Déterminer la couleur de fond
  const getBatteryBgColor = () => {
    if (battery > 75) return 'bg-green-50';
    if (battery > 50) return 'bg-yellow-50';
    if (battery > 25) return 'bg-orange-50';
    return 'bg-red-50';
  };

  // Déterminer l'icône de batterie
  const getBatteryIcon = () => {
    if (battery > 75) return '🔋'; // Plein
    if (battery > 50) return '🔋'; // Bon
    if (battery > 25) return '🪫'; // Moyen
    return '🪫'; // Faible
  };

  // Déterminer le statut
  const getBatteryStatus = () => {
    if (battery > 75) return 'Excellent';
    if (battery > 50) return 'Bon';
    if (battery > 25) return 'Moyen';
    return 'Faible';
  };

  return (
    <div 
      onClick={() => navigate(`/entity/${entity.entity_id}`)}
      className={`rounded-lg border p-4 shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-105 ${getBatteryBgColor()}`}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-medium text-gray-600 truncate flex-1">{friendlyName}</h4>
        <span className="text-xl ml-2">{getBatteryIcon()}</span>
      </div>

      <div className="flex items-baseline gap-1 mb-1">
        <span className={`text-3xl font-bold ${getBatteryColor()}`}>{battery}</span>
        <span className="text-xl font-medium text-gray-500">%</span>
      </div>

      {/* Barre de progression */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          className={`h-2 rounded-full transition-all ${
            battery > 75
              ? 'bg-green-500'
              : battery > 50
              ? 'bg-yellow-500'
              : battery > 25
              ? 'bg-orange-500'
              : 'bg-red-500'
          }`}
          style={{ width: `${battery}%` }}
        ></div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className={`font-medium ${getBatteryColor()}`}>{getBatteryStatus()}</span>
        <span className="text-gray-500">
          {lastUpdated.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  );
}
