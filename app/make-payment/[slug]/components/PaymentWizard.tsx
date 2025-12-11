'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Country } from '@/lib/currency/countries'
import { CurrencyCode } from '@/lib/currency/rates'
import { PaymentMethodType } from '@/lib/payments/methods'
import { CurrencyConversion, calculateConversion } from '@/lib/currency/converter'
import { COUNTRIES } from '@/lib/currency/countries'
import { validateCurrencyCode } from '@/lib/currency/rates'
import { createEnrollmentPayment } from '@/actions/enrollments/createEnrollmentPayment'
import { PaymentStatus } from '@/lib/enums/paymentStatus'
// Reuse components from enrollment page
import { EnrollmentLeftPanel } from '@/app/enroll/[slug]/components/EnrollmentLeftPanel'
import { EnrollmentRightPanel } from '@/app/enroll/[slug]/components/EnrollmentRightPanel'
import { PaymentProcessingOverlay } from '@/app/enroll/[slug]/components/PaymentProcessingOverlay'

interface PaymentWizardProps {
  courseId: string
  courseSlug: string
  courseTitle: string
  enrollmentId: string
  outstandingBalance: number
  enrollmentCurrency: string
}

interface PaymentData {
  country: Country | null
  currency: CurrencyCode | null
  conversion: CurrencyConversion | null
  paymentMethod: PaymentMethodType | null
  phoneNumber?: string
  cardDetails?: {
    number: string
    expiry: string
    cvv: string
    name: string
  }
  isPartialPayment: boolean
  partialAmount?: number
}

// Generate unique payment reference
function generatePaymentReference(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 9).toUpperCase()
  return `PAY-${timestamp}-${random}`
}

export function PaymentWizard({ 
  courseId,
  courseSlug, 
  courseTitle, 
  enrollmentId,
  outstandingBalance,
  enrollmentCurrency
}: PaymentWizardProps) {
  const router = useRouter()
  const [paymentData, setPaymentData] = useState<PaymentData>({
    country: null,
    currency: null,
    conversion: null,
    paymentMethod: null,
    isPartialPayment: true, // Default to partial payment for existing enrollments
  })
  const [processingStage, setProcessingStage] = useState<'verifying' | 'success' | 'enrolling' | null>(null)
  const [paymentProgress, setPaymentProgress] = useState(0)
  const [remainingBalance, setRemainingBalance] = useState<{ amount: number; currency: string } | null>(null)

  // Initialize remaining balance and convert when country changes
  useEffect(() => {
    // Validate and normalize enrollment currency
    const validCurrency = validateCurrencyCode(enrollmentCurrency)
    
    if (paymentData.country) {
      try {
        const balanceConversion = calculateConversion(
          outstandingBalance,
          validCurrency,
          paymentData.country.currency
        )
        setRemainingBalance({
          amount: balanceConversion.convertedAmount,
          currency: balanceConversion.convertedCurrency,
        })
        setPaymentData(prev => ({
          ...prev,
          currency: paymentData.country!.currency,
          conversion: balanceConversion,
        }))
      } catch (error) {
        // If conversion fails, just use the original currency
        setRemainingBalance({
          amount: outstandingBalance,
          currency: validCurrency,
        })
      }
    } else {
      setRemainingBalance({
        amount: outstandingBalance,
        currency: validCurrency,
      })
    }
  }, [paymentData.country, outstandingBalance, enrollmentCurrency])

  const handleCountryChange = (countryCode: string) => {
    const selectedCountry = COUNTRIES.find(c => c.code === countryCode) || null
    setPaymentData(prev => ({
      ...prev,
      country: selectedCountry,
      paymentMethod: null, // Reset payment method when country changes
    }))
  }

  const handlePaymentMethodSelect = (method: PaymentMethodType) => {
    setPaymentData(prev => ({
      ...prev,
      paymentMethod: method,
    }))
  }

  const handlePaymentSubmit = async (formData: { phoneNumber?: string; cardDetails?: any; partialAmount?: number }) => {
    if (!paymentData.paymentMethod || !paymentData.conversion || !paymentData.country) {
      toast.error('Please complete all payment details')
      return
    }

    // Determine amount to pay
    const amountToPay = paymentData.isPartialPayment && paymentData.partialAmount
      ? paymentData.partialAmount
      : remainingBalance?.amount || outstandingBalance

    // Validate partial payment amount
    if (paymentData.isPartialPayment) {
      if (!paymentData.partialAmount || paymentData.partialAmount <= 0) {
        toast.error('Please enter a valid payment amount')
        return
      }
      const maxAmount = remainingBalance?.amount || outstandingBalance
      if (paymentData.partialAmount > maxAmount) {
        toast.error('Amount exceeds remaining balance')
        return
      }
    }

    try {
      // Stage 1: Verifying payment (simulate)
      setProcessingStage('verifying')
      await new Promise(resolve => setTimeout(resolve, 1500))

      const paymentCurrency = paymentData.conversion.convertedCurrency

      // Step 1: Generate payment reference
      const paymentReference = generatePaymentReference()

      // Step 2: Create payment record
      const paymentResult = await createEnrollmentPayment({
        enrollmentId,
        amountPaid: amountToPay,
        currency: paymentCurrency,
        paymentMethod: paymentData.paymentMethod,
        paymentReference,
        paymentStatus: PaymentStatus.COMPLETED, // For simulation, mark as completed
        phoneNumber: formData.phoneNumber,
        cardLast4: formData.cardDetails?.number?.slice(-4),
      })

      if (!paymentResult.success) {
        toast.error(paymentResult.message || 'Payment failed')
        setProcessingStage(null)
        return
      }

      // Stage 2: Payment successful
      setProcessingStage('success')
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Stage 3: Processing payment (show progress)
      setProcessingStage('enrolling')
      setPaymentProgress(0)

      // Simulate processing progress with smooth increments
      const progressSteps = [20, 40, 60, 80, 100]
      for (let i = 0; i < progressSteps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 400))
        setPaymentProgress(progressSteps[i])
      }

      // Wait a moment at 100% before redirecting
      await new Promise(resolve => setTimeout(resolve, 500))

      // Redirect to Finance page
      router.push('/finance')
    } catch (error) {
      console.error('Payment processing error:', error)
      toast.error('An unexpected error occurred. Please try again.')
      setProcessingStage(null)
      setPaymentProgress(0)
    }
  }

  // Use outstanding balance as the base amount for currency conversion
  const baseAmount = outstandingBalance

  return (
    <>
      {processingStage && (
        <PaymentProcessingOverlay 
          stage={processingStage} 
          progress={processingStage === 'enrolling' ? paymentProgress : undefined}
        />
      )}
      
      <div className="grid lg:grid-cols-2 h-[calc(100vh-12rem)] gap-0">
        {/* Left Panel - Selections */}
        <div className="pr-8 lg:border-r border-border overflow-y-auto">
          <div className="space-y-6 pb-6">
            <EnrollmentLeftPanel
              coursePrice={baseAmount}
              courseCurrency={validateCurrencyCode(enrollmentCurrency)}
              selectedCountry={paymentData.country}
              conversion={paymentData.conversion}
              selectedPaymentMethod={paymentData.paymentMethod}
              onCountryChange={handleCountryChange}
              onPaymentMethodSelect={handlePaymentMethodSelect}
            />
          </div>
        </div>

        {/* Right Panel - Dynamic Form */}
        <div className="pl-8 overflow-y-auto">
          <div className="space-y-6 pb-6">
            <EnrollmentRightPanel
              paymentMethod={paymentData.paymentMethod}
              amount={remainingBalance?.amount || outstandingBalance}
              currency={validateCurrencyCode(remainingBalance?.currency || enrollmentCurrency)}
              courseTitle={courseTitle}
              remainingBalance={remainingBalance}
              isPartialPayment={paymentData.isPartialPayment}
              partialAmount={paymentData.partialAmount}
              onPartialPaymentChange={(isPartial) => {
                setPaymentData(prev => ({
                  ...prev,
                  isPartialPayment: isPartial,
                  partialAmount: isPartial ? undefined : undefined,
                }))
              }}
              onPartialAmountChange={(amount) => {
                setPaymentData(prev => ({
                  ...prev,
                  partialAmount: amount,
                }))
              }}
              onSubmit={handlePaymentSubmit}
              isProcessing={!!processingStage}
            />
          </div>
        </div>
      </div>
    </>
  )
}

