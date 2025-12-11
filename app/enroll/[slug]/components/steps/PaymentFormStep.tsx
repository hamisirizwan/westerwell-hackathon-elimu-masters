'use client'

import { useState } from 'react'
import { PaymentMethodType } from '@/lib/payments/methods'
import { CurrencyCode } from '@/lib/currency/rates'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { MpesaForm } from '../payment-forms/MpesaForm'
import { MTNForm } from '../payment-forms/MTNForm'
import { AirtelForm } from '../payment-forms/AirtelForm'
import { OrangeMoneyForm } from '../payment-forms/OrangeMoneyForm'
import { CardForm } from '../payment-forms/CardForm'
import { formatCurrency } from '@/lib/currency/converter'

interface PaymentFormStepProps {
  paymentMethod: PaymentMethodType
  amount: number
  currency: CurrencyCode
  courseTitle: string
  onSubmit: (data: { phoneNumber?: string; cardDetails?: any }) => Promise<void>
  onBack: () => void
  isProcessing: boolean
}

export function PaymentFormStep({
  paymentMethod,
  amount,
  currency,
  courseTitle,
  onSubmit,
  onBack,
  isProcessing,
}: PaymentFormStepProps) {
  const renderPaymentForm = () => {
    switch (paymentMethod) {
      case 'mpesa':
        return <MpesaForm onSubmit={onSubmit} isProcessing={isProcessing} />
      case 'mtn_momo':
        return <MTNForm onSubmit={onSubmit} isProcessing={isProcessing} />
      case 'airtel_money':
        return <AirtelForm onSubmit={onSubmit} isProcessing={isProcessing} />
      case 'orange_money':
        return <OrangeMoneyForm onSubmit={onSubmit} isProcessing={isProcessing} />
      case 'card':
        return <CardForm onSubmit={onSubmit} isProcessing={isProcessing} />
      default:
        return <div>Payment method not supported</div>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Complete Payment</h2>
        <p className="text-muted-foreground">
          Enter your payment details to enroll in this course
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Payment Form */}
        <div className="lg:col-span-2">
          {renderPaymentForm()}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Course</p>
                <p className="font-medium">{courseTitle}</p>
              </div>
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Amount</span>
                  <span className="font-semibold">{formatCurrency(amount, currency)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="text-xl font-bold">{formatCurrency(amount, currency)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex gap-4">
        <Button variant="outline" onClick={onBack} disabled={isProcessing} className="flex-1">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>
    </div>
  )
}

