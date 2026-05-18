const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');


const result = dotenv.config();


// Llamamos a la variable que inyectará Vite

const API_URL = process.env.VITE_API_URL;


  

if (result.error) {
    console.error('Error cargando el archivo .env:', result.error);
}


// =========================
// Errores globales
// =========================
process.on('uncaughtException', (err) => {
    console.error('EXCEPCIÓN NO CAPTURADA:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('RECHAZO NO MANEJADO en:', promise, reason);
});

console.log('Cargando servicios...');

// =========================
// GEMINI
// =========================

const GeminiService = require('./src/services/geminiService');

const systemPrompt = `
You are a PostgreSQL expert focused on stress testing and security.

SECURITY AND CONTROL RULES:
- You may ONLY generate SELECT queries.
- INSERT, UPDATE, DELETE, DROP, and ALTER are strictly forbidden.
- Do NOT use a semicolon (;) at the end of the query.
- Do NOT invent tables or columns. Use only the analytical table provided.
- HARDENING RULE: The security middleware validates columns literally. If you use AVG() or SUM(), the AS alias must match EXACTLY an allowed column name (e.g. AVG(precio_articulo) AS precio_articulo or SUM(monto_total_articulo) AS monto_total_articulo). Do not invent new alias names or the query will be rejected.
- Respond STRICTLY with pure JSON, no markdown code blocks.

CRITICAL REJECTION RULES (PURPOSE ALIGNMENT):
- You must NOT answer general knowledge, homework, jokes, poems, or any topic unrelated to the e-commerce dataset.
- You must NOT solve direct math (e.g. "what is 5+5"), unit conversions, or general algorithms that do not use table data.
- ESCAPE RULE FOR REJECTIONS: If the user asks for something forbidden, do NOT reply in plain text or break the format. You MUST return the required JSON with a harmless query in "sql_query" that returns no rows (e.g. SELECT id_interno FROM v_analytics_ventas_maestra_fisica WHERE id_interno IS NULL) and a formal rejection message in English in "business_insight".

BUSINESS ABSTRACTION RULE (HIDE SCHEMA):
- Do NOT mention technical table, view, or column names in "business_insight".
- Write insights in business language only. Refer to the data source abstractly as "the company catalog", "historical sales records", or "the analytics system".

SANDBOX SCHEMA (SOLE SOURCE OF TRUTH):
v_analytics_ventas_maestra_fisica(
  id_interno,
  order_id,
  product_id,
  precio_articulo,
  costo_envio,
  monto_total_articulo,
  categoria_producto,
  fecha_compra,
  estado_orden,
  ciudad_cliente,
  estado_cliente
)

REQUIRED RESPONSE FORMAT:
{
  "sql_query": "THE_SQL_QUERY_HERE",
  "business_insight": "THE_INSIGHT_IN_ENGLISH_HERE"
}

Always write "business_insight" in English.
`;
const geminiService = new GeminiService(systemPrompt);

// =========================

// SERVICIOS
// =========================
const dbService = require('./src/services/dbService');
const consolidationService = require('./src/services/consolidationService');

// Query service
const QueryService = require('./src/services/query.service');
const queryService = new QueryService(geminiService);

// =========================
// SECURITY MIDDLEWARE
// =========================
const intentMiddleware = require('./src/services/security/intent.middleware');

console.log('Servicios cargados correctamente.');

// =========================
// EXPRESS
// =========================
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());




app.post(`${API_URL}/api/query`, intentMiddleware, async (req, res) => {

    const { prompt } = req.body;

    try {

        console.log(`Prompt: ${prompt}`);

        console.log('Procesando con QueryService...');

        const geminiResult = await queryService.process(prompt);

        console.log('Ejecutando SQL...');

        const dbResults = await dbService.executeSQL(
            geminiResult.sql_query
        );

        console.log('Consolidando...');

        const finalResponse = consolidationService.consolidate(
            geminiResult.sql_query,
            geminiResult.business_insight,
            dbResults
        );

        res.json(finalResponse);

    } catch (error) {

        console.error('Error:', error.message);

        res.status(500).json({
            error: true,
            message: error.message
        });
    }
});

// =========================
// HEALTHCHECK
// =========================


app.get(`${API_URL}/health`, (req, res) => {
    res.json({ status: 'OK' });
});


app.listen(PORT,'0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
