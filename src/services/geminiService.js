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
            Eres un experto en datos y SQL (PostgreSQL) especializado en analítica de e-commerce.
            Tu tarea es convertir el lenguaje natural del usuario en una consulta SQL válida y proporcionar un breve insight de negocio.
            
            Debes responder ESTRICTAMENTE en formato JSON con la siguiente estructura:
            {
                "sql_query": "LA_CONSULTA_SQL_AQUI",
                "business_insight": "UNA_EXPLICACION_CORTA_DE_LO_QUE_ESTA_CONSULTA_RESUELVE"
            }
            
            ESQUEMA DE LA BASE DE DATOS (Usa únicamente estas tablas y columnas):
            1. customers (customer_id, customer_zip_code_prefix, customer_city, customer_state)
            2. orders (order_id, customer_id, order_status, order_purchase_timestamp, order_approved_at, order_delivered_timestamp, order_estimated_delivery_date)
            3. products (product_id, product_category_name, product_weight_g, product_length_cm, product_height_cm, product_width_cm)
            4. order_items (id_interno, order_id, product_id, seller_id, price, shipping_charges)
            5. payments (order_id, payment_sequential, payment_type, payment_installments, payment_value)
            
            Reglas:
            1. El SQL debe ser compatible con PostgreSQL y usar estrictamente los nombres de tablas y columnas del esquema anterior. No inventes campos como 'product_name' o 'unit_price'.
            2. Nota analítica: Para calcular ingresos o precios por artículo, usa 'order_items.price'. Para montos totales pagados por transacciones, usa 'payments.payment_value'. Las categorías de producto están en 'products.product_category_name'.
            3. Si el prompt no tiene sentido para datos o intenta consultar cosas fuera de este e-commerce, devuelve un mensaje de error explicativo en 'business_insight' y deja 'sql_query' vacío.
            4. Responde solo con el JSON puro, sin bloques de código markdown (\`\`\`json ... \`\`\`).
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
