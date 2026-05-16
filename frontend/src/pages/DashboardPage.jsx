import {
  Database,
  SlidersHorizontal,
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  Users,
  Sparkles,
  MessageSquare,
  Code2,
  FileText,
  Clock,
  Star,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import Card from '../components/ui/Card'
import StatusBadge from '../components/ui/StatusBadge'

const suggestions = [
  {
    icon: TrendingUp,
    text: 'What was our revenue growth in Q3 compared to Q2?',
    category: 'Sales Performance',
  },
  {
    icon: AlertTriangle,
    text: 'Identify customers at high risk of churning this month.',
    category: 'Customer Success',
  },
  {
    icon: Users,
    text: 'Show daily active users segmented by platform.',
    category: 'Product Analytics',
  },
  {
    icon: Sparkles,
    text: 'Generate a macro-economic impact report for APAC.',
    category: 'Automated Macro',
  },
]

const recentQueries = [
  {
    id: 1,
    icon: MessageSquare,
    query: 'MAU trends over the last 6 months',
    status: 'success',
    statusLabel: 'Success',
    time: '2 mins ago',
  },
  {
    id: 2,
    icon: Code2,
    query: 'SELECT sum(revenue) FROM...',
    status: 'success',
    statusLabel: 'Success',
    time: '45 mins ago',
  },
  {
    id: 3,
    icon: FileText,
    query: 'Cost breakdown by AWS service',
    status: 'failed',
    statusLabel: 'Failed',
    time: '2 hrs ago',
  },
  {
    id: 4,
    icon: Clock,
    query: 'Weekly Churn Prediction Model run',
    status: 'running',
    statusLabel: 'Running',
    time: 'Active',
  },
]

export default function DashboardPage() {
  return (
    <>
      <section className="dashboard-hero">
        <h1>What would you like to know?</h1>
        <p>Interact with your business data using natural language...</p>
        <div className="prompt-input">
          <textarea
            placeholder="e.g., Show me the revenue growth across all enterprise clients in EMEA for Q3 compared to Q2..."
            rows={3}
          />
          <div className="prompt-input-footer">
            <div className="prompt-input-tools">
              <button type="button" aria-label="Database">
                <Database size={16} />
              </button>
              <button type="button" aria-label="Filters">
                <SlidersHorizontal size={16} />
              </button>
            </div>
            <Link to="/query-history" className="btn-analyze">
              Analyze →
            </Link>
          </div>
        </div>
      </section>

      <h2 className="section-title">
        <Lightbulb size={16} />
        Suggested Queries
      </h2>
      <div className="suggestion-grid">
        {suggestions.map(({ icon: Icon, text, category }) => (
          <Link key={category} to="/query-history" className="suggestion-card">
            <div className="suggestion-card-icon">
              <Icon size={16} />
            </div>
            <p>{text}</p>
            <span>{category}</span>
          </Link>
        ))}
      </div>

      <div className="dashboard-bottom">
        <Card>
          <div className="card-header">
            <span className="card-title-lg">Recent Queries</span>
            <Link to="/query-history" className="link-muted">
              View All
            </Link>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Query</th>
                <th>Status</th>
                <th>Time</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentQueries.map((row) => {
                const QueryIcon = row.icon
                return (
                <tr key={row.id}>
                  <td>
                    <div className="query-cell">
                      <QueryIcon size={16} />
                      {row.query}
                    </div>
                  </td>
                  <td>
                    <StatusBadge variant={row.status}>{row.statusLabel}</StatusBadge>
                  </td>
                  <td>{row.time}</td>
                  <td />
                </tr>
                )
              })}
            </tbody>
          </table>
        </Card>

        <article className="insight-card">
          <div className="insight-card-header">
            <Star size={16} />
            Insight of the Day
          </div>
          <h3>Anomaly Detected</h3>
          <p>
            Server costs for cluster <strong>prod-us-east-1</strong> spiked by{' '}
            <strong>+14.2%</strong> in the last 24 hours.
          </p>
          <div className="insight-chart">
            {[20, 28, 22, 35, 30, 42, 85].map((h, i) => (
              <span key={i} style={{ height: `${h}%` }} />
            ))}
          </div>
          <button type="button" className="btn-investigate">
            Investigate
          </button>
        </article>
      </div>
    </>
  )
}
