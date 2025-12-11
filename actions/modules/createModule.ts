'use server'

import { z } from 'zod'
import { auth } from '@/lib/auth/auth'
import dbConnect from '@/db/dbConnect'
import { Module } from '@/db/models/ModuleModel'
import { Course } from '@/db/models/CourseModel'
import { UserRole } from '@/db/models/UserModel'

const CreateModuleSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
  title: z.string().min(1, 'Title is required').max(150, 'Title cannot exceed 150 characters'),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
  order: z.number().min(0, 'Order cannot be negative').optional(),
})

export type CreateModuleInput = z.infer<typeof CreateModuleSchema>

export async function createModule(data: CreateModuleInput) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { success: false, message: 'You must be logged in to create a module' }
    }

    if (session.user.role !== UserRole.ADMIN) {
      return { success: false, message: 'Only administrators can create modules' }
    }

    const validatedData = CreateModuleSchema.parse(data)

    await dbConnect()

    // Verify course exists
    const course = await Course.findById(validatedData.courseId)
    if (!course) {
      return { success: false, message: 'Course not found' }
    }

    // Get max order for this course
    const maxOrderModule = await Module.findOne({ course: validatedData.courseId })
      .sort({ order: -1 })
      .lean()
    
    const newOrder = maxOrderModule ? maxOrderModule.order + 1 : (validatedData.order || 0)

    const module = new Module({
      course: validatedData.courseId,
      title: validatedData.title,
      description: validatedData.description || undefined,
      order: newOrder,
    })

    await module.save()

    return {
      success: true,
      message: 'Module created successfully',
      data: {
        id: module._id.toString(),
        title: module.title,
        order: module.order,
      },
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: error.issues[0].message }
    }
    console.error('Create module error:', error)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

