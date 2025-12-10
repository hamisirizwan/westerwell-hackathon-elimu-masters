'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
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
import { createCourse } from '@/actions/courses/createCourse'
import { updateCourse } from '@/actions/courses/updateCourse'
import { slugify } from '@/lib/slugify'
import { Loader2, Plus, X } from 'lucide-react'

const categories = [
  'Programming',
  'Business',
  'Design',
  'Marketing',
  'Data Science',
  'Language',
  'Personal Development',
  'Finance',
  'Health & Wellness',
  'Education & Teaching',
] as const

const formSchema = z.object({
  title: z.string().min(1, 'Title is required').max(150, 'Title cannot exceed 150 characters'),
  description: z.string().max(5000, 'Description cannot exceed 5000 characters').optional(),
  thumbnail: z.string().optional().or(z.literal('')),
  courseType: z.enum(['self-paced', 'live']),
  
  // Pricing
  price: z.string().optional(),
  currency: z.enum(['KES', 'TZS', 'UGX', 'RWF', 'ZAR', 'NGN', 'GHS', 'USD', 'EUR']),
  
  // Metadata
  category: z.enum(categories).optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  language: z.string().max(50, 'Language cannot exceed 50 characters'),
  estimatedDuration: z.string().optional(),
  learningOutcomes: z.array(z.object({ value: z.string() })),
  requirements: z.array(z.object({ value: z.string() })),
  
  // Status
  status: z.enum(['draft', 'published']),
  
  // Live course specific
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  maxStudents: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

const currencyLabels: Record<string, string> = {
  KES: 'KES (Kenyan Shilling)',
  TZS: 'TZS (Tanzanian Shilling)',
  UGX: 'UGX (Ugandan Shilling)',
  RWF: 'RWF (Rwandan Franc)',
  ZAR: 'ZAR (South African Rand)',
  NGN: 'NGN (Nigerian Naira)',
  GHS: 'GHS (Ghanaian Cedi)',
  USD: 'USD (US Dollar)',
  EUR: 'EUR (Euro)',
}

interface CourseFormProps {
  mode: 'create' | 'edit'
  initialData?: {
    id: string
    title: string
    description?: string
    thumbnail?: string
    courseType: 'self-paced' | 'live'
    price: number
    currency: string
    category?: string
    level: string
    language: string
    estimatedDuration?: number
    learningOutcomes: string[]
    requirements: string[]
    status: 'draft' | 'published'
    startDate?: string
    endDate?: string
    maxStudents?: number
  }
}

export function CourseForm({ mode, initialData }: CourseFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      title: initialData.title,
      description: initialData.description || '',
      thumbnail: initialData.thumbnail || '',
      courseType: initialData.courseType,
      price: initialData.price.toString(),
      currency: initialData.currency as any,
      category: (initialData.category || '') as any,
      level: initialData.level as any,
      language: initialData.language,
      estimatedDuration: initialData.estimatedDuration?.toString() || '',
      learningOutcomes: initialData.learningOutcomes.length > 0 
        ? initialData.learningOutcomes.map(o => ({ value: o }))
        : [{ value: '' }],
      requirements: initialData.requirements.length > 0 
        ? initialData.requirements.map(r => ({ value: r }))
        : [{ value: '' }],
      status: initialData.status as any,
      startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
      endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '',
      maxStudents: initialData.maxStudents?.toString() || '',
    } : {
      title: '',
      description: '',
      thumbnail: '',
      courseType: 'self-paced',
      price: '0',
      currency: 'KES',
      category: '',
      level: 'beginner',
      language: 'English',
      estimatedDuration: '',
      learningOutcomes: [{ value: '' }],
      requirements: [{ value: '' }],
      status: 'draft',
      startDate: '',
      endDate: '',
      maxStudents: '',
    },
  })

  const courseType = form.watch('courseType')
  const title = form.watch('title')
  const slugPreview = title ? slugify(title) : ''

  const { fields: outcomeFields, append: appendOutcome, remove: removeOutcome } = useFieldArray({
    control: form.control,
    name: 'learningOutcomes',
  })

  const { fields: requirementFields, append: appendRequirement, remove: removeRequirement } = useFieldArray({
    control: form.control,
    name: 'requirements',
  })

  async function onSubmit(data: FormValues) {
    setIsLoading(true)

    const payload = {
      title: data.title,
      description: data.description || undefined,
      thumbnail: data.thumbnail || undefined,
      courseType: data.courseType as 'self-paced' | 'live',
      price: data.price ? parseFloat(data.price) : 0,
      currency: data.currency as 'KES' | 'TZS' | 'UGX' | 'RWF' | 'ZAR' | 'NGN' | 'GHS' | 'USD' | 'EUR',
      category: data.category || undefined,
      level: data.level as 'beginner' | 'intermediate' | 'advanced',
      language: data.language,
      estimatedDuration: data.estimatedDuration ? parseFloat(data.estimatedDuration) : undefined,
      learningOutcomes: data.learningOutcomes.map(o => o.value).filter(v => v.trim() !== ''),
      requirements: data.requirements.map(r => r.value).filter(v => v.trim() !== ''),
      status: data.status as 'draft' | 'published',
      startDate: data.startDate || undefined,
      endDate: data.endDate || undefined,
      maxStudents: data.maxStudents ? parseInt(data.maxStudents) : undefined,
    }

    let result
    if (mode === 'create') {
      result = await createCourse(payload)
    } else {
      result = await updateCourse(initialData!.id, payload)
    }

    setIsLoading(false)

    if (result.success) {
      toast.success(result.message)
      router.push('/admin/courses')
    } else {
      toast.error(result.message)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
        {/* Basic Info Section */}
        <div className="space-y-8">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Basic Information</h3>
          
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course Title *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                {slugPreview && (
                  <FormDescription>
                    URL: /courses/{slugPreview}
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    className="resize-none"
                    rows={5}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="thumbnail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Thumbnail URL</FormLabel>
                <FormControl>
                  <Input 
                    type="url"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="courseType"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Live Course</FormLabel>
                  <FormDescription>
                    Enable for scheduled Google Meet sessions. Disable for self-paced video content.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value === 'live'}
                    onCheckedChange={(checked) => field.onChange(checked ? 'live' : 'self-paced')}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Pricing Section */}
        <div className="space-y-8">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Pricing</h3>

          <div className="grid grid-cols-2 gap-8">
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
                      {Object.entries(currencyLabels).map(([code, label]) => (
                        <SelectItem key={code} value={code}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Enter 0 for free courses</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Metadata Section */}
        <div className="space-y-8">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Course Details</h3>

          <div className="grid grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Level *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Language *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="estimatedDuration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Duration (hours)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0"
                      step="0.5"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Learning Outcomes */}
        <div className="space-y-6">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">What Students Will Learn</h3>
          
          <div className="space-y-4">
            {outcomeFields.map((field, index) => (
              <div key={field.id} className="flex gap-3">
                <FormField
                  control={form.control}
                  name={`learningOutcomes.${index}.value`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {outcomeFields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOutcome(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendOutcome({ value: '' })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Outcome
          </Button>
        </div>

        {/* Requirements */}
        <div className="space-y-6">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Prerequisites / Requirements</h3>
          
          <div className="space-y-4">
            {requirementFields.map((field, index) => (
              <div key={field.id} className="flex gap-3">
                <FormField
                  control={form.control}
                  name={`requirements.${index}.value`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {requirementFields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeRequirement(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendRequirement({ value: '' })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Requirement
          </Button>
        </div>

        {/* Live Course Settings */}
        {courseType === 'live' && (
          <div className="space-y-8">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Live Course Schedule</h3>

            <div className="grid grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date"
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
              name="maxStudents"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Students</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Leave empty for unlimited enrollment
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Status & Submit */}
        <div className="space-y-8">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Publishing</h3>

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Publish Immediately</FormLabel>
                  <FormDescription>
                    Make this course visible to students right away
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value === 'published'}
                    onCheckedChange={(checked) => field.onChange(checked ? 'published' : 'draft')}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-4 pt-6">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isLoading ? (mode === 'create' ? 'Creating...' : 'Updating...') : (mode === 'create' ? 'Create Course' : 'Update Course')}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}
