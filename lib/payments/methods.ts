// Payment method types
export const PaymentMethod = {
  MPESA: 'mpesa',
  MTN_MOMO: 'mtn_momo',
  AIRTEL_MONEY: 'airtel_money',
  ORANGE_MONEY: 'orange_money',
  CARD: 'card',
  BANK_TRANSFER: 'bank_transfer',
} as const

export type PaymentMethodType = typeof PaymentMethod[keyof typeof PaymentMethod]

export interface PaymentMethodConfig {
  id: PaymentMethodType
  name: string
  description: string
  icon?: string
  requiresPhone: boolean
  requiresCard: boolean
}

export const PAYMENT_METHODS: Record<PaymentMethodType, PaymentMethodConfig> = {
  [PaymentMethod.MPESA]: {
    id: PaymentMethod.MPESA,
    name: 'M-Pesa',
    description: 'Mobile money via M-Pesa',
    requiresPhone: true,
    requiresCard: false,
  },
  [PaymentMethod.MTN_MOMO]: {
    id: PaymentMethod.MTN_MOMO,
    name: 'MTN Mobile Money',
    description: 'Pay with MTN Mobile Money',
    requiresPhone: true,
    requiresCard: false,
  },
  [PaymentMethod.AIRTEL_MONEY]: {
    id: PaymentMethod.AIRTEL_MONEY,
    name: 'Airtel Money',
    description: 'Pay with Airtel Money',
    requiresPhone: true,
    requiresCard: false,
  },
  [PaymentMethod.ORANGE_MONEY]: {
    id: PaymentMethod.ORANGE_MONEY,
    name: 'Orange Money',
    description: 'Pay with Orange Money',
    requiresPhone: true,
    requiresCard: false,
  },
  [PaymentMethod.CARD]: {
    id: PaymentMethod.CARD,
    name: 'Card Payment',
    description: 'Pay with Visa or Mastercard',
    requiresPhone: false,
    requiresCard: true,
  },
  [PaymentMethod.BANK_TRANSFER]: {
    id: PaymentMethod.BANK_TRANSFER,
    name: 'Bank Transfer',
    description: 'Direct bank transfer',
    requiresPhone: false,
    requiresCard: false,
  },
}

// Country to available payment methods mapping
export const COUNTRY_PAYMENT_METHODS: Record<string, PaymentMethodType[]> = {
  // Kenya
  KE: [PaymentMethod.MPESA, PaymentMethod.CARD],
  
  // Tanzania
  TZ: [PaymentMethod.MPESA, PaymentMethod.AIRTEL_MONEY, PaymentMethod.CARD],
  
  // Uganda
  UG: [PaymentMethod.MTN_MOMO, PaymentMethod.AIRTEL_MONEY, PaymentMethod.CARD],
  
  // Rwanda
  RW: [PaymentMethod.MTN_MOMO, PaymentMethod.AIRTEL_MONEY, PaymentMethod.CARD],
  
  // Ghana
  GH: [PaymentMethod.MTN_MOMO, PaymentMethod.AIRTEL_MONEY, PaymentMethod.CARD],
  
  // Nigeria
  NG: [PaymentMethod.CARD, PaymentMethod.BANK_TRANSFER],
  
  // South Africa
  ZA: [PaymentMethod.CARD, PaymentMethod.BANK_TRANSFER],
  
  // West Africa (Orange Money countries)
  SN: [PaymentMethod.ORANGE_MONEY, PaymentMethod.CARD],
  CI: [PaymentMethod.ORANGE_MONEY, PaymentMethod.CARD],
  
  // Default (International)
  US: [PaymentMethod.CARD],
  EU: [PaymentMethod.CARD],
  
  // Default for other countries
  DEFAULT: [PaymentMethod.CARD],
}

export function getPaymentMethodsForCountry(countryCode: string): PaymentMethodConfig[] {
  const methodIds = COUNTRY_PAYMENT_METHODS[countryCode] || COUNTRY_PAYMENT_METHODS.DEFAULT
  return methodIds.map(id => PAYMENT_METHODS[id])
}

