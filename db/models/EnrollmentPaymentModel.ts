import mongoose from "mongoose";
const { Schema } = mongoose;
import { PaymentStatus, type PaymentStatusValue } from '@/lib/enums/paymentStatus'
import { PaymentMethod, type PaymentMethodValue } from '@/lib/enums/paymentMethod'

// Re-export for backward compatibility
export { PaymentMethod }
export type { PaymentMethodValue }
export { PaymentStatus }
export type { PaymentStatusValue }

// Interface
export interface IEnrollmentPayment {
  _id: string;
  enrollment: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  amountPaid: number; // Amount in enrollment currency (converted)
  originalAmount: number; // Original payment amount in payment currency
  previousBalance: number;
  newBalance: number;
  currency: string; // Payment currency (original currency used)
  paymentMethod: PaymentMethodValue;
  paymentReference: string;
  paymentStatus: PaymentStatusValue;
  phoneNumber?: string;
  cardLast4?: string;
  paidAt?: Date;
  initiatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Schema
const enrollmentPaymentSchema = new Schema(
  {
    enrollment: {
      type: Schema.Types.ObjectId,
      ref: "Enrollment",
      required: [true, "Enrollment reference is required"],
      index: true,
    },
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
    amountPaid: {
      type: Number,
      required: [true, "Amount paid is required"],
      min: [0.01, "Amount paid must be greater than 0"],
    },
    originalAmount: {
      type: Number,
      required: [true, "Original amount is required"],
      min: [0.01, "Original amount must be greater than 0"],
    },
    previousBalance: {
      type: Number,
      required: [true, "Previous balance is required"],
      min: [0, "Previous balance cannot be negative"],
    },
    newBalance: {
      type: Number,
      required: [true, "New balance is required"],
      min: [0, "New balance cannot be negative"],
    },
    currency: {
      type: String,
      required: [true, "Currency is required"],
      trim: true,
      uppercase: true,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: [true, "Payment method is required"],
    },
    paymentReference: {
      type: String,
      required: [true, "Payment reference is required"],
      unique: true,
      trim: true,
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
      index: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    cardLast4: {
      type: String,
      trim: true,
      match: [/^\d{4}$/, "Card last 4 digits must be exactly 4 digits"],
    },
    paidAt: {
      type: Date,
    },
    initiatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound indexes
enrollmentPaymentSchema.index({ enrollment: 1, createdAt: -1 });
enrollmentPaymentSchema.index({ student: 1, createdAt: -1 });
enrollmentPaymentSchema.index({ course: 1, createdAt: -1 });
enrollmentPaymentSchema.index({ paymentStatus: 1, createdAt: -1 });

// Export model
export const EnrollmentPayment = mongoose.models.EnrollmentPayment || mongoose.model<IEnrollmentPayment>("EnrollmentPayment", enrollmentPaymentSchema);

