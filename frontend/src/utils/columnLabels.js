const COLUMN_LABELS = {
  id_interno: 'Internal ID',
  order_id: 'Order ID',
  product_id: 'Product ID',
  precio_articulo: 'Item price',
  costo_envio: 'Shipping cost',
  monto_total_articulo: 'Total amount',
  categoria_producto: 'Product category',
  fecha_compra: 'Purchase date',
  estado_orden: 'Order status',
  ciudad_cliente: 'Customer city',
  estado_cliente: 'Customer state',
}

function normalizeKey(key) {
  if (!key) return ''
  return String(key)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
}

export function formatColumnLabel(key) {
  const normalized = normalizeKey(key)
  if (COLUMN_LABELS[normalized]) {
    return COLUMN_LABELS[normalized]
  }

  return normalized
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}
