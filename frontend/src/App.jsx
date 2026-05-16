import { Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import DashboardPage from './pages/DashboardPage'
import QueryHistoryPage from './pages/QueryHistoryPage'
import SecurityPage from './pages/SecurityPage'
import SystemStatusPage from './pages/SystemStatusPage'
import PlaceholderPage from './pages/PlaceholderPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="query-history" element={<QueryHistoryPage />} />
        <Route path="security" element={<SecurityPage />} />
        <Route path="system-status" element={<SystemStatusPage />} />
        <Route
          path="settings"
          element={<PlaceholderPage title="Settings" />}
        />
        <Route
          path="support"
          element={<PlaceholderPage title="Support" />}
        />
      </Route>
    </Routes>
  )
}
