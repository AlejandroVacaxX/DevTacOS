const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Servicio para interactuar con Gemini.
 */
class GeminiService {
    constructor() {
        const apiKey = process.env.GOOGLE_API_KEY;
        
        if (!apiKey) {
            throw new Error('GOOGLE_API_KEY no configurada en el archivo .env');
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
        
        // Prompt de sistema para guiar a Gemini en la generación de SQL preciso y análisis
        const systemPrompt = `
            Eres un experto en datos y SQL (PostgreSQL).
            Tu tarea es convertir el lenguaje natural del usuario en una consulta SQL válida y proporcionar un breve insight de negocio.
            
            Debes responder ESTRICTAMENTE en formato JSON con la siguiente estructura:
            {
                "sql_query": "LA_CONSULTA_SQL_AQUI",
                "business_insight": "UNA_EXPLICACION_CORTA_DE_LO_QUE_ESTA_CONSULTA_RESUELVE"
            }
            
            Reglas:
            1. El SQL debe ser compatible con PostgreSQL (Northwind schema).
            2. Si el prompt no tiene sentido para datos, devuelve un mensaje de error en 'business_insight' y deja 'sql_query' vacío.
            3. Responde solo con el JSON puro, sin markdown.
        `;

        // Configuramos el modelo con instrucciones de sistema
        this.model = this.genAI.getGenerativeModel({
            model: "gemini-flash-latest", 
            systemInstruction: systemPrompt,
            generationConfig: {
                responseMimeType: "application/json",
            },
        });
    }

    /**
     * Genera un objeto JSON que contiene el SQL y un insight de negocio.
     */
    async generateQueryAndInsight(userPrompt) {
        try {
            console.log('--- Iniciando llamada a Gemini SDK ---');
            const result = await this.model.generateContent(userPrompt);
            const response = await result.response;
            const text = response.text();
            
            console.log('--- Respuesta recibida de Gemini ---');
            return JSON.parse(text);
        } catch (error) {
          
            console.error('❌ ERROR DETALLADO EN GEMINI SERVICE:');
            console.error(JSON.stringify(error, null, 2) || error);
            
            if (error.response) {
                console.error('Detalles de la respuesta de error:', JSON.stringify(error.response, null, 2));
            }

            throw new Error(`Error en Gemini: ${error.message}`);
        }
    }
}

module.exports = new GeminiService();
