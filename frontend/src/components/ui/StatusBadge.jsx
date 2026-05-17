const VARIANTS = {
  success: 'status-badge--success',
  failed: 'status-badge--failed',
  running: 'status-badge--running',
  passed: 'status-badge--passed',
  blocked: 'status-badge--blocked',
  secure: 'status-badge--secure',
}

export default function StatusBadge({ variant = 'success', children }) {
  return (
    <span className={`status-badge ${VARIANTS[variant] ?? VARIANTS.success}`}>
      {children}
    </span>
  )
}
