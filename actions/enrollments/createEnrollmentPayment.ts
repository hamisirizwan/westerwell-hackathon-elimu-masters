'use server'

import { z } from 'zod'
import { auth } from '@/lib/auth/auth'
import dbConnect from '@/db/dbConnect'
import { Enrollment, EnrollmentStatus } from '@/db/models/EnrollmentModel'
import { EnrollmentPayment } from '@/db/models/EnrollmentPaymentModel'
import { PaymentMethod } from '@/lib/enums/paymentMethod'
import { PaymentStatus } from '@/lib/enums/paymentStatus'
import { convertCurrency, CurrencyCode } from '@/lib/currency/rates'
import { createActivity } from '@/actions/activities/createActivity'
import { ActivityType } from '@/lib/enums/activityType'
import mongoose from 'mongoose'

const CreateEnrollmentPaymentSchema = z.object({
  enrollmentId: z.string().min(1, 'Enrollment ID is required'),
  amountPaid: z.number().min(0.01, 'Amount paid must be greater than 0'), // Amount in payment currency
  currency: z.string().min(1, 'Currency is required').transform(val => val.toUpperCase()), // Payment currency
  paymentMethod: z.enum([
    PaymentMethod.MPESA,
    PaymentMethod.MTN_MOMO,
    PaymentMethod.AIRTEL_MONEY,
    PaymentMethod.ORANGE_MONEY,
    PaymentMethod.CARD,
    PaymentMethod.BANK_TRANSFER,
  ]),
  paymentReference: z.string().min(1, 'Payment reference is required'),
  paymentStatus: z.enum([
    PaymentStatus.PENDING,
    PaymentStatus.COMPLETED,
    PaymentStatus.FAILED,
    PaymentStatus.REFUNDED,
    PaymentStatus.CANCELLED,
  ]).default(PaymentStatus.PENDING),
  phoneNumber: z.string().optional(),
  cardLast4: z.string().regex(/^\d{4}$/, 'Card last 4 digits must be exactly 4 digits').optional(),
})

export type CreateEnrollmentPaymentInput = z.infer<typeof CreateEnrollmentPaymentSchema>

export async function createEnrollmentPayment(data: CreateEnrollmentPaymentInput) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { success: false, message: 'You must be logged in to make a payment' }
    }

    const validatedData = CreateEnrollmentPaymentSchema.parse(data)

    await dbConnect()

    // Fetch enrollment and verify it belongs to the user
    const enrollment = await Enrollment.findById(validatedData.enrollmentId)
      .populate('course', '_id title')

    if (!enrollment) {
      return { success: false, message: 'Enrollment not found' }
    }

    // Verify enrollment belongs to the current user
    // student is an ObjectId, so we need to convert both to strings for comparison
    if (enrollment.student.toString() !== session.user.id) {
      return { success: false, message: 'You are not authorized to make payments for this enrollment' }
    }

    // Check if enrollment is already fully paid (optional check)
    if (enrollment.paidAmount >= enrollment.totalExpectedPayment && validatedData.paymentStatus === PaymentStatus.COMPLETED) {
      return { success: false, message: 'This enrollment is already fully paid' }
    }

    // Convert payment amount to enrollment currency
    // All enrollment balances and calculations are done in enrollment currency
    const paymentCurrency = validatedData.currency as CurrencyCode
    const enrollmentCurrency = enrollment.currency as CurrencyCode
    
    // Always convert payment to enrollment currency (even if same, conversion will return same value)
    // This ensures all amounts are stored in enrollment currency for accurate balance calculations
    const amountInEnrollmentCurrency = convertCurrency(
      validatedData.amountPaid,
      paymentCurrency,
      enrollmentCurrency
    )

    // Calculate balances (all in enrollment currency)
    const previousBalance = enrollment.totalExpectedPayment - enrollment.paidAmount
    const newPaidAmount = enrollment.paidAmount + amountInEnrollmentCurrency
    const newBalance = enrollment.totalExpectedPayment - newPaidAmount

    // Validate that payment doesn't exceed remaining balance
    if (newBalance < 0) {
      return {
        success: false,
        message: `Payment amount exceeds remaining balance. Remaining balance: ${enrollment.currency} ${previousBalance.toFixed(2)}`,
      }
    }

    // Start a transaction for atomicity
    const mongoSession = await mongoose.startSession()
    mongoSession.startTransaction()

    try {
      // Create payment record
      // Store both original payment amount and converted amount
      const payment = new EnrollmentPayment({
        enrollment: enrollment._id,
        course: (enrollment.course as any)._id,
        student: enrollment.student,
        amountPaid: amountInEnrollmentCurrency, // Amount in enrollment currency (for calculations)
        originalAmount: validatedData.amountPaid, // Original payment amount in payment currency
        previousBalance: previousBalance,
        newBalance: Math.max(0, newBalance), // Ensure non-negative
        currency: validatedData.currency, // Payment currency (original currency used)
        paymentMethod: validatedData.paymentMethod,
        paymentReference: validatedData.paymentReference,
        paymentStatus: validatedData.paymentStatus,
        phoneNumber: validatedData.phoneNumber,
        cardLast4: validatedData.cardLast4,
        initiatedAt: new Date(),
        paidAt: validatedData.paymentStatus === PaymentStatus.COMPLETED ? new Date() : undefined,
      })

      await payment.save({ session: mongoSession })

      // Update enrollment with converted amount
      const wasFullyPaidBefore = enrollment.paidAmount >= enrollment.totalExpectedPayment
      enrollment.paidAmount = newPaidAmount

      // Update enrollment status if fully paid
      if (newPaidAmount >= enrollment.totalExpectedPayment) {
        enrollment.enrollmentStatus = EnrollmentStatus.ACTIVE
      }

      await enrollment.save({ session: mongoSession })

      // Commit transaction
      await mongoSession.commitTransaction()

      // Fetch course for activity (outside transaction)
      const { Course } = await import('@/db/models/CourseModel')
      const course = await Course.findById((enrollment.course as any)._id).lean()
      const courseTitle = course?.title || 'Course'

      // Create activity for payment (outside transaction)
      await createActivity({
        userId: session.user.id,
        activityType: ActivityType.PAYMENT_MADE,
        title: 'Made a payment',
        description: `Payment for ${courseTitle}`,
        metadata: {
          courseId: (enrollment.course as any)._id.toString(),
          courseTitle,
          enrollmentId: enrollment._id.toString(),
          paymentId: payment._id.toString(),
          paymentAmount: payment.originalAmount,
          paymentCurrency: payment.currency,
        },
      })

      // Create activity for enrollment activation if status changed to active
      if (!wasFullyPaidBefore && enrollment.enrollmentStatus === EnrollmentStatus.ACTIVE) {
        await createActivity({
          userId: session.user.id,
          activityType: ActivityType.ENROLLMENT_COMPLETED,
          title: 'Enrollment activated',
          description: `Your enrollment for ${courseTitle} is now active`,
          metadata: {
            courseId: (enrollment.course as any)._id.toString(),
            courseTitle,
            enrollmentId: enrollment._id.toString(),
          },
        })
      }

      return {
        success: true,
        message: 'Payment recorded successfully',
        data: {
          paymentId: payment._id.toString(),
          enrollmentId: enrollment._id.toString(),
          amountPaid: payment.amountPaid,
          previousBalance: payment.previousBalance,
          newBalance: payment.newBalance,
          enrollmentStatus: enrollment.enrollmentStatus,
          isFullyPaid: newPaidAmount >= enrollment.totalExpectedPayment,
        },
      }
    } catch (error) {
      // Rollback transaction on error
      await mongoSession.abortTransaction()
      throw error
    } finally {
      await mongoSession.endSession()
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: error.issues[0].message }
    }

    // Handle duplicate payment reference error
    if (error instanceof Error && error.name === 'MongoServerError' && (error as any).code === 11000) {
      return { success: false, message: 'A payment with this reference already exists' }
    }

    console.error('Create enrollment payment error:', error)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

