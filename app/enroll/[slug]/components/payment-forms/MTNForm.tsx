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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

const formSchema = z.object({
  phoneNumber: z.string().min(1, 'Phone number is required'),
  network: z.enum(['mtn', 'vodafone', 'airteltigo']),
})

type FormValues = z.infer<typeof formSchema>

interface MTNFormProps {
  onSubmit: (data: { phoneNumber: string }) => Promise<void>
  isProcessing: boolean
}

export function MTNForm({ onSubmit, isProcessing }: MTNFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phoneNumber: '',
      network: 'mtn',
    },
  })

  const handleSubmit = async (data: FormValues) => {
    await onSubmit({ phoneNumber: data.phoneNumber })
  }

  return (
    <Card className="border-0 shadow-none bg-muted/30">
      <CardContent className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">MTN Mobile Money</h3>
          <p className="text-sm text-muted-foreground">
            Enter your mobile money details. You will receive a payment prompt on your phone.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="network"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Network</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="mtn">MTN</SelectItem>
                      <SelectItem value="vodafone">Vodafone</SelectItem>
                      <SelectItem value="airteltigo">AirtelTigo</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="0244123456"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '')
                        field.onChange(value)
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter your mobile money registered phone number
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
                'Pay with Mobile Money'
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              You will receive a payment prompt on your phone. Enter your PIN to complete the payment.
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

