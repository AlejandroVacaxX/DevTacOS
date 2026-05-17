import { Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import DashboardPage from './pages/DashboardPage'
import QueryHistoryPage from './pages/QueryHistoryPage'
import ActivityPage from './pages/ActivityPage'
import SystemStatusPage from './pages/SystemStatusPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="query-history" element={<QueryHistoryPage />} />
        <Route path="activity" element={<ActivityPage />} />
        <Route path="system-status" element={<SystemStatusPage />} />
      </Route>
    </Routes>
  )
}
