'use server'

import { auth } from '@/lib/auth/auth'
import dbConnect from '@/db/dbConnect'
import { Session } from '@/db/models/SessionModel'
import { UserRole } from '@/db/models/UserModel'

export async function deleteSession(sessionId: string) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { success: false, message: 'You must be logged in' }
    }

    if (session.user.role !== UserRole.ADMIN) {
      return { success: false, message: 'Only administrators can delete sessions' }
    }

    await dbConnect()

    const sessionRecord = await Session.findById(sessionId)
    if (!sessionRecord) {
      return { success: false, message: 'Session not found' }
    }

    await Session.findByIdAndDelete(sessionId)

    return {
      success: true,
      message: 'Session deleted successfully',
    }
  } catch (error) {
    console.error('Delete session error:', error)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

