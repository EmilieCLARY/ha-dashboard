import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEntitiesStore } from '../stores/entities.store';
import { apiService } from '../services/api.service';
import { SystemStatusWidget } from '../components/widgets/SystemStatusWidget';
import {
  Server,
  Cpu,
  HardDrive,
  Activity,
  Thermometer,
  Network,
  Database,
  Zap,
} from 'lucide-react';
import { Card } from '../components/ui/Card';

export function SystemMonitor() {
  const { entities, loading, fetchEntities } = useEntitiesStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (entities.length === 0) {
      fetchEntities();
    }
  }, [entities.length, fetchEntities]);

  // Récupérer tous les capteurs système
  const systemSensors = apiService.getSystemSensors(entities);

  // Filtrer par type de capteur
  const cpuSensors = systemSensors.filter(
    (e) =>
      e.entity_id.includes('cpu') ||
      e.entity_id.includes('processor') ||
      e.attributes.device_class === 'cpu'
  );

  const memorySensors = systemSensors.filter(
    (e) =>
      e.entity_id.includes('memory') ||
      e.entity_id.includes('ram') ||
      e.attributes.device_class === 'memory'
  );

  const diskSensors = systemSensors.filter(
    (e) =>
      e.entity_id.includes('disk') ||
      e.entity_id.includes('storage') ||
      e.attributes.device_class === 'disk'
  );

  const networkSensors = systemSensors.filter(
    (e) =>
      e.entity_id.includes('network') ||
      e.entity_id.includes('eth') ||
      e.entity_id.includes('wlan') ||
      e.entity_id.includes('bytes')
  );

  const temperatureSensors = systemSensors.filter(
    (e) =>
      (e.entity_id.includes('temp') || e.attributes.device_class === 'temperature') &&
      (e.entity_id.includes('system') || e.entity_id.includes('cpu') || e.entity_id.includes('core'))
  );

  const otherSensors = systemSensors.filter(
    (e) =>
      !cpuSensors.includes(e) &&
      !memorySensors.includes(e) &&
      !diskSensors.includes(e) &&
      !networkSensors.includes(e) &&
      !temperatureSensors.includes(e)
  );

  // Fonction pour rendre une carte de capteur
  const renderSensorCard = (sensor: any, icon: React.ReactNode) => {
    const value = parseFloat(sensor.state);
    const unit = sensor.attributes.unit_of_measurement || '';
    const friendlyName = sensor.attributes.friendly_name || sensor.entity_id;

    // Déterminer la couleur selon la valeur et le type
    const getColor = () => {
      if (isNaN(value)) return 'text-gray-500';
      
      // Pour les pourcentages
      if (unit === '%') {
        if (value < 50) return 'text-green-500';
        if (value < 75) return 'text-yellow-500';
        if (value < 90) return 'text-orange-500';
        return 'text-red-500';
      }
      
      // Pour les températures
      if (unit === '°C' || unit === '°F') {
        if (value < 50) return 'text-blue-500';
        if (value < 70) return 'text-green-500';
        if (value < 80) return 'text-yellow-500';
        if (value < 90) return 'text-orange-500';
        return 'text-red-500';
      }

      return 'text-blue-500';
    };

    const getBgColor = () => {
      if (isNaN(value)) return 'bg-gray-50';
      
      if (unit === '%') {
        if (value < 50) return 'bg-green-50';
        if (value < 75) return 'bg-yellow-50';
        if (value < 90) return 'bg-orange-50';
        return 'bg-red-50';
      }

      if (unit === '°C' || unit === '°F') {
        if (value < 50) return 'bg-blue-50';
        if (value < 70) return 'bg-green-50';
        if (value < 80) return 'bg-yellow-50';
        if (value < 90) return 'bg-orange-50';
        return 'bg-red-50';
      }

      return 'bg-blue-50';
    };

    const getProgressWidth = () => {
      if (unit === '%') return `${Math.min(value, 100)}%`;
      if (unit === '°C') return `${Math.min((value / 100) * 100, 100)}%`;
      return '0%';
    };

    const getProgressColor = () => {
      if (isNaN(value)) return 'bg-gray-300';
      
      if (unit === '%') {
        if (value < 50) return 'bg-green-500';
        if (value < 75) return 'bg-yellow-500';
        if (value < 90) return 'bg-orange-500';
        return 'bg-red-500';
      }

      if (unit === '°C' || unit === '°F') {
        if (value < 50) return 'bg-blue-500';
        if (value < 70) return 'bg-green-500';
        if (value < 80) return 'bg-yellow-500';
        if (value < 90) return 'bg-orange-500';
        return 'bg-red-500';
      }

      return 'bg-blue-500';
    };

    return (
      <div
        key={sensor.entity_id}
        className={`rounded-lg border p-4 transition-all cursor-pointer hover:shadow-md hover:scale-105 ${getBgColor()}`}
        onClick={() => navigate(`/entity/${encodeURIComponent(sensor.entity_id)}`)}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className={getColor()}>{icon}</div>
            <h4 className="text-sm font-medium text-gray-700 truncate">
              {friendlyName}
            </h4>
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className={`text-3xl font-bold ${getColor()}`}>
            {isNaN(value) ? sensor.state : value.toFixed(1)}
          </span>
          {unit && (
            <span className="text-xl font-medium text-gray-500">{unit}</span>
          )}
        </div>

        {(unit === '%' || unit === '°C' || unit === '°F') && !isNaN(value) && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${getProgressColor()}`}
              style={{ width: getProgressWidth() }}
            ></div>
          </div>
        )}

        <div className="mt-2 text-xs text-gray-500">
          {new Date(sensor.last_updated).toLocaleString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
        </div>
      </div>
    );
  };

  if (loading && entities.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des capteurs système...</p>
        </div>
      </div>
    );
  }

  if (systemSensors.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">🖥️ Monitoring Système</h2>
          <p className="text-sm text-gray-600 mt-1">
            Surveillance en temps réel de votre système Home Assistant
          </p>
        </div>

        <Card padding="lg">
          <div className="text-center py-12">
            <Server className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun capteur système détecté</h3>
            <p className="text-sm text-gray-600 mb-4">
              Pour activer le monitoring système, ajoutez l'intégration "System Monitor" dans Home Assistant.
            </p>
            <a
              href="https://www.home-assistant.io/integrations/systemmonitor/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              📚 Documentation System Monitor
            </a>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">🖥️ Monitoring Système</h2>
        <p className="text-sm text-gray-600 mt-1">
          {systemSensors.length} capteurs système actifs
        </p>
      </div>

      {/* Widget Status Global */}
      <section>
        <h3 className="text-xl font-semibold mb-4">📊 Vue d'ensemble</h3>
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          <SystemStatusWidget />
        </div>
      </section>

      {/* CPU Sensors */}
      {cpuSensors.length > 0 && (
        <section>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Cpu className="h-6 w-6 text-blue-600" />
            Processeur ({cpuSensors.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {cpuSensors.map((sensor) => renderSensorCard(sensor, <Cpu className="h-5 w-5" />))}
          </div>
        </section>
      )}

      {/* Memory Sensors */}
      {memorySensors.length > 0 && (
        <section>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Activity className="h-6 w-6 text-purple-600" />
            Mémoire ({memorySensors.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {memorySensors.map((sensor) => renderSensorCard(sensor, <Activity className="h-5 w-5" />))}
          </div>
        </section>
      )}

      {/* Disk Sensors */}
      {diskSensors.length > 0 && (
        <section>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <HardDrive className="h-6 w-6 text-green-600" />
            Disques ({diskSensors.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {diskSensors.map((sensor) => renderSensorCard(sensor, <HardDrive className="h-5 w-5" />))}
          </div>
        </section>
      )}

      {/* Temperature Sensors */}
      {temperatureSensors.length > 0 && (
        <section>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Thermometer className="h-6 w-6 text-red-600" />
            Températures Système ({temperatureSensors.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {temperatureSensors.map((sensor) => renderSensorCard(sensor, <Thermometer className="h-5 w-5" />))}
          </div>
        </section>
      )}

      {/* Network Sensors */}
      {networkSensors.length > 0 && (
        <section>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Network className="h-6 w-6 text-cyan-600" />
            Réseau ({networkSensors.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {networkSensors.map((sensor) => renderSensorCard(sensor, <Network className="h-5 w-5" />))}
          </div>
        </section>
      )}

      {/* Other System Sensors */}
      {otherSensors.length > 0 && (
        <section>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Database className="h-6 w-6 text-orange-600" />
            Autres Capteurs ({otherSensors.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {otherSensors.map((sensor) => renderSensorCard(sensor, <Zap className="h-5 w-5" />))}
          </div>
        </section>
      )}
    </div>
  );
}
