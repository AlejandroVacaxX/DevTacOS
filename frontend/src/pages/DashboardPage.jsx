import { useState } from 'react'
import { Lightbulb, MessageSquare } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card'
import StatusBadge from '../components/ui/StatusBadge'
import { useQuery } from '../context/QueryContext'

export default function DashboardPage() {
  const navigate = useNavigate()
  const {
    prompt,
    setPrompt,
    loading,
    recentQueries,
    submitQuery,
    viewStoredEntry,
  } = useQuery()
  const [submitError, setSubmitError] = useState(null)

  const successfulRecent = recentQueries
    .filter((q) => q.status === 'success')
    .slice(0, 4)

  async function handleAnalyze(text) {
    const query = (text ?? prompt).trim()
    if (!query) {
      setSubmitError('Escribe una pregunta antes de analizar.')
      return
    }
    setSubmitError(null)
    try {
      await submitQuery(query)
      navigate('/query-history')
    } catch (err) {
      setSubmitError(err.message)
      navigate('/query-history')
    }
  }

  function handleView(entry) {
    viewStoredEntry(entry)
    navigate('/query-history')
  }

  async function handleRerun(entry) {
    setPrompt(entry.prompt)
    try {
      await submitQuery(entry.prompt)
    } catch {
      /* error shown on query-history */
    }
    navigate('/query-history')
  }

  return (
    <>
      <section className="dashboard-hero">
        <h1>What would you like to know?</h1>
        <p>Interact with your business data using natural language.</p>
        <div className="prompt-input">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Top 5 categorías por monto total de ventas..."
            rows={3}
            disabled={loading}
          />
          <div className="prompt-input-footer">
            <button
              type="button"
              className="btn-analyze"
              disabled={loading}
              onClick={() => handleAnalyze()}
            >
              {loading ? 'Analyzing…' : 'Analyze →'}
            </button>
          </div>
        </div>
        {submitError && (
          <p className="form-error">{submitError}</p>
        )}
      </section>

      {successfulRecent.length > 0 && (
        <>
          <h2 className="section-title">
            <Lightbulb size={16} />
            Recent successful queries
          </h2>
          <div className="suggestion-grid">
            {successfulRecent.map((entry) => (
              <button
                key={entry.id}
                type="button"
                className="suggestion-card"
                disabled={loading}
                onClick={() => handleAnalyze(entry.prompt)}
              >
                <p>{entry.prompt}</p>
              </button>
            ))}
          </div>
        </>
      )}

      <Card className="dashboard-recent-card">
        <div className="card-header">
          <span className="card-title-lg">Recent Queries</span>
          <Link to="/query-history" className="link-muted">
            View latest
          </Link>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Query</th>
              <th>Status</th>
              <th>Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {recentQueries.length === 0 ? (
              <tr>
                <td colSpan={4} className="table-empty">
                  No hay consultas en esta sesión. Ejecuta tu primera pregunta arriba.
                </td>
              </tr>
            ) : (
              recentQueries.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div className="query-cell">
                      <MessageSquare size={16} />
                      {row.prompt}
                    </div>
                  </td>
                  <td>
                    <StatusBadge variant={row.status}>
                      {row.statusLabel}
                    </StatusBadge>
                  </td>
                  <td>{row.time}</td>
                  <td className="table-actions">
                    {row.resultSnapshot || row.status === 'failed' ? (
                      <button
                        type="button"
                        className="link-muted table-action-btn"
                        disabled={loading}
                        onClick={() => handleView(row)}
                      >
                        View
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="link-muted table-action-btn"
                      disabled={loading}
                      onClick={() => handleRerun(row)}
                    >
                      Re-run
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </>
  )
}
