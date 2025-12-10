'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createPaymentLink } from '@/actions/paymentLinks/createPaymentLink'
import { slugify } from '@/lib/slugify'
import { Loader2 } from 'lucide-react'

const formSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title cannot exceed 100 characters'),
  slug: z.string().max(50, 'Slug cannot exceed 50 characters').optional().or(z.literal('')),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  amountType: z.enum(['fixed', 'flexible']),
  amount: z.string().optional(),
  minAmount: z.string().optional(),
  maxAmount: z.string().optional(),
  currency: z.enum(['KES', 'USD', 'EUR', 'GBP']),
  hasUsageLimit: z.boolean(),
  usageLimit: z.string().optional(),
  hasExpiry: z.boolean(),
  expiresAt: z.string().optional(),
  redirectUrl: z.string().optional(),
  successMessage: z.string().max(200, 'Success message cannot exceed 200 characters').optional(),
})

type FormValues = z.infer<typeof formSchema>

export function CreatePaymentLinkForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [slugPreview, setSlugPreview] = useState('')

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      slug: '',
      description: '',
      amountType: 'flexible',
      amount: '',
      minAmount: '1',
      maxAmount: '',
      currency: 'KES',
      hasUsageLimit: false,
      usageLimit: '',
      hasExpiry: false,
      expiresAt: '',
      redirectUrl: '',
      successMessage: '',
    },
  })

  const amountType = form.watch('amountType')
  const hasUsageLimit = form.watch('hasUsageLimit')
  const hasExpiry = form.watch('hasExpiry')
  const title = form.watch('title')
  const customSlug = form.watch('slug')

  // Update slug preview when title changes
  const updateSlugPreview = (value: string) => {
    if (!customSlug) {
      setSlugPreview(slugify(value))
    }
  }

  async function onSubmit(data: FormValues) {
    setIsLoading(true)

    // Validate amount for fixed type
    if (data.amountType === 'fixed' && (!data.amount || parseFloat(data.amount) < 1)) {
      form.setError('amount', { message: 'Amount is required for fixed price links' })
      setIsLoading(false)
      return
    }

    // Validate usage limit
    if (data.hasUsageLimit && (!data.usageLimit || parseInt(data.usageLimit) < 1)) {
      form.setError('usageLimit', { message: 'Usage limit is required' })
      setIsLoading(false)
      return
    }

    // Validate expiry date
    if (data.hasExpiry && !data.expiresAt) {
      form.setError('expiresAt', { message: 'Expiry date is required' })
      setIsLoading(false)
      return
    }

    const payload = {
      title: data.title,
      slug: data.slug || undefined,
      description: data.description || undefined,
      amountType: data.amountType,
      amount: data.amountType === 'fixed' && data.amount ? parseFloat(data.amount) : undefined,
      minAmount: data.minAmount ? parseFloat(data.minAmount) : 1,
      maxAmount: data.maxAmount ? parseFloat(data.maxAmount) : undefined,
      currency: data.currency,
      hasUsageLimit: data.hasUsageLimit,
      usageLimit: data.hasUsageLimit && data.usageLimit ? parseInt(data.usageLimit) : undefined,
      expiresAt: data.hasExpiry && data.expiresAt ? data.expiresAt : undefined,
      redirectUrl: data.redirectUrl || undefined,
      successMessage: data.successMessage || undefined,
    }

    const result = await createPaymentLink(payload)

    setIsLoading(false)

    if (result.success) {
      toast.success(result.message)
      router.push('/links')
    } else {
      toast.error(result.message)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
        {/* Basic Info Section */}
        <div className="space-y-6">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Basic Information</h3>
          
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title *</FormLabel>
                <FormControl>
                  <Input 
                    {...field}
                    onChange={(e) => {
                      field.onChange(e)
                      updateSlugPreview(e.target.value)
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Custom URL (Optional)</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">/pay/</span>
                    <Input 
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
                        field.onChange(value)
                        setSlugPreview(value || slugify(title))
                      }}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    className="resize-none"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Amount Section */}
        <div className="space-y-6">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Payment Amount</h3>

          <FormField
            control={form.control}
            name="amountType"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Fixed Amount</FormLabel>
                  <FormDescription>
                    Set a specific amount for this payment link
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value === 'fixed'}
                    onCheckedChange={(checked) => field.onChange(checked ? 'fixed' : 'flexible')}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="KES">KES (Kenyan Shilling)</SelectItem>
                      <SelectItem value="USD">USD (US Dollar)</SelectItem>
                      <SelectItem value="EUR">EUR (Euro)</SelectItem>
                      <SelectItem value="GBP">GBP (British Pound)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {amountType === 'fixed' ? (
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <>
                <FormField
                  control={form.control}
                  name="minAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Amount</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>

          {amountType === 'flexible' && (
            <FormField
              control={form.control}
              name="maxAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Amount (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Limits Section */}
        <div className="space-y-6">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Limits & Expiry</h3>

          <FormField
            control={form.control}
            name="hasUsageLimit"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Usage Limit</FormLabel>
                  <FormDescription>
                    Limit how many times this link can be used
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {hasUsageLimit && (
            <FormField
              control={form.control}
              name="usageLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Uses *</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="hasExpiry"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Expiry Date</FormLabel>
                  <FormDescription>
                    Set when this link should expire
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {hasExpiry && (
            <FormField
              control={form.control}
              name="expiresAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expires On *</FormLabel>
                  <FormControl>
                    <Input 
                      type="datetime-local"
                      min={new Date().toISOString().slice(0, 16)}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Advanced Section */}
        <div className="space-y-6">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Advanced Options</h3>

          <FormField
            control={form.control}
            name="redirectUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Redirect URL (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    type="url"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Optional website URL to redirect the client after a successful payment
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isLoading ? 'Creating...' : 'Create Payment Link'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}

