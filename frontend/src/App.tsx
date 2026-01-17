import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { LoginPage } from './pages/LoginPage';
import { Settings } from './pages/Settings';
import { History } from './pages/History';
import { Automations } from './pages/Automations';
import { SystemMonitor } from './pages/SystemMonitor';
import EntityDetailPage from './pages/EntityDetailPage';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="history" element={<History />} />
          <Route path="automations" element={<Automations />} />
          <Route path="system" element={<SystemMonitor />} />
          <Route path="settings" element={<Settings />} />
          <Route path="entity/:entityId" element={<EntityDetailPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
