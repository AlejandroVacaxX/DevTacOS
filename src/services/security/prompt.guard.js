//Detecta trampas del usuario
//Prompt Injection

const INJECTION_PATTERNS = [
"ignore",
"bypass",
"actua como",
"actúa como",
"modo desarrollador",
"dev mode",
"system prompt"
];

function normalizeText(text) {
return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function isPromptSuspicious(text) {
if (!text) return true;

const clean = normalizeText(text);
return INJECTION_PATTERNS.some(p => clean.includes(p));
}

module.exports = { isPromptSuspicious };