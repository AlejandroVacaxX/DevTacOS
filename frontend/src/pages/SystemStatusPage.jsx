import {
  Server,
  Database,
  ArrowLeftRight,
  AlertTriangle,
  Users,
  Shield,
  Bot,
  GitBranch,
  HardDrive,
  ChevronRight,
  Play,
  Trash2,
} from 'lucide-react'
import Card from '../components/ui/Card'
import MetricCard from '../components/ui/MetricCard'

const pipelineNodes = [
  { icon: Users, title: 'Client Apps', sub: '14k active' },
  { icon: Shield, title: 'Lobster Trap', sub: 'Sec Layer' },
  { icon: Bot, title: 'Gemini Core', sub: 'Inference Engine', active: true },
  { icon: GitBranch, title: 'SQL Engine', sub: 'Vector DB' },
  { icon: HardDrive, title: 'Data Lake', sub: 'S3 Archive' },
]

const logs = [
  { time: '14:02:11', level: 'info', msg: 'SecLayer.Auth: Token validated for workspace prod-01' },
  { time: '14:02:12', level: 'db', msg: 'DB.Query: SELECT region, lead_source FROM leads LIMIT 100' },
  { time: '14:02:13', level: 'info', msg: 'GeminiCore.Inference: Model gemini-2.0-flash invoked' },
  { time: '14:02:14', level: 'info', msg: 'Pipeline.Sync: Batch 1847 processed (4.2ms)' },
  { time: '14:02:15', level: 'warn', msg: 'Rate Limit approaching for tenant acme-corp (89%)', highlight: true },
  { time: '14:02:16', level: 'info', msg: 'SQLEngine.Vector: Embedding cache hit ratio 94%' },
]

const levelClass = { info: 'level-info', db: 'level-db', warn: 'level-warn' }

export default function SystemStatusPage() {
  return (
    <>
      <header className="page-header">
        <h1>System Flow Architecture</h1>
        <p>
          Real-time telemetry and service health monitoring across the InsightFlow
          pipeline.
        </p>
      </header>

      <div className="metric-grid">
        <MetricCard
          label="Server Uptime"
          value="99.99%"
          icon={Server}
          trend={{ text: '↑ +0.01%' }}
          footer={{ dot: true, text: 'System Optimal' }}
        />
        <MetricCard
          label="DB Connectivity"
          value="< 5ms"
          icon={Database}
          footer={{ dot: true, text: 'Replication Synced' }}
        />
        <MetricCard label="Pipeline Throughput" icon={ArrowLeftRight}>
          <div className="metric-card-value">4.2 TB/hr</div>
          <div className="metric-card-trend">+12%</div>
          <div className="metric-progress">
            <div className="metric-progress-fill" style={{ width: '72%' }} />
          </div>
        </MetricCard>
        <MetricCard
          label="Error Rate"
          value="0.01%"
          icon={AlertTriangle}
          trend={{ text: '-0.05%', negative: true }}
          footer={{ dot: true, text: 'Below Threshold' }}
        />
      </div>

      <div className="system-grid">
        <Card>
          <div className="card-header">
            <span className="card-title-lg">Live Data Pipeline</span>
            <span className="live-badge">LIVE FLOW</span>
          </div>
          <div className="pipeline-flow">
            {pipelineNodes.map((node, i) => (
              <span key={node.title} style={{ display: 'contents' }}>
                {i > 0 && <ChevronRight className="pipeline-arrow" size={20} />}
                <div className={`pipeline-node${node.active ? ' active' : ''}`}>
                  <div className="pipeline-node-icon">
                    <node.icon size={20} />
                  </div>
                  <h4>{node.title}</h4>
                  <span>{node.sub}</span>
                </div>
              </span>
            ))}
          </div>
        </Card>

        <Card>
          <div className="log-panel-header">
            <span className="card-title-lg">Live API Logs</span>
            <div className="log-panel-actions">
              <button type="button" className="icon-btn" aria-label="Play">
                <Play size={14} />
              </button>
              <button type="button" className="icon-btn" aria-label="Clear">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
          <div className="log-panel">
            {logs.map((log) => (
              <div
                key={log.time + log.msg.slice(0, 20)}
                className={`log-entry${log.highlight ? ' highlight' : ''}`}
              >
                {log.time}{' '}
                <span className={levelClass[log.level]}>
                  [{log.level === 'db' ? 'DB_QUERY' : log.level.toUpperCase()}]
                </span>{' '}
                {log.msg}
              </div>
            ))}
            <p className="log-waiting">... Waiting for events</p>
          </div>
        </Card>
      </div>
    </>
  )
}
