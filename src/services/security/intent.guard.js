function isValidIntent(prompt) {
  const p = prompt.toLowerCase();

  // 1. SQL DANGEROUS (solo si parecen comandos reales)
  const sqlDanger = [
    "drop table",
    "delete from",
    "insert into",
    "update set",
    "alter table",
    "truncate table",
    "grant all",
    "revoke"
  ];

  // 2. Prompt injection fuerte (no palabras sueltas)
  const injectionPatterns = [
    "ignore previous instructions",
    "you are now",
    "act as system",
    "bypass security",
    "disable restrictions",
    "pretend you are"
  ];

  // 3. detección real (frases completas)
  if (sqlDanger.some(pat => p.includes(pat))) return false;
  if (injectionPatterns.some(pat => p.includes(pat))) return false;

  return true;
}

module.exports = { isValidIntent };