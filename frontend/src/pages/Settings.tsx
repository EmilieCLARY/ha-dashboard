import { useState } from 'react';
import { Settings as SettingsIcon, User, Bell, Palette, Shield, Database } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuthStore } from '../stores/auth.store';

export function Settings() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Apparence', icon: Palette },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'data', label: 'Données', icon: Database },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <SettingsIcon className="h-8 w-8 text-blue-600" />
          Paramètres
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gérez les paramètres de votre compte et de l'application
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <Card padding="sm" className="lg:col-span-1 h-fit">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </Card>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {activeTab === 'profile' && (
            <Card title="Informations du Profil" padding="lg">
              <div className="space-y-4">
                <Input
                  label="Nom"
                  placeholder="Votre nom"
                  defaultValue={user?.name}
                  fullWidth
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="votre@email.com"
                  defaultValue={user?.email}
                  fullWidth
                  disabled
                />
                <Input
                  label="Rôle"
                  defaultValue={user?.role}
                  fullWidth
                  disabled
                />
                <div className="pt-4">
                  <Button>Enregistrer les modifications</Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card title="Préférences de Notifications" padding="lg">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
                  <div>
                    <p className="font-medium">Notifications Email</p>
                    <p className="text-sm text-muted-foreground">
                      Recevoir des alertes par email
                    </p>
                  </div>
                  <input type="checkbox" className="toggle" />
                </div>

                <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
                  <div>
                    <p className="font-medium">Notifications Push</p>
                    <p className="text-sm text-muted-foreground">
                      Recevoir des notifications push
                    </p>
                  </div>
                  <input type="checkbox" className="toggle" />
                </div>

                <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
                  <div>
                    <p className="font-medium">Alertes Importantes</p>
                    <p className="text-sm text-muted-foreground">
                      Seulement les alertes critiques
                    </p>
                  </div>
                  <input type="checkbox" className="toggle" defaultChecked />
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'appearance' && (
            <Card title="Apparence" padding="lg">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Thème</label>
                  <select className="block w-full rounded-lg border bg-card px-3 py-2 text-sm">
                    <option>Clair</option>
                    <option>Sombre</option>
                    <option>Automatique</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Langue</label>
                  <select className="block w-full rounded-lg border bg-card px-3 py-2 text-sm">
                    <option>Français</option>
                    <option>English</option>
                    <option>Español</option>
                  </select>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card title="Sécurité" padding="lg">
              <div className="space-y-4">
                <Input
                  label="Mot de passe actuel"
                  type="password"
                  placeholder="••••••••"
                  fullWidth
                />
                <Input
                  label="Nouveau mot de passe"
                  type="password"
                  placeholder="••••••••"
                  fullWidth
                />
                <Input
                  label="Confirmer le mot de passe"
                  type="password"
                  placeholder="••••••••"
                  fullWidth
                />
                <div className="pt-4">
                  <Button>Changer le mot de passe</Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'data' && (
            <Card title="Gestion des Données" padding="lg">
              <div className="space-y-4">
                <div className="p-4 bg-accent rounded-lg">
                  <h4 className="font-medium mb-2">Exporter les données</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Téléchargez une copie de vos données
                  </p>
                  <Button size="sm" variant="secondary">
                    Exporter
                  </Button>
                </div>

                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <h4 className="font-medium text-red-900 dark:text-red-400 mb-2">
                    Supprimer le compte
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                    Cette action est irréversible
                  </p>
                  <Button size="sm" variant="danger">
                    Supprimer mon compte
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
