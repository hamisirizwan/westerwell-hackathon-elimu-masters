'use server'

import { signOut } from "@/lib/auth/auth"

export async function logout() {
  await signOut({ redirectTo: '/login' })
}

