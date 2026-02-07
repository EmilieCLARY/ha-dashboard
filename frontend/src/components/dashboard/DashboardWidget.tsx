import React from 'react';
import { X, GripVertical, Settings } from 'lucide-react';
import { WidgetConfig, useDashboardStore } from '../../stores/dashboard-manager.store';
import { Card } from '../ui/Card';

// Import all available widgets
import { TemperatureWidget } from '../widgets/TemperatureWidget';
import { HumidityWidget } from '../widgets/HumidityWidget';
import { BatteryWidget } from '../widgets/BatteryWidget';
import { LightWidget } from '../widgets/LightWidget';
import { EnergyWidget } from '../widgets/EnergyWidget';
import { WeatherWidget } from '../widgets/WeatherWidget';
import { SystemStatusWidget } from '../widgets/SystemStatusWidget';

interface DashboardWidgetProps {
  config: WidgetConfig;
}

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({ config }) => {
  const { editMode, removeWidget } = useDashboardStore();

  const handleRemove = () => {
    if (window.confirm('Remove this widget?')) {
      removeWidget(config.i);
    }
  };

  const renderWidget = () => {
    const widgetProps = {
      entityId: config.entityId,
      ...config.config,
    };

    switch (config.widgetType) {
      case 'temperature':
        return <TemperatureWidget {...widgetProps} />;
      case 'humidity':
        return <HumidityWidget {...widgetProps} />;
      case 'battery':
        return <BatteryWidget {...widgetProps} />;
      case 'light':
        return <LightWidget {...widgetProps} />;
      case 'energy':
        return <EnergyWidget {...widgetProps} />;
      case 'weather':
        return <WeatherWidget {...widgetProps} />;
      case 'system-status':
        return <SystemStatusWidget {...widgetProps} />;
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Unknown widget type: {config.widgetType}</p>
          </div>
        );
    }
  };

  return (
    <Card className="h-full flex flex-col relative">
      {/* Drag Handle - Only visible in edit mode */}
      {editMode && (
        <div className="widget-drag-handle flex items-center justify-between bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <GripVertical size={16} className="text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {config.widgetType}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleRemove}
              className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors"
              title="Remove widget"
            >
              <X size={16} className="text-red-600" />
            </button>
          </div>
        </div>
      )}

      {/* Widget Content */}
      <div className="flex-1 overflow-hidden">{renderWidget()}</div>

      {/* Edit Mode Overlay */}
      {editMode && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-5 pointer-events-none border-2 border-blue-400 border-dashed rounded-lg" />
      )}
    </Card>
  );
};
