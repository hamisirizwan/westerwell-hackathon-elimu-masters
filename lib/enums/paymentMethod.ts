// Payment Method enum - shared between client and server
export const PaymentMethod = {
  MPESA: 'mpesa',
  MTN_MOMO: 'mtn_momo',
  AIRTEL_MONEY: 'airtel_money',
  ORANGE_MONEY: 'orange_money',
  CARD: 'card',
  BANK_TRANSFER: 'bank_transfer',
} as const

export type PaymentMethodValue = typeof PaymentMethod[keyof typeof PaymentMethod]

