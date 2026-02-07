import { useEffect, useState } from 'react';
import { useEntitiesStore } from '../stores/entities.store';
import { useDashboardStore } from '../stores/dashboard-manager.store';
import { Edit2, Save, X, Menu, Grid, Plus } from 'lucide-react';
import { DashboardGrid } from '../components/dashboard/DashboardGrid';
import { DashboardWidget } from '../components/dashboard/DashboardWidget';
import { DashboardManager } from '../components/dashboard/DashboardManager';
import { TemplateGallery } from '../components/dashboard/TemplateGallery';
import { WidgetPicker } from '../components/dashboard/WidgetPicker';
import { Button } from '../components/ui/Button';

export function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {
    entities,
    loading,
    error,
    wsConnected,
    haConnected,
    fetchEntities,
    connectWebSocket,
  } = useEntitiesStore();

  const {
    dashboards,
    activeDashboardId,
    editMode,
    setEditMode,
    loadDashboards,
    loadTemplates,
  } = useDashboardStore();

  useEffect(() => {
    // Fetch initial entities
    fetchEntities();

    // Connect to WebSocket for real-time updates
    connectWebSocket();

    // Load dashboards and templates
    loadDashboards();
    loadTemplates();
  }, [fetchEntities, connectWebSocket, loadDashboards, loadTemplates]);

  const activeDashboard = dashboards.find((d) => d.id === activeDashboardId);

  if (loading && entities.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading entities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg max-w-md">
          <h2 className="text-red-800 dark:text-red-200 font-semibold mb-2">Connection Error</h2>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={() => fetchEntities()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Navigation Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Dashboard Title and Sidebar Toggle */}
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden"
              >
                <Menu size={20} />
              </Button>
              <div>
                <h1 className="text-xl font-bold">
                  {activeDashboard?.name || 'Dashboard'}
                </h1>
                {activeDashboard?.description && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {activeDashboard.description}
                  </p>
                )}
              </div>
            </div>

            {/* Right: Actions and Status */}
            <div className="flex items-center gap-3">
              {/* Connection Status */}
              <div className="hidden md:flex items-center gap-3 text-sm border-r pr-3 border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {wsConnected ? 'WS' : 'Disconnected'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${haConnected ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {haConnected ? 'HA' : 'Waiting'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              {editMode ? (
                <>
                  <WidgetPicker />
                  <Button onClick={() => setEditMode(false)} size="sm">
                    <Save size={16} className="mr-2" />
                    Save
                  </Button>
                  <Button onClick={() => setEditMode(false)} variant="outline" size="sm">
                    <X size={16} className="mr-2" />
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <TemplateGallery />
                  <Button onClick={() => setEditMode(true)} variant="outline" size="sm">
                    <Edit2 size={16} className="mr-2" />
                    Edit
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar - Dashboard Manager */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-20 w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="h-full overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-4 lg:hidden">
              <h2 className="font-semibold text-lg">Dashboards</h2>
              <Button variant="outline" size="sm" onClick={() => setSidebarOpen(false)}>
                <X size={20} />
              </Button>
            </div>
            <DashboardManager />
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content - Dashboard Grid */}
        <main className="flex-1 p-4">
          {dashboards.length === 0 ? (
            <div className="flex items-center justify-center min-h-96">
              <div className="text-center max-w-md">
                <Grid size={64} className="mx-auto text-gray-400 mb-4" />
                <h2 className="text-2xl font-bold mb-2">No Dashboards Yet</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Create your first dashboard or choose from a template to get started
                </p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => setSidebarOpen(true)}>
                    <Plus size={16} className="mr-2" />
                    Create Dashboard
                  </Button>
                  <TemplateGallery />
                </div>
              </div>
            </div>
          ) : activeDashboard ? (
            <DashboardGrid>
              {(widgetConfig) => <DashboardWidget config={widgetConfig} />}
            </DashboardGrid>
          ) : (
            <div className="flex items-center justify-center min-h-96">
              <p className="text-gray-500">Select a dashboard from the sidebar</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
