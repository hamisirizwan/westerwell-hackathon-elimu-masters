'use server'

import { auth } from '@/lib/auth/auth'
import dbConnect from '@/db/dbConnect'
import { Enrollment, EnrollmentStatus } from '@/db/models/EnrollmentModel'
import mongoose from 'mongoose'

export async function getStudentStats() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { success: false, message: 'You must be logged in' }
    }

    await dbConnect()

    const userId = new mongoose.Types.ObjectId(session.user.id)

    const [
      totalEnrollments,
      activeEnrollments,
      completedEnrollments,
      enrollments,
    ] = await Promise.all([
      Enrollment.countDocuments({ student: userId }),
      Enrollment.countDocuments({
        student: userId,
        enrollmentStatus: EnrollmentStatus.ACTIVE,
      }),
      Enrollment.countDocuments({
        student: userId,
        enrollmentStatus: EnrollmentStatus.COMPLETED,
      }),
      Enrollment.find({ student: userId })
        .populate('course', 'estimatedDuration')
        .lean(),
    ])

    // Calculate hours learned from enrollments (sum of course durations)
    // Assuming estimatedDuration is in hours
    const hoursLearned = enrollments.reduce((total, enrollment: any) => {
      const duration = enrollment.course?.estimatedDuration || 0
      return total + duration
    }, 0)

    // Certificates = completed enrollments
    const certificates = completedEnrollments

    return {
      success: true,
      data: {
        enrolledCourses: totalEnrollments,
        activeCourses: activeEnrollments,
        completedCourses: completedEnrollments,
        hoursLearned: Math.round(hoursLearned * 10) / 10, // Round to 1 decimal
        certificates,
      },
    }
  } catch (error) {
    console.error('Get student stats error:', error)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

