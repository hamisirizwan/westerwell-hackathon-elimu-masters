'use server'

import { auth } from '@/lib/auth/auth'
import dbConnect from '@/db/dbConnect'
import { Enrollment } from '@/db/models/EnrollmentModel'
import mongoose from 'mongoose'

export async function getEnrollmentByCourseAndStudent(courseId: string) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { success: false, message: 'You must be logged in' }
    }

    await dbConnect()

    const enrollment = await Enrollment.findOne({
      student: new mongoose.Types.ObjectId(session.user.id),
      course: new mongoose.Types.ObjectId(courseId),
    }).lean()

    if (!enrollment) {
      return { success: false, message: 'Enrollment not found' }
    }

    return {
      success: true,
      data: {
        id: enrollment._id.toString(),
        enrollmentStatus: enrollment.enrollmentStatus,
        totalExpectedPayment: enrollment.totalExpectedPayment,
        paidAmount: enrollment.paidAmount,
        currency: enrollment.currency,
        balance: enrollment.totalExpectedPayment - enrollment.paidAmount,
        isFullyPaid: enrollment.paidAmount >= enrollment.totalExpectedPayment,
      },
    }
  } catch (error) {
    console.error('Get enrollment error:', error)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

