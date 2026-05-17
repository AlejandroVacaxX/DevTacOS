const { Parser } = require('node-sql-parser');
const parser = new Parser();

// =========================
// ESQUEMA REAL ACTUALIZADO
// =========================
const SCHEMA = {
  customers: ["customer_id","customer_zip_code_prefix","customer_city","customer_state"],
  orders: ["order_id","customer_id","order_status"],
  products: ["product_id","product_category_name"],
  order_items: ["id_interno","order_id","product_id","price"],
  payments: ["order_id","payment_value"],
  
  // 🔥 TU NUEVA TABLA MAESTRA DE INGENIERÍA DE DATOS
  v_analytics_ventas_maestra_fisica: [
    "id_interno",
    "order_id",
    "product_id",
    "precio_articulo",
    "costo_envio",
    "monto_total_articulo",
    "categoria_producto",
    "fecha_compra",
    "estado_orden",
    "ciudad_cliente",
    "estado_cliente"
  ]
};

// =========================
// 1. Seguridad básica SQL
// =========================
function isSQLSafe(sql) {
  const lower = sql.toLowerCase();

  const blocked = [
    "insert", "update", "delete", "drop",
    "alter", "truncate", "grant", "revoke"
  ];

  if (blocked.some(w => lower.includes(w))) return false;

  // evitar múltiples queries
  if ((lower.match(/;/g) || []).length > 0) return false;

  return true;
}

// =========================
// 2. Validar SOLO SELECT
// =========================
function validateAST(sql) {
  const ast = parser.astify(sql);

  if (!ast) {
    throw new Error("SQL inválido");
  }

  if (ast.type !== "select") {
    throw new Error("Solo SELECT permitido");
  }

  return ast;
}

// =========================
// 3. VALIDACIÓN CORRECTA DE COLUMNAS
// =========================
function validateColumns(ast) {
  const validColumns = new Set(
    Object.values(SCHEMA).flat()
  );

  function walk(node, visited = new Set()) {
    if (!node || typeof node !== "object") return;

    if (visited.has(node)) return;
    visited.add(node);

    // =========================
    // IGNORAR ALIAS DEL SELECT
    // =========================
    if (node.as) return;

    // =========================
    // IGNORAR FUNCIONES SQL (AVG, SUM, COUNT)
    // =========================
    if (node.type === "aggr_func") return;

    // =========================
    // VALIDAR COLUMNAS REALES
    // =========================
    if (node.column && typeof node.column === "string") {
      const col = node.column.toLowerCase();

      // permitir *
      if (col === "*") return;

      // validar contra schema
      if (!validColumns.has(col)) {
        throw new Error(`Columna no permitida: ${col}`);
      }
    }

    // =========================
    // VALIDAR COLUMNAS EN EXPRESIONES (JOIN / TABLE.COLUMN)
    // =========================
    if (node.expr && node.expr.column) {
      const col = node.expr.column.toLowerCase();

      if (col !== "*" && !validColumns.has(col)) {
        throw new Error(`Columna no permitida: ${col}`);
      }
    }

    // =========================
    // RECORRER AST SIN STACK OVERFLOW
    // =========================
    for (const key of Object.keys(node)) {
      const value = node[key];

      if (Array.isArray(value)) {
        value.forEach(v => walk(v, visited));
      } else if (value && typeof value === "object") {
        walk(value, visited);
      }
    }
  }

  walk(ast);
}

// =========================
// EXPORTS
// =========================
module.exports = {
  isSQLSafe,
  validateAST,
  validateColumns
};