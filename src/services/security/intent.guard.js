function normalizePrompt(text) {
  return text
    .toLowerCase()

    // reemplazos comunes
    .replace(/0/g, "o")
    .replace(/1/g, "i")
    .replace(/3/g, "e")
    .replace(/4/g, "a")
    .replace(/5/g, "s")
    .replace(/7/g, "t")

    // símbolos comunes
    .replace(/[@$!]/g, "")

    // espacios repetidos
    .replace(/\s+/g, " ")

    .trim();
}

function isValidIntent(prompt) {

  const p = normalizePrompt(prompt);

  // =========================
  // SQL peligroso
  // =========================
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

  // =========================
  // Prompt injection
  // =========================
  const injectionPatterns = [
    "ignore previous instructions",
    "ignore all instructions",
    "you are now",
    "act as system",
    "bypass security",
    "disable restrictions",
    "pretend you are",
    "reveal secrets",
    "show passwords"
  ];

  // =========================
  // detección
  // =========================
  if (sqlDanger.some(pat => p.includes(pat))) {
    return false;
  }

  if (injectionPatterns.some(pat => p.includes(pat))) {
    return false;
  }

  return true;
}

module.exports = { isValidIntent };