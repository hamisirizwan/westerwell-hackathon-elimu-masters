'use server'

import { z } from 'zod'
import { auth } from '@/lib/auth/auth'
import dbConnect from '@/db/dbConnect'
import { Course, CourseType, CourseLevel, CourseStatus, Currency, CourseCategory } from '@/db/models/CourseModel'
import { UserRole } from '@/db/models/UserModel'
import { slugify, generateUniqueSlug } from '@/lib/slugify'

const UpdateCourseSchema = z.object({
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
  // If endDate is provided, it should be after startDate
  if (data.startDate && data.endDate) {
    return new Date(data.endDate) > new Date(data.startDate)
  }
  return true
}, {
  message: 'End date must be after start date',
  path: ['endDate'],
})

export type UpdateCourseInput = z.infer<typeof UpdateCourseSchema>

export async function updateCourse(courseId: string, data: UpdateCourseInput) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { success: false, message: 'You must be logged in to update a course' }
    }

    // Check if user is an admin
    if (session.user.role !== UserRole.ADMIN) {
      return { success: false, message: 'Only administrators can update courses' }
    }

    const validatedData = UpdateCourseSchema.parse(data)

    await dbConnect()

    // Find the existing course
    const existingCourse = await Course.findById(courseId)
    if (!existingCourse) {
      return { success: false, message: 'Course not found' }
    }

    // Handle slug - only update if different from current
    let newSlug = existingCourse.slug
    if (validatedData.slug && validatedData.slug !== existingCourse.slug) {
      // Check if new slug is available
      const slugExists = await Course.findOne({ slug: validatedData.slug, _id: { $ne: courseId } })
      if (slugExists) {
        return { success: false, message: 'This slug is already in use' }
      }
      newSlug = validatedData.slug
    } else if (!validatedData.slug || validatedData.title !== existingCourse.title) {
      // If title changed and no custom slug, regenerate from title
      const baseSlug = validatedData.slug || slugify(validatedData.title)
      const finalBaseSlug = baseSlug.length < 3 ? `${baseSlug}-course` : baseSlug

      newSlug = await generateUniqueSlug(finalBaseSlug, async (slugToCheck) => {
        const existing = await Course.findOne({ slug: slugToCheck, _id: { $ne: courseId } })
        return !!existing
      })
    }

    // Update the course
    existingCourse.title = validatedData.title
    existingCourse.slug = newSlug
    existingCourse.description = validatedData.description || undefined
    existingCourse.thumbnail = validatedData.thumbnail || undefined
    existingCourse.courseType = validatedData.courseType
    
    // Pricing
    existingCourse.price = validatedData.price
    existingCourse.currency = validatedData.currency
    
    // Metadata
    existingCourse.category = validatedData.category || undefined
    existingCourse.level = validatedData.level
    existingCourse.language = validatedData.language
    existingCourse.estimatedDuration = validatedData.estimatedDuration || undefined
    existingCourse.learningOutcomes = validatedData.learningOutcomes.filter(o => o.trim() !== '')
    existingCourse.requirements = validatedData.requirements.filter(r => r.trim() !== '')
    
    // Status
    if (validatedData.status === CourseStatus.PUBLISHED && !existingCourse.publishedAt) {
      existingCourse.publishedAt = new Date()
    }
    existingCourse.status = validatedData.status
    
    // Live course specific
    existingCourse.startDate = validatedData.startDate ? new Date(validatedData.startDate) : undefined
    existingCourse.endDate = validatedData.endDate ? new Date(validatedData.endDate) : undefined
    existingCourse.maxStudents = validatedData.maxStudents || undefined

    await existingCourse.save()

    return {
      success: true,
      message: 'Course updated successfully',
      data: {
        id: existingCourse._id.toString(),
        slug: existingCourse.slug,
      },
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: error.issues[0].message }
    }
    console.error('Update course error:', error)
    return { success: false, message: 'An unexpected error occurred' }
  }
}
