const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');


const result = dotenv.config();

if (result.error) {
    console.error('⚠️ Error cargando el archivo .env:', result.error);
}


// =========================
// Errores globales
// =========================
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
Eres un experto en SQL PostgreSQL.

REGLAS:
- SOLO generar queries SELECT
- NO usar INSERT, UPDATE, DELETE, DROP, ALTER
- NO múltiples queries
- NO usar ;
- NO inventar tablas ni columnas
- Responder SOLO JSON válido

ESQUEMA:

customers(customer_id, customer_zip_code_prefix, customer_city, customer_state)
orders(order_id, customer_id, order_status)
products(product_id, product_category_name)
order_items(id_interno, order_id, product_id, price)
payments(order_id, payment_value)

FORMATO:
{
  "sql_query": "SELECT ...",
  "business_insight": "..."
>>>>>>> Seguridad_IA
}
`;

const geminiService = new GeminiService(systemPrompt);

// =========================

// 🗄️ SERVICIOS
// =========================
const dbService = require('./src/services/dbService');
const consolidationService = require('./src/services/consolidationService');

// Query service
const QueryService = require('./src/services/query.service');
const queryService = new QueryService(geminiService);

// =========================
// 🛡️ SECURITY MIDDLEWARE
// =========================
const intentMiddleware = require('./src/services/security/intent.middleware');

console.log('✅ Servicios cargados correctamente.');

// =========================
// EXPRESS
// =========================
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());


// =========================
// ENDPOINT PRINCIPAL
// =========================
app.post('/api/query', intentMiddleware, async (req, res) => {

    const { prompt } = req.body;

    try {

        console.log(`🔍 Prompt: ${prompt}`);

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

// =========================
// HEALTHCHECK
// =========================
app.get('/health', (req, res) => {
    res.json({ status: 'OK' });
});

// =========================
// START SERVER
// =========================
app.listen(PORT,'0.0.0.0', () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});require('./src/services/security/intent.middleware')

