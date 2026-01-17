import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lightbulb, Power } from 'lucide-react';
import type { HomeAssistantEntity } from '../../types/homeAssistant';
import { apiService } from '../../services/api.service';

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
    e.stopPropagation(); // Empêcher la navigation vers la page de détail
    
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

  const handleCardClick = () => {
    navigate(`/entity/${entity.entity_id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`rounded-lg border p-6 shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-105 ${
        isOn ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Lightbulb
            className={`h-6 w-6 ${isOn ? 'text-yellow-500' : 'text-gray-400'}`}
          />
          <h4 className="text-sm font-medium text-gray-600 truncate">
            {friendlyName}
          </h4>
        </div>
        
        {/* Toggle Button */}
        <button
          onClick={handleToggle}
          disabled={isToggling}
          className={`p-2 rounded-full transition-all ${
            isToggling
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:scale-110'
          } ${
            isOn
              ? 'bg-yellow-500 text-white hover:bg-yellow-600'
              : 'bg-gray-300 text-gray-600 hover:bg-gray-400'
          }`}
        >
          <Power className="h-5 w-5" />
        </button>
      </div>

      {/* Status */}
      <div className="flex items-baseline gap-2 mb-3">
        <span
          className={`text-3xl font-bold ${
            isOn ? 'text-yellow-600' : 'text-gray-400'
          }`}
        >
          {isOn ? 'Allumée' : 'Éteinte'}
        </span>
      </div>

      {/* Brightness (if available and on) */}
      {isOn && brightness !== undefined && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Luminosité</span>
            <span className="font-medium">{brightnessPercent}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-yellow-500 transition-all"
              style={{ width: `${brightnessPercent}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Last Update */}
      <div className="mt-3 text-xs text-gray-500">
        {new Date(entity.last_updated).toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </div>
    </div>
  );
}
