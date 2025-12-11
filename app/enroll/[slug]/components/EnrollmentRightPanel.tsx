'use client'

import { useState, useEffect } from 'react'
import { PaymentMethodType } from '@/lib/payments/methods'
import { CurrencyCode } from '@/lib/currency/rates'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { MpesaForm } from './payment-forms/MpesaForm'
import { MTNForm } from './payment-forms/MTNForm'
import { AirtelForm } from './payment-forms/AirtelForm'
import { OrangeMoneyForm } from './payment-forms/OrangeMoneyForm'
import { CardForm } from './payment-forms/CardForm'
import { formatCurrency } from '@/lib/currency/converter'

interface EnrollmentRightPanelProps {
  paymentMethod: PaymentMethodType | null
  amount: number
  currency: CurrencyCode
  courseTitle: string
  remainingBalance?: { amount: number; currency: string } | null
  isPartialPayment: boolean
  partialAmount?: number
  onPartialPaymentChange: (isPartial: boolean) => void
  onPartialAmountChange: (amount: number | undefined) => void
  onSubmit: (data: { phoneNumber?: string; cardDetails?: any; partialAmount?: number }) => Promise<void>
  isProcessing: boolean
}

export function EnrollmentRightPanel({
  paymentMethod,
  amount,
  currency,
  courseTitle,
  remainingBalance,
  isPartialPayment,
  partialAmount,
  onPartialPaymentChange,
  onPartialAmountChange,
  onSubmit,
  isProcessing,
}: EnrollmentRightPanelProps) {
  const [localPartialAmount, setLocalPartialAmount] = useState<string>(partialAmount?.toString() || '')

  // Update local state when prop changes
  useEffect(() => {
    if (partialAmount) {
      setLocalPartialAmount(partialAmount.toString())
    } else {
      setLocalPartialAmount('')
    }
  }, [partialAmount])

  // Calculate display amount (partial or full)
  const displayAmount = isPartialPayment && partialAmount ? partialAmount : (remainingBalance ? remainingBalance.amount : amount)
  const maxAmount = remainingBalance ? remainingBalance.amount : amount
  const hasExistingBalance = !!remainingBalance && remainingBalance.amount > 0

  const handlePartialAmountChange = (value: string) => {
    setLocalPartialAmount(value)
    const numValue = parseFloat(value)
    if (!isNaN(numValue) && numValue > 0) {
      onPartialAmountChange(numValue)
    } else {
      onPartialAmountChange(undefined)
    }
  }

  const handleFormSubmit = async (data: { phoneNumber?: string; cardDetails?: any }) => {
    await onSubmit({
      ...data,
      partialAmount: isPartialPayment && partialAmount ? partialAmount : undefined,
    })
  }
  const renderPaymentForm = () => {
    if (!paymentMethod) {
      return (
        <Card className="border-0 shadow-none bg-muted/30">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              Select a payment method from the left to continue with your enrollment.
            </p>
          </CardContent>
        </Card>
      )
    }

    switch (paymentMethod) {
      case 'mpesa':
        return <MpesaForm onSubmit={handleFormSubmit} isProcessing={isProcessing} />
      case 'mtn_momo':
        return <MTNForm onSubmit={handleFormSubmit} isProcessing={isProcessing} />
      case 'airtel_money':
        return <AirtelForm onSubmit={handleFormSubmit} isProcessing={isProcessing} />
      case 'orange_money':
        return <OrangeMoneyForm onSubmit={handleFormSubmit} isProcessing={isProcessing} />
      case 'card':
        return <CardForm onSubmit={handleFormSubmit} isProcessing={isProcessing} />
      default:
        return (
          <Card className="border-0 shadow-none bg-muted/30">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Payment method not supported</p>
            </CardContent>
          </Card>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Order Summary */}
      <Card className="border-0 shadow-none bg-muted/30">
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Course</p>
            <p className="font-medium">{courseTitle}</p>
          </div>
          
          {/* Remaining Balance Info */}
          {hasExistingBalance && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-900 dark:text-blue-100 font-medium mb-1">
                Outstanding Balance
              </p>
              <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                {formatCurrency(remainingBalance.amount, remainingBalance.currency as CurrencyCode)}
              </p>
            </div>
          )}

          {/* Partial Payment Toggle */}
          {(hasExistingBalance || amount > 0) && paymentMethod && (
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <Label htmlFor="partial-payment" className="text-sm font-medium cursor-pointer">
                  Make Partial Payment
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Pay a portion now, complete payment later
                </p>
              </div>
              <Switch
                id="partial-payment"
                checked={isPartialPayment}
                onCheckedChange={onPartialPaymentChange}
                disabled={isProcessing}
              />
            </div>
          )}

          {/* Partial Amount Input */}
          {isPartialPayment && paymentMethod && (
            <div className="space-y-2">
              <Label htmlFor="partial-amount">Payment Amount</Label>
              <div className="relative">
                <Input
                  id="partial-amount"
                  type="number"
                  min="0.01"
                  max={maxAmount}
                  step="0.01"
                  value={localPartialAmount}
                  onChange={(e) => handlePartialAmountChange(e.target.value)}
                  placeholder={`Enter amount (max: ${formatCurrency(maxAmount, currency)})`}
                  disabled={isProcessing}
                  className="pr-20"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  {currency}
                </span>
              </div>
              {partialAmount && partialAmount > maxAmount && (
                <p className="text-xs text-destructive">
                  Amount exceeds {hasExistingBalance ? 'remaining balance' : 'course price'}
                </p>
              )}
              {partialAmount && partialAmount <= 0 && (
                <p className="text-xs text-destructive">
                  Amount must be greater than 0
                </p>
              )}
            </div>
          )}

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                {hasExistingBalance ? 'Outstanding' : isPartialPayment ? 'Payment' : 'Course'} Amount
              </span>
              <span className="font-semibold">{formatCurrency(amount, currency)}</span>
            </div>
            {isPartialPayment && partialAmount && (
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">You&apos;re Paying</span>
                <span className="font-semibold text-primary">{formatCurrency(partialAmount, currency)}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-xl font-bold">
                {formatCurrency(displayAmount, currency)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Form */}
      <div>
        {paymentMethod && (
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Complete Payment</h2>
            <p className="text-sm text-muted-foreground">
              Enter your payment details to enroll in this course
            </p>
          </div>
        )}
        {renderPaymentForm()}
      </div>
    </div>
  )
}

