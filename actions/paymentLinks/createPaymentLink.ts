'use server'

import { z } from 'zod'
import { auth } from '@/lib/auth/auth'
import dbConnect from '@/db/dbConnect'
import { PaymentLink } from '@/db/models/PaymentLinkModel'
import { slugify, generateUniqueSlug } from '@/lib/slugify'

const CreatePaymentLinkSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title cannot exceed 100 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters').max(50, 'Slug cannot exceed 50 characters').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens').optional(),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  amountType: z.enum(['fixed', 'flexible']),
  amount: z.number().min(1, 'Amount must be at least 1').optional(),
  minAmount: z.number().min(1, 'Minimum amount must be at least 1').default(1),
  maxAmount: z.number().min(1, 'Maximum amount must be at least 1').optional(),
  currency: z.enum(['KES', 'USD', 'EUR', 'GBP']).default('KES'),
  hasUsageLimit: z.boolean().default(false),
  usageLimit: z.number().min(1, 'Usage limit must be at least 1').optional(),
  expiresAt: z.string().optional(), // ISO date string
  redirectUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  successMessage: z.string().max(200, 'Success message cannot exceed 200 characters').optional(),
}).refine((data) => {
  // If fixed amount, amount is required
  if (data.amountType === 'fixed' && !data.amount) {
    return false
  }
  return true
}, {
  message: 'Amount is required for fixed amount links',
  path: ['amount'],
}).refine((data) => {
  // If has usage limit, usageLimit is required
  if (data.hasUsageLimit && !data.usageLimit) {
    return false
  }
  return true
}, {
  message: 'Usage limit is required when usage limit is enabled',
  path: ['usageLimit'],
}).refine((data) => {
  // maxAmount should be greater than minAmount
  if (data.maxAmount && data.maxAmount < data.minAmount) {
    return false
  }
  return true
}, {
  message: 'Maximum amount must be greater than minimum amount',
  path: ['maxAmount'],
})

export async function createPaymentLink(data: z.infer<typeof CreatePaymentLinkSchema>) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { success: false, message: 'You must be logged in to create a payment link' }
    }

    const validatedData = CreatePaymentLinkSchema.parse(data)

    await dbConnect()

    // Generate slug from title if not provided, or use provided slug
    const baseSlug = validatedData.slug || slugify(validatedData.title)
    
    // Ensure slug is at least 3 characters
    const finalBaseSlug = baseSlug.length < 3 ? `${baseSlug}-link` : baseSlug

    // Check for uniqueness and generate unique slug if needed
    const slug = await generateUniqueSlug(finalBaseSlug, async (slugToCheck) => {
      const existing = await PaymentLink.findOne({ slug: slugToCheck })
      return !!existing
    })

    const paymentLink = new PaymentLink({
      user: session.user.id,
      title: validatedData.title,
      description: validatedData.description,
      slug,
      amountType: validatedData.amountType,
      amount: validatedData.amountType === 'fixed' ? validatedData.amount : undefined,
      minAmount: validatedData.minAmount,
      maxAmount: validatedData.maxAmount,
      currency: validatedData.currency,
      hasUsageLimit: validatedData.hasUsageLimit,
      usageLimit: validatedData.hasUsageLimit ? validatedData.usageLimit : undefined,
      expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : undefined,
      redirectUrl: validatedData.redirectUrl || undefined,
      successMessage: validatedData.successMessage,
      status: 'active',
    })

    await paymentLink.save()

    return {
      success: true,
      message: 'Payment link created successfully',
      data: {
        id: paymentLink._id.toString(),
        slug: paymentLink.slug,
      },
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: error.issues[0].message }
    }
    console.error('Create payment link error:', error)
    return { success: false, message: 'An unexpected error occurred' }
  }
}
