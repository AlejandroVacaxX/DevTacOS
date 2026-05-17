import { useEffect, useState } from 'react'
import { Server, Clock, Database, Hash } from 'lucide-react'
import Card from '../components/ui/Card'
import MetricCard from '../components/ui/MetricCard'
import { fetchHealth } from '../api/query'
import { useQuery } from '../context/QueryContext'
import { formatTimestamp } from '../utils/formatters'

export default function SystemStatusPage() {
  const [health, setHealth] = useState(null)
  const [healthError, setHealthError] = useState(null)
  const { result, durationMs, prompt } = useQuery()

  useEffect(() => {
    let cancelled = false

    fetchHealth()
      .then((data) => {
        if (!cancelled) setHealth(data)
      })
      .catch((err) => {
        if (!cancelled) setHealthError(err.message)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const apiOnline = health?.status === 'OK'

  return (
    <>
      <header className="page-header">
        <h1>System Status</h1>
        <p>
        API status according to <code>GET /health </code>
        and the last query executed.</p>
      </header>

      <div className="metric-grid">
        <MetricCard
          label="API Backend"
          value={
            health == null && !healthError
              ? 'Checking…'
              : apiOnline
                ? 'Online'
                : 'Offline'
          }
          icon={Server}
          footer={{
            dot: apiOnline,
            text:
              health?.status != null
                ? `status: ${health.status}`
                : healthError ?? 'Connecting…',
          }}
        />

        {result ? (
          <>
            <MetricCard
              label="Last query rows"
              value={String(result.count ?? result.results?.length ?? 0)}
              icon={Hash}
              footer={{
                dot: true,
                text: prompt ? truncate(prompt, 40) : '—',
              }}
            />
            <MetricCard
              label="Last execution"
              value={durationMs != null ? `${durationMs}ms` : '—'}
              icon={Clock}
              footer={{
                dot: true,
                text: result.timestamp
                  ? formatTimestamp(result.timestamp)
                  : '—',
              }}
            />
            <MetricCard
              label="Data source"
              value="PostgreSQL"
              icon={Database}
              footer={{ dot: apiOnline, text: 'Supabase via API' }}
            />
          </>
        ) : (
          <Card className="status-hint-card">
            <p className="table-empty-message">
            Run a query on the dashboard to view metrics from the latest API response.
            </p>
          </Card>
        )}
      </div>
    </>
  )
}

function truncate(text, max) {
  if (!text || text.length <= max) return text ?? '—'
  return `${text.slice(0, max)}…`
}
