function isNumeric(value) {
  return typeof value === 'number' && !Number.isNaN(value)
}

function isLabelValue(value) {
  return typeof value === 'string' || typeof value === 'boolean'
}

export function chartFromResults(results = []) {
  if (!results.length) return null

  const keys = Object.keys(results[0])
  const labelKey = keys.find((k) => isLabelValue(results[0][k]))
  const valueKey = keys.find((k) => k !== labelKey && isNumeric(results[0][k]))

  if (!labelKey || !valueKey) return null

  const points = results
    .slice(0, 12)
    .map((row) => ({
      label: String(row[labelKey] ?? '—'),
      value: Number(row[valueKey]) || 0,
    }))
    .filter((p) => p.label)

  if (!points.length) return null

  const max = Math.max(...points.map((p) => p.value), 1)

  return {
    labelKey,
    valueKey,
    points: points.map((p) => ({
      label: p.label,
      height: Math.round((p.value / max) * 100),
    })),
  }
}
