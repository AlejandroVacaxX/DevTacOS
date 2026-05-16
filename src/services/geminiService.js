const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {

  constructor(systemPrompt) {
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY no configurada');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);

    this.model = this.genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      systemInstruction: systemPrompt,
      generationConfig: {
        responseMimeType: "application/json",
      },
    });
  }

  async generateQueryAndInsight(userPrompt) {
    try {
      const result = await this.model.generateContent(userPrompt);
      const response = await result.response;
      const text = response.text();

      const parsed = JSON.parse(text);

      // 🔐 validación mínima estructural
      if (!parsed.sql_query || !parsed.business_insight) {
        throw new Error("Respuesta incompleta de Gemini");
      }

      return parsed;

    } catch (err) {
      throw new Error(`Gemini parse error: ${err.message}`);
    }
  }

  // compatibilidad
  async generate(userPrompt) {
    return this.generateQueryAndInsight(userPrompt);
  }
}

module.exports = GeminiService;