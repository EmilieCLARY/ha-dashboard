import React, { useState } from 'react';
import { Plus, Grid, Star } from 'lucide-react';
import { useDashboardStore, DashboardTemplate } from '../../stores/dashboard-manager.store';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

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
        <Grid size={16} className="mr-2" />
        Templates
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Dashboard Templates"
        size="lg"
      >
        {!selectedTemplate ? (
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Choose a template to get started quickly
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.length === 0 ? (
                <div className="col-span-2 text-center py-8">
                  <p className="text-gray-500">No templates available</p>
                </div>
              ) : (
                templates.map((template) => (
                  <Card
                    key={template.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow p-4"
                    onClick={() => handleSelectTemplate(template)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <Grid size={24} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{template.name}</h3>
                        {template.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {template.description}
                          </p>
                        )}
                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                          <Star size={12} />
                          <span>{template.config.layout.length} widgets</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">{selectedTemplate.name}</h3>
              {selectedTemplate.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedTemplate.description}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Dashboard Name</label>
              <Input
                value={dashboardName}
                onChange={(e) => setDashboardName(e.target.value)}
                placeholder="Enter dashboard name"
                autoFocus
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button onClick={handleCancel} variant="outline">
                Back
              </Button>
              <Button
                onClick={handleCreateFromTemplate}
                disabled={!dashboardName.trim() || isLoading}
              >
                <Plus size={16} className="mr-2" />
                Create Dashboard
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};
