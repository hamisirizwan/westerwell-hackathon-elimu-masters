'use server'

import { auth } from '@/lib/auth/auth'
import dbConnect from '@/db/dbConnect'
import { EnrollmentPayment } from '@/db/models/EnrollmentPaymentModel'
import mongoose from 'mongoose'

export async function getAllPayments() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { success: false, message: 'You must be logged in' }
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      return { success: false, message: 'You are not authorized to view all payments' }
    }

    await dbConnect()

    // Get all payments with populated course and student data
    const payments = await EnrollmentPayment.find({})
      .populate('course', 'title slug')
      .populate('student', 'name email')
      .sort({ createdAt: -1 })
      .lean()

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

      return {
        id: payment._id.toString(),
        course: payment.course ? {
          id: payment.course._id.toString(),
          title: payment.course.title,
          slug: payment.course.slug,
        } : null,
        student: payment.student ? {
          id: payment.student._id.toString(),
          name: payment.student.name || payment.student.email,
          email: payment.student.email,
        } : null,
        // Ensure numbers are properly converted
        amountPaid: toNumber(payment.amountPaid),
        originalAmount: originalAmount,
        previousBalance: toNumber(payment.previousBalance),
        newBalance: toNumber(payment.newBalance),
        currency: payment.currency || 'USD',
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
    console.error('Get all payments error:', error)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

