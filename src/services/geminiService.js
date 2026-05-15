const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Servicio para interactuar con Gemini Pro.
 * Se encarga de la generación de SQL y análisis de negocio.
 */
class GeminiService {
    constructor() {
        // Inicialización del SDK con la API Key de las variables de entorno
        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            throw new Error('GOOGLE_API_KEY no configurada en el archivo .env');
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
        
        // Configuración del modelo para forzar respuesta en JSON
        this.model = this.genAI.getGenerativeModel({
            model: "gemini-1.5-pro",
            generationConfig: {
                responseMimeType: "application/json",
            },
        });
    }

    /**
     * Genera un objeto JSON que contiene el SQL y un insight de negocio basado en el prompt.
     * @param {string} userPrompt - El prompt en lenguaje natural del usuario.
     * @returns {Promise<Object>} - El JSON con { sql_query, business_insight }.
     */
    async generateQueryAndInsight(userPrompt) {
        // Prompt de sistema para guiar a Gemini en la generación de SQL preciso y análisis
        const systemPrompt = `
            Eres un experto en datos y SQL (PostgreSQL/BigQuery).
            Tu tarea es convertir el lenguaje natural del usuario en una consulta SQL válida y proporcionar un breve insight de negocio.
            
            Debes responder ESTRICTAMENTE en formato JSON con la siguiente estructura:
            {
                "sql_query": "LA_CONSULTA_SQL_AQUI",
                "business_insight": "UNA_EXPLICACION_CORTA_DE_LO_QUE_ESTA_CONSULTA_RESUELVE"
            }
            
            Reglas:
            1. El SQL debe ser compatible con PostgreSQL.
            2. Si el prompt no tiene sentido para datos, devuelve un mensaje de error en 'business_insight' y deja 'sql_query' vacío.
            3. No incluyas bloques de código Markdown (\`\`\`json). Solo el JSON puro.
        `;

        try {
            const result = await this.model.generateContent([systemPrompt, userPrompt]);
            const response = await result.response;
            const text = response.text();
            
            // Parseamos la respuesta para asegurar que sea un JSON válido
            return JSON.parse(text);
        } catch (error) {
            console.error('Error en GeminiService:', error.message);
            throw new Error('Error al generar la consulta con Gemini.');
        }
    }
}

module.exports = new GeminiService();
