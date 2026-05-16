const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');

// .env
const result = dotenv.config();

if (result.error) {
    console.error('⚠️ Error cargando el archivo .env:', result.error);
}

// errores globales
process.on('uncaughtException', (err) => {
    console.error('❌ EXCEPCIÓN NO CAPTURADA:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ RECHAZO NO MANEJADO en:', promise, reason);
});

console.log('📦 Cargando servicios...');

// =========================
// 🤖 GEMINI
// =========================

const GeminiService = require('./src/services/geminiService');

const systemPrompt = `
Eres un experto en SQL (PostgreSQL).

Base de datos e-commerce:

customers, orders, products, order_items, payments.

Reglas:
- Solo SELECT
- No inventes tablas ni columnas
- Usa SOLO el esquema dado
- Responde SOLO JSON:

{
  "sql_query": "",
  "business_insight": ""
}
`;

const geminiService = new GeminiService(systemPrompt);

// =========================
// 🗄️ OTROS SERVICIOS
// =========================

const dbService = require('./src/services/dbService');
const consolidationService = require('./src/services/consolidationService');

// query service
const QueryService = require('./src/services/query.service');
const queryService = new QueryService(geminiService);

console.log('✅ Servicios cargados correctamente.');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// proxy placeholder
async function validatePromptWithProxy(prompt) {
    return true;
}

/**
 * Endpoint principal
 */
app.post('/api/query', async (req, res) => {

    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({
            error: true,
            message: "No se proporcionó un prompt."
        });
    }

    try {

        console.log(`🔍 Prompt: ${prompt}`);

        const isSafe = await validatePromptWithProxy(prompt);

        if (!isSafe) {
            return res.status(403).json({
                error: true,
                message: "Bloqueado por seguridad."
            });
        }

        console.log('⚙️ Procesando con QueryService...');

        const geminiResult = await queryService.process(prompt);

        console.log('🗄️ Ejecutando SQL...');

        const dbResults = await dbService.executeSQL(
            geminiResult.sql_query
        );

        console.log('📊 Consolidando...');

        const finalResponse = consolidationService.consolidate(
            geminiResult.sql_query,
            geminiResult.business_insight,
            dbResults
        );

        res.json(finalResponse);

    } catch (error) {

        console.error('❌ Error:', error.message);

        res.status(500).json({
            error: true,
            message: error.message
        });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'OK' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});