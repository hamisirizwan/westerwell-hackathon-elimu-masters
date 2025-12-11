'use server'

import dbConnect from '@/db/dbConnect'
import { Activity } from '@/db/models/ActivityModel'
import { ActivityType } from '@/lib/enums/activityType'
import mongoose from 'mongoose'

interface CreateActivityInput {
  userId: string
  activityType: ActivityType
  title: string
  description?: string
  metadata?: Record<string, any>
}

export async function createActivity(data: CreateActivityInput) {
  try {
    await dbConnect()

    const activity = new Activity({
      user: new mongoose.Types.ObjectId(data.userId),
      activityType: data.activityType,
      title: data.title,
      description: data.description,
      metadata: data.metadata || {},
    })

    await activity.save()

    return { success: true, data: { id: activity._id.toString() } }
  } catch (error) {
    console.error('Create activity error:', error)
    // Don't fail the main operation if activity creation fails
    return { success: false, message: 'Failed to create activity' }
  }
}

