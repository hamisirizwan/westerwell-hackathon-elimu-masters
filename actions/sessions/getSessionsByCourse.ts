'use server'

import { auth } from '@/lib/auth/auth'
import dbConnect from '@/db/dbConnect'
import { Session } from '@/db/models/SessionModel'
import { Course } from '@/db/models/CourseModel'
import { UserRole } from '@/db/models/UserModel'

export async function getSessionsByCourse(courseId: string) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { success: false, message: 'You must be logged in' }
    }

    if (session.user.role !== UserRole.ADMIN) {
      return { success: false, message: 'Only administrators can view sessions' }
    }

    await dbConnect()

    // Verify course exists
    const course = await Course.findById(courseId)
    if (!course) {
      return { success: false, message: 'Course not found' }
    }

    const sessions = await Session.find({ course: courseId })
      .sort({ order: 1 })
      .lean()

    return {
      success: true,
      data: sessions.map((sessionRecord: any) => ({
        id: sessionRecord._id.toString(),
        courseId: sessionRecord.course.toString(),
        title: sessionRecord.title,
        description: sessionRecord.description,
        scheduledAt: sessionRecord.scheduledAt.toISOString(),
        duration: sessionRecord.duration,
        meetingLink: sessionRecord.meetingLink,
        recordingUrl: sessionRecord.recordingUrl,
        order: sessionRecord.order,
        createdAt: sessionRecord.createdAt.toISOString(),
        updatedAt: sessionRecord.updatedAt.toISOString(),
      })),
    }
  } catch (error) {
    console.error('Get sessions by course error:', error)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

