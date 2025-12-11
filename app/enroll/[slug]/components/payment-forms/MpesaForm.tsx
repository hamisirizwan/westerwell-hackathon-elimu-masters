'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { isValidKenyanPhoneNumber } from '@/utils/kenyanphone'
import { Loader2 } from 'lucide-react'

const formSchema = z.object({
  phoneNumber: z.string().min(1, 'Phone number is required'),
})

type FormValues = z.infer<typeof formSchema>

interface MpesaFormProps {
  onSubmit: (data: { phoneNumber: string }) => Promise<void>
  isProcessing: boolean
}

export function MpesaForm({ onSubmit, isProcessing }: MpesaFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phoneNumber: '',
    },
  })

  const handleSubmit = async (data: FormValues) => {
    // Validate Kenyan phone number
    if (!isValidKenyanPhoneNumber(data.phoneNumber)) {
      form.setError('phoneNumber', {
        message: 'Please enter a valid Kenyan phone number (e.g., 0712345678)',
      })
      return
    }

    await onSubmit({ phoneNumber: data.phoneNumber })
  }

  return (
    <Card className="border-0 shadow-none bg-muted/30">
      <CardContent className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">M-Pesa Payment</h3>
          <p className="text-sm text-muted-foreground">
            Enter your M-Pesa registered phone number. You will receive a payment prompt on your phone.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>M-Pesa Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="0712345678"
                      {...field}
                      onChange={(e) => {
                        // Remove any non-digit characters
                        const value = e.target.value.replace(/\D/g, '')
                        field.onChange(value)
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter your M-Pesa registered phone number without the country code
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" size="lg" disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                'Pay with M-Pesa'
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              You will receive an M-Pesa prompt on your phone. Enter your PIN to complete the payment.
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

