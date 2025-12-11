'use server'

import { auth } from '@/lib/auth/auth'
import dbConnect from '@/db/dbConnect'
import { Enrollment } from '@/db/models/EnrollmentModel'
import mongoose from 'mongoose'

export type AdminEnrollment = {
  id: string
  course: {
    id: string
    title: string
    slug: string
  } | null
  student: {
    id: string
    username: string
    email: string
  } | null
  totalExpectedPayment: number
  paidAmount: number
  balance: number
  currency: string
  enrollmentStatus: string
  enrolledAt: string
}

export async function getAllEnrollments() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { success: false, message: 'You must be logged in' }
    }

    if (session.user.role !== 'ADMIN') {
      return { success: false, message: 'Only administrators can view enrollments' }
    }

    await dbConnect()

    const enrollments = await Enrollment.find({})
      .populate('course', 'title slug')
      .populate('student', 'username email')
      .sort({ createdAt: -1 })
      .lean()

    const data: AdminEnrollment[] = enrollments.map((enrollment: any) => ({
      id: enrollment._id.toString(),
      course: enrollment.course
        ? {
            id: enrollment.course._id.toString(),
            title: enrollment.course.title,
            slug: enrollment.course.slug,
          }
        : null,
      student: enrollment.student
        ? {
            id: enrollment.student._id.toString(),
            username: enrollment.student.username || 'Unnamed',
            email: enrollment.student.email || 'N/A',
          }
        : null,
      totalExpectedPayment: enrollment.totalExpectedPayment,
      paidAmount: enrollment.paidAmount,
      balance: enrollment.totalExpectedPayment - enrollment.paidAmount,
      currency: enrollment.currency,
      enrollmentStatus: enrollment.enrollmentStatus,
      enrolledAt: enrollment.enrolledAt ? enrollment.enrolledAt.toISOString() : '',
    }))

    return { success: true, data }
  } catch (error) {
    console.error('Get all enrollments error:', error)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

