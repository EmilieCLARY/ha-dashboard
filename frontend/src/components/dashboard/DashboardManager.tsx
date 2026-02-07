import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Copy,
  Check,
  Star,
  ChevronDown,
  MoreVertical,
  Download,
  Upload,
} from 'lucide-react';
import { useDashboardStore } from '../../stores/dashboard-manager.store';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Card } from '../ui/Card';

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
            <label className="block text-sm font-medium mb-2">Upload JSON File</label>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                dark:file:bg-blue-900 dark:file:text-blue-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Or Paste JSON</label>
            <textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder="Paste dashboard JSON here..."
              className="w-full h-48 p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 font-mono text-sm"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button onClick={handleModalClose} variant="outline">
              Cancel
            </Button>
            <Button
              onClick={handleImportDashboard}
              disabled={!importData.trim() || isLoading}
            >
              <Upload size={16} className="mr-2" />
              Import
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Dashboard Name</label>
          <Input
            value={dashboardName}
            onChange={(e) => setDashboardName(e.target.value)}
            placeholder="e.g., Living Room"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description (optional)</label>
          <textarea
            value={dashboardDescription}
            onChange={(e) => setDashboardDescription(e.target.value)}
            placeholder="Add a description..."
            className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            rows={3}
          />
        </div>

        <div className="flex gap-2 justify-end">
          <Button onClick={handleModalClose} variant="outline">
            Cancel
          </Button>
          <Button
            onClick={modalMode === 'create' ? handleCreateDashboard : handleEditDashboard}
            disabled={!dashboardName.trim() || isLoading}
          >
            {modalMode === 'create' ? (
              <>
                <Plus size={16} className="mr-2" />
                Create
              </>
            ) : (
              <>
                <Check size={16} className="mr-2" />
                Save
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
          <Plus size={16} className="mr-2" />
          New Dashboard
        </Button>
        <Button onClick={openImportModal} variant="outline" size="sm">
          <Upload size={16} className="mr-2" />
          Import
        </Button>
      </div>

      {/* Dashboard List */}
      <div className="space-y-2">
        {dashboards.map((dashboard) => (
          <Card
            key={dashboard.id}
            className={`p-3 cursor-pointer transition-all ${
              dashboard.id === activeDashboardId
                ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div
                className="flex-1 flex items-center gap-3"
                onClick={() => setActiveDashboard(dashboard.id)}
              >
                {dashboard.isDefault && (
                  <Star size={16} className="text-yellow-500 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{dashboard.name}</h3>
                  {dashboard.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {dashboard.description}
                    </p>
                  )}
                </div>
                {dashboard.id === activeDashboardId && (
                  <Check size={16} className="text-blue-600 flex-shrink-0" />
                )}
              </div>

              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(menuOpen === dashboard.id ? null : dashboard.id);
                  }}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  <MoreVertical size={16} />
                </button>

                {menuOpen === dashboard.id && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setMenuOpen(null)}
                    />
                    <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                      <button
                        onClick={() =>
                          openEditModal(dashboard.id, dashboard.name, dashboard.description)
                        }
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        <Edit2 size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDuplicateDashboard(dashboard.id)}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        <Copy size={14} />
                        Duplicate
                      </button>
                      <button
                        onClick={() => handleExportDashboard(dashboard.id)}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        <Download size={14} />
                        Export
                      </button>
                      <button
                        onClick={() => handleDeleteDashboard(dashboard.id)}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-red-600"
                        disabled={dashboards.length <= 1}
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={
          modalMode === 'create'
            ? 'Create Dashboard'
            : modalMode === 'edit'
            ? 'Edit Dashboard'
            : 'Import Dashboard'
        }
      >
        {renderModalContent()}
      </Modal>
    </div>
  );
};
