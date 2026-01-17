import { useEffect } from 'react';
import { useEntitiesStore } from '../stores/entities.store';
import { apiService } from '../services/api.service';
import { TemperatureWidget } from '../components/widgets/TemperatureWidget';
import { HumidityWidget } from '../components/widgets/HumidityWidget';
import { BatteryWidget } from '../components/widgets/BatteryWidget';
import { LightWidget } from '../components/widgets/LightWidget';
import { EnergyWidget } from '../components/widgets/EnergyWidget';
import { WeatherWidget } from '../components/widgets/WeatherWidget';

export function Dashboard() {
  const {
    entities,
    loading,
    error,
    wsConnected,
    haConnected,
    fetchEntities,
    connectWebSocket,
  } = useEntitiesStore();

  useEffect(() => {
    // Fetch initial entities
    fetchEntities();

    // Connect to WebSocket for real-time updates
    connectWebSocket();
  }, []);

  // Get temperature sensors
  const temperatureSensors = apiService.getTemperatureSensors(entities);

  // Get humidity sensors
  const humiditySensors = apiService.getHumiditySensors(entities);

  // Get battery sensors
  const batterySensors = apiService.getBatterySensors(entities);

  // Get lights
  const lights = apiService.getLights(entities);

  // Get energy sensors
  const energySensors = apiService.getEnergySensors(entities);

  // Get weather entities
  const weatherEntities = apiService.getWeatherEntities(entities);

  if (loading && entities.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des entités...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 p-6 rounded-lg max-w-md">
          <h2 className="text-red-800 font-semibold mb-2">Erreur de connexion</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => fetchEntities()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Connection Status */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">🏠 Dashboard</h2>
          <p className="text-sm text-gray-600 mt-1">{entities.length} entités disponibles</p>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>{wsConnected ? 'WS connecté' : 'WS déconnecté'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${haConnected ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <span>{haConnected ? 'HA connecté' : 'HA en attente'}</span>
          </div>
        </div>
      </div>

      {/* Temperature Sensors */}
      {temperatureSensors.length > 0 && (
        <section>
          <h3 className="text-xl font-semibold mb-4">🌡️ Températures</h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {temperatureSensors.map((sensor) => (
              <TemperatureWidget key={sensor.entity_id} entity={sensor} />
            ))}
          </div>
        </section>
      )}

      {/* Humidity Sensors */}
      {humiditySensors.length > 0 && (
        <section>
          <h3 className="text-xl font-semibold mb-4">💧 Humidité</h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {humiditySensors.map((sensor) => (
              <HumidityWidget key={sensor.entity_id} entity={sensor} />
            ))}
          </div>
        </section>
      )}

      {/* Battery Sensors */}
      {batterySensors.length > 0 && (
        <section>
          <h3 className="text-xl font-semibold mb-4">🔋 Batteries</h3>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {batterySensors.map((sensor) => (
              <BatteryWidget key={sensor.entity_id} entity={sensor} />
            ))}
          </div>
        </section>
      )}

      {/* Lights */}
      {lights.length > 0 && (
        <section>
          <h3 className="text-xl font-semibold mb-4">💡 Lumières</h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {lights.map((light) => (
              <LightWidget key={light.entity_id} entity={light} />
            ))}
          </div>
        </section>
      )}

      {/* Energy Sensors */}
      {energySensors.length > 0 && (
        <section>
          <h3 className="text-xl font-semibold mb-4">⚡ Consommation Énergétique</h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {energySensors.map((sensor) => (
              <EnergyWidget key={sensor.entity_id} entity={sensor} />
            ))}
          </div>
        </section>
      )}

      {/* Weather */}
      {weatherEntities.length > 0 && (
        <section>
          <h3 className="text-xl font-semibold mb-4">🌤️ Météo</h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {weatherEntities.map((weather) => (
              <WeatherWidget key={weather.entity_id} entity={weather} />
            ))}
          </div>
        </section>
      )}

      {/* All Entities (Debug) */}
      <details className="rounded-lg border bg-card p-6">
        <summary className="cursor-pointer font-semibold">
          📋 Toutes les entités ({entities.length})
        </summary>
        <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
          {entities.map((entity) => (
            <div
              key={entity.entity_id}
              className="flex items-center justify-between p-2 hover:bg-gray-100 rounded"
            >
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {entity.attributes.friendly_name || entity.entity_id}
                </p>
                <p className="text-xs text-gray-500">{entity.entity_id}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">{entity.state}</p>
                {entity.attributes.unit_of_measurement && (
                  <p className="text-xs text-gray-500">
                    {entity.attributes.unit_of_measurement}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
