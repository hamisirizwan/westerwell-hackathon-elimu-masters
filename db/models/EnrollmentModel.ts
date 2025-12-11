import mongoose from "mongoose";
const { Schema } = mongoose;

// Enums
export const EnrollmentStatus = {
  PENDING: 'pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
} as const;

export type EnrollmentStatusValue = typeof EnrollmentStatus[keyof typeof EnrollmentStatus];

// Interface
export interface IEnrollment {
  _id: string;
  course: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  totalExpectedPayment: number;
  paidAmount: number;
  currency: string; // Currency of the enrollment (course currency)
  enrollmentStatus: EnrollmentStatusValue;
  enrolledAt: Date;
  completedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Schema
const enrollmentSchema = new Schema(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course reference is required"],
      index: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student reference is required"],
      index: true,
    },
    totalExpectedPayment: {
      type: Number,
      required: [true, "Total expected payment is required"],
      min: [0, "Total expected payment cannot be negative"],
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: [0, "Paid amount cannot be negative"],
    },
    currency: {
      type: String,
      required: [true, "Currency is required"],
      trim: true,
      uppercase: true,
    },
    enrollmentStatus: {
      type: String,
      enum: Object.values(EnrollmentStatus),
      default: EnrollmentStatus.PENDING,
      index: true,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Virtual for balance
enrollmentSchema.virtual('balance').get(function() {
  return this.totalExpectedPayment - this.paidAmount;
});

// Virtual for isFullyPaid
enrollmentSchema.virtual('isFullyPaid').get(function() {
  return this.paidAmount >= this.totalExpectedPayment;
});

// Virtual for payment progress (percentage)
enrollmentSchema.virtual('paymentProgress').get(function() {
  if (this.totalExpectedPayment === 0) return 100;
  return Math.min(100, (this.paidAmount / this.totalExpectedPayment) * 100);
});

// Compound indexes
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });
enrollmentSchema.index({ student: 1, enrollmentStatus: 1 });
enrollmentSchema.index({ course: 1, enrollmentStatus: 1 });

// Ensure virtuals are included in JSON output
enrollmentSchema.set('toJSON', { virtuals: true });
enrollmentSchema.set('toObject', { virtuals: true });

// Export model
export const Enrollment = mongoose.models.Enrollment || mongoose.model<IEnrollment>("Enrollment", enrollmentSchema);

