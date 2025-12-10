'use server'

import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { User } from '@/db/models/UserModel'
import dbConnect from '@/db/dbConnect'
import { auth } from '@/lib/auth/auth'

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export async function changePassword(formData: FormData) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return { success: false, message: 'You must be logged in to change your password' }
    }

    const rawInput = {
      currentPassword: formData.get('currentPassword'),
      newPassword: formData.get('newPassword'),
      confirmPassword: formData.get('confirmPassword'),
    }

    const validatedInput = ChangePasswordSchema.parse(rawInput)

    await dbConnect()

    const user = await User.findById(session.user.id)
    
    if (!user) {
      return { success: false, message: 'User not found' }
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      validatedInput.currentPassword,
      user.password
    )

    if (!isCurrentPasswordValid) {
      return { success: false, message: 'Current password is incorrect' }
    }

    // Check if new password is the same as current
    const isSamePassword = await bcrypt.compare(
      validatedInput.newPassword,
      user.password
    )

    if (isSamePassword) {
      return { success: false, message: 'New password must be different from current password' }
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(validatedInput.newPassword, salt)

    // Update password
    await User.findByIdAndUpdate(session.user.id, { password: hashedPassword })

    return { success: true, message: 'Password changed successfully' }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: error.issues[0].message }
    }
    console.error('Change password error:', error)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

