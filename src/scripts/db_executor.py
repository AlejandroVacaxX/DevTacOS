import sys
import json
import psycopg2
import os
from decimal import Decimal
from dotenv import load_dotenv

# Cargamos las variables de entorno que Docker inyecta
load_dotenv(override=True)

# Clase especial para convertir números Decimal de la BD a datos que JSON entienda
class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)  # Convierte el dinero/promedios a número estándar
        return super(DecimalEncoder, self).default(obj)

def execute_query(sql_query):
    """
    Se conecta a la base de datos de Supabase (PostgreSQL) usando la variable del .env.
    """
    connection = None
    try:
        db_url = os.environ.get("DB_URL")
        
        if not db_url:
            return {"error": True, "message": "La variable DB_URL no llegó al contenedor de Docker."}

        # Conexión limpia a Supabase
        connection = psycopg2.connect(db_url, sslmode='require')
        cursor = connection.cursor()
        
        # Ejecución de la consulta
        cursor.execute(sql_query)
        
        # Obtenemos los resultados y columnas
        colnames = [desc[0] for desc in cursor.description]
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
    if len(sys.argv) > 1:
        sql = sys.argv[1]
        results = execute_query(sql)
        # CORREGIDO: Usamos el DecimalEncoder para que no truene con promedios o sumas
        print(json.dumps(results, cls=DecimalEncoder))
    else:
        print(json.dumps({"error": True, "message": "No SQL query provided"}))