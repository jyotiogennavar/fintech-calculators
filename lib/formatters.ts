/**
 * All INR formatting utilities.
 * Never call toLocaleString() directly in components — always use these.
 */

/**
 * Format a number as INR currency.
 * e.g. 1500000 → "₹15,00,000"
 */
export function formatINR(value: number): string {
  if (!isFinite(value)) return '₹0'
  return '₹' + Math.round(value).toLocaleString('en-IN')
}

/**
 * Format a number in compact lakh/crore notation.
 * e.g. 1500000 → "₹15.00 L"
 *      12500000 → "₹1.25 Cr"
 *      500 → "₹500"
 */
export function formatCompact(value: number): string {
  if (!isFinite(value)) return '₹0'
  const abs = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  if (abs >= 10_000_000) return `${sign}₹${(abs / 10_000_000).toFixed(2)} Cr`
  if (abs >= 100_000)   return `${sign}₹${(abs / 100_000).toFixed(2)} L`
  return `${sign}₹${Math.round(abs).toLocaleString('en-IN')}`
}

/**
 * Format a percentage.
 * e.g. 0.1523 → "15.23%"
 *      formatPct(15.23, false) → "15.23%"  (already in percent form)
 */
export function formatPct(value: number, isDecimal = false): string {
  const pct = isDecimal ? value * 100 : value
  return `${pct.toFixed(2)}%`
}

/**
 * Format a number of months as a human-readable tenure.
 * e.g. 18 → "1 yr 6 mos"
 *      12 → "1 yr"
 *      5  → "5 mos"
 */
export function formatTenure(months: number): string {
  const yrs = Math.floor(months / 12)
  const mos = months % 12
  if (yrs === 0) return `${mos} mo${mos !== 1 ? 's' : ''}`
  if (mos === 0) return `${yrs} yr${yrs !== 1 ? 's' : ''}`
  return `${yrs} yr${yrs !== 1 ? 's' : ''} ${mos} mo${mos !== 1 ? 's' : ''}`
}

/**
 * Parse a raw string input to a safe positive number.
 * Returns 0 for empty, NaN, negative, or non-finite inputs.
 */
export function parsePositiveNumber(raw: string | number): number {
  const n = typeof raw === 'string' ? parseFloat(raw) : raw
  if (!isFinite(n) || n < 0) return 0
  return n
}

/**
 * Clamp a number between min and max (inclusive).
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Round to a given number of decimal places.
 * Avoids floating-point artifacts.
 */
export function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}