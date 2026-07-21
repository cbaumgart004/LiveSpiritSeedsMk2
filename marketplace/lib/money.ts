// Prices are stored as integer cents. Format for display.
export function formatMoney(cents: number, currency = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format((cents || 0) / 100)
}

// Parse a user-typed price string ("19.99") into integer cents.
export function parsePriceToCents(value: string): number {
  const n = Number.parseFloat(String(value).replace(/[^0-9.]/g, ''))
  return Number.isFinite(n) ? Math.round(n * 100) : 0
}
