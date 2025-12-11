'use server'

import { auth } from '@/lib/auth/auth'
import dbConnect from '@/db/dbConnect'
import { EnrollmentPayment } from '@/db/models/EnrollmentPaymentModel'
import { Enrollment } from '@/db/models/EnrollmentModel'
import mongoose from 'mongoose'

export async function getEnrollmentPayments(enrollmentId: string) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { success: false, message: 'You must be logged in' }
    }

    await dbConnect()

    // Verify enrollment belongs to the user
    const enrollment = await Enrollment.findById(enrollmentId).lean()

    if (!enrollment) {
      return { success: false, message: 'Enrollment not found' }
    }

    if (enrollment.student.toString() !== session.user.id) {
      return { success: false, message: 'You are not authorized to view these payments' }
    }

    // Get all payments for this enrollment
    const payments = await EnrollmentPayment.find({
      enrollment: new mongoose.Types.ObjectId(enrollmentId),
    })
      .sort({ createdAt: -1 })
      .lean()

    // Get enrollment currency for balance calculations
    const enrollmentCurrency = enrollment.currency

    const paymentData = payments.map((payment: any) => {
      // Helper to safely convert to number
      const toNumber = (value: any, fallback: number = 0) => {
        const num = Number(value)
        return isNaN(num) ? fallback : num
      }

      // For old payments without originalAmount, use amountPaid as fallback
      const originalAmount = payment.originalAmount != null 
        ? toNumber(payment.originalAmount)
        : toNumber(payment.amountPaid)

      // For balance calculations, use enrollment currency (amountPaid is in enrollment currency)
      // For display, show original payment currency
      return {
        id: payment._id.toString(),
        amountPaid: toNumber(payment.amountPaid), // In enrollment currency
        originalAmount: originalAmount, // Original payment amount (or amountPaid for old records)
        previousBalance: toNumber(payment.previousBalance), // In enrollment currency
        newBalance: toNumber(payment.newBalance), // In enrollment currency
        currency: payment.currency || 'USD', // Payment currency (original)
        enrollmentCurrency: enrollmentCurrency || 'USD', // Enrollment currency (for balance display)
        paymentMethod: payment.paymentMethod,
        paymentReference: payment.paymentReference,
        paymentStatus: payment.paymentStatus,
        phoneNumber: payment.phoneNumber,
        cardLast4: payment.cardLast4,
        paidAt: payment.paidAt?.toISOString(),
        initiatedAt: payment.initiatedAt?.toISOString(),
        createdAt: payment.createdAt.toISOString(),
      }
    })

    return {
      success: true,
      data: paymentData,
    }
  } catch (error) {
    console.error('Get enrollment payments error:', error)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

