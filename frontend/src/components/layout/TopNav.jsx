import { Bell, CircleHelp } from 'lucide-react'
import SearchBar from '../ui/SearchBar'

export default function TopNav({ placeholder, shortcut }) {
  return (
    <header className="top-nav">
      <SearchBar placeholder={placeholder} shortcut={shortcut} />
      <div className="top-nav-actions">
        <button type="button" className="icon-btn" aria-label="Notifications">
          <Bell size={18} />
          <span className="badge-dot" />
        </button>
        <button type="button" className="icon-btn" aria-label="Help">
          <CircleHelp size={18} />
        </button>
      </div>
    </header>
  )
}
