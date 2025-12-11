'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Country } from '@/lib/currency/countries'
import { CurrencyCode } from '@/lib/currency/rates'
import { PaymentMethodType } from '@/lib/payments/methods'
import { CurrencyConversion, calculateConversion } from '@/lib/currency/converter'
import { COUNTRIES } from '@/lib/currency/countries'
import { getPaymentMethodsForCountry } from '@/lib/payments/methods'
import { createEnrollment } from '@/actions/enrollments/createEnrollment'
import { createEnrollmentPayment } from '@/actions/enrollments/createEnrollmentPayment'
import { getEnrollmentByCourseAndStudent } from '@/actions/enrollments/getEnrollmentByCourseAndStudent'
import { PaymentStatus } from '@/lib/enums/paymentStatus'
import { EnrollmentLeftPanel } from './EnrollmentLeftPanel'
import { EnrollmentRightPanel } from './EnrollmentRightPanel'
import { PaymentProcessingOverlay } from './PaymentProcessingOverlay'

interface EnrollmentWizardProps {
  courseId: string
  courseSlug: string
  courseTitle: string
  coursePrice: number
  courseCurrency: CurrencyCode
}

export interface EnrollmentData {
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
  isPartialPayment?: boolean
  partialAmount?: number
  existingEnrollment?: {
    id: string
    balance: number
    currency: string
  } | null
}

// Generate unique payment reference
function generatePaymentReference(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 9).toUpperCase()
  return `PAY-${timestamp}-${random}`
}

export function EnrollmentWizard({ 
  courseId,
  courseSlug, 
  courseTitle, 
  coursePrice, 
  courseCurrency 
}: EnrollmentWizardProps) {
  const router = useRouter()
  const [enrollmentData, setEnrollmentData] = useState<EnrollmentData>({
    country: null,
    currency: null,
    conversion: null,
    paymentMethod: null,
  })
  const [processingStage, setProcessingStage] = useState<'verifying' | 'success' | 'enrolling' | null>(null)
  const [enrollmentProgress, setEnrollmentProgress] = useState(0)
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null)
  const [remainingBalance, setRemainingBalance] = useState<{ amount: number; currency: string } | null>(null)

  // Calculate conversion when country changes
  useEffect(() => {
    if (enrollmentData.country) {
      const conversion = calculateConversion(
        coursePrice,
        courseCurrency,
        enrollmentData.country.currency
      )
      setEnrollmentData(prev => ({
        ...prev,
        currency: enrollmentData.country!.currency,
        conversion,
      }))
    }
  }, [enrollmentData.country, coursePrice, courseCurrency])

  // Check for existing enrollment on mount and when country changes
  useEffect(() => {
    const checkExistingEnrollment = async () => {
      const existing = await getEnrollmentByCourseAndStudent(courseId)
      if (existing.success && existing.data && !existing.data.isFullyPaid) {
        setEnrollmentId(existing.data.id)
        // Convert balance to selected currency if country is selected
        if (enrollmentData.country && existing.data.currency) {
          const balanceConversion = calculateConversion(
            existing.data.balance,
            existing.data.currency,
            enrollmentData.country.currency
          )
          setRemainingBalance({
            amount: balanceConversion.convertedAmount,
            currency: balanceConversion.convertedCurrency,
          })
        } else {
          setRemainingBalance({
            amount: existing.data.balance,
            currency: existing.data.currency || courseCurrency,
          })
        }
      } else {
        setRemainingBalance(null)
        if (!existing.success || !existing.data || existing.data.isFullyPaid) {
          setEnrollmentId(null)
        }
      }
    }
    checkExistingEnrollment()
  }, [courseId, courseCurrency, enrollmentData.country, enrollmentData.conversion])

  const handleCountryChange = (countryCode: string) => {
    const selectedCountry = COUNTRIES.find(c => c.code === countryCode) || null
    setEnrollmentData(prev => ({
      ...prev,
      country: selectedCountry,
      paymentMethod: null, // Reset payment method when country changes
    }))
  }

  const handlePaymentMethodSelect = (method: PaymentMethodType) => {
    setEnrollmentData(prev => ({
      ...prev,
      paymentMethod: method,
    }))
  }

  const handlePaymentSubmit = async (paymentData: { phoneNumber?: string; cardDetails?: any; partialAmount?: number }) => {
    if (!enrollmentData.paymentMethod || !enrollmentData.conversion || !enrollmentData.country) {
      toast.error('Please complete all payment details')
      return
    }

    // Validate partial payment amount
    if (enrollmentData.isPartialPayment) {
      if (!enrollmentData.partialAmount || enrollmentData.partialAmount <= 0) {
        toast.error('Please enter a valid partial payment amount')
        return
      }
      const maxAmount = remainingBalance ? remainingBalance.amount : enrollmentData.conversion.convertedAmount
      if (enrollmentData.partialAmount > maxAmount) {
        toast.error(`Amount exceeds ${remainingBalance ? 'remaining balance' : 'course price'}`)
        return
      }
    }

    try {
      // Stage 1: Verifying payment (simulate)
      setProcessingStage('verifying')
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Determine amount to pay (in payment currency)
      let amountToPay: number
      if (enrollmentData.isPartialPayment && enrollmentData.partialAmount) {
        amountToPay = enrollmentData.partialAmount
      } else if (remainingBalance) {
        amountToPay = remainingBalance.amount
      } else {
        amountToPay = enrollmentData.conversion.convertedAmount
      }

      const paymentCurrency = enrollmentData.conversion.convertedCurrency
      // For enrollment: use converted amount and selected currency
      const enrollmentAmount = enrollmentData.conversion.convertedAmount
      const enrollmentCurrency = enrollmentData.conversion.convertedCurrency

      // Step 1: Check for existing enrollment or create new one
      let currentEnrollmentId = enrollmentId
      
      if (!currentEnrollmentId) {
        // First, try to get existing enrollment
        const existingEnrollment = await getEnrollmentByCourseAndStudent(courseId)
        
        if (existingEnrollment.success && existingEnrollment.data) {
          currentEnrollmentId = existingEnrollment.data.id
          setEnrollmentId(currentEnrollmentId)
        } else {
          // Create new enrollment with converted amount and selected currency
          const enrollmentResult = await createEnrollment({
            courseId,
            totalExpectedPayment: enrollmentAmount, // Use converted amount
            currency: enrollmentCurrency, // Use selected currency (not original course currency)
          })

          if (!enrollmentResult.success) {
            toast.error(enrollmentResult.message || 'Failed to create enrollment')
            setProcessingStage(null)
            return
          }
          
          currentEnrollmentId = enrollmentResult.data!.id
          setEnrollmentId(currentEnrollmentId)
        }
      }

      // Step 2: Generate payment reference
      const paymentReference = generatePaymentReference()

      // Step 3: Create payment record
      const paymentResult = await createEnrollmentPayment({
        enrollmentId: currentEnrollmentId!,
        amountPaid: amountToPay,
        currency: paymentCurrency,
        paymentMethod: enrollmentData.paymentMethod,
        paymentReference,
        paymentStatus: PaymentStatus.COMPLETED, // For simulation, mark as completed
        phoneNumber: paymentData.phoneNumber,
        cardLast4: paymentData.cardDetails?.number?.slice(-4),
      })

      if (!paymentResult.success) {
        toast.error(paymentResult.message || 'Payment failed')
        setProcessingStage(null)
        return
      }

      // Stage 2: Payment successful
      setProcessingStage('success')
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Stage 3: Enrolling to course (show progress)
      setProcessingStage('enrolling')
      setEnrollmentProgress(0)

      // Simulate enrollment progress with smooth increments
      const progressSteps = [20, 40, 60, 80, 100]
      for (let i = 0; i < progressSteps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 400))
        setEnrollmentProgress(progressSteps[i])
      }

      // Wait a moment at 100% before redirecting
      await new Promise(resolve => setTimeout(resolve, 500))

      // Redirect to My Courses page
      router.push('/my-courses')
    } catch (error) {
      console.error('Payment processing error:', error)
      toast.error('An unexpected error occurred. Please try again.')
      setProcessingStage(null)
      setEnrollmentProgress(0)
    }
  }

  return (
    <>
      {processingStage && (
        <PaymentProcessingOverlay 
          stage={processingStage} 
          progress={processingStage === 'enrolling' ? enrollmentProgress : undefined}
        />
      )}
      
      <div className="grid lg:grid-cols-2 h-[calc(100vh-12rem)] gap-0">
        {/* Left Panel - Selections */}
        <div className="pr-8 lg:border-r border-border overflow-y-auto">
          <div className="space-y-6 pb-6">
            <EnrollmentLeftPanel
              coursePrice={coursePrice}
              courseCurrency={courseCurrency}
              selectedCountry={enrollmentData.country}
              conversion={enrollmentData.conversion}
              selectedPaymentMethod={enrollmentData.paymentMethod}
              onCountryChange={handleCountryChange}
              onPaymentMethodSelect={handlePaymentMethodSelect}
            />
          </div>
        </div>

        {/* Right Panel - Dynamic Form */}
        <div className="pl-8 overflow-y-auto">
          <div className="space-y-6 pb-6">
            <EnrollmentRightPanel
              paymentMethod={enrollmentData.paymentMethod}
              amount={enrollmentData.conversion?.convertedAmount || coursePrice}
              currency={enrollmentData.conversion?.convertedCurrency || courseCurrency}
              courseTitle={courseTitle}
              remainingBalance={remainingBalance}
              isPartialPayment={enrollmentData.isPartialPayment || false}
              partialAmount={enrollmentData.partialAmount}
              onPartialPaymentChange={(isPartial) => {
                setEnrollmentData(prev => ({
                  ...prev,
                  isPartialPayment: isPartial,
                  partialAmount: isPartial ? undefined : undefined,
                }))
              }}
              onPartialAmountChange={(amount) => {
                setEnrollmentData(prev => ({
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
