const EXACT_MESSAGES = {
  'prompt invalido': 'Invalid prompt',
  'prompt inválido': 'Invalid prompt',
  'intent bloqueado por seguridad': 'Request blocked by security',
  'prompt bloqueado': 'Prompt blocked',
  'bloqueado por veaa security layer': 'Blocked by VEAA security layer',
  'sql bloqueado por loobster': 'SQL blocked by Loobster',
  'sql bloqueado': 'SQL blocked',
  'escribe una pregunta antes de analizar.': 'Type a question before analyzing.',
  'consulta fallida': 'Query failed',
  'error al ejecutar la consulta en supabase.': 'Failed to run query on the database.',
  'error al procesar los resultados de la base de datos.': 'Failed to process database results.',
  'solo select permitido': 'Only SELECT queries are allowed',
  'sql invalido': 'Invalid SQL',
  'sql inválido': 'Invalid SQL',
  'respuesta incompleta de gemini': 'Incomplete response from Gemini',
  'google_api_key is not configured': 'GOOGLE_API_KEY is not configured',
  'google_api_key no configurada': 'GOOGLE_API_KEY is not configured',
}

const PREFIX_MESSAGES = [
  {
    test: (m) => m.startsWith('columna no permitida:'),
    translate: (m) =>
      `Column not allowed: ${m.replace(/^columna no permitida:\s*/i, '')}`,
  },
  {
    test: (m) => m.startsWith('column not allowed:'),
    translate: (m) => m,
  },
]

function normalizeMessage(message) {
  return String(message ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export function translateErrorMessage(message) {
  if (!message) return 'An unknown error occurred'

  const normalized = normalizeMessage(message)
  if (EXACT_MESSAGES[normalized]) {
    return EXACT_MESSAGES[normalized]
  }

  for (const { test, translate } of PREFIX_MESSAGES) {
    if (test(normalized)) {
      return translate(message)
    }
  }

  return message
}
