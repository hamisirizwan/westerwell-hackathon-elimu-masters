import mongoose from "mongoose";
const { Schema } = mongoose;

// Interface
export interface ILesson {
  _id: string;
  module: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  videoUrl: string;
  duration?: number; // in minutes
  order: number;
  isFreePreview: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Schema
const lessonSchema = new Schema(
  {
    module: {
      type: Schema.Types.ObjectId,
      ref: "Module",
      required: [true, "Module reference is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Lesson title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    videoUrl: {
      type: String,
      required: [true, "Video URL is required"],
      trim: true,
    },
    duration: {
      type: Number,
      min: [0, "Duration cannot be negative"],
    },
    order: {
      type: Number,
      required: [true, "Order is required"],
      min: [0, "Order cannot be negative"],
    },
    isFreePreview: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Compound index for ordering lessons within a module
lessonSchema.index({ module: 1, order: 1 });

export const Lesson = mongoose.models?.Lesson || mongoose.model("Lesson", lessonSchema);

