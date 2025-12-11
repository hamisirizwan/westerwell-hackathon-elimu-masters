'use server'

import { auth } from '@/lib/auth/auth'
import dbConnect from '@/db/dbConnect'
import { Enrollment, EnrollmentStatus } from '@/db/models/EnrollmentModel'
import { Course, CourseStatus } from '@/db/models/CourseModel'
import { EnrollmentPayment } from '@/db/models/EnrollmentPaymentModel'
import { User, UserRole } from '@/db/models/UserModel'
import mongoose from 'mongoose'

interface PaymentOverTime {
  date: string
  count: number
  amount: number
}

interface EnrollmentOverTime {
  date: string
  count: number
}

export async function getAdminStats() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { success: false, message: 'You must be logged in' }
    }

    // Check if user is admin
    if (session.user.role !== UserRole.ADMIN) {
      return { success: false, message: 'You are not authorized to view admin stats' }
    }

    await dbConnect()

    // Basic counts
    const [
      totalCourses,
      publishedCourses,
      totalStudents,
      totalEnrollments,
      activeEnrollments,
      totalPayments,
      totalRevenue,
    ] = await Promise.all([
      Course.countDocuments({}),
      Course.countDocuments({ status: CourseStatus.PUBLISHED }),
      User.countDocuments({ role: UserRole.STUDENT }),
      Enrollment.countDocuments({}),
      Enrollment.countDocuments({ enrollmentStatus: EnrollmentStatus.ACTIVE }),
      EnrollmentPayment.countDocuments({ paymentStatus: 'completed' }),
      EnrollmentPayment.aggregate([
        {
          $match: { paymentStatus: 'completed' }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amountPaid' }
          }
        }
      ]).then(result => result[0]?.total || 0),
    ])

    // Payments over time (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const payments = await EnrollmentPayment.find({
      paymentStatus: 'completed',
      createdAt: { $gte: thirtyDaysAgo }
    })
      .select('amountPaid createdAt')
      .sort({ createdAt: 1 })
      .lean()

    // Group payments by date
    const paymentsByDate: Record<string, { count: number; amount: number }> = {}
    
    payments.forEach((payment: any) => {
      const date = new Date(payment.createdAt).toISOString().split('T')[0]
      if (!paymentsByDate[date]) {
        paymentsByDate[date] = { count: 0, amount: 0 }
      }
      paymentsByDate[date].count++
      paymentsByDate[date].amount += payment.amountPaid
    })

    // Convert to array format for chart
    const paymentsOverTime: PaymentOverTime[] = Object.entries(paymentsByDate).map(([date, data]) => ({
      date,
      count: data.count,
      amount: data.amount,
    })).sort((a, b) => a.date.localeCompare(b.date))

    // Enrollments over time (last 30 days)
    const enrollments = await Enrollment.find({
      createdAt: { $gte: thirtyDaysAgo }
    })
      .select('createdAt')
      .sort({ createdAt: 1 })
      .lean()

    // Group enrollments by date
    const enrollmentsByDate: Record<string, number> = {}
    
    enrollments.forEach((enrollment: any) => {
      const date = new Date(enrollment.createdAt).toISOString().split('T')[0]
      enrollmentsByDate[date] = (enrollmentsByDate[date] || 0) + 1
    })

    // Convert to array format for chart
    const enrollmentsOverTime: EnrollmentOverTime[] = Object.entries(enrollmentsByDate).map(([date, count]) => ({
      date,
      count,
    })).sort((a, b) => a.date.localeCompare(b.date))

    return {
      success: true,
      data: {
        totalCourses,
        publishedCourses,
        totalStudents,
        totalEnrollments,
        activeEnrollments,
        totalPayments,
        totalRevenue,
        paymentsOverTime,
        enrollmentsOverTime,
      },
    }
  } catch (error) {
    console.error('Get admin stats error:', error)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

