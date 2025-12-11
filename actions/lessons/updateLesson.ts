'use server'

import { z } from 'zod'
import { auth } from '@/lib/auth/auth'
import dbConnect from '@/db/dbConnect'
import { Lesson } from '@/db/models/LessonModel'
import { UserRole } from '@/db/models/UserModel'

const UpdateLessonSchema = z.object({
  title: z.string().min(1, 'Title is required').max(150, 'Title cannot exceed 150 characters'),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
  videoUrl: z.string().url('Invalid video URL').min(1, 'Video URL is required'),
  duration: z.number().min(0, 'Duration cannot be negative').optional(),
  order: z.number().min(0, 'Order cannot be negative').optional(),
  isFreePreview: z.boolean().optional(),
})

export type UpdateLessonInput = z.infer<typeof UpdateLessonSchema>

export async function updateLesson(lessonId: string, data: UpdateLessonInput) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { success: false, message: 'You must be logged in to update a lesson' }
    }

    if (session.user.role !== UserRole.ADMIN) {
      return { success: false, message: 'Only administrators can update lessons' }
    }

    const validatedData = UpdateLessonSchema.parse(data)

    await dbConnect()

    const lesson = await Lesson.findById(lessonId)
    if (!lesson) {
      return { success: false, message: 'Lesson not found' }
    }

    lesson.title = validatedData.title
    lesson.videoUrl = validatedData.videoUrl
    if (validatedData.description !== undefined) {
      lesson.description = validatedData.description || undefined
    }
    if (validatedData.duration !== undefined) {
      lesson.duration = validatedData.duration || undefined
    }
    if (validatedData.order !== undefined) {
      lesson.order = validatedData.order
    }
    if (validatedData.isFreePreview !== undefined) {
      lesson.isFreePreview = validatedData.isFreePreview
    }

    await lesson.save()

    return {
      success: true,
      message: 'Lesson updated successfully',
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
    console.error('Update lesson error:', error)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

