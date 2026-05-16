export default function MetricCard({
  label,
  value,
  footer,
  trend,
  icon: Icon,
  accent,
  children,
}) {
  const Wrapper = 'div'
  return (
    <Wrapper className={`metric-card${accent ? ' metric-card--accent' : ''}`}>
      <Wrapper className="metric-card-header">
        <span className="metric-card-label">{label}</span>
        {Icon && (
          <span className="metric-card-icon">
            <Icon size={18} />
          </span>
        )}
      </Wrapper>
      {children ?? <Wrapper className="metric-card-value">{value}</Wrapper>}
      {trend && (
        <Wrapper className={`metric-card-trend${trend.negative ? ' negative' : ''}`}>
          {trend.text}
        </Wrapper>
      )}
      {footer && (
        <Wrapper className="metric-card-footer">
          {footer.dot && <span className="dot" />}
          {footer.text}
        </Wrapper>
      )}
    </Wrapper>
  )
}
