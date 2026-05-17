import { Link, useNavigate } from 'react-router-dom'
import {
  LayoutGrid,
  History,
  ListOrdered,
  BarChart3,
  Hexagon,
} from 'lucide-react'
import NavItem from '../ui/NavItem'
import PrimaryButton from '../ui/PrimaryButton'

const mainNav = [
  { to: '/', icon: LayoutGrid, label: 'Dashboard', end: true },
  { to: '/query-history', icon: History, label: 'Query History' },
  { to: '/activity', icon: ListOrdered, label: 'Activity' },
  { to: '/system-status', icon: BarChart3, label: 'System Status' },
]

export default function Sidebar() {
  const navigate = useNavigate()

  return (
    <aside className="sidebar">
      <Link to="/" className="sidebar-brand">
        <div className="sidebar-logo">
          <Hexagon size={20} />
        </div>
        <div>
          <div className="sidebar-title">InsightFlow</div>
        </div>
      </Link>

      <PrimaryButton onClick={() => navigate('/')}>New Analysis</PrimaryButton>

      <nav className="sidebar-nav sidebar-nav-main">
        {mainNav.map(({ to, icon, label, end }) => (
          <NavItem key={to} to={to} icon={icon} end={end}>
            {label}
          </NavItem>
        ))}
      </nav>
    </aside>
  )
}
