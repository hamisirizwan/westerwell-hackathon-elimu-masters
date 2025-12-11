'use server'

import { auth } from '@/lib/auth/auth'
import dbConnect from '@/db/dbConnect'
import { Lesson } from '@/db/models/LessonModel'
import { Module } from '@/db/models/ModuleModel'
import { UserRole } from '@/db/models/UserModel'

export async function getLessonsByModule(moduleId: string) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { success: false, message: 'You must be logged in' }
    }

    if (session.user.role !== UserRole.ADMIN) {
      return { success: false, message: 'Only administrators can view lessons' }
    }

    await dbConnect()

    // Verify module exists
    const module = await Module.findById(moduleId)
    if (!module) {
      return { success: false, message: 'Module not found' }
    }

    const lessons = await Lesson.find({ module: moduleId })
      .sort({ order: 1 })
      .lean()

    return {
      success: true,
      data: lessons.map((lesson: any) => ({
        id: lesson._id.toString(),
        moduleId: lesson.module.toString(),
        title: lesson.title,
        description: lesson.description,
        videoUrl: lesson.videoUrl,
        duration: lesson.duration,
        order: lesson.order,
        isFreePreview: lesson.isFreePreview,
        createdAt: lesson.createdAt.toISOString(),
        updatedAt: lesson.updatedAt.toISOString(),
      })),
    }
  } catch (error) {
    console.error('Get lessons by module error:', error)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

