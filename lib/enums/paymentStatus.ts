// Payment Status enum - shared between client and server
export const PaymentStatus = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled',
} as const

export type PaymentStatusValue = typeof PaymentStatus[keyof typeof PaymentStatus]

