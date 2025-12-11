import { convertCurrency, getExchangeRate, type CurrencyCode } from './rates'

export interface CurrencyConversion {
  originalAmount: number
  originalCurrency: CurrencyCode
  convertedAmount: number
  convertedCurrency: CurrencyCode
  exchangeRate: number
  rateDate?: string // For future API integration
}

export function calculateConversion(
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode
): CurrencyConversion {
  const convertedAmount = convertCurrency(amount, fromCurrency, toCurrency)
  const fromRate = getExchangeRate(fromCurrency)
  const toRate = getExchangeRate(toCurrency)
  const exchangeRate = toRate / fromRate

  return {
    originalAmount: amount,
    originalCurrency: fromCurrency,
    convertedAmount,
    convertedCurrency: toCurrency,
    exchangeRate,
    rateDate: new Date().toISOString().split('T')[0], // Today's date
  }
}

// Format currency for display
export function formatCurrency(amount: number | string | undefined | null, currency: CurrencyCode | string | undefined | null): string {
  // Convert to number and validate
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : Number(amount)
  
  // Handle invalid amounts
  if (isNaN(numericAmount) || numericAmount === null || numericAmount === undefined) {
    return 'N/A'
  }
  
  if (numericAmount === 0) return 'Free'
  
  // Validate currency code
  if (!currency || typeof currency !== 'string') {
    // Fallback to USD if currency is invalid
    currency = 'USD'
  }
  
  // Ensure currency is uppercase for ISO 4217 format
  const currencyCode = currency.toUpperCase()
  
  try {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })
    
    return formatter.format(numericAmount)
  } catch (error) {
    // Fallback if currency code is not supported by Intl
    console.warn(`Invalid currency code: ${currencyCode}, falling back to USD`)
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })
    return formatter.format(numericAmount)
  }
}

