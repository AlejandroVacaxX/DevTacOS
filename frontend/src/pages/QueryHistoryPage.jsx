import { useState } from 'react'
import {
  CheckCircle2,
  Clock,
  Database,
  Sparkles,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  Code,
} from 'lucide-react'
import Card from '../components/ui/Card'

const rawData = [
  { region: 'North America', source: 'Organic Search', mqls: '12,400', sqls: '1,860', rate: '15.0%', rateClass: 'conv-high' },
  { region: 'North America', source: 'Paid Social', mqls: '8,200', sqls: '902', rate: '11.0%', rateClass: 'conv-mid' },
  { region: 'EMEA', source: 'Organic Search', mqls: '9,100', sqls: '1,547', rate: '17.0%', rateClass: 'conv-high' },
  { region: 'EMEA', source: 'Referral', mqls: '4,500', sqls: '810', rate: '18.0%', rateClass: 'conv-high' },
  { region: 'APAC', source: 'Paid Social', mqls: '6,800', sqls: '544', rate: '8.0%', rateClass: 'conv-low' },
]

const chartData = [
  { label: 'North America', bars: [65, 45, 80] },
  { label: 'EMEA', bars: [90, 70, 95] },
  { label: 'APAC', bars: [40, 55, 60] },
]

const generatedSql = `SELECT region, lead_source,
  COUNT(*) FILTER (WHERE stage = 'MQL') AS total_mqls,
  COUNT(*) FILTER (WHERE stage = 'SQL') AS total_sqls,
  ROUND(100.0 * COUNT(*) FILTER (WHERE stage = 'SQL')
    / NULLIF(COUNT(*) FILTER (WHERE stage = 'MQL'), 0), 1) AS conv_rate
FROM leads
WHERE created_at >= NOW() - INTERVAL '3 months'
GROUP BY 1, 2
ORDER BY conv_rate DESC;`

export default function QueryHistoryPage() {
  const [chartType, setChartType] = useState('bar')

  return (
    <>
      <header className="query-result-header">
        <div className="page-header-row">
          <h1>
            Show me the MQL to SQL conversion rate by region for the last quarter,
            grouped by primary lead source.
          </h1>
          <div className="query-actions">
            <button type="button" className="btn-export">CSV</button>
            <button type="button" className="btn-export">PDF</button>
            <button type="button" className="btn-export">Share</button>
          </div>
        </div>
        <div className="meta-badges">
          <span className="badge-pill badge-pill--highlight">
            <CheckCircle2 size={14} />
            Confidence: 98%
          </span>
          <span className="badge-pill">
            <Clock size={14} />
            Execution: 450ms
          </span>
          <span className="badge-pill">
            <Database size={14} />
            Source: PostgreSQL (Prod)
          </span>
        </div>
      </header>

      <div className="summary-grid">
        <Card className="summary-card">
          <h3>
            <Sparkles size={16} />
            AI Executive Summary
          </h3>
          <p>
            EMEA leads conversion performance with an average rate of 17.5%, driven
            primarily by Referral and Organic channels. APAC shows underperformance in
            Paid Social at 8%, suggesting budget reallocation opportunities.
          </p>
          <div className="summary-metrics">
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Global Avg</div>
              <strong>14.2%</strong>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Top Region</div>
              <strong>EMEA</strong>
            </div>
          </div>
        </Card>
        <Card className="summary-card">
          <h3>
            <Lightbulb size={16} />
            Business Recommendations
          </h3>
          <ul>
            <li>Increase Paid Social budget in EMEA by 15% based on strong ROI.</li>
            <li>Audit APAC lead scoring — conversion gap vs global average is 6.2%.</li>
            <li>Scale Referral program in North America; 18% conv rate in EMEA benchmark.</li>
          </ul>
        </Card>
      </div>

      <Card className="chart-card">
        <div className="card-header">
          <span className="card-title">Conversion Rate by Region &amp; Source</span>
          <div className="chart-toggle">
            <button
              type="button"
              className={chartType === 'bar' ? 'active' : ''}
              onClick={() => setChartType('bar')}
            >
              Bar
            </button>
            <button
              type="button"
              className={chartType === 'line' ? 'active' : ''}
              onClick={() => setChartType('line')}
            >
              Line
            </button>
          </div>
        </div>
        <div className="bar-chart">
          {chartData.map(({ label, bars }) => (
            <div key={label} className="bar-group">
              <div className="bar-group-bars">
                {bars.map((h, i) => (
                  <div
                    key={i}
                    className={`bar bar--${['a', 'b', 'c'][i]}`}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <span className="bar-group-label">{label}</span>
            </div>
          ))}
        </div>
        <div className="chart-legend">
          <span><i className="bar bar--a" style={{ display: 'inline-block' }} /> Organic</span>
          <span><i className="bar bar--b" style={{ display: 'inline-block' }} /> Paid Social</span>
          <span><i className="bar bar--c" style={{ display: 'inline-block' }} /> Referral</span>
        </div>
      </Card>

      <Card>
        <div className="card-header">
          <span className="card-title">Raw Data Results</span>
          <div className="pagination">
            Rows 1-10 of 42
            <button type="button" className="icon-btn" aria-label="Previous">
              <ChevronLeft size={16} />
            </button>
            <button type="button" className="icon-btn" aria-label="Next">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Region</th>
              <th>Lead Source</th>
              <th>Total MQLs</th>
              <th>Total SQLs</th>
              <th>Conv. Rate</th>
            </tr>
          </thead>
          <tbody>
            {rawData.map((row) => (
              <tr key={`${row.region}-${row.source}`}>
                <td>{row.region}</td>
                <td>{row.source}</td>
                <td>{row.mqls}</td>
                <td>{row.sqls}</td>
                <td className={row.rateClass}>{row.rate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <details className="sql-accordion">
        <summary>
          <Code size={16} />
          Generated SQL
        </summary>
        <pre>{generatedSql}</pre>
      </details>
    </>
  )
}
