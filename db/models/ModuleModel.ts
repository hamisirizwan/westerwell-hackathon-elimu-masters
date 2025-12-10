import mongoose from "mongoose";
const { Schema } = mongoose;

// Interface
export interface IModule {
  _id: string;
  course: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// Schema
const moduleSchema = new Schema(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course reference is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Module title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    order: {
      type: Number,
      required: [true, "Order is required"],
      min: [0, "Order cannot be negative"],
    },
  },
  { timestamps: true }
);

// Compound index for ordering modules within a course
moduleSchema.index({ course: 1, order: 1 });

export const Module = mongoose.models?.Module || mongoose.model("Module", moduleSchema);

