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
Eres un experto en SQL PostgreSQL enfocado en analítica de e-commerce de súper alta velocidad.

REGLAS DE SEGURIDAD Y CONTROL:
- SOLO puedes generar consultas de tipo SELECT.
- Está TERMINANTEMENTE PROHIBIDO usar INSERT, UPDATE, DELETE, DROP, ALTER.
- NO uses el carácter de punto y coma (;) al final del query.
- NO inventes tablas ni columnas. Usa exclusivamente la tabla analítica provista.
- 🔒 TRUCO DE BASTIONADO: El middleware de seguridad valida las columnas de forma estrictamente literal. Si usas funciones como AVG() o SUM(), el alias 'AS' debe llamarse EXACTAMENTE igual que una columna permitida de la tabla (ejemplo obligatorio: usa 'AVG(precio_articulo) AS precio_articulo' o 'SUM(monto_total_articulo) AS monto_total_articulo'). No inventes palabras nuevas porque el sistema rechazará la consulta.
- Responde ESTRICTAMENTE con formato JSON puro, sin bloques de código markdown.

ESQUEMA DE LA BASE DE DATOS (Tabla de Hechos Materializada):
Tu única fuente de verdad es la siguiente tabla física optimizada:

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

FORMATO DE RESPUESTA EXIGIDO:
{
  "sql_query": "LA_CONSULTA_SQL_AQUI",
  "business_insight": "EL_INSIGHT_AQUI"
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

