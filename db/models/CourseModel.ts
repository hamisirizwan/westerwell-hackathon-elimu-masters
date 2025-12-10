import mongoose from "mongoose";
const { Schema } = mongoose;

// Enums
export const CourseType = {
  SELF_PACED: 'self-paced',
  LIVE: 'live',
} as const;

export const CourseLevel = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
} as const;

export const CourseStatus = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const;

export const CourseCategory = {
  PROGRAMMING: 'Programming',
  BUSINESS: 'Business',
  DESIGN: 'Design',
  MARKETING: 'Marketing',
  DATA_SCIENCE: 'Data Science',
  LANGUAGE: 'Language',
  PERSONAL_DEVELOPMENT: 'Personal Development',
  FINANCE: 'Finance',
  HEALTH_WELLNESS: 'Health & Wellness',
  EDUCATION: 'Education & Teaching',
} as const;

export const Currency = {
  // East Africa
  KES: 'KES',  // Kenyan Shilling
  TZS: 'TZS',  // Tanzanian Shilling
  UGX: 'UGX',  // Ugandan Shilling
  RWF: 'RWF',  // Rwandan Franc
  // Southern Africa
  ZAR: 'ZAR',  // South African Rand
  // West Africa
  NGN: 'NGN',  // Nigerian Naira
  GHS: 'GHS',  // Ghanaian Cedi
  // International
  USD: 'USD',  // US Dollar
  EUR: 'EUR',  // Euro
} as const;

export type CourseTypeValue = typeof CourseType[keyof typeof CourseType];
export type CourseLevelValue = typeof CourseLevel[keyof typeof CourseLevel];
export type CourseStatusValue = typeof CourseStatus[keyof typeof CourseStatus];
export type CurrencyValue = typeof Currency[keyof typeof Currency];
export type CourseCategoryValue = typeof CourseCategory[keyof typeof CourseCategory];

// Interface
export interface ICourse {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  instructor: mongoose.Types.ObjectId;
  courseType: CourseTypeValue;
  
  // Pricing
  price: number;
  currency: CurrencyValue;
  
  // Metadata
  category?: CourseCategoryValue;
  level: CourseLevelValue;
  language: string;
  estimatedDuration?: number;
  learningOutcomes: string[];
  requirements: string[];
  
  // Status
  status: CourseStatusValue;
  publishedAt?: Date;
  enrollmentCount: number;
  
  // Live course specific
  startDate?: Date;
  endDate?: Date;
  maxStudents?: number;
  
  createdAt: Date;
  updatedAt: Date;
}

// Schema
const courseSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },
    thumbnail: {
      type: String,
      trim: true,
    },
    instructor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Instructor is required"],
      index: true,
    },
    courseType: {
      type: String,
      enum: Object.values(CourseType),
      required: [true, "Course type is required"],
    },
    
    // Pricing
    price: {
      type: Number,
      default: 0,
      min: [0, "Price cannot be negative"],
    },
    currency: {
      type: String,
      enum: Object.values(Currency),
      default: Currency.KES,
    },
    
    // Metadata
    category: {
      type: String,
      enum: Object.values(CourseCategory),
    },
    level: {
      type: String,
      enum: Object.values(CourseLevel),
      default: CourseLevel.BEGINNER,
    },
    language: {
      type: String,
      trim: true,
      default: "English",
    },
    estimatedDuration: {
      type: Number,
      min: [0, "Duration cannot be negative"],
    },
    learningOutcomes: [{
      type: String,
      trim: true,
    }],
    requirements: [{
      type: String,
      trim: true,
    }],
    
    // Status
    status: {
      type: String,
      enum: Object.values(CourseStatus),
      default: CourseStatus.DRAFT,
      index: true,
    },
    publishedAt: {
      type: Date,
    },
    enrollmentCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    
    // Live course specific
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    maxStudents: {
      type: Number,
      min: [1, "Max students must be at least 1"],
    },
  },
  { timestamps: true }
);

// Compound indexes
courseSchema.index({ status: 1, courseType: 1 });
courseSchema.index({ instructor: 1, status: 1 });
courseSchema.index({ category: 1, status: 1 });

export const Course = mongoose.models?.Course || mongoose.model("Course", courseSchema);

