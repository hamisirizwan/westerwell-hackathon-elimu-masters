'use server'

import { auth } from '@/lib/auth/auth'
import dbConnect from '@/db/dbConnect'
import { PaymentLink } from '@/db/models/PaymentLinkModel'

export async function deactivatePaymentLink(id: string) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { success: false, message: 'You must be logged in to deactivate a payment link' }
    }

    if (!id) {
      return { success: false, message: 'Payment link ID is required' }
    }

    await dbConnect()

    // Find the payment link and verify ownership
    const paymentLink = await PaymentLink.findOne({
      _id: id,
      user: session.user.id,
    })

    if (!paymentLink) {
      return { success: false, message: 'Payment link not found' }
    }

    if (paymentLink.status === 'inactive') {
      return { success: false, message: 'Payment link is already inactive' }
    }

    await PaymentLink.findByIdAndUpdate(id, { status: 'inactive' })

    return {
      success: true,
      message: 'Payment link deactivated successfully',
    }
  } catch (error) {
    console.error('Deactivate payment link error:', error)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

// Reactivate a payment link
export async function reactivatePaymentLink(id: string) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { success: false, message: 'You must be logged in to reactivate a payment link' }
    }

    if (!id) {
      return { success: false, message: 'Payment link ID is required' }
    }

    await dbConnect()

    // Find the payment link and verify ownership
    const paymentLink = await PaymentLink.findOne({
      _id: id,
      user: session.user.id,
    })

    if (!paymentLink) {
      return { success: false, message: 'Payment link not found' }
    }

    // Check if link can be reactivated
    if (paymentLink.status === 'active') {
      return { success: false, message: 'Payment link is already active' }
    }

    if (paymentLink.status === 'expired') {
      if (paymentLink.expiresAt && new Date(paymentLink.expiresAt) < new Date()) {
        return { success: false, message: 'Cannot reactivate an expired link. Please update the expiry date first.' }
      }
    }

    if (paymentLink.status === 'exhausted') {
      if (paymentLink.hasUsageLimit && paymentLink.usageCount >= paymentLink.usageLimit) {
        return { success: false, message: 'Cannot reactivate an exhausted link. Please increase the usage limit first.' }
      }
    }

    await PaymentLink.findByIdAndUpdate(id, { status: 'active' })

    return {
      success: true,
      message: 'Payment link reactivated successfully',
    }
  } catch (error) {
    console.error('Reactivate payment link error:', error)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

