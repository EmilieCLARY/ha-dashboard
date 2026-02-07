import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Copy,
  Check,
  Star,
  MoreVertical,
  Download,
  Upload,
} from 'lucide-react';
import { useDashboardStore } from '../../stores/dashboard-manager.store';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';

export const DashboardManager: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'import'>('create');
  const [dashboardName, setDashboardName] = useState('');
  const [dashboardDescription, setDashboardDescription] = useState('');
  const [editingDashboardId, setEditingDashboardId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [importData, setImportData] = useState('');

  const {
    dashboards,
    activeDashboardId,
    setActiveDashboard,
    createDashboard,
    updateDashboard,
    deleteDashboard,
    duplicateDashboard,
    exportDashboard,
    importDashboard,
    loadDashboards,
    isLoading,
  } = useDashboardStore();

  useEffect(() => {
    loadDashboards();
  }, [loadDashboards]);

  const handleCreateDashboard = async () => {
    if (!dashboardName.trim()) return;

    try {
      await createDashboard({
        name: dashboardName,
        description: dashboardDescription,
        config: { layout: [] },
      });
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create dashboard:', error);
    }
  };

  const handleEditDashboard = async () => {
    if (!editingDashboardId || !dashboardName.trim()) return;

    try {
      await updateDashboard(editingDashboardId, {
        name: dashboardName,
        description: dashboardDescription,
      });
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to update dashboard:', error);
    }
  };

  const handleDeleteDashboard = async (id: string) => {
    if (dashboards.length <= 1) {
      alert('Cannot delete the last dashboard');
      return;
    }

    if (window.confirm('Are you sure you want to delete this dashboard?')) {
      try {
        await deleteDashboard(id);
        setMenuOpen(null);
      } catch (error) {
        console.error('Failed to delete dashboard:', error);
      }
    }
  };

  const handleDuplicateDashboard = async (id: string) => {
    try {
      await duplicateDashboard(id);
      setMenuOpen(null);
    } catch (error) {
      console.error('Failed to duplicate dashboard:', error);
    }
  };

  const handleExportDashboard = async (id: string) => {
    try {
      const data = await exportDashboard(id);
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-${data.name.replace(/\s+/g, '-').toLowerCase()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setMenuOpen(null);
    } catch (error) {
      console.error('Failed to export dashboard:', error);
    }
  };

  const handleImportDashboard = async () => {
    if (!importData.trim()) return;

    try {
      const data = JSON.parse(importData);
      await importDashboard(data);
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to import dashboard:', error);
      alert('Invalid dashboard data');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setImportData(content);
    };
    reader.readAsText(file);
  };

  const openCreateModal = () => {
    setModalMode('create');
    setIsModalOpen(true);
  };

  const openEditModal = (id: string, name: string, description?: string) => {
    setModalMode('edit');
    setEditingDashboardId(id);
    setDashboardName(name);
    setDashboardDescription(description || '');
    setIsModalOpen(true);
    setMenuOpen(null);
  };

  const openImportModal = () => {
    setModalMode('import');
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setDashboardName('');
    setDashboardDescription('');
    setEditingDashboardId(null);
    setImportData('');
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const renderModalContent = () => {
    if (modalMode === 'import') {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Fichier JSON</label>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="block w-full text-sm text-muted-foreground
                file:mr-4 file:py-2 file:px-4
                file:rounded-xl file:border-0
                file:text-sm file:font-semibold
                file:bg-primary/10 file:text-primary
                hover:file:bg-primary/20
                transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Ou coller le JSON</label>
            <textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder="Collez le JSON du dashboard ici..."
              className="w-full h-48 p-3 border-2 border-border rounded-2xl bg-background text-foreground placeholder:text-muted-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button onClick={handleModalClose} variant="outline" size="sm">
              Annuler
            </Button>
            <Button
              onClick={handleImportDashboard}
              disabled={!importData.trim() || isLoading}
              size="sm"
            >
              <Upload size={14} className="mr-1.5" />
              Importer
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Nom du dashboard</label>
          <Input
            value={dashboardName}
            onChange={(e) => setDashboardName(e.target.value)}
            placeholder="ex: Salon"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Description (optionnel)</label>
          <textarea
            value={dashboardDescription}
            onChange={(e) => setDashboardDescription(e.target.value)}
            placeholder="Ajouter une description..."
            className="w-full p-3 border-2 border-border rounded-2xl bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            rows={3}
          />
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <Button onClick={handleModalClose} variant="outline" size="sm">
            Annuler
          </Button>
          <Button
            onClick={modalMode === 'create' ? handleCreateDashboard : handleEditDashboard}
            disabled={!dashboardName.trim() || isLoading}
            size="sm"
          >
            {modalMode === 'create' ? (
              <>
                <Plus size={14} className="mr-1.5" />
                Créer
              </>
            ) : (
              <>
                <Check size={14} className="mr-1.5" />
                Sauvegarder
              </>
            )}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Actions Bar */}
      <div className="flex gap-2">
        <Button onClick={openCreateModal} size="sm">
          <Plus size={14} className="mr-1.5" />
          Nouveau
        </Button>
        <Button onClick={openImportModal} variant="outline" size="sm">
          <Upload size={14} className="mr-1.5" />
          Importer
        </Button>
      </div>

      {/* Dashboard List */}
      <div className="space-y-2">
        {dashboards.map((dashboard) => (
          <div
            key={dashboard.id}
            className={`p-3 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
              dashboard.id === activeDashboardId
                ? 'border-primary/50 bg-primary/5 shadow-sm'
                : 'border-border hover:bg-muted hover:border-border/80'
            }`}
          >
            <div className="flex items-center justify-between">
              <div
                className="flex-1 flex items-center gap-3"
                onClick={() => setActiveDashboard(dashboard.id)}
              >
                {dashboard.isDefault && (
                  <Star size={14} className="text-yellow-500 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm text-foreground truncate">{dashboard.name}</h3>
                  {dashboard.description && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {dashboard.description}
                    </p>
                  )}
                </div>
                {dashboard.id === activeDashboardId && (
                  <Check size={14} className="text-primary flex-shrink-0" />
                )}
              </div>

              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(menuOpen === dashboard.id ? null : dashboard.id);
                  }}
                  className="p-1.5 hover:bg-muted rounded-xl transition-colors"
                >
                  <MoreVertical size={14} className="text-muted-foreground" />
                </button>

                {menuOpen === dashboard.id && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setMenuOpen(null)}
                    />
                    <div className="absolute right-0 mt-1 w-44 bg-background rounded-2xl shadow-lg border-2 border-border py-1 z-20 overflow-hidden">
                      <button
                        onClick={() =>
                          openEditModal(dashboard.id, dashboard.name, dashboard.description)
                        }
                        className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 text-foreground transition-colors"
                      >
                        <Edit2 size={13} />
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDuplicateDashboard(dashboard.id)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 text-foreground transition-colors"
                      >
                        <Copy size={13} />
                        Dupliquer
                      </button>
                      <button
                        onClick={() => handleExportDashboard(dashboard.id)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 text-foreground transition-colors"
                      >
                        <Download size={13} />
                        Exporter
                      </button>
                      <div className="border-t border-border my-1" />
                      <button
                        onClick={() => handleDeleteDashboard(dashboard.id)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-destructive/10 flex items-center gap-2 text-destructive transition-colors"
                        disabled={dashboards.length <= 1}
                      >
                        <Trash2 size={13} />
                        Supprimer
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={
          modalMode === 'create'
            ? 'Créer un dashboard'
            : modalMode === 'edit'
            ? 'Modifier le dashboard'
            : 'Importer un dashboard'
        }
      >
        {renderModalContent()}
      </Modal>
    </div>
  );
};
