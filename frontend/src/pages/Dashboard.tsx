import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useEntitiesStore } from '../stores/entities.store';
import { useAuthStore } from '../stores/auth.store';
import { useDashboardStore } from '../stores/dashboard-manager.store';
import { Edit2, Save, X, Menu, Grid, Plus, Loader2, WifiOff, Wifi, AlertCircle, History, Zap, Server, Settings, LogOut, Thermometer } from 'lucide-react';
import { DashboardGrid } from '../components/dashboard/DashboardGrid';
import { DashboardWidget } from '../components/dashboard/DashboardWidget';
import { DashboardManager } from '../components/dashboard/DashboardManager';
import { TemplateGallery } from '../components/dashboard/TemplateGallery';
import { WidgetPicker } from '../components/dashboard/WidgetPicker';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/badge';

export function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuthStore();
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
    fetchEntities();
    connectWebSocket();
    loadDashboards();
    loadTemplates();
  }, [fetchEntities, connectWebSocket, loadDashboards, loadTemplates]);

  const activeDashboard = dashboards.find((d) => d.id === activeDashboardId);

  if (loading && entities.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground text-sm">Chargement des entités...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="bg-destructive/5 border-2 border-destructive/20 p-8 rounded-3xl max-w-md text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-foreground font-semibold text-lg">Erreur de connexion</h2>
          <p className="text-muted-foreground text-sm">{error}</p>
          <Button
            onClick={() => fetchEntities()}
            variant="danger"
            size="sm"
          >
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* ── Top Navigation Bar ── */}
      <div className="bg-background/80 backdrop-blur-lg border-b-2 border-border z-10 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Dashboard Title */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden"
              >
                <Menu size={20} />
              </Button>
              <div>
                <h1 className="text-lg font-bold text-foreground">
                  {activeDashboard?.name || 'Dashboard'}
                </h1>
                {activeDashboard?.description && (
                  <p className="text-xs text-muted-foreground">
                    {activeDashboard.description}
                  </p>
                )}
              </div>
            </div>

            {/* Right: Status & Actions */}
            <div className="flex items-center gap-2.5">
              {/* Connection Status */}
              <div className="hidden md:flex items-center gap-2 pr-3 border-r-2 border-border">
                <Badge variant={wsConnected ? 'success' : 'error'} className="text-[10px] gap-1">
                  {wsConnected ? <Wifi size={10} /> : <WifiOff size={10} />}
                  WS
                </Badge>
                <Badge variant={haConnected ? 'success' : 'warning'} className="text-[10px] gap-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${haConnected ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  HA
                </Badge>
              </div>

              {/* Action Buttons */}
              {editMode ? (
                <>
                  <WidgetPicker />
                  <Button onClick={() => setEditMode(false)} size="sm">
                    <Save size={14} className="mr-1.5" />
                    Sauvegarder
                  </Button>
                  <Button onClick={() => setEditMode(false)} variant="ghost" size="sm">
                    <X size={14} className="mr-1.5" />
                    Annuler
                  </Button>
                </>
              ) : (
                <>
                  <TemplateGallery />
                  <Button onClick={() => setEditMode(true)} variant="outline" size="sm">
                    <Edit2 size={14} className="mr-1.5" />
                    Éditer
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Sidebar – Dashboard Manager ── */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-20 w-80 bg-background border-r-2 border-border transform transition-transform duration-300 lg:translate-x-0 flex flex-col ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Logo */}
          <div className="flex items-center gap-2 border-b-2 border-border px-5 py-4">
            <Thermometer className="h-7 w-7 text-blue-600" />
            <div>
              <h2 className="text-base font-bold text-foreground">HA Dashboard</h2>
              <p className="text-[10px] text-muted-foreground">Home Assistant</p>
            </div>
          </div>

          {/* Dashboard Manager */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-4 lg:hidden">
              <h2 className="font-semibold text-lg text-foreground">Dashboards</h2>
              <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
                <X size={18} />
              </Button>
            </div>
            <DashboardManager />
          </div>

          {/* Navigation Links */}
          <nav className="border-t-2 border-border p-3 space-y-1">
            <Link to="/history" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
              <History size={16} />
              Historique
            </Link>
            <Link to="/automations" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
              <Zap size={16} />
              Automations
            </Link>
            <Link to="/system" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
              <Server size={16} />
              Système
            </Link>
            <Link to="/settings" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
              <Settings size={16} />
              Paramètres
            </Link>
          </nav>

          {/* Logout */}
          <div className="border-t-2 border-border p-3">
            <button
              onClick={() => { logout(); window.location.href = '/login'; }}
              className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut size={16} />
              Déconnexion
            </button>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-10 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Main Content – Dashboard Grid ── */}
        <main className="flex-1 overflow-y-auto p-4">
          {dashboards.length === 0 ? (
            <div className="flex items-center justify-center min-h-96">
              <div className="text-center max-w-md space-y-5">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-muted">
                  <Grid size={36} className="text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Aucun dashboard</h2>
                <p className="text-muted-foreground text-sm">
                  Créez votre premier dashboard ou choisissez un template pour commencer
                </p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => setSidebarOpen(true)}>
                    <Plus size={14} className="mr-1.5" />
                    Créer
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
              <p className="text-muted-foreground text-sm">Sélectionnez un dashboard</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
