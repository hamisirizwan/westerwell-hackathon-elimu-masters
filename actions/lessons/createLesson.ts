'use server'

import { z } from 'zod'
import { auth } from '@/lib/auth/auth'
import dbConnect from '@/db/dbConnect'
import { Lesson } from '@/db/models/LessonModel'
import { Module } from '@/db/models/ModuleModel'
import { UserRole } from '@/db/models/UserModel'

const CreateLessonSchema = z.object({
  moduleId: z.string().min(1, 'Module ID is required'),
  title: z.string().min(1, 'Title is required').max(150, 'Title cannot exceed 150 characters'),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
  videoUrl: z.string().url('Invalid video URL').min(1, 'Video URL is required'),
  duration: z.number().min(0, 'Duration cannot be negative').optional(),
  order: z.number().min(0, 'Order cannot be negative').optional(),
  isFreePreview: z.boolean().default(false),
})

export type CreateLessonInput = z.infer<typeof CreateLessonSchema>

export async function createLesson(data: CreateLessonInput) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { success: false, message: 'You must be logged in to create a lesson' }
    }

    if (session.user.role !== UserRole.ADMIN) {
      return { success: false, message: 'Only administrators can create lessons' }
    }

    const validatedData = CreateLessonSchema.parse(data)

    await dbConnect()

    // Verify module exists
    const module = await Module.findById(validatedData.moduleId)
    if (!module) {
      return { success: false, message: 'Module not found' }
    }

    // Get max order for this module
    const maxOrderLesson = await Lesson.findOne({ module: validatedData.moduleId })
      .sort({ order: -1 })
      .lean()
    
    const newOrder = maxOrderLesson ? maxOrderLesson.order + 1 : (validatedData.order || 0)

    const lesson = new Lesson({
      module: validatedData.moduleId,
      title: validatedData.title,
      description: validatedData.description || undefined,
      videoUrl: validatedData.videoUrl,
      duration: validatedData.duration || undefined,
      order: newOrder,
      isFreePreview: validatedData.isFreePreview,
    })

    await lesson.save()

    return {
      success: true,
      message: 'Lesson created successfully',
      data: {
        id: lesson._id.toString(),
        title: lesson.title,
        order: lesson.order,
      },
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: error.issues[0].message }
    }
    console.error('Create lesson error:', error)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

