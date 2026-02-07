import React, { useState } from 'react';
import { Plus, Grid, Star, ChevronRight } from 'lucide-react';
import { useDashboardStore, DashboardTemplate } from '../../stores/dashboard-manager.store';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Widget, WidgetHeader, WidgetTitle, WidgetContent, WidgetFooter } from '../ui/widget';
import { Badge } from '../ui/badge';

export const TemplateGallery: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<DashboardTemplate | null>(null);
  const [dashboardName, setDashboardName] = useState('');
  const { templates, createFromTemplate, isLoading } = useDashboardStore();

  const handleSelectTemplate = (template: DashboardTemplate) => {
    setSelectedTemplate(template);
    setDashboardName(`${template.name} Copy`);
  };

  const handleCreateFromTemplate = async () => {
    if (!selectedTemplate || !dashboardName.trim()) return;

    try {
      await createFromTemplate(selectedTemplate.id, dashboardName);
      setIsOpen(false);
      setSelectedTemplate(null);
      setDashboardName('');
    } catch (error) {
      console.error('Failed to create dashboard from template:', error);
    }
  };

  const handleCancel = () => {
    setSelectedTemplate(null);
    setDashboardName('');
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant="outline" size="sm">
        <Grid size={14} className="mr-1.5" />
        Templates
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Templates de dashboard"
        size="lg"
      >
        {!selectedTemplate ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Choisissez un template pour démarrer rapidement
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {templates.length === 0 ? (
                <div className="col-span-2 text-center py-10">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-muted mb-3">
                    <Grid size={24} className="text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-sm">Aucun template disponible</p>
                </div>
              ) : (
                templates.map((template) => (
                  <Widget
                    key={template.id}
                    variant="glass"
                    size="md"
                    design="compact"
                    className="cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200 group"
                    onClick={() => handleSelectTemplate(template)}
                  >
                    <WidgetHeader>
                      <div className="flex items-center gap-2.5">
                        <Grid size={18} className="text-primary" />
                        <WidgetTitle className="text-sm font-semibold text-foreground">
                          {template.name}
                        </WidgetTitle>
                      </div>
                      <ChevronRight size={16} className="opacity-0 group-hover:opacity-60 transition-opacity" />
                    </WidgetHeader>
                    <WidgetContent className="items-start justify-start pt-1">
                      {template.description && (
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {template.description}
                        </p>
                      )}
                    </WidgetContent>
                    <WidgetFooter>
                      <Badge variant="outline" className="text-[10px] gap-1">
                        <Star size={10} />
                        {template.config.layout.length} widgets
                      </Badge>
                    </WidgetFooter>
                  </Widget>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Widget variant="accent" size="md" design="compact" className="w-full">
              <WidgetHeader>
                <WidgetTitle className="text-base font-semibold text-foreground">
                  {selectedTemplate.name}
                </WidgetTitle>
                <Badge variant="secondary">{selectedTemplate.config.layout.length} widgets</Badge>
              </WidgetHeader>
              <WidgetContent className="items-start justify-start pt-1">
                {selectedTemplate.description && (
                  <p className="text-xs text-muted-foreground">
                    {selectedTemplate.description}
                  </p>
                )}
              </WidgetContent>
            </Widget>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Nom du dashboard</label>
              <Input
                value={dashboardName}
                onChange={(e) => setDashboardName(e.target.value)}
                placeholder="Entrez le nom du dashboard"
                autoFocus
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button onClick={handleCancel} variant="outline" size="sm">
                Retour
              </Button>
              <Button
                onClick={handleCreateFromTemplate}
                disabled={!dashboardName.trim() || isLoading}
                size="sm"
              >
                <Plus size={14} className="mr-1.5" />
                Créer
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};
