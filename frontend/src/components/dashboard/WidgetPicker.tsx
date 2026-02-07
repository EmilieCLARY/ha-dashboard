import React, { useState, useMemo } from 'react';
import { Plus, Thermometer, Droplet, Battery, Lightbulb, Zap, Cloud, Activity } from 'lucide-react';
import { useDashboardStore, WidgetConfig } from '../../stores/dashboard-manager.store';
import { useEntitiesStore } from '../../stores/entities.store';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';

interface WidgetType {
  type: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  defaultSize: { w: number; h: number };
  requiresEntity: boolean;
  entityDomain?: string;
}

const WIDGET_TYPES: WidgetType[] = [
  {
    type: 'temperature',
    name: 'Temperature',
    icon: <Thermometer size={24} />,
    description: 'Display temperature sensor data',
    defaultSize: { w: 2, h: 2 },
    requiresEntity: true,
    entityDomain: 'sensor',
  },
  {
    type: 'humidity',
    name: 'Humidity',
    icon: <Droplet size={24} />,
    description: 'Display humidity sensor data',
    defaultSize: { w: 2, h: 2 },
    requiresEntity: true,
    entityDomain: 'sensor',
  },
  {
    type: 'battery',
    name: 'Battery',
    icon: <Battery size={24} />,
    description: 'Display battery level',
    defaultSize: { w: 2, h: 2 },
    requiresEntity: true,
    entityDomain: 'sensor',
  },
  {
    type: 'light',
    name: 'Light',
    icon: <Lightbulb size={24} />,
    description: 'Control light entities',
    defaultSize: { w: 2, h: 2 },
    requiresEntity: true,
    entityDomain: 'light',
  },
  {
    type: 'energy',
    name: 'Energy',
    icon: <Zap size={24} />,
    description: 'Display energy consumption',
    defaultSize: { w: 3, h: 2 },
    requiresEntity: true,
    entityDomain: 'sensor',
  },
  {
    type: 'weather',
    name: 'Weather',
    icon: <Cloud size={24} />,
    description: 'Display weather information',
    defaultSize: { w: 4, h: 3 },
    requiresEntity: true,
    entityDomain: 'weather',
  },
  {
    type: 'system-status',
    name: 'System Status',
    icon: <Activity size={24} />,
    description: 'Display Home Assistant system status',
    defaultSize: { w: 4, h: 2 },
    requiresEntity: false,
  },
];

export const WidgetPicker: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<WidgetType | null>(null);
  const [selectedEntity, setSelectedEntity] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { addWidget, dashboards, activeDashboardId } = useDashboardStore();
  const { entities } = useEntitiesStore();

  const activeDashboard = useMemo(() => {
    return dashboards.find((d) => d.id === activeDashboardId);
  }, [dashboards, activeDashboardId]);

  const filteredEntities = useMemo(() => {
    if (!selectedType?.requiresEntity) return [];

    let filtered = Object.values(entities);

    if (selectedType.entityDomain) {
      filtered = filtered.filter((e) => e.entity_id.startsWith(`${selectedType.entityDomain}.`));
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.entity_id.toLowerCase().includes(query) ||
          e.attributes.friendly_name?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [entities, selectedType, searchQuery]);

  const handleSelectType = (widgetType: WidgetType) => {
    setSelectedType(widgetType);
    setSelectedEntity('');
    setSearchQuery('');
  };

  const handleAddWidget = async () => {
    if (!selectedType || !activeDashboard) return;
    if (selectedType.requiresEntity && !selectedEntity) return;

    // Find next available position
    const layout = activeDashboard.config.layout;
    const cols = activeDashboard.config.cols || 12;
    const maxY = layout.reduce((max, item) => Math.max(max, item.y + item.h), 0);

    const newWidget: WidgetConfig = {
      i: `widget-${Date.now()}`,
      x: 0,
      y: maxY,
      ...selectedType.defaultSize,
      widgetType: selectedType.type,
      entityId: selectedType.requiresEntity ? selectedEntity : undefined,
      config: {},
    };

    try {
      await addWidget(newWidget);
      setIsOpen(false);
      setSelectedType(null);
      setSelectedEntity('');
    } catch (error) {
      console.error('Failed to add widget:', error);
    }
  };

  const handleBack = () => {
    setSelectedType(null);
    setSelectedEntity('');
    setSearchQuery('');
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} size="sm">
        <Plus size={16} className="mr-2" />
        Add Widget
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Add Widget"
        size="lg"
      >
        {!selectedType ? (
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Choose a widget type to add to your dashboard
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {WIDGET_TYPES.map((widgetType) => (
                <Card
                  key={widgetType.type}
                  className="cursor-pointer hover:shadow-lg transition-all p-4"
                  onClick={() => handleSelectType(widgetType)}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg text-blue-600 dark:text-blue-400">
                      {widgetType.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{widgetType.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {widgetType.description}
                      </p>
                      <div className="mt-2 text-xs text-gray-500">
                        Size: {widgetType.defaultSize.w}x{widgetType.defaultSize.h}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg text-blue-600 dark:text-blue-400">
                {selectedType.icon}
              </div>
              <div>
                <h3 className="font-semibold">{selectedType.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedType.description}
                </p>
              </div>
            </div>

            {selectedType.requiresEntity ? (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Search Entity</label>
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by entity ID or name..."
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Select Entity ({filteredEntities.length} available)
                  </label>
                  <div className="max-h-64 overflow-y-auto space-y-1 border rounded-lg p-2 dark:border-gray-700">
                    {filteredEntities.length === 0 ? (
                      <p className="text-center text-gray-500 py-4">
                        No entities found
                      </p>
                    ) : (
                      filteredEntities.map((entity) => (
                        <div
                          key={entity.entity_id}
                          onClick={() => setSelectedEntity(entity.entity_id)}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedEntity === entity.entity_id
                              ? 'bg-blue-100 dark:bg-blue-900 border-2 border-blue-500'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-800 border-2 border-transparent'
                          }`}
                        >
                          <div className="font-medium text-sm">
                            {entity.attributes.friendly_name || entity.entity_id}
                          </div>
                          <div className="text-xs text-gray-500 font-mono">
                            {entity.entity_id}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            State: {entity.state}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-4 text-gray-600 dark:text-gray-400">
                This widget doesn't require an entity selection
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button onClick={handleBack} variant="outline">
                Back
              </Button>
              <Button
                onClick={handleAddWidget}
                disabled={selectedType.requiresEntity && !selectedEntity}
              >
                <Plus size={16} className="mr-2" />
                Add Widget
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};
