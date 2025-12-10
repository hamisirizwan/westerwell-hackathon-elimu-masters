'use server'

import { auth } from '@/lib/auth/auth'
import dbConnect from '@/db/dbConnect'
import { PaymentLink, type IPaymentLink } from '@/db/models/PaymentLinkModel'

export type PaymentLinkDetail = {
  id: string
  title: string
  description?: string
  slug: string
  amountType: string
  amount?: number
  minAmount: number
  maxAmount?: number
  currency: string
  hasUsageLimit: boolean
  usageLimit?: number
  usageCount: number
  status: string
  expiresAt?: string
  redirectUrl?: string
  successMessage?: string
  viewCount: number
  totalCollected: number
  createdAt: string
  updatedAt: string
}

export async function getPaymentLink(id: string) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { success: false, message: 'You must be logged in to view payment link details', data: null }
    }

    await dbConnect()

    const paymentLink = await PaymentLink.findOne({
      _id: id,
      user: session.user.id,
    }).lean<IPaymentLink>()

    if (!paymentLink) {
      return { success: false, message: 'Payment link not found', data: null }
    }

    // Check if link should be marked as expired
    if (paymentLink.status === 'active' && paymentLink.expiresAt && new Date(paymentLink.expiresAt) < new Date()) {
      await PaymentLink.findByIdAndUpdate(id, { status: 'expired' })
      paymentLink.status = 'expired'
    }

    // Check if link should be marked as exhausted
    if (paymentLink.status === 'active' && paymentLink.hasUsageLimit && paymentLink.usageCount >= (paymentLink.usageLimit || 0)) {
      await PaymentLink.findByIdAndUpdate(id, { status: 'exhausted' })
      paymentLink.status = 'exhausted'
    }

    const formattedLink: PaymentLinkDetail = {
      id: paymentLink._id.toString(),
      title: paymentLink.title,
      description: paymentLink.description,
      slug: paymentLink.slug,
      amountType: paymentLink.amountType,
      amount: paymentLink.amount,
      minAmount: paymentLink.minAmount,
      maxAmount: paymentLink.maxAmount,
      currency: paymentLink.currency,
      hasUsageLimit: paymentLink.hasUsageLimit,
      usageLimit: paymentLink.usageLimit,
      usageCount: paymentLink.usageCount,
      status: paymentLink.status,
      expiresAt: paymentLink.expiresAt?.toISOString(),
      redirectUrl: paymentLink.redirectUrl,
      successMessage: paymentLink.successMessage,
      viewCount: paymentLink.viewCount,
      totalCollected: paymentLink.totalCollected,
      createdAt: paymentLink.createdAt.toISOString(),
      updatedAt: paymentLink.updatedAt.toISOString(),
    }

    return {
      success: true,
      data: formattedLink,
    }
  } catch (error) {
    console.error('Get payment link error:', error)
    return { success: false, message: 'An unexpected error occurred', data: null }
  }
}

// Get payment link by slug (for public payment page - no auth required)
export async function getPaymentLinkBySlug(slug: string) {
  try {
    await dbConnect()

    const paymentLink = await PaymentLink.findOne({ slug }).lean<IPaymentLink>()

    if (!paymentLink) {
      return { success: false, message: 'Payment link not found', data: null }
    }

    // Increment view count
    await PaymentLink.findByIdAndUpdate(paymentLink._id, { $inc: { viewCount: 1 } })

    // Check if link is usable
    if (paymentLink.status !== 'active') {
      return { 
        success: false, 
        message: paymentLink.status === 'expired' 
          ? 'This payment link has expired' 
          : paymentLink.status === 'exhausted'
            ? 'This payment link has reached its usage limit'
            : 'This payment link is not active',
        data: null 
      }
    }

    // Check expiry
    if (paymentLink.expiresAt && new Date(paymentLink.expiresAt) < new Date()) {
      await PaymentLink.findByIdAndUpdate(paymentLink._id, { status: 'expired' })
      return { success: false, message: 'This payment link has expired', data: null }
    }

    // Check usage limit
    if (paymentLink.hasUsageLimit && paymentLink.usageCount >= (paymentLink.usageLimit || 0)) {
      await PaymentLink.findByIdAndUpdate(paymentLink._id, { status: 'exhausted' })
      return { success: false, message: 'This payment link has reached its usage limit', data: null }
    }

    // Return only public-facing data
    return {
      success: true,
      data: {
        title: paymentLink.title,
        description: paymentLink.description,
        amountType: paymentLink.amountType,
        amount: paymentLink.amount,
        minAmount: paymentLink.minAmount,
        maxAmount: paymentLink.maxAmount,
        currency: paymentLink.currency,
        successMessage: paymentLink.successMessage,
      },
    }
  } catch (error) {
    console.error('Get payment link by slug error:', error)
    return { success: false, message: 'An unexpected error occurred', data: null }
  }
}

