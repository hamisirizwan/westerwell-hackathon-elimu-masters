import mongoose from "mongoose";
const { Schema } = mongoose;

// Interface
export interface ISession {
  _id: string;
  course: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  scheduledAt: Date;
  duration: number; // in minutes
  meetingLink?: string;
  recordingUrl?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// Schema
const sessionSchema = new Schema(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course reference is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Session title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    scheduledAt: {
      type: Date,
      required: [true, "Scheduled date/time is required"],
    },
    duration: {
      type: Number,
      required: [true, "Duration is required"],
      min: [1, "Duration must be at least 1 minute"],
    },
    meetingLink: {
      type: String,
      trim: true,
    },
    recordingUrl: {
      type: String,
      trim: true,
    },
    order: {
      type: Number,
      required: [true, "Order is required"],
      min: [0, "Order cannot be negative"],
    },
  },
  { timestamps: true }
);

// Compound indexes
sessionSchema.index({ course: 1, order: 1 });
sessionSchema.index({ course: 1, scheduledAt: 1 });

export const Session = mongoose.models?.Session || mongoose.model("Session", sessionSchema);

