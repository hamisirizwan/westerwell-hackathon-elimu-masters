import mongoose from "mongoose";
const { Schema } = mongoose;

export type PaymentLinkStatus = 'active' | 'inactive' | 'expired' | 'exhausted';
export type AmountType = 'fixed' | 'flexible';
export type Currency = 'KES' | 'USD' | 'EUR' | 'GBP';

export interface IPaymentLink {
  _id: string;
  user: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  slug: string;
  amountType: AmountType;
  amount?: number;
  minAmount: number;
  maxAmount?: number;
  currency: Currency;
  hasUsageLimit: boolean;
  usageLimit?: number;
  usageCount: number;
  status: PaymentLinkStatus;
  expiresAt?: Date;
  redirectUrl?: string;
  successMessage?: string;
  viewCount: number;
  totalCollected: number;
  createdAt: Date;
  updatedAt: Date;
}

const paymentLinkSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    amountType: {
      type: String,
      enum: ["fixed", "flexible"],
      required: [true, "Amount type is required"],
      default: "fixed",
    },
    amount: {
      type: Number,
      min: [1, "Amount must be at least 1"],
    },
    minAmount: {
      type: Number,
      default: 1,
      min: [1, "Minimum amount must be at least 1"],
    },
    maxAmount: {
      type: Number,
      min: [1, "Maximum amount must be at least 1"],
    },
    currency: {
      type: String,
      enum: ["KES", "USD", "EUR", "GBP"],
      default: "KES",
    },
    hasUsageLimit: {
      type: Boolean,
      default: false,
    },
    usageLimit: {
      type: Number,
      min: [1, "Usage limit must be at least 1"],
    },
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "expired", "exhausted"],
      default: "active",
      index: true,
    },
    expiresAt: {
      type: Date,
    },
    redirectUrl: {
      type: String,
      trim: true,
    },
    successMessage: {
      type: String,
      trim: true,
      maxlength: [200, "Success message cannot exceed 200 characters"],
    },
    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalCollected: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

// Compound index for user's payment links
paymentLinkSchema.index({ user: 1, status: 1, createdAt: -1 });

export const PaymentLink = mongoose.models?.PaymentLink || mongoose.model("PaymentLink", paymentLinkSchema);

