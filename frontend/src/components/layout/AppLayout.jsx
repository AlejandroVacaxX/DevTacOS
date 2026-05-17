import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopNav from './TopNav'

export default function AppLayout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <TopNav />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
