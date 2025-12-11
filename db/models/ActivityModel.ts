import mongoose from "mongoose";
const { Schema } = mongoose;
import { ActivityType, type ActivityTypeValue } from '@/lib/enums/activityType'

// Re-export for backward compatibility
export { ActivityType }
export type { ActivityTypeValue }

// Interface
export interface IActivity {
  _id: string;
  user: mongoose.Types.ObjectId; // Student who performed the activity
  activityType: ActivityTypeValue;
  title: string; // Human-readable title
  description?: string; // Optional description
  metadata?: {
    courseId?: string;
    courseTitle?: string;
    enrollmentId?: string;
    paymentId?: string;
    paymentAmount?: number;
    paymentCurrency?: string;
    lessonId?: string;
    lessonTitle?: string;
    moduleId?: string;
    moduleTitle?: string;
    certificateId?: string;
    [key: string]: any; // Allow additional metadata
  };
  createdAt: Date;
}

// Schema
const activitySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      index: true,
    },
    activityType: {
      type: String,
      enum: Object.values(ActivityType),
      required: [true, "Activity type is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Activity title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// Compound indexes for efficient queries
activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ user: 1, activityType: 1, createdAt: -1 });

// Export model
export const Activity = mongoose.models.Activity || mongoose.model<IActivity>("Activity", activitySchema);

