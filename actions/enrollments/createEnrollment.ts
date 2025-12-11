'use server'

import { z } from 'zod'
import { auth } from '@/lib/auth/auth'
import dbConnect from '@/db/dbConnect'
import { Enrollment, EnrollmentStatus } from '@/db/models/EnrollmentModel'
import { Course } from '@/db/models/CourseModel'
import { createActivity } from '@/actions/activities/createActivity'
import { ActivityType } from '@/lib/enums/activityType'
import mongoose from 'mongoose'

const CreateEnrollmentSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
  totalExpectedPayment: z.number().min(0, 'Total expected payment cannot be negative'),
  currency: z.string().min(1, 'Currency is required').transform(val => val.toUpperCase()),
})

export type CreateEnrollmentInput = z.infer<typeof CreateEnrollmentSchema>

export async function createEnrollment(data: CreateEnrollmentInput) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { success: false, message: 'You must be logged in to enroll in a course' }
    }

    const validatedData = CreateEnrollmentSchema.parse(data)

    await dbConnect()

    // Verify course exists and is published
    const course = await Course.findById(validatedData.courseId)
    if (!course) {
      return { success: false, message: 'Course not found' }
    }

    if (course.status !== 'published') {
      return { success: false, message: 'Course is not available for enrollment' }
    }

    // Check if enrollment already exists
    const existingEnrollment = await Enrollment.findOne({
      student: new mongoose.Types.ObjectId(session.user.id),
      course: new mongoose.Types.ObjectId(validatedData.courseId),
    })

    if (existingEnrollment) {
      return {
        success: false,
        message: 'You are already enrolled in this course',
        data: {
          enrollmentId: existingEnrollment._id.toString(),
        },
      }
    }

    // Create enrollment
    const enrollment = new Enrollment({
      course: validatedData.courseId,
      student: session.user.id,
      totalExpectedPayment: validatedData.totalExpectedPayment,
      paidAmount: 0,
      currency: validatedData.currency,
      enrollmentStatus: EnrollmentStatus.PENDING,
      enrolledAt: new Date(),
    })

    await enrollment.save()

    // Increment course enrollment count
    await Course.findByIdAndUpdate(validatedData.courseId, {
      $inc: { enrollmentCount: 1 },
    })

    // Create activity for enrollment
    await createActivity({
      userId: session.user.id,
      activityType: ActivityType.ENROLLMENT_CREATED,
      title: 'Enrolled in a course',
      description: `You enrolled in ${course.title}`,
      metadata: {
        courseId: course._id.toString(),
        courseTitle: course.title,
        enrollmentId: enrollment._id.toString(),
      },
    })

    return {
      success: true,
      message: 'Enrollment created successfully',
      data: {
        id: enrollment._id.toString(),
        enrollmentStatus: enrollment.enrollmentStatus,
        totalExpectedPayment: enrollment.totalExpectedPayment,
        paidAmount: enrollment.paidAmount,
      },
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: error.issues[0].message }
    }
    
    // Handle duplicate key error (unique constraint)
    if (error instanceof Error && error.name === 'MongoServerError' && (error as any).code === 11000) {
      return { success: false, message: 'You are already enrolled in this course' }
    }
    
    console.error('Create enrollment error:', error)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

