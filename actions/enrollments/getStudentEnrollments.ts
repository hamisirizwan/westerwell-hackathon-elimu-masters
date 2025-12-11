'use server'

import { auth } from '@/lib/auth/auth'
import dbConnect from '@/db/dbConnect'
import { Enrollment } from '@/db/models/EnrollmentModel'
import { Course } from '@/db/models/CourseModel'
import mongoose from 'mongoose'

export async function getStudentEnrollments() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { success: false, message: 'You must be logged in' }
    }

    await dbConnect()

    const enrollments = await Enrollment.find({
      student: new mongoose.Types.ObjectId(session.user.id),
    })
      .populate('course', 'title slug description thumbnail price currency category level courseType enrollmentCount')
      .sort({ createdAt: -1 })
      .lean()

    const enrollmentData = enrollments.map((enrollment: any) => {
      const course = enrollment.course
      return {
        id: enrollment._id.toString(),
        enrollmentStatus: enrollment.enrollmentStatus,
        totalExpectedPayment: enrollment.totalExpectedPayment,
        paidAmount: enrollment.paidAmount,
        currency: enrollment.currency, // Enrollment currency
        balance: enrollment.totalExpectedPayment - enrollment.paidAmount,
        isFullyPaid: enrollment.paidAmount >= enrollment.totalExpectedPayment,
        enrolledAt: enrollment.enrolledAt,
        course: course ? {
          id: course._id.toString(),
          title: course.title,
          slug: course.slug,
          description: course.description,
          thumbnail: course.thumbnail,
          price: course.price,
          currency: course.currency,
          category: course.category,
          level: course.level,
          courseType: course.courseType,
          enrollmentCount: course.enrollmentCount,
        } : null,
      }
    })

    return {
      success: true,
      data: enrollmentData,
    }
  } catch (error) {
    console.error('Get student enrollments error:', error)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

