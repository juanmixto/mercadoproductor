/**
 * Genera un número de pedido legible: ORD-2026-00412
 * Se apoya en un contador secuencial almacenado en la BD.
 */
export function formatOrderNumber(year: number, sequence: number): string {
  return `ORD-${year}-${String(sequence).padStart(5, '0')}`
}
