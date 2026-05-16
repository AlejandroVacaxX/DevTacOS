// Coordina todo el sistema

const { isPromptSuspicious } = require("./security/prompt.guard");

const {
  isSQLSafe,
  validateAST,
  validateColumns
} = require("./security/sql.guard");

const { buildLog, saveLog } = require("../logs/audit.logger");

class QueryService {

  constructor(geminiService) {
    this.gemini = geminiService;
  }

  async process(userPrompt) {

    try {

      // ======================
      // 1. Prompt Injection
      // ======================
      if (isPromptSuspicious(userPrompt)) {

        await saveLog(buildLog({
          userPrompt,
          status: "blocked",
          reason: "prompt_injection"
        }));

        throw new Error("Prompt bloqueado");
      }

      // ======================
      // 2. Gemini
      // ======================
      const raw =
        await this.gemini.generateQueryAndInsight(userPrompt);

      const parsed =
        typeof raw === "string"
          ? JSON.parse(raw)
          : raw;

      // ======================
      // 3. Limpiar SQL
      // ======================
      parsed.sql_query = parsed.sql_query
        .trim()
        .replace(/;$/, "");

      // ======================
      // DEBUG
      // ======================
      console.log("🧠 RESPUESTA GEMINI:");
      console.log(parsed);

      console.log("🧠 SQL GENERADO:");
      console.log(parsed.sql_query);

      // ======================
      // 4. SQL safety
      // ======================
      if (!isSQLSafe(parsed.sql_query)) {

        await saveLog(buildLog({
          userPrompt,
          sql: parsed.sql_query,
          status: "blocked",
          reason: "sql_violation"
        }));

        throw new Error("SQL bloqueado");
      }

      // ======================
      // 5. AST validation
      // ======================
      const ast =
        validateAST(parsed.sql_query);

      validateColumns(ast);

      // ======================
      // 6. Audit OK
      // ======================
      await saveLog(buildLog({
        userPrompt,
        sql: parsed.sql_query,
        insight: parsed.business_insight,
        status: "approved"
      }));

      return parsed;

    } catch (err) {

      console.error("❌ QUERY SERVICE ERROR:");
      console.error(err);

      await saveLog(buildLog({
        userPrompt,
        status: "error",
        reason: err.message
      }));

      throw err;
    }
  }
}

module.exports = QueryService;