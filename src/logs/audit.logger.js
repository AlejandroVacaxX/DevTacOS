//Guarda todo lo que pasa en la BD

function buildLog({ userPrompt, sql, insight, status, reason }) {
  return {
    user_prompt: userPrompt,
    sql_query: sql,
    business_insight: insight,
    status,
    reason,
    created_at: new Date().toISOString()
  };
}

async function saveLog(log) {
  console.log("🧾 AUDIT LOG:", JSON.stringify(log, null, 2));

  // aquí conectas Supabase después
}

module.exports = { buildLog, saveLog };