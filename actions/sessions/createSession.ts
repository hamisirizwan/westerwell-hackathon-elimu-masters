'use server'

import { z } from 'zod'
import { auth } from '@/lib/auth/auth'
import dbConnect from '@/db/dbConnect'
import { Session } from '@/db/models/SessionModel'
import { Course } from '@/db/models/CourseModel'
import { UserRole } from '@/db/models/UserModel'

const CreateSessionSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
  title: z.string().min(1, 'Title is required').max(150, 'Title cannot exceed 150 characters'),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
  scheduledAt: z.string().min(1, 'Scheduled date/time is required'), // ISO date string
  duration: z.number().min(1, 'Duration must be at least 1 minute'),
  meetingLink: z.string().url('Invalid meeting link').optional().or(z.literal('')),
  recordingUrl: z.string().url('Invalid recording URL').optional().or(z.literal('')),
  order: z.number().min(0, 'Order cannot be negative').optional(),
})

export type CreateSessionInput = z.infer<typeof CreateSessionSchema>

export async function createSession(data: CreateSessionInput) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { success: false, message: 'You must be logged in to create a session' }
    }

    if (session.user.role !== UserRole.ADMIN) {
      return { success: false, message: 'Only administrators can create sessions' }
    }

    const validatedData = CreateSessionSchema.parse(data)

    await dbConnect()

    // Verify course exists
    const course = await Course.findById(validatedData.courseId)
    if (!course) {
      return { success: false, message: 'Course not found' }
    }

    // Get max order for this course
    const maxOrderSession = await Session.findOne({ course: validatedData.courseId })
      .sort({ order: -1 })
      .lean()
    
    const newOrder = maxOrderSession ? maxOrderSession.order + 1 : (validatedData.order || 0)

    const sessionRecord = new Session({
      course: validatedData.courseId,
      title: validatedData.title,
      description: validatedData.description || undefined,
      scheduledAt: new Date(validatedData.scheduledAt),
      duration: validatedData.duration,
      meetingLink: validatedData.meetingLink || undefined,
      recordingUrl: validatedData.recordingUrl || undefined,
      order: newOrder,
    })

    await sessionRecord.save()

    return {
      success: true,
      message: 'Session created successfully',
      data: {
        id: sessionRecord._id.toString(),
        title: sessionRecord.title,
        order: sessionRecord.order,
      },
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: error.issues[0].message }
    }
    console.error('Create session error:', error)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

