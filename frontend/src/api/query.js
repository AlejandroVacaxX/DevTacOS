import { apiUrl } from './client'

export async function postQuery(prompt) {
  const start = performance.now()

  const response = await fetch(apiUrl('/api/query'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  })

  const durationMs = Math.round(performance.now() - start)
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const error = new Error(data.message || `Error ${response.status}`)
    error.status = response.status
    error.durationMs = durationMs
    throw error
  }

  return { data, durationMs }
}

export async function fetchHealth() {
  const response = await fetch(apiUrl('/health'))
  if (!response.ok) throw new Error('Health check failed')
  return response.json()
}
