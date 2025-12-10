'use server'

import { z } from 'zod'
import { auth } from '@/lib/auth/auth'
import dbConnect from '@/db/dbConnect'
import { PaymentLink } from '@/db/models/PaymentLinkModel'

const UpdatePaymentLinkSchema = z.object({
  id: z.string().min(1, 'Payment link ID is required'),
  title: z.string().min(1, 'Title is required').max(100, 'Title cannot exceed 100 characters').optional(),
  slug: z.string().min(3, 'Slug must be at least 3 characters').max(50, 'Slug cannot exceed 50 characters').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens').optional(),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  amountType: z.enum(['fixed', 'flexible']).optional(),
  amount: z.number().min(1, 'Amount must be at least 1').optional(),
  minAmount: z.number().min(1, 'Minimum amount must be at least 1').optional(),
  maxAmount: z.number().min(1, 'Maximum amount must be at least 1').optional().nullable(),
  currency: z.enum(['KES', 'USD', 'EUR', 'GBP']).optional(),
  hasUsageLimit: z.boolean().optional(),
  usageLimit: z.number().min(1, 'Usage limit must be at least 1').optional().nullable(),
  expiresAt: z.string().optional().nullable(),
  redirectUrl: z.string().url('Invalid URL').optional().or(z.literal('')).nullable(),
  successMessage: z.string().max(200, 'Success message cannot exceed 200 characters').optional(),
  status: z.enum(['active', 'inactive']).optional(),
})

export async function updatePaymentLink(data: z.infer<typeof UpdatePaymentLinkSchema>) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { success: false, message: 'You must be logged in to update a payment link' }
    }

    const validatedData = UpdatePaymentLinkSchema.parse(data)

    await dbConnect()

    // Find the payment link and verify ownership
    const existingLink = await PaymentLink.findOne({
      _id: validatedData.id,
      user: session.user.id,
    })

    if (!existingLink) {
      return { success: false, message: 'Payment link not found' }
    }

    // Check if slug is being changed and if it's unique
    if (validatedData.slug && validatedData.slug !== existingLink.slug) {
      const slugExists = await PaymentLink.findOne({ 
        slug: validatedData.slug.toLowerCase(),
        _id: { $ne: validatedData.id }
      })
      if (slugExists) {
        return { success: false, message: 'This slug is already taken. Please choose a different one.' }
      }
    }

    // Don't allow updating exhausted or expired links to active without resetting conditions
    if (existingLink.status === 'exhausted' && validatedData.status === 'active') {
      // Check if usage limit is being increased
      if (!validatedData.hasUsageLimit || (validatedData.usageLimit && validatedData.usageLimit > existingLink.usageCount)) {
        // Allow reactivation
      } else {
        return { success: false, message: 'Cannot reactivate an exhausted link without increasing the usage limit' }
      }
    }

    if (existingLink.status === 'expired' && validatedData.status === 'active') {
      // Check if expiry date is being extended
      if (validatedData.expiresAt && new Date(validatedData.expiresAt) > new Date()) {
        // Allow reactivation
      } else if (validatedData.expiresAt === null) {
        // Removing expiry, allow reactivation
      } else {
        return { success: false, message: 'Cannot reactivate an expired link without extending the expiry date' }
      }
    }

    // Build update object
    const updateData: Record<string, unknown> = {}

    if (validatedData.title !== undefined) updateData.title = validatedData.title
    if (validatedData.slug !== undefined) updateData.slug = validatedData.slug.toLowerCase()
    if (validatedData.description !== undefined) updateData.description = validatedData.description
    if (validatedData.amountType !== undefined) updateData.amountType = validatedData.amountType
    if (validatedData.amount !== undefined) updateData.amount = validatedData.amount
    if (validatedData.minAmount !== undefined) updateData.minAmount = validatedData.minAmount
    if (validatedData.maxAmount !== undefined) updateData.maxAmount = validatedData.maxAmount === null ? undefined : validatedData.maxAmount
    if (validatedData.currency !== undefined) updateData.currency = validatedData.currency
    if (validatedData.hasUsageLimit !== undefined) updateData.hasUsageLimit = validatedData.hasUsageLimit
    if (validatedData.usageLimit !== undefined) updateData.usageLimit = validatedData.usageLimit === null ? undefined : validatedData.usageLimit
    if (validatedData.expiresAt !== undefined) updateData.expiresAt = validatedData.expiresAt ? new Date(validatedData.expiresAt) : undefined
    if (validatedData.redirectUrl !== undefined) updateData.redirectUrl = validatedData.redirectUrl || undefined
    if (validatedData.successMessage !== undefined) updateData.successMessage = validatedData.successMessage
    if (validatedData.status !== undefined) updateData.status = validatedData.status

    // Validate amount for fixed type
    const newAmountType = validatedData.amountType || existingLink.amountType
    const newAmount = validatedData.amount !== undefined ? validatedData.amount : existingLink.amount

    if (newAmountType === 'fixed' && !newAmount) {
      return { success: false, message: 'Amount is required for fixed amount links' }
    }

    // Validate usage limit
    const newHasUsageLimit = validatedData.hasUsageLimit !== undefined ? validatedData.hasUsageLimit : existingLink.hasUsageLimit
    const newUsageLimit = validatedData.usageLimit !== undefined ? validatedData.usageLimit : existingLink.usageLimit

    if (newHasUsageLimit && !newUsageLimit) {
      return { success: false, message: 'Usage limit is required when usage limit is enabled' }
    }

    await PaymentLink.findByIdAndUpdate(validatedData.id, updateData)

    return {
      success: true,
      message: 'Payment link updated successfully',
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: error.issues[0].message }
    }
    console.error('Update payment link error:', error)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

