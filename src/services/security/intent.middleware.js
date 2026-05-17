const { isValidIntent } = require("./intent.guard");

function intentMiddleware(req, res, next) {
  const { prompt } = req.body;

  // 1. Validación básica de existencia
  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({
      error: true,
      message: "Invalid prompt"
    });
  }

  // 2. Normalización ligera (opcional pero útil)
  const cleanPrompt = prompt.trim();

  // 3. Seguridad de intención
  const isValid = isValidIntent(cleanPrompt);

  if (!isValid) {
    return res.status(403).json({
      error: true,
      message: "Request blocked by security"
    });
  }

  // 4. Guardamos el prompt limpio para el siguiente middleware
  req.body.prompt = cleanPrompt;

  // 5. Continuar flujo
  next();
}

module.exports = intentMiddleware;