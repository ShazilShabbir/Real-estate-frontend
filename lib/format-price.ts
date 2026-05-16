export function formatPrice(price: string | number | undefined, currency?: string, defaultCurrency?: string): string {
  if (price === undefined || price === null) return "N/A"
  const cur = defaultCurrency || currency || "USD"
  const num = typeof price === "string" ? Number.parseFloat(price) : price
  if (isNaN(num)) return "N/A"
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: cur,
      maximumFractionDigits: 0,
    }).format(num)
  } catch {
    return `${cur} ${num.toLocaleString()}`
  }
}
