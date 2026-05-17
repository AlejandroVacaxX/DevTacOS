const { isPromptSuspicious } = require("./security/prompt.guard");
const { isSQLSafe, validateAST, validateColumns } = require("./security/sql.guard");
const { buildLog, saveLog } = require("../logs/audit.logger");

class QueryService {
  constructor(geminiService, veaaService, loobsterService) {
    this.gemini = geminiService;
    this.veaa = veaaService;
    this.loobster = loobsterService;
  }

  async process(userPrompt) {
    try {

      // ======================
      // 1. Prompt Injection (básico)
      // ======================
      if (isPromptSuspicious(userPrompt)) {
        await saveLog(buildLog({
          userPrompt,
          status: "blocked",
          reason: "prompt_injection"
        }));
        throw new Error("Prompt blocked");
      }

      // ======================
      // 2. VEAA (INTENT SECURITY)
      // ======================
      if (this.veaa) {
        const veaaResult = await this.veaa.analyze(userPrompt);

        if (!veaaResult.allowed) {
          await saveLog(buildLog({
            userPrompt,
            status: "blocked",
            reason: "veaa_block"
          }));
          throw new Error("Blocked by VEAA security layer");
        }
      }

      // ======================
      // 3. GEMINI (SQL generation)
      // ======================
      const raw = await this.gemini.generateQueryAndInsight(userPrompt);
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;

      let sql = parsed.sql_query
        .trim()
        .replace(/;$/, "");

      // ======================
      // 4. LOOBSTER (SQL FIREWALL)
      // ======================
      if (this.loobster) {
        const check = await this.loobster.validate(sql);

        if (!check.allowed) {
          await saveLog(buildLog({
            userPrompt,
            sql,
            status: "blocked",
            reason: "loobster_block"
          }));
          throw new Error("SQL blocked by Loobster");
        }
      }

      // ======================
      // 5. SQL SAFE CHECK (backup)
      // ======================
      if (!isSQLSafe(sql)) {
        throw new Error("SQL blocked");
      }

      // ======================
      // 6. AST validation
      // ======================
      const ast = validateAST(sql);
      validateColumns(ast);

      // ======================
      // 7. LOG OK
      // ======================
      await saveLog(buildLog({
        userPrompt,
        sql,
        insight: parsed.business_insight,
        status: "approved"
      }));

      return {
        sql_query: sql,
        business_insight: parsed.business_insight
      };

    } catch (err) {
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