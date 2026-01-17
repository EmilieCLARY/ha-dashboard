import { useNavigate } from 'react-router-dom';
import { Zap, TrendingUp, TrendingDown } from 'lucide-react';
import type { HomeAssistantEntity } from '../../types/homeAssistant';

interface EnergyWidgetProps {
  entity: HomeAssistantEntity;
}

export function EnergyWidget({ entity }: EnergyWidgetProps) {
  const navigate = useNavigate();
  
  const power = parseFloat(entity.state);
  const friendlyName = entity.attributes.friendly_name || entity.entity_id;
  const unit = entity.attributes.unit_of_measurement || 'W';
  const lastUpdated = new Date(entity.last_updated);

  // Déterminer la couleur en fonction de la consommation
  const getPowerColor = () => {
    if (power < 100) return 'text-green-500';
    if (power < 500) return 'text-yellow-500';
    if (power < 1000) return 'text-orange-500';
    return 'text-red-500';
  };

  // Déterminer la couleur de fond
  const getPowerBgColor = () => {
    if (power < 100) return 'bg-green-50 border-green-200';
    if (power < 500) return 'bg-yellow-50 border-yellow-200';
    if (power < 1000) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  // Déterminer l'icône de tendance
  const getTrendIcon = () => {
    if (power < 100) return <TrendingDown className="h-5 w-5 text-green-500" />;
    if (power > 500) return <TrendingUp className="h-5 w-5 text-red-500" />;
    return <Zap className="h-5 w-5 text-yellow-500" />;
  };

  // Déterminer le statut
  const getPowerStatus = () => {
    if (power < 100) return 'Faible';
    if (power < 500) return 'Normale';
    if (power < 1000) return 'Élevée';
    return 'Très élevée';
  };

  // Formater la valeur avec unité appropriée
  const formatPower = () => {
    if (unit.toLowerCase() === 'w' || unit.toLowerCase() === 'wh') {
      if (power >= 1000) {
        return {
          value: (power / 1000).toFixed(2),
          unit: unit.toLowerCase() === 'w' ? 'kW' : 'kWh',
        };
      }
    }
    return {
      value: power.toFixed(1),
      unit: unit,
    };
  };

  const formattedPower = formatPower();

  return (
    <div
      onClick={() => navigate(`/entity/${entity.entity_id}`)}
      className={`rounded-lg border p-6 shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-105 ${getPowerBgColor()}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className={`h-6 w-6 ${getPowerColor()}`} />
          <h4 className="text-sm font-medium text-gray-600 truncate flex-1">
            {friendlyName}
          </h4>
        </div>
        {getTrendIcon()}
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-2 mb-2">
        <span className={`text-4xl font-bold ${getPowerColor()}`}>
          {formattedPower.value}
        </span>
        <span className="text-xl font-medium text-gray-500">
          {formattedPower.unit}
        </span>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between text-sm mb-3">
        <span className={`font-medium ${getPowerColor()}`}>
          {getPowerStatus()}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div
          className={`h-2 rounded-full transition-all ${
            power < 100
              ? 'bg-green-500'
              : power < 500
              ? 'bg-yellow-500'
              : power < 1000
              ? 'bg-orange-500'
              : 'bg-red-500'
          }`}
          style={{ width: `${Math.min((power / 2000) * 100, 100)}%` }}
        ></div>
      </div>

      {/* Estimation coût (approximatif à 0.15€/kWh) */}
      {unit.toLowerCase().includes('w') && (
        <div className="text-xs text-gray-600 mb-2">
          ≈ {((power / 1000) * 0.15).toFixed(2)} €/h
        </div>
      )}

      {/* Last Update */}
      <div className="text-xs text-gray-500">
        {lastUpdated.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </div>
    </div>
  );
}
