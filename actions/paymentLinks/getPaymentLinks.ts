'use server'

import { auth } from '@/lib/auth/auth'
import dbConnect from '@/db/dbConnect'
import { PaymentLink, type IPaymentLink } from '@/db/models/PaymentLinkModel'

export type PaymentLinkListItem = {
  id: string
  title: string
  slug: string
  amountType: string
  amount?: number
  currency: string
  status: string
  usageCount: number
  usageLimit?: number
  viewCount: number
  totalCollected: number
  createdAt: string
  expiresAt?: string
}

type GetPaymentLinksOptions = {
  status?: 'active' | 'inactive' | 'expired' | 'exhausted' | 'all'
  page?: number
  limit?: number
}

export async function getPaymentLinks(options: GetPaymentLinksOptions = {}) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { success: false, message: 'You must be logged in to view payment links', data: null }
    }

    const { status = 'all', page = 1, limit = 10 } = options

    await dbConnect()

    // Build query
    const query: Record<string, unknown> = { user: session.user.id }
    
    if (status !== 'all') {
      query.status = status
    }

    // Check and update expired links
    await PaymentLink.updateMany(
      {
        user: session.user.id,
        status: 'active',
        expiresAt: { $lt: new Date() },
      },
      { status: 'expired' }
    )

    // Check and update exhausted links
    await PaymentLink.updateMany(
      {
        user: session.user.id,
        status: 'active',
        hasUsageLimit: true,
        $expr: { $gte: ['$usageCount', '$usageLimit'] },
      },
      { status: 'exhausted' }
    )

    const skip = (page - 1) * limit

    const [paymentLinks, totalCount] = await Promise.all([
      PaymentLink.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<IPaymentLink[]>(),
      PaymentLink.countDocuments(query),
    ])

    const formattedLinks: PaymentLinkListItem[] = paymentLinks.map((link) => ({
      id: link._id.toString(),
      title: link.title,
      slug: link.slug,
      amountType: link.amountType,
      amount: link.amount,
      currency: link.currency,
      status: link.status,
      usageCount: link.usageCount,
      usageLimit: link.usageLimit,
      viewCount: link.viewCount,
      totalCollected: link.totalCollected,
      createdAt: link.createdAt.toISOString(),
      expiresAt: link.expiresAt?.toISOString(),
    }))

    return {
      success: true,
      data: {
        links: formattedLinks,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
    }
  } catch (error) {
    console.error('Get payment links error:', error)
    return { success: false, message: 'An unexpected error occurred', data: null }
  }
}

