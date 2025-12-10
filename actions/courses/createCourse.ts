'use server'

import { z } from 'zod'
import { auth } from '@/lib/auth/auth'
import dbConnect from '@/db/dbConnect'
import { Course, CourseType, CourseLevel, CourseStatus, Currency, CourseCategory } from '@/db/models/CourseModel'
import { UserRole } from '@/db/models/UserModel'
import { slugify, generateUniqueSlug } from '@/lib/slugify'

const CreateCourseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(150, 'Title cannot exceed 150 characters'),
  slug: z.string()
    .min(3, 'Slug must be at least 3 characters')
    .max(50, 'Slug cannot exceed 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .optional(),
  description: z.string().max(5000, 'Description cannot exceed 5000 characters').optional(),
  thumbnail: z.string().url('Invalid thumbnail URL').optional().or(z.literal('')),
  courseType: z.enum([CourseType.SELF_PACED, CourseType.LIVE]),
  
  // Pricing
  price: z.number().min(0, 'Price cannot be negative').default(0),
  currency: z.enum([
    Currency.KES, Currency.TZS, Currency.UGX, Currency.RWF,
    Currency.ZAR, Currency.NGN, Currency.GHS,
    Currency.USD, Currency.EUR
  ]).default(Currency.KES),
  
  // Metadata
  category: z.enum([
    CourseCategory.PROGRAMMING,
    CourseCategory.BUSINESS,
    CourseCategory.DESIGN,
    CourseCategory.MARKETING,
    CourseCategory.DATA_SCIENCE,
    CourseCategory.LANGUAGE,
    CourseCategory.PERSONAL_DEVELOPMENT,
    CourseCategory.FINANCE,
    CourseCategory.HEALTH_WELLNESS,
    CourseCategory.EDUCATION,
  ]).optional(),
  level: z.enum([CourseLevel.BEGINNER, CourseLevel.INTERMEDIATE, CourseLevel.ADVANCED]).default(CourseLevel.BEGINNER),
  language: z.string().max(50, 'Language cannot exceed 50 characters').default('English'),
  estimatedDuration: z.number().min(0, 'Duration cannot be negative').optional(),
  learningOutcomes: z.array(z.string().max(200, 'Each outcome cannot exceed 200 characters')).default([]),
  requirements: z.array(z.string().max(200, 'Each requirement cannot exceed 200 characters')).default([]),
  
  // Status
  status: z.enum([CourseStatus.DRAFT, CourseStatus.PUBLISHED]).default(CourseStatus.DRAFT),
  
  // Live course specific
  startDate: z.string().optional(), // ISO date string
  endDate: z.string().optional(), // ISO date string
  maxStudents: z.number().min(1, 'Max students must be at least 1').optional(),
}).refine((data) => {
  // If live course, startDate is recommended but not required at creation
  return true
}, {
  message: 'Start date is recommended for live courses',
  path: ['startDate'],
}).refine((data) => {
  // If endDate is provided, it should be after startDate
  if (data.startDate && data.endDate) {
    return new Date(data.endDate) > new Date(data.startDate)
  }
  return true
}, {
  message: 'End date must be after start date',
  path: ['endDate'],
})

export type CreateCourseInput = z.infer<typeof CreateCourseSchema>

export async function createCourse(data: CreateCourseInput) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { success: false, message: 'You must be logged in to create a course' }
    }

    // Check if user is an admin
    if (session.user.role !== UserRole.ADMIN) {
      return { success: false, message: 'Only administrators can create courses' }
    }

    const validatedData = CreateCourseSchema.parse(data)

    await dbConnect()

    // Generate slug from title if not provided
    const baseSlug = validatedData.slug || slugify(validatedData.title)
    
    // Ensure slug is at least 3 characters
    const finalBaseSlug = baseSlug.length < 3 ? `${baseSlug}-course` : baseSlug

    // Check for uniqueness and generate unique slug if needed
    const slug = await generateUniqueSlug(finalBaseSlug, async (slugToCheck) => {
      const existing = await Course.findOne({ slug: slugToCheck })
      return !!existing
    })

    const course = new Course({
      title: validatedData.title,
      slug,
      description: validatedData.description || undefined,
      thumbnail: validatedData.thumbnail || undefined,
      instructor: session.user.id,
      courseType: validatedData.courseType,
      
      // Pricing
      price: validatedData.price,
      currency: validatedData.currency,
      
      // Metadata
      category: validatedData.category || undefined,
      level: validatedData.level,
      language: validatedData.language,
      estimatedDuration: validatedData.estimatedDuration || undefined,
      learningOutcomes: validatedData.learningOutcomes.filter(o => o.trim() !== ''),
      requirements: validatedData.requirements.filter(r => r.trim() !== ''),
      
      // Status
      status: validatedData.status,
      publishedAt: validatedData.status === CourseStatus.PUBLISHED ? new Date() : undefined,
      
      // Live course specific
      startDate: validatedData.startDate ? new Date(validatedData.startDate) : undefined,
      endDate: validatedData.endDate ? new Date(validatedData.endDate) : undefined,
      maxStudents: validatedData.maxStudents || undefined,
    })

    await course.save()

    return {
      success: true,
      message: 'Course created successfully',
      data: {
        id: course._id.toString(),
        slug: course.slug,
      },
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: error.issues[0].message }
    }
    console.error('Create course error:', error)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

