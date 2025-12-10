'use server'

import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { User } from '@/db/models/UserModel'
import mongoose from 'mongoose'
import dbConnect from '@/db/dbConnect'

// Zod schema for input validation
const RegisterSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters long'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
})

export async function registerUserAction(formData: FormData) {
  try {
    // Extract and validate input
    const rawInput = {
      username: formData.get('username'),
      email: formData.get('email'),
      password: formData.get('password'),
    }

    const validatedInput = RegisterSchema.parse(rawInput)

    await dbConnect()
    // Check if email already exists
    const existingUser = await User.findOne({ email: validatedInput.email })
    if (existingUser) {
      return { success: false, message: 'Email already in use' }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(validatedInput.password, salt)

    // Create new user
    const newUser = new User({
      username: validatedInput.username,
      email: validatedInput.email,
      password: hashedPassword,
    })

    // Save user to database
    await newUser.save()

    return {
      success: true,
      message: 'User registered successfully',
      data: { username: newUser.username, email: newUser.email }
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: error.issues[0].message }
    }
    if (error instanceof mongoose.Error.ValidationError) {
      const errorMessage = Object.values(error.errors)[0].message
      return { success: false, message: errorMessage }
    }
    console.error('Registration error:', error)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

