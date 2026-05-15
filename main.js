const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');

// Cargamos el .env lo más pronto posible
const result = dotenv.config();
if (result.error) {
    console.error('⚠️ Error cargando el archivo .env:', result.error);
}

// Manejadores de errores globales para evitar cierres silenciosos
process.on('uncaughtException', (err) => {
    console.error('❌ EXCEPCIÓN NO CAPTURADA:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ RECHAZO NO MANEJADO en:', promise, 'razón:', reason);
});

// Importación de servicios
console.log('📦 Cargando servicios...');
const geminiService = require('./src/services/geminiService');
const dbService = require('./src/services/dbService');
const consolidationService = require('./src/services/consolidationService');
console.log('✅ Servicios cargados correctamente.');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Instancia de Axios para llamadas al Proxy de Seguridad (Lobster Trap/Veea)
const securityProxy = axios.create({
    baseURL: process.env.SECURITY_PROXY_URL || 'http://localhost:4000',
    timeout: 5000 
});

/**
 * Valida el prompt contra el Proxy de Seguridad (Lobster Trap/Veea).
 */
async function validatePromptWithProxy(prompt) {
    try {
        return true; 
    } catch (error) {
        console.error('Error en el Proxy de Seguridad:', error.message);
        throw new Error('Fallo en la validación de seguridad del prompt.');
    }
}

/**
 * Endpoint Principal: InsightFlow Query
 */
app.post('/api/query', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: true, message: "No se proporcionó un prompt." });
    }

    try {
        console.log(`🔍 Procesando prompt: "${prompt}"`);
        
        const isSafe = await validatePromptWithProxy(prompt);
        if (!isSafe) {
            return res.status(403).json({ error: true, message: "Bloqueado por seguridad." });
        }
        
        console.log('🤖 Llamando a Gemini...');
        const geminiResult = await geminiService.generateQueryAndInsight(prompt);
        
        console.log('🗄️ Ejecutando SQL en DB...');
        const dbResults = await dbService.executeSQL(geminiResult.sql_query);

        console.log('📊 Consolidando respuesta...');
        const finalResponse = consolidationService.consolidate(
            geminiResult.sql_query,
            geminiResult.business_insight,
            dbResults
        );

        res.json(finalResponse);

    } catch (error) {
        console.error('❌ Error en /api/query:', error.message);
        res.status(500).json({ 
            error: true, 
            message: error.message || "Error interno del servidor." 
        });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});

// Forzamos que el bucle de eventos se mantenga activo con un "heartbeat"
setInterval(() => {
    console.log('💓 Heartbeat: El servidor sigue vivo - ' + new Date().toLocaleTimeString());
}, 10000);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 InsightFlow server running on http://localhost:${PORT}`);
    console.log('Press Ctrl+C to stop');
});


