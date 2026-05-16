import os
import psycopg2
from dotenv import load_dotenv

load_dotenv(override=True)

def run_pipeline():
    """
    Data Pipeline que materializa la vista analítica en una tabla física
    para maximizar la velocidad de respuesta en el Hackatón.
    """
    connection = None
    try:
        db_url = os.environ.get("DB_URL")
        if not db_url:
            print("Error: DB_URL no encontrada.")
            return

        print("🔌 Conectando a Supabase...")
        connection = psycopg2.connect(db_url, sslmode='require')
        cursor = connection.cursor()

        print("Materializando v_analytics_ventas_maestra en una tabla física...")
        
        # Clonamos la estructura de tu vista directamente a una tabla física veloz
        query_materializar = """
        DROP TABLE IF EXISTS v_analytics_ventas_maestra_fisica;
        
        CREATE TABLE v_analytics_ventas_maestra_fisica AS 
        SELECT * FROM v_analytics_ventas_maestra;
        """
        
        cursor.execute(query_materializar)
        connection.commit()
        print("¡Pipeline ejecutado con éxito! Tabla física sincronizada.")

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        if connection:
            connection.rollback()
    finally:
        if connection:
            connection.close()

if __name__ == "__main__":
    run_pipeline()