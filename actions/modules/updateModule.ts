'use server'

import { z } from 'zod'
import { auth } from '@/lib/auth/auth'
import dbConnect from '@/db/dbConnect'
import { Module } from '@/db/models/ModuleModel'
import { UserRole } from '@/db/models/UserModel'

const UpdateModuleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(150, 'Title cannot exceed 150 characters'),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
  order: z.number().min(0, 'Order cannot be negative').optional(),
})

export type UpdateModuleInput = z.infer<typeof UpdateModuleSchema>

export async function updateModule(moduleId: string, data: UpdateModuleInput) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { success: false, message: 'You must be logged in to update a module' }
    }

    if (session.user.role !== UserRole.ADMIN) {
      return { success: false, message: 'Only administrators can update modules' }
    }

    const validatedData = UpdateModuleSchema.parse(data)

    await dbConnect()

    const module = await Module.findById(moduleId)
    if (!module) {
      return { success: false, message: 'Module not found' }
    }

    module.title = validatedData.title
    if (validatedData.description !== undefined) {
      module.description = validatedData.description || undefined
    }
    if (validatedData.order !== undefined) {
      module.order = validatedData.order
    }

    await module.save()

    return {
      success: true,
      message: 'Module updated successfully',
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
    console.error('Update module error:', error)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

