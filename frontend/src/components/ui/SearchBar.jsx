import { Search } from 'lucide-react'

export default function SearchBar({
  placeholder = 'Quick find...',
  shortcut = '⌘ K',
}) {
  return (
    <div className="search-bar">
      <Search className="search-icon" />
      <input type="search" placeholder={placeholder} />
      {shortcut && <span className="shortcut">{shortcut}</span>}
    </div>
  )
}
