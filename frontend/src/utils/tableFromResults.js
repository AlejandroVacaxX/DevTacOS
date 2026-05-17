import { formatCellValue, formatColumnLabel } from './formatters'

export function tableFromResults(results = []) {
  if (!results.length) {
    return { columns: [], rows: [] }
  }

  const keys = Object.keys(results[0])
  const columns = keys.map((key) => ({
    key,
    label: formatColumnLabel(key),
  }))

  const rows = results.map((row, i) => {
    const formatted = { id: i }
    for (const key of keys) {
      formatted[key] = formatCellValue(row[key])
    }
    return formatted
  })

  return { columns, rows }
}
