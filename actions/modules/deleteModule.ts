'use server'

import { auth } from '@/lib/auth/auth'
import dbConnect from '@/db/dbConnect'
import { Module } from '@/db/models/ModuleModel'
import { Lesson } from '@/db/models/LessonModel'
import { UserRole } from '@/db/models/UserModel'

export async function deleteModule(moduleId: string) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { success: false, message: 'You must be logged in' }
    }

    if (session.user.role !== UserRole.ADMIN) {
      return { success: false, message: 'Only administrators can delete modules' }
    }

    await dbConnect()

    const module = await Module.findById(moduleId)
    if (!module) {
      return { success: false, message: 'Module not found' }
    }

    // Delete all lessons in this module
    await Lesson.deleteMany({ module: moduleId })

    // Delete the module
    await Module.findByIdAndDelete(moduleId)

    return {
      success: true,
      message: 'Module deleted successfully',
    }
  } catch (error) {
    console.error('Delete module error:', error)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

