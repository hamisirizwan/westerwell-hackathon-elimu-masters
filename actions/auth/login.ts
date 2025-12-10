'use server'

import { AuthError } from 'next-auth'
import { signIn } from '@/lib/auth/auth'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import dbConnect from '@/db/dbConnect'
import { User } from '@/db/models/UserModel'

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
})

export async function login(prevState: unknown, formData: FormData) {
  const validatedFields = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return { error: "Invalid input. Please check your email and password." }
  }

  const { email, password } = validatedFields.data

  try {
    await dbConnect()

    const user = await User.findOne({ email: email });

    if (!user) {
      return { error: "Email not found" }
    }

    const passwordsMatch = await bcrypt.compare(password, user.password)
    if (!passwordsMatch) {
      return { error: "Invalid password" }
    }

    await signIn('credentials', {
      email,
      password,
      redirectTo: '/dashboard',
    })

    return { success: "Logged in successfully" }
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: "Invalid credentials" }
        default:
          return { error: "An error occurred during login" }
      }
    }
    throw error
  }
}

