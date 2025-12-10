'use server'

import { auth } from '@/lib/auth/auth'
import dbConnect from '@/db/dbConnect'
import { Course } from '@/db/models/CourseModel'
import { Module } from '@/db/models/ModuleModel'
import { Lesson } from '@/db/models/LessonModel'
import { Session } from '@/db/models/SessionModel'
import { UserRole } from '@/db/models/UserModel'

export async function deleteCourse(courseId: string) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { success: false, message: 'You must be logged in' }
    }

    if (session.user.role !== UserRole.ADMIN) {
      return { success: false, message: 'Only administrators can delete courses' }
    }

    await dbConnect()

    const course = await Course.findById(courseId)

    if (!course) {
      return { success: false, message: 'Course not found' }
    }

    // Delete all related content
    const modules = await Module.find({ course: courseId })
    const moduleIds = modules.map(m => m._id)

    // Delete lessons belonging to these modules
    await Lesson.deleteMany({ module: { $in: moduleIds } })

    // Delete modules
    await Module.deleteMany({ course: courseId })

    // Delete sessions (for live courses)
    await Session.deleteMany({ course: courseId })

    // Delete the course
    await Course.findByIdAndDelete(courseId)

    return {
      success: true,
      message: 'Course deleted successfully',
    }
  } catch (error) {
    console.error('Delete course error:', error)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

