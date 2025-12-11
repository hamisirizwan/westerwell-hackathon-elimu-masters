'use client'

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
import { Loader2 } from 'lucide-react'

const formSchema = z.object({
  phoneNumber: z.string().min(1, 'Phone number is required'),
})

type FormValues = z.infer<typeof formSchema>

interface OrangeMoneyFormProps {
  onSubmit: (data: { phoneNumber: string }) => Promise<void>
  isProcessing: boolean
}

export function OrangeMoneyForm({ onSubmit, isProcessing }: OrangeMoneyFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phoneNumber: '',
    },
  })

  const handleSubmit = async (data: FormValues) => {
    await onSubmit({ phoneNumber: data.phoneNumber })
  }

  return (
    <Card className="border-0 shadow-none bg-muted/30">
      <CardContent className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Orange Money</h3>
          <p className="text-sm text-muted-foreground">
            Enter your Orange Money registered phone number. You will receive a payment prompt on your phone.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Orange Money Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="771234567"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '')
                        field.onChange(value)
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter your Orange Money registered phone number
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
                'Pay with Orange Money'
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

