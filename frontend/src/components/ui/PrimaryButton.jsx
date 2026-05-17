import { Plus } from 'lucide-react'

export default function PrimaryButton({ children = 'New Analysis', onClick }) {
  return (
    <button type="button" className="btn-primary" onClick={onClick}>
      <Plus size={16} />
      {children}
    </button>
  )
}
