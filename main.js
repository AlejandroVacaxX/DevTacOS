const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

// Importacion de servicios siguiendo el principio de responsabilidad única
const geminiService = require('./src/services/geminiService');
const dbService = require('./src/services/dbService');
const consolidationService = require('./src/services/consolidationService');

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
 * @param {string} prompt - El texto ingresado por el usuario.
 * @returns {Promise<boolean>} - True si es seguro, lanza error si no.
 */
async function validatePromptWithProxy(prompt) {
    try {
        // Simulación de validación (Sustituir con la llamada real cuando esté disponible)
        return true; 
    } catch (error) {
        console.error('Error en el Proxy de Seguridad:', error.message);
        throw new Error('Fallo en la validación de seguridad del prompt.');
    }
}

/**
 * Endpoint Principal: InsightFlow Query
 * Flujo: Seguridad -> Gemini (SQL/Insight) -> DB (Python) -> Consolidación
 */
app.post('/api/query', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: true, message: "No se proporcionó un prompt." });
    }

    try {
        // Paso 1: Validación con Proxy de Seguridad (Lobster Trap/Veea)
        const isSafe = await validatePromptWithProxy(prompt);
        
        if (!isSafe) {
            return res.status(403).json({ 
                error: true, 
                message: "El prompt fue rechazado por políticas de seguridad." 
            });
        }
        
        // Paso 2: Generacion de SQL e Insight con Gemini
        const geminiResult = await geminiService.generateQueryAndInsight(prompt);
        
        // Paso 3: Ejecucion en DB (Lógica delegada a DBService que apunta al venv de Python)
        const dbResults = await dbService.executeSQL(geminiResult.sql_query);

        // Paso 4: Consolidación y Respuesta Estructurada
        const finalResponse = consolidationService.consolidate(
            geminiResult.sql_query,
            geminiResult.business_insight,
            dbResults
        );

        res.json(finalResponse);

    } catch (error) {
        console.error('Error en /api/query:', error.message);
        res.status(500).json({ 
            error: true, 
            message: error.message || "Error interno del servidor durante el procesamiento." 
        });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});

app.listen(PORT, () => {
    console.log(`🚀 InsightFlow server running on http://localhost:${PORT}`);
});
