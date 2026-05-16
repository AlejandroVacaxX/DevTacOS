/**
 * Servicio encargado de consolidar la respuesta final para el frontend.
 * Une los datos crudos de la DB con el insight generado por la IA.
 */
class ConsolidationService {
    /**
     * Consolida los resultados en un formato estándar.
     * @param {string} sql - La consulta generada.
     * @param {string} insight - El análisis de negocio de Gemini.
     * @param {Array} data - Los resultados crudos de la base de datos.
     * @returns {Object} - Respuesta final estructurada.
     */
    consolidate(sql, insight, data) {
        // Aquí se puede añadir lógica adicional de limpieza o formateo si es necesario
        return {
            success: true,
            timestamp: new Date().toISOString(),
            metadata: {
                sql_executed: sql
            },
            business_insight: insight,
            results: data,
            count: data.length
        };
    }
}

module.exports = new ConsolidationService();
