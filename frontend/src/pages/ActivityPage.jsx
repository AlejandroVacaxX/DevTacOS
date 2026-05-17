import { History } from 'lucide-react'
import Card from '../components/ui/Card'
import DataTable from '../components/ui/DataTable'
import StatusBadge from '../components/ui/StatusBadge'
import { useQuery } from '../context/QueryContext'
import { formatTimestamp } from '../utils/formatters'

function truncate(text, max = 80) {
  if (!text || text.length <= max) return text
  return `${text.slice(0, max)}…`
}

export default function ActivityPage() {
  const { recentQueries } = useQuery()

  const columns = [
    { key: 'timestamp', label: 'Timestamp', mono: true },
    { key: 'prompt', label: 'Prompt' },
    { key: 'status', label: 'Status' },
    { key: 'httpStatus', label: 'HTTP', mono: true },
    { key: 'latency', label: 'Latency', mono: true },
    { key: 'errorMessage', label: 'Error' },
  ]

  const rows = recentQueries.map((entry) => ({
    id: entry.id,
    timestamp: formatTimestamp(entry.timestamp),
    prompt: truncate(entry.prompt),
    status: (
      <StatusBadge variant={entry.status}>
        {entry.statusLabel}
      </StatusBadge>
    ),
    httpStatus: entry.httpStatus ?? '—',
    latency: entry.durationMs != null ? `${entry.durationMs}ms` : '—',
    errorMessage: entry.errorMessage ?? '—',
  }))

  return (
    <>
      <header className="page-header">
        <h1>Query Activity</h1>
        <p>
          Historial de consultas de esta sesión enviadas al API (
          <code>POST /api/query</code>).
        </p>
      </header>

      <Card>
        <div className="card-header">
          <span className="card-title-lg">
            <History size={16} style={{ display: 'inline', marginRight: 8 }} />
            Session log
          </span>
        </div>
        {rows.length === 0 ? (
          <p className="table-empty-message">
            Aún no hay consultas en esta sesión.
          </p>
        ) : (
          <DataTable columns={columns} rows={rows} />
        )}
      </Card>
    </>
  )
}
