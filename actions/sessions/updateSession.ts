'use server'

import { z } from 'zod'
import { auth } from '@/lib/auth/auth'
import dbConnect from '@/db/dbConnect'
import { Session } from '@/db/models/SessionModel'
import { UserRole } from '@/db/models/UserModel'

const UpdateSessionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(150, 'Title cannot exceed 150 characters'),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
  scheduledAt: z.string().min(1, 'Scheduled date/time is required'), // ISO date string
  duration: z.number().min(1, 'Duration must be at least 1 minute'),
  meetingLink: z.string().url('Invalid meeting link').optional().or(z.literal('')),
  recordingUrl: z.string().url('Invalid recording URL').optional().or(z.literal('')),
  order: z.number().min(0, 'Order cannot be negative').optional(),
})

export type UpdateSessionInput = z.infer<typeof UpdateSessionSchema>

export async function updateSession(sessionId: string, data: UpdateSessionInput) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { success: false, message: 'You must be logged in to update a session' }
    }

    if (session.user.role !== UserRole.ADMIN) {
      return { success: false, message: 'Only administrators can update sessions' }
    }

    const validatedData = UpdateSessionSchema.parse(data)

    await dbConnect()

    const sessionRecord = await Session.findById(sessionId)
    if (!sessionRecord) {
      return { success: false, message: 'Session not found' }
    }

    sessionRecord.title = validatedData.title
    sessionRecord.scheduledAt = new Date(validatedData.scheduledAt)
    sessionRecord.duration = validatedData.duration
    if (validatedData.description !== undefined) {
      sessionRecord.description = validatedData.description || undefined
    }
    if (validatedData.meetingLink !== undefined) {
      sessionRecord.meetingLink = validatedData.meetingLink || undefined
    }
    if (validatedData.recordingUrl !== undefined) {
      sessionRecord.recordingUrl = validatedData.recordingUrl || undefined
    }
    if (validatedData.order !== undefined) {
      sessionRecord.order = validatedData.order
    }

    await sessionRecord.save()

    return {
      success: true,
      message: 'Session updated successfully',
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
    console.error('Update session error:', error)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

