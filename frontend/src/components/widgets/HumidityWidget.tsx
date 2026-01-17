import { useNavigate } from 'react-router-dom';
import type { HomeAssistantEntity } from '../../types/homeAssistant';

interface HumidityWidgetProps {
  entity: HomeAssistantEntity;
}

export function HumidityWidget({ entity }: HumidityWidgetProps) {
  const navigate = useNavigate();
  const humidity = parseFloat(entity.state);
  const friendlyName = entity.attributes.friendly_name || entity.entity_id;
  const lastUpdated = new Date(entity.last_updated);

  // Déterminer la couleur en fonction de l'humidité
  const getHumidityColor = () => {
    if (humidity < 30) return 'text-orange-500'; // Trop sec
    if (humidity > 60) return 'text-blue-600'; // Trop humide
    return 'text-green-500'; // Optimal
  };

  // Déterminer l'icône en fonction de l'humidité
  const getHumidityIcon = () => {
    if (humidity < 30) return '🏜️'; // Sec
    if (humidity > 60) return '💧'; // Humide
    return '✨'; // Optimal
  };

  // Déterminer le statut
  const getHumidityStatus = () => {
    if (humidity < 30) return 'Trop sec';
    if (humidity > 60) return 'Trop humide';
    return 'Optimal';
  };

  return (
    <div 
      onClick={() => navigate(`/entity/${entity.entity_id}`)}
      className="rounded-lg border bg-card p-6 shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-105"
    >
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-gray-600 truncate">{friendlyName}</h4>
        <span className="text-2xl">{getHumidityIcon()}</span>
      </div>

      <div className="flex items-baseline gap-1 mb-2">
        <span className={`text-4xl font-bold ${getHumidityColor()}`}>
          {humidity.toFixed(1)}
        </span>
        <span className="text-2xl font-medium text-gray-500">
          {entity.attributes.unit_of_measurement || '%'}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className={`font-medium ${getHumidityColor()}`}>
          {getHumidityStatus()}
        </span>
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
