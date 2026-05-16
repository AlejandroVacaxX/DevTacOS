import { Link } from 'react-router-dom'
import {
  LayoutGrid,
  History,
  Shield,
  BarChart3,
  Settings,
  HelpCircle,
  Hexagon,
  User,
} from 'lucide-react'
import NavItem from '../ui/NavItem'
import PrimaryButton from '../ui/PrimaryButton'

const mainNav = [
  { to: '/', icon: LayoutGrid, label: 'Dashboard', end: true },
  { to: '/query-history', icon: History, label: 'Query History' },
  { to: '/security', icon: Shield, label: 'Security Monitoring' },
  { to: '/system-status', icon: BarChart3, label: 'System Status' },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <Link to="/" className="sidebar-brand">
        <div className="sidebar-logo">
          <Hexagon size={20} />
        </div>
        <div>
          <div className="sidebar-title">InsightFlow</div>
          <div className="sidebar-version">AI Core v2.4</div>
        </div>
      </Link>

      <PrimaryButton>New Analysis</PrimaryButton>

      <nav className="sidebar-nav sidebar-nav-main">
        {mainNav.map(({ to, icon, label, end }) => (
          <NavItem key={to} to={to} icon={icon} end={end}>
            {label}
          </NavItem>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <NavItem to="/settings" icon={Settings}>
          Settings
        </NavItem>
        <NavItem to="/support" icon={HelpCircle}>
          Support
        </NavItem>
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            <User size={16} />
          </div>
          <div>
            <div className="sidebar-user-name">Admin User</div>
            <div className="sidebar-user-role">Workspace Owner</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
