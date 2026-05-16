import { NavLink } from 'react-router-dom'

export default function NavItem({ to, icon: Icon, children, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
    >
      <Icon size={18} />
      {children}
    </NavLink>
  )
}
