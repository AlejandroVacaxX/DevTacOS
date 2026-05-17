import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  CheckCircle2,
  Clock,
  Database,
  Sparkles,
  Code,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import Card from '../components/ui/Card'
import DataTable from '../components/ui/DataTable'
import StatusBadge from '../components/ui/StatusBadge'
import { useQuery } from '../context/QueryContext'
import { tableFromResults } from '../utils/tableFromResults'
import { chartFromResults } from '../utils/chartFromResults'
import { formatTimestamp } from '../utils/formatters'

export default function QueryHistoryPage() {
  const { prompt, result, error, loading, durationMs } = useQuery()

  const results = result?.results ?? []
  const { columns, rows } = useMemo(
    () => tableFromResults(results),
    [results],
  )
  const chart = useMemo(() => chartFromResults(results), [results])
  const sql = result?.metadata?.sql_executed ?? ''
  const count = result?.count ?? results.length
  const insight = result?.business_insight ?? ''

  if (loading) {
    return (
      <div className="query-empty-state">
        <Loader2 size={32} className="spin" />
        <p>Analizando tu consulta…</p>
      </div>
    )
  }

  if (!result && !error) {
    return (
      <div className="query-empty-state">
        <p>No hay resultados todavía.</p>
        <Link to="/" className="btn-analyze query-empty-cta">
          Ir al dashboard
        </Link>
      </div>
    )
  }

  if (error && !result) {
    return (
      <>
        <header className="query-result-header">
          <h1>{prompt || 'Consulta'}</h1>
          <div className="meta-badges">
            <span className="badge-pill badge-pill--danger">
              <AlertCircle size={14} />
              Error
            </span>
            {error.status != null && (
              <span className="badge-pill">HTTP {error.status}</span>
            )}
            {durationMs != null && (
              <span className="badge-pill">
                <Clock size={14} />
                {durationMs}ms
              </span>
            )}
          </div>
        </header>
        <Card className="summary-card">
          <StatusBadge variant="failed">Failed</StatusBadge>
          <p className="error-message">{error.message}</p>
          <Link to="/" className="link-muted back-link">
            ← Volver al dashboard
          </Link>
        </Card>
      </>
    )
  }

  return (
    <>
      <header className="query-result-header">
        <h1>{prompt}</h1>
        <div className="meta-badges">
          {result?.success && (
            <span className="badge-pill badge-pill--highlight">
              <CheckCircle2 size={14} />
              Success
            </span>
          )}
          <span className="badge-pill">
            <CheckCircle2 size={14} />
            {count} row{count === 1 ? '' : 's'}
          </span>
          {durationMs != null && (
            <span className="badge-pill">
              <Clock size={14} />
              Execution: {durationMs}ms
            </span>
          )}
          <span className="badge-pill">
            <Database size={14} />
            PostgreSQL (Supabase)
          </span>
          {result?.timestamp && (
            <span className="badge-pill">
              <Clock size={14} />
              {formatTimestamp(result.timestamp)}
            </span>
          )}
        </div>
      </header>

      <div className="summary-grid summary-grid--single">
        <Card className="summary-card">
          <h3>
            <Sparkles size={16} />
            AI Executive Summary
          </h3>
          <p>{insight || 'Sin insight disponible.'}</p>
        </Card>
      </div>

      {chart && (
        <Card className="chart-card">
          <div className="card-header">
            <span className="card-title">
              {chart.labelKey} vs {chart.valueKey}
            </span>
          </div>
          <div className="bar-chart">
            {chart.points.map(({ label, height }) => (
              <div key={label} className="bar-group">
                <div className="bar-group-bars">
                  <div
                    className="bar bar--a"
                    style={{ height: `${height}%` }}
                  />
                </div>
                <span className="bar-group-label">{label}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <div className="card-header">
          <span className="card-title">Raw Data Results</span>
          <div className="pagination">
            {results.length > 0
              ? `Rows 1–${results.length} of ${count}`
              : 'No rows'}
          </div>
        </div>
        {rows.length > 0 ? (
          <DataTable columns={columns} rows={rows} />
        ) : (
          <p className="table-empty-message">
            La consulta no devolvió filas.
          </p>
        )}
      </Card>

      {sql && (
        <details className="sql-accordion" open>
          <summary>
            <Code size={16} />
            Generated SQL
          </summary>
          <pre>{sql}</pre>
        </details>
      )}
    </>
  )
}
