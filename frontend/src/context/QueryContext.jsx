import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { postQuery } from '../api/query'
import { formatRelativeTime } from '../utils/formatters'
import { translateErrorMessage } from '../utils/errorMessages'

const RECENT_KEY = 'insightflow_recent_queries'
const SESSION_KEY = 'insightflow_last_session'
const MAX_RECENT = 8

const QueryContext = createContext(null)

function loadRecent() {
  try {
    const raw = sessionStorage.getItem(RECENT_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function loadSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveRecent(items) {
  sessionStorage.setItem(RECENT_KEY, JSON.stringify(items))
}

function saveSession(session) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

function serializeError(err) {
  if (!err) return null
  return { message: err.message, status: err.status }
}

function deserializeError(saved) {
  if (!saved) return null
  return Object.assign(
    new Error(translateErrorMessage(saved.message)),
    { status: saved.status },
  )
}

export function QueryProvider({ children }) {
  const saved = loadSession()

  const [prompt, setPrompt] = useState(saved?.prompt ?? '')
  const [result, setResult] = useState(saved?.result ?? null)
  const [error, setError] = useState(deserializeError(saved?.error))
  const [durationMs, setDurationMs] = useState(saved?.durationMs ?? null)
  const [loading, setLoading] = useState(false)
  const [recentQueries, setRecentQueries] = useState(loadRecent)

  useEffect(() => {
    saveSession({
      prompt,
      result,
      error: serializeError(error),
      durationMs,
    })
  }, [prompt, result, error, durationMs])

  const pushRecent = useCallback((entry) => {
    setRecentQueries((prev) => {
      const next = [
        entry,
        ...prev.filter((q) => q.id !== entry.id && q.prompt !== entry.prompt),
      ].slice(0, MAX_RECENT)
      saveRecent(next)
      return next
    })
  }, [])

  const submitQuery = useCallback(
    async (userPrompt) => {
      const trimmed = userPrompt?.trim()
      if (!trimmed) {
        const err = new Error('Type a question before analyzing.')
        err.status = 400
        throw err
      }

      setPrompt(trimmed)
      setLoading(true)
      setError(null)

      const entryId = crypto.randomUUID()

      try {
        const { data, durationMs: ms } = await postQuery(trimmed)
        setResult(data)
        setDurationMs(ms)
        pushRecent({
          id: entryId,
          prompt: trimmed,
          status: 'success',
          statusLabel: 'Success',
          time: formatRelativeTime(data.timestamp ?? new Date().toISOString()),
          timestamp: data.timestamp ?? new Date().toISOString(),
          durationMs: ms,
          httpStatus: 200,
          errorMessage: null,
          resultSnapshot: data,
        })
        return { success: true, data }
      } catch (err) {
        setResult(null)
        setDurationMs(err.durationMs ?? null)
        setError(err)
        pushRecent({
          id: entryId,
          prompt: trimmed,
          status: 'failed',
          statusLabel: 'Failed',
          time: formatRelativeTime(new Date().toISOString()),
          timestamp: new Date().toISOString(),
          durationMs: err.durationMs ?? null,
          httpStatus: err.status ?? null,
          errorMessage: translateErrorMessage(err.message),
          resultSnapshot: null,
        })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [pushRecent],
  )

  const viewStoredEntry = useCallback((entry) => {
    setPrompt(entry.prompt)
    setDurationMs(entry.durationMs ?? null)

    if (entry.status === 'success' && entry.resultSnapshot) {
      setResult(entry.resultSnapshot)
      setError(null)
      return true
    }

    if (entry.status === 'failed') {
      setResult(null)
      setError(
        deserializeError({
          message: translateErrorMessage(entry.errorMessage ?? 'Query failed'),
          status: entry.httpStatus,
        }),
      )
      return true
    }

    return false
  }, [])

  const clearSession = useCallback(() => {
    setPrompt('')
    setResult(null)
    setError(null)
    setDurationMs(null)
    sessionStorage.removeItem(SESSION_KEY)
  }, [])

  const value = useMemo(
    () => ({
      prompt,
      setPrompt,
      result,
      error,
      loading,
      durationMs,
      recentQueries,
      submitQuery,
      viewStoredEntry,
      clearSession,
    }),
    [
      prompt,
      result,
      error,
      loading,
      durationMs,
      recentQueries,
      submitQuery,
      viewStoredEntry,
      clearSession,
    ],
  )

  return (
    <QueryContext.Provider value={value}>{children}</QueryContext.Provider>
  )
}

export function useQuery() {
  const ctx = useContext(QueryContext)
  if (!ctx) {
    throw new Error('useQuery must be used within QueryProvider')
  }
  return ctx
}
