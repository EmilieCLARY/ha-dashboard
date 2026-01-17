import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, TrendingUp, Activity, Info } from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { useEntitiesStore } from '../stores/entities.store';
import { apiService } from '../services/api.service';
import type { HistoryDataPoint } from '../services/api.service';

interface ChartDataPoint {
  time: string;
  value: number;
  formattedTime: string;
}

export default function EntityDetailPage() {
  const { entityId: rawEntityId } = useParams<{ entityId: string }>();
  const navigate = useNavigate();
  const { entities, fetchEntities } = useEntitiesStore();
  const [history, setHistory] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');

  // Decode the entity ID from URL
  const entityId = rawEntityId ? decodeURIComponent(rawEntityId) : undefined;
  
  const entity = entities.find((e) => e.entity_id === entityId);

  useEffect(() => {
    // Fetch entities if not already loaded
    if (entities.length === 0) {
      fetchEntities();
    }
  }, [entities.length, fetchEntities]);

  useEffect(() => {
    if (!entityId) return;

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const endDate = new Date();
        let startDate = new Date();
        
        switch (timeRange) {
          case '1h':
            startDate.setHours(startDate.getHours() - 1);
            break;
          case '6h':
            startDate.setHours(startDate.getHours() - 6);
            break;
          case '24h':
            startDate.setHours(startDate.getHours() - 24);
            break;
          case '7d':
            startDate.setDate(startDate.getDate() - 7);
            break;
          case '30d':
            startDate.setDate(startDate.getDate() - 30);
            break;
        }

        const response = await apiService.getEntityHistory(
          entityId,
          startDate,
          endDate
        );

        const chartData: ChartDataPoint[] = response.data
          .map((point: HistoryDataPoint) => {
            const value = parseFloat(point.state);
            if (isNaN(value)) return null;

            const date = new Date(point.last_changed);
            return {
              time: date.toISOString(),
              value,
              formattedTime: date.toLocaleString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: '2-digit',
              }),
            };
          })
          .filter((point: ChartDataPoint | null): point is ChartDataPoint => point !== null);

        setHistory(chartData);
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [entityId, timeRange]);

  // Show loading if we're still fetching entities
  if (loading && entities.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'entité...</p>
        </div>
      </div>
    );
  }

  if (!entity) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Entité non trouvée</h2>
          <p className="text-gray-600 mb-4">L'entité "{entityId}" n'existe pas ou n'est pas encore chargée.</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => navigate('/')}>Retour au Dashboard</Button>
            <Button variant="secondary" onClick={() => fetchEntities()}>
              Recharger les entités
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const getUnit = () => {
    return entity.attributes?.unit_of_measurement || '';
  };

  const getEntityType = () => {
    const domain = entity.entity_id.split('.')[0];
    const typeMap: Record<string, string> = {
      sensor: 'Capteur',
      binary_sensor: 'Capteur Binaire',
      light: 'Lumière',
      switch: 'Interrupteur',
      climate: 'Climat',
      cover: 'Volet',
    };
    return typeMap[domain] || domain;
  };

  const timeRanges = [
    { value: '1h', label: '1h' },
    { value: '6h', label: '6h' },
    { value: '24h', label: '24h' },
    { value: '7d', label: '7j' },
    { value: '30d', label: '30j' },
  ];

  const stats = history.length > 0 ? {
    current: history[history.length - 1]?.value,
    min: Math.min(...history.map((d: ChartDataPoint) => d.value)),
    max: Math.max(...history.map((d: ChartDataPoint) => d.value)),
    avg: history.reduce((sum: number, d: ChartDataPoint) => sum + d.value, 0) / history.length,
  } : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">
              {entity.attributes?.friendly_name || entity.entity_id}
            </h1>
            <Badge variant="default">{getEntityType()}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{entity.entity_id}</p>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card padding="md">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Activity className="h-4 w-4" />
              Actuel
            </div>
            <div className="text-2xl font-bold">
              {stats.current.toFixed(1)} {getUnit()}
            </div>
          </Card>
          <Card padding="md">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <TrendingUp className="h-4 w-4" />
              Minimum
            </div>
            <div className="text-2xl font-bold">
              {stats.min.toFixed(1)} {getUnit()}
            </div>
          </Card>
          <Card padding="md">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <TrendingUp className="h-4 w-4 rotate-180" />
              Maximum
            </div>
            <div className="text-2xl font-bold">
              {stats.max.toFixed(1)} {getUnit()}
            </div>
          </Card>
          <Card padding="md">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Info className="h-4 w-4" />
              Moyenne
            </div>
            <div className="text-2xl font-bold">
              {stats.avg.toFixed(1)} {getUnit()}
            </div>
          </Card>
        </div>
      )}

      <Card padding="md">
        <div className="flex items-center gap-2 flex-wrap">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium">Période :</span>
          <div className="flex gap-2 flex-wrap">
            {timeRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                  timeRange === range.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card title="Historique" padding="lg">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucune donnée</h3>
            <p className="text-sm text-muted-foreground">
              Aucun historique disponible pour cette période
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={history}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
              <XAxis
                dataKey="formattedTime"
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
              />
              <YAxis
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                label={{
                  value: getUnit(),
                  angle: -90,
                  position: 'insideLeft',
                  fill: '#9ca3af',
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f3f4f6',
                }}
                labelStyle={{ color: '#9ca3af' }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Card>

      <Card title="Informations" padding="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">État</p>
            <p className="font-medium">{entity.state} {getUnit()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Dernière mise à jour</p>
            <p className="font-medium">
              {new Date(entity.last_updated).toLocaleString('fr-FR')}
            </p>
          </div>
          {entity.attributes?.device_class && (
            <div>
              <p className="text-sm text-muted-foreground">Classe de dispositif</p>
              <p className="font-medium">{entity.attributes.device_class}</p>
            </div>
          )}
          {entity.attributes?.friendly_name && (
            <div>
              <p className="text-sm text-muted-foreground">Nom convivial</p>
              <p className="font-medium">{entity.attributes.friendly_name}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
