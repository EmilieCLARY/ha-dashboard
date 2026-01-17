import { useState } from 'react';
import { Calendar, TrendingUp, Download } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export default function HistoryPage() {
  const [timeRange, setTimeRange] = useState('24h');

  const timeRanges = [
    { value: '1h', label: '1 heure' },
    { value: '24h', label: '24 heures' },
    { value: '7d', label: '7 jours' },
    { value: '30d', label: '30 jours' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            Historique
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Consultez l'historique de vos entités Home Assistant
          </p>
        </div>

        <Button variant="secondary">
          <Download className="h-4 w-4 mr-2" />
          Exporter CSV
        </Button>
      </div>

      {/* Time Range Selector */}
      <Card padding="md">
        <div className="flex items-center gap-2 flex-wrap">
          <Calendar className="h-5 w-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Période :
          </span>
          <div className="flex gap-2">
            {timeRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                  timeRange === range.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* History Charts - To be implemented */}
      <Card title="Graphiques Historiques" padding="lg">
        <div className="text-center py-12">
          <TrendingUp className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Historique des Données
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Les graphiques historiques seront affichés ici. Cette fonctionnalité
            est en cours de développement.
          </p>
        </div>
      </Card>

      {/* Recent Events */}
      <Card title="Événements Récents" padding="none">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Température Salon
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Changement de 22.5°C à 23.1°C
                  </p>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  il y a {i + 1}h
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
