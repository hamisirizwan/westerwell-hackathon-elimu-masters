'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from "@/components/ui/form"
import { PaymentModal } from './PaymentModal'

type Props = {
  title: string
  description?: string
  amountType: string
  amount?: number
  minAmount: number
  maxAmount?: number
  currency: string
}

export function PaymentForm({ 
  title, 
  description,
  amountType, 
  amount, 
  minAmount, 
  maxAmount,
  currency 
}: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [paymentData, setPaymentData] = useState<{
    amount: number
    customerName: string
    customerEmail: string
  } | null>(null)

  const formSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    amount: amountType === 'flexible' 
      ? z.string().min(1, 'Amount is required').refine(
          (val) => {
            const num = parseFloat(val)
            return num >= minAmount && (!maxAmount || num <= maxAmount)
          },
          {
            message: maxAmount 
              ? `Amount must be between ${currency} ${minAmount} and ${currency} ${maxAmount}`
              : `Amount must be at least ${currency} ${minAmount}`
          }
        )
      : z.string().optional(),
  })

  type FormValues = z.infer<typeof formSchema>

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      amount: amountType === 'flexible' ? minAmount.toString() : '',
    },
  })

  const payAmount = amountType === 'fixed' 
    ? amount 
    : parseFloat(form.watch('amount') || minAmount.toString())

  function onSubmit(data: FormValues) {
    const finalAmount = amountType === 'fixed' ? amount! : parseFloat(data.amount || '0')
    
    // Store payment data and open modal
    setPaymentData({
      amount: finalAmount,
      customerName: `${data.firstName} ${data.lastName}`,
      customerEmail: data.email,
    })
    setIsModalOpen(true)
  }

  const handlePaymentSuccess = () => {
    setIsModalOpen(false)
    toast.success('Payment completed successfully!', {
      description: 'Thank you for your payment.',
    })
    // Reset form after successful payment
    form.reset()
    setPaymentData(null)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    // Form data is preserved for retry
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Check Out</h2>
          {description && (
            <p className="text-gray-600 mt-1">Ref: {description}</p>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Your Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Your Details</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          placeholder="First name" 
                          className="bg-white border-gray-200"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          placeholder="Last name" 
                          className="bg-white border-gray-200"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        type="email"
                        placeholder="Email" 
                        className="bg-white border-gray-200"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Flexible Amount Input */}
              {amountType === 'flexible' && (
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                            {currency}
                          </span>
                          <Input 
                            type="number"
                            min={minAmount}
                            max={maxAmount}
                            placeholder={`Enter amount (min ${minAmount})`}
                            className="bg-white border-gray-200 pl-14"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Pay Button */}
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-medium"
            >
              Pay {currency} {payAmount?.toLocaleString() || 0}
            </Button>
          </form>
        </Form>

        {/* Contact Info */}
        <div className="text-center text-sm text-gray-600">
          <p>If you have any questions, contact</p>
          <a href="mailto:support@sendflow.co.ke" className="text-blue-600 hover:underline">
            support@sendflow.co.ke 
          </a>
        </div>

        {/* Payment Method Logos */}
        <div className="flex items-center justify-center gap-4 pt-2">
          <div className="flex items-center gap-3 opacity-60">
            {/* M-Pesa */}
            <span className="text-xs font-bold text-green-600">PAY VIA M-PESA</span>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {paymentData && (
        <PaymentModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSuccess={handlePaymentSuccess}
          amount={paymentData.amount}
          currency={currency}
          customerName={paymentData.customerName}
          customerEmail={paymentData.customerEmail}
        />
      )}
    </>
  )
}
