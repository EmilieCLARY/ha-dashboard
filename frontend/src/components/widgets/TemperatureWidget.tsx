import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HomeAssistantEntity } from '../../types/homeAssistant';

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

  const getTempColor = (temp: number): string => {
    if (temp < 15) return 'text-blue-500';
    if (temp < 20) return 'text-cyan-500';
    if (temp < 25) return 'text-green-500';
    if (temp < 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  const tempValue = parseFloat(temperature);
  const tempColor = isNaN(tempValue) ? 'text-gray-500' : getTempColor(tempValue);

  return (
    <div
      onClick={() => navigate(`/entity/${entity.entity_id}`)}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-all cursor-pointer hover:scale-105 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg
            className="w-6 h-6 text-gray-600 dark:text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {entity.attributes.friendly_name || entity.entity_id}
          </h3>
        </div>
      </div>

      <div className="flex items-baseline gap-1">
        <span className={`text-4xl font-bold ${tempColor}`}>
          {temperature}
        </span>
        {showUnit && (
          <span className="text-2xl font-medium text-gray-500 dark:text-gray-400">
            {unit}
          </span>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        Dernière mise à jour: {new Date(entity.last_updated).toLocaleTimeString('fr-FR')}
      </div>
    </div>
  );
};
