import React from 'react';
import { X, GripVertical, Settings2 } from 'lucide-react';
import { WidgetConfig, useDashboardStore } from '../../stores/dashboard-manager.store';
import { useEntitiesStore } from '../../stores/entities.store';

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
  const { getEntityById } = useEntitiesStore();

  const handleRemove = () => {
    if (window.confirm('Supprimer ce widget ?')) {
      removeWidget(config.i);
    }
  };

  const renderWidget = () => {
    const entity = config.entityId ? getEntityById(config.entityId) : undefined;

    const widgetProps = {
      entity,
      entityId: config.entityId,
      ...config.config,
    };

    switch (config.widgetType) {
      case 'temperature':
        return entity ? <TemperatureWidget entity={entity} /> : <NoEntityPlaceholder type="temperature" />;
      case 'humidity':
        return entity ? <HumidityWidget entity={entity} /> : <NoEntityPlaceholder type="humidity" />;
      case 'battery':
        return entity ? <BatteryWidget entity={entity} /> : <NoEntityPlaceholder type="battery" />;
      case 'light':
        return entity ? <LightWidget entity={entity} /> : <NoEntityPlaceholder type="light" />;
      case 'energy':
        return entity ? <EnergyWidget entity={entity} /> : <NoEntityPlaceholder type="energy" />;
      case 'weather':
        return entity ? <WeatherWidget entity={entity} /> : <NoEntityPlaceholder type="weather" />;
      case 'system-status':
        return <SystemStatusWidget {...widgetProps} />;
      default:
        return (
          <div className="flex items-center justify-center h-full rounded-3xl border-2 border-dashed border-muted p-6">
            <p className="text-muted-foreground text-sm">
              Type inconnu : {config.widgetType}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col relative">
      {/* Edit Mode Controls */}
      {editMode && (
        <div className="widget-drag-handle absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-3 py-1.5 bg-background/90 backdrop-blur-sm rounded-t-3xl border-b border-border">
          <div className="flex items-center gap-1.5">
            <GripVertical size={14} className="text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground capitalize">
              {config.widgetType}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleRemove}
              className="p-1 hover:bg-destructive/10 rounded-full transition-colors"
              title="Supprimer"
            >
              <X size={14} className="text-destructive" />
            </button>
          </div>
        </div>
      )}

      {/* Widget Content */}
      <div className={`flex-1 overflow-hidden ${editMode ? 'pt-0' : ''}`}>
        {renderWidget()}
      </div>

      {/* Edit Mode Overlay */}
      {editMode && (
        <div className="absolute inset-0 bg-primary/5 pointer-events-none border-2 border-primary/30 border-dashed rounded-3xl" />
      )}
    </div>
  );
};

// Placeholder component for when no entity is configured
function NoEntityPlaceholder({ type }: { type: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full rounded-3xl border-2 border-dashed border-muted bg-muted/20 p-6 gap-2">
      <Settings2 className="h-8 w-8 text-muted-foreground/50" />
      <p className="text-muted-foreground text-sm text-center">
        Aucune entité configurée
      </p>
      <p className="text-muted-foreground/60 text-xs capitalize">{type}</p>
    </div>
  );
}
