'use server'

import { auth } from '@/lib/auth/auth'
import dbConnect from '@/db/dbConnect'
import { Activity } from '@/db/models/ActivityModel'
import mongoose from 'mongoose'

export async function getStudentActivities(limit: number = 20) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { success: false, message: 'You must be logged in' }
    }

    await dbConnect()

    const userId = new mongoose.Types.ObjectId(session.user.id)

    const activities = await Activity.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()

    const activityData = activities.map((activity: any) => ({
      id: activity._id.toString(),
      activityType: activity.activityType,
      title: activity.title,
      description: activity.description,
      metadata: activity.metadata || {},
      createdAt: activity.createdAt.toISOString(),
    }))

    return {
      success: true,
      data: activityData,
    }
  } catch (error) {
    console.error('Get student activities error:', error)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

