// Exchange rates (USD as base currency)
// Rates are approximate and should be updated regularly
// Structure allows for easy migration to live API in the future

export const EXCHANGE_RATES = {
  USD: 1,
  KES: 150,      // Kenyan Shilling
  NGN: 1600,     // Nigerian Naira
  GHS: 15,       // Ghanaian Cedi
  ZAR: 18,       // South African Rand
  TZS: 2400,     // Tanzanian Shilling
  UGX: 3800,     // Ugandan Shilling
  RWF: 1300,     // Rwandan Franc
  EUR: 0.92,     // Euro
} as const

export type CurrencyCode = keyof typeof EXCHANGE_RATES

// Helper to validate and normalize currency code
export function validateCurrencyCode(currency: string | undefined | null): CurrencyCode {
  if (!currency) return 'USD'
  
  const normalized = currency.toUpperCase().trim() as CurrencyCode
  // Check if it's a valid currency code
  if (normalized in EXCHANGE_RATES) {
    return normalized
  }
  
  // Fallback to USD if currency is not supported
  return 'USD'
}

// Helper to get rate for a currency
export function getExchangeRate(currency: CurrencyCode): number {
  return EXCHANGE_RATES[currency] || 1
}

// Convert amount from one currency to another
export function convertCurrency(
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode
): number {
  if (fromCurrency === toCurrency) return amount
  
  // Convert to USD first, then to target currency
  const usdAmount = amount / getExchangeRate(fromCurrency)
  const targetAmount = usdAmount * getExchangeRate(toCurrency)
  
  return Math.round(targetAmount * 100) / 100 // Round to 2 decimal places
}

