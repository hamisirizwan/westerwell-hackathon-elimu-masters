import mongoose from "mongoose";
const { Schema } = mongoose;

// Role enum
export const UserRole = {
  STUDENT: 'STUDENT',
  ADMIN: 'ADMIN',
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];

// User interface
export interface IUser {
  _id: string;
  username: string;
  email: string;
  password: string;
  role: UserRoleType;
  createdAt: Date;
  updatedAt: Date;
}

// Define User schema
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Please provide a username"],
      minlength: [3, "Username must be at least 3 characters long"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.STUDENT,
    },
  },
  { timestamps: true }
);

export const User = mongoose.models?.User || mongoose.model("User", userSchema);

