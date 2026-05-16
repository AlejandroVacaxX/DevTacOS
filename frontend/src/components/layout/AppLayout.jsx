import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopNav from './TopNav'

const searchConfig = {
  '/': { placeholder: 'Quick find...', shortcut: '⌘ K' },
  '/system-status': {
    placeholder: 'Search resources, logs, or metrics...',
    shortcut: null,
  },
}

export default function AppLayout() {
  const { pathname } = useLocation()
  const search = searchConfig[pathname] ?? searchConfig['/']

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <TopNav placeholder={search.placeholder} shortcut={search.shortcut} />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
