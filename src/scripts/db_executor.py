import sys
import json
import psycopg2
import os
from dotenv import load_dotenv

# Cargamos variables de entorno desde la raiz
load_dotenv(override=True)

def execute_query(sql_query):
    """
    Se conecta a la base de datos de Supabase (PostgreSQL) y ejecuta la consulta.
    """
    connection = None
    try:
        # Los datos de conexión deben estar en el .env, este se los pasare en secreto en whats amores.
        db_url = os.getenv("DB_URL")
        
        if not db_url:
            return {"error": True, "message": "DB_URL no configurada en .env"}

        # Conexion a Supabase
        connection = psycopg2.connect(db_url, sslmode='require')
        cursor = connection.cursor()
        
        # Ejecucion de la consulta
        cursor.execute(sql_query)
        
        # Obtenemos los nombres de las columnas
        colnames = [desc[0] for desc in cursor.description]
        
        # Obtenemos los resultados
        rows = cursor.fetchall()
        
        # Convertimos a lista de diccionarios para el JSON de Node.js
        results = []
        for row in rows:
            results.append(dict(zip(colnames, row)))
            
        return results

    except Exception as e:
        return {"error": True, "message": str(e)}
    finally:
        if connection:
            connection.close()

if __name__ == "__main__":
    # Recibimos el SQL como argumento desde Node.js
    if len(sys.argv) > 1:
        sql = sys.argv[1]
        results = execute_query(sql)
        # Imprimimos el JSON para que Node.js lo capture en el stdout
        print(json.dumps(results))
    else:
        print(json.dumps({"error": True, "message": "No SQL query provided"}))
