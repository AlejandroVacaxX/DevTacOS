// Protege la Base de Datos

const { Parser } = require('node-sql-parser');

const parser = new Parser();

const SCHEMA = {
  customers: [
    "customer_id",
    "customer_zip_code_prefix",
    "customer_city",
    "customer_state"
  ],

  orders: [
    "order_id",
    "customer_id",
    "order_status"
  ],

  products: [
    "product_id",
    "product_category_name"
  ],

  order_items: [
    "id_interno",
    "order_id",
    "product_id",
    "price"
  ],

  payments: [
    "order_id",
    "payment_value"
  ]
};

// ======================
// Validación básica SQL
// ======================
function isSQLSafe(sql) {

  if (!sql || typeof sql !== "string") {
    return false;
  }

  const clean = sql.trim();
  const lower = clean.toLowerCase();

  // Solo SELECT
  if (!lower.startsWith("select")) {
    return false;
  }

  // Bloquear múltiples queries
  const semicolons = (clean.match(/;/g) || []).length;

  if (semicolons > 1) {
    return false;
  }

  // Bloquear keywords peligrosas
  const forbidden = [
    "drop",
    "delete",
    "truncate",
    "update",
    "insert",
    "alter",
    "create"
  ];

  for (const word of forbidden) {
    if (lower.includes(word)) {
      return false;
    }
  }

  return true;
}

// ======================
// AST validation
// ======================
function validateAST(sql) {

  const ast = parser.astify(sql);

  if (Array.isArray(ast)) {
    throw new Error("Múltiples queries no permitidas");
  }

  if (ast.type !== "select") {
    throw new Error("Solo SELECT permitido");
  }

  return ast;
}

// ======================
// Validación de columnas
// ======================
function validateColumns(ast) {

  const valid = Object.values(SCHEMA).flat();

  function walk(node) {

    if (!node) return;

    // arrays
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }

    // objetos
    if (typeof node === "object") {

      if (
        node.column &&
        typeof node.column === "string"
      ) {

        const col = node.column.toLowerCase();

        // permitir SELECT *
        if (col !== "*" && !valid.includes(col)) {
          throw new Error(`Columna no permitida: ${col}`);
        }
      }

      for (const key in node) {
        walk(node[key]);
      }
    }
  }

  walk(ast);
}

module.exports = {
  isSQLSafe,
  validateAST,
  validateColumns
};