import React, { useState, useMemo } from 'react';
import { Plus, Thermometer, Droplet, Battery, Lightbulb, Zap, Cloud, Activity, ArrowLeft, Search, ChevronRight } from 'lucide-react';
import { useDashboardStore, WidgetConfig } from '../../stores/dashboard-manager.store';
import { useEntitiesStore } from '../../stores/entities.store';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/badge';

interface WidgetType {
  type: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  defaultSize: { w: number; h: number };
  requiresEntity: boolean;
  entityDomain?: string;
  variant: 'temperature' | 'humidity' | 'battery' | 'light' | 'energy' | 'weather' | 'system';
  color: string;
}

const WIDGET_TYPES: WidgetType[] = [
  {
    type: 'temperature',
    name: 'Température',
    icon: <Thermometer size={20} />,
    description: 'Capteur de température',
    defaultSize: { w: 2, h: 2 },
    requiresEntity: true,
    entityDomain: 'sensor',
    variant: 'temperature',
    color: 'text-orange-500 bg-orange-500/10',
  },
  {
    type: 'humidity',
    name: 'Humidité',
    icon: <Droplet size={20} />,
    description: 'Capteur d\'humidité',
    defaultSize: { w: 2, h: 2 },
    requiresEntity: true,
    entityDomain: 'sensor',
    variant: 'humidity',
    color: 'text-sky-500 bg-sky-500/10',
  },
  {
    type: 'battery',
    name: 'Batterie',
    icon: <Battery size={20} />,
    description: 'Niveau de batterie',
    defaultSize: { w: 2, h: 2 },
    requiresEntity: true,
    entityDomain: 'sensor',
    variant: 'battery',
    color: 'text-emerald-500 bg-emerald-500/10',
  },
  {
    type: 'light',
    name: 'Lumière',
    icon: <Lightbulb size={20} />,
    description: 'Contrôle des lumières',
    defaultSize: { w: 2, h: 2 },
    requiresEntity: true,
    entityDomain: 'light',
    variant: 'light',
    color: 'text-amber-500 bg-amber-500/10',
  },
  {
    type: 'energy',
    name: 'Énergie',
    icon: <Zap size={20} />,
    description: 'Consommation énergétique',
    defaultSize: { w: 3, h: 2 },
    requiresEntity: true,
    entityDomain: 'sensor',
    variant: 'energy',
    color: 'text-violet-500 bg-violet-500/10',
  },
  {
    type: 'weather',
    name: 'Météo',
    icon: <Cloud size={20} />,
    description: 'Informations météo',
    defaultSize: { w: 4, h: 3 },
    requiresEntity: true,
    entityDomain: 'weather',
    variant: 'weather',
    color: 'text-blue-500 bg-blue-500/10',
  },
  {
    type: 'system-status',
    name: 'Système',
    icon: <Activity size={20} />,
    description: 'Statut Home Assistant',
    defaultSize: { w: 4, h: 2 },
    requiresEntity: false,
    variant: 'system',
    color: 'text-rose-500 bg-rose-500/10',
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
        Ajouter
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={selectedType ? selectedType.name : 'Ajouter un widget'}
        size="md"
      >
        {!selectedType ? (
          /* ── Step 1: Widget type list ── */
          <div className="space-y-1.5">
            {WIDGET_TYPES.map((widgetType) => (
              <button
                key={widgetType.type}
                onClick={() => handleSelectType(widgetType)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors text-left group"
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${widgetType.color}`}>
                  {widgetType.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground">{widgetType.name}</div>
                  <div className="text-xs text-muted-foreground">{widgetType.description}</div>
                </div>
                <ChevronRight size={16} className="flex-shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        ) : (
          /* ── Step 2: Entity selection ── */
          <div className="space-y-4">
            {/* Selected type recap */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
              <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${selectedType.color}`}>
                {selectedType.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground">{selectedType.name}</div>
                <div className="text-xs text-muted-foreground">{selectedType.description}</div>
              </div>
              <Badge variant="outline" className="flex-shrink-0 text-[10px]">
                {selectedType.defaultSize.w}×{selectedType.defaultSize.h}
              </Badge>
            </div>

            {selectedType.requiresEntity ? (
              <>
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher une entité..."
                  leftIcon={<Search size={16} />}
                  autoFocus
                />

                <div className="max-h-56 overflow-y-auto space-y-1 border-2 rounded-xl p-1.5 border-border">
                  {filteredEntities.length === 0 ? (
                    <p className="text-center text-muted-foreground py-6 text-sm">
                      Aucune entité trouvée
                    </p>
                  ) : (
                    filteredEntities.map((entity) => (
                      <button
                        key={entity.entity_id}
                        onClick={() => setSelectedEntity(entity.entity_id)}
                        className={`w-full text-left p-2.5 rounded-lg transition-colors ${
                          selectedEntity === entity.entity_id
                            ? 'bg-primary/10 ring-1 ring-primary/40'
                            : 'hover:bg-muted'
                        }`}
                      >
                        <div className="text-sm font-medium truncate">
                          {entity.attributes.friendly_name || entity.entity_id}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-muted-foreground font-mono truncate">
                            {entity.entity_id}
                          </span>
                          <Badge variant="outline" className="text-[9px] flex-shrink-0">
                            {entity.state}
                          </Badge>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </>
            ) : (
              <p className="text-center text-muted-foreground text-sm py-4">
                Ce widget ne nécessite pas d'entité
              </p>
            )}

            <div className="flex gap-2 justify-end pt-1">
              <Button onClick={handleBack} variant="outline" size="sm">
                <ArrowLeft size={14} className="mr-1.5" />
                Retour
              </Button>
              <Button
                onClick={handleAddWidget}
                disabled={selectedType.requiresEntity && !selectedEntity}
                size="sm"
              >
                <Plus size={14} className="mr-1.5" />
                Ajouter
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};
