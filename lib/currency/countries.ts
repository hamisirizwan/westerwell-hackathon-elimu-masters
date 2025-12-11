import { CurrencyCode } from './rates'

export interface Country {
  code: string
  name: string
  currency: CurrencyCode
  flag?: string
}

// African countries with their currencies
export const COUNTRIES: Country[] = [
  // East Africa
  { code: 'KE', name: 'Kenya', currency: 'KES' },
  { code: 'TZ', name: 'Tanzania', currency: 'TZS' },
  { code: 'UG', name: 'Uganda', currency: 'UGX' },
  { code: 'RW', name: 'Rwanda', currency: 'RWF' },
  { code: 'ET', name: 'Ethiopia', currency: 'USD' }, // Uses USD
  
  // West Africa
  { code: 'NG', name: 'Nigeria', currency: 'NGN' },
  { code: 'GH', name: 'Ghana', currency: 'GHS' },
  { code: 'SN', name: 'Senegal', currency: 'USD' },
  { code: 'CI', name: 'Ivory Coast', currency: 'USD' },
  
  // Southern Africa
  { code: 'ZA', name: 'South Africa', currency: 'ZAR' },
  { code: 'ZW', name: 'Zimbabwe', currency: 'USD' },
  { code: 'ZM', name: 'Zambia', currency: 'USD' },
  
  // International
  { code: 'US', name: 'United States', currency: 'USD' },
  { code: 'EU', name: 'Europe', currency: 'EUR' },
]

export function getCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find(c => c.code === code)
}

export function getCountryByCurrency(currency: CurrencyCode): Country[] {
  return COUNTRIES.filter(c => c.currency === currency)
}

