'use server'

import { auth } from '@/lib/auth/auth'
import dbConnect from '@/db/dbConnect'
import { Lesson } from '@/db/models/LessonModel'
import { UserRole } from '@/db/models/UserModel'

export async function deleteLesson(lessonId: string) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { success: false, message: 'You must be logged in' }
    }

    if (session.user.role !== UserRole.ADMIN) {
      return { success: false, message: 'Only administrators can delete lessons' }
    }

    await dbConnect()

    const lesson = await Lesson.findById(lessonId)
    if (!lesson) {
      return { success: false, message: 'Lesson not found' }
    }

    await Lesson.findByIdAndDelete(lessonId)

    return {
      success: true,
      message: 'Lesson deleted successfully',
    }
  } catch (error) {
    console.error('Delete lesson error:', error)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

