const { exec } = require('child_process');
const path = require('path');

/**
 * Servicio encargado de la ejecución de consultas SQL.
 * Se comunica con el entorno de Python para interactuar con la base de datos.
 */
class DBService {
    constructor() {
        // FIJADO PARA HACKATHON: En Docker usamos el comando global 'python3'
        this.pythonPath = 'python3';
        
        // esta es la ruta al archivo de py que habla con supabase
        this.dbScriptPath = path.join(process.cwd(), 'src', 'scripts', 'db_executor.py');
    }

    /**
     * Ejecuta una consulta SQL usando un script de Python.
     * @param {string} sql - La consulta SQL a ejecutar.
     * @returns {Promise<Array>} - Los resultados de la consulta.
     */
    async executeSQL(sql) {
        if (!sql) return [];

        return new Promise((resolve, reject) => {
            // Ejecutamos el script de Python pasando el SQL como argumento
            exec(`${this.pythonPath} "${this.dbScriptPath}" "${sql.replace(/"/g, '\\"')}"`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error ejecución Python: ${error.message}`);
                    return reject(new Error('Failed to run query on the database.'));
                }
                
                if (stderr) {
                    console.warn(`Advertencia Python: ${stderr}`);
                }

                try {
                    const results = JSON.parse(stdout);
                    
                    // Si el script de Python devolvio un objeto de error
                    if (results.error) {
                        return reject(new Error(results.message));
                    }
                    
                    resolve(results);
                } catch (parseError) {
                    console.error('Error al parsear JSON de Python:', stdout);
                    reject(new Error('Failed to process database results.'));
                }
            });
        });
    }
}

module.exports = new DBService();