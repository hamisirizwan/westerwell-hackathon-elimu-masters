'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { updateLesson } from '@/actions/lessons/updateLesson'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

const lessonSchema = z.object({
  title: z.string().min(1, 'Title is required').max(150, 'Title cannot exceed 150 characters'),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
  videoUrl: z.string().url('Invalid video URL').min(1, 'Video URL is required'),
  duration: z.string().optional().transform((val) => val ? parseFloat(val) : undefined),
  isFreePreview: z.boolean().default(false),
})

type LessonFormValues = z.infer<typeof lessonSchema>

interface LessonDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: { title: string; description?: string; videoUrl: string; duration?: number; isFreePreview: boolean }) => void
  lesson?: { id: string; title: string; description?: string; videoUrl: string; duration?: number; isFreePreview: boolean } | null
  moduleId: string
}

export function LessonDialog({ open, onOpenChange, onSubmit, lesson, moduleId }: LessonDialogProps) {
  const router = useRouter()
  const form = useForm<LessonFormValues>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: '',
      description: '',
      videoUrl: '',
      duration: undefined,
      isFreePreview: false,
    },
  })

  useEffect(() => {
    if (lesson) {
      form.reset({
        title: lesson.title,
        description: lesson.description || '',
        videoUrl: lesson.videoUrl,
        duration: lesson.duration?.toString() || '',
        isFreePreview: lesson.isFreePreview,
      })
    } else {
      form.reset({
        title: '',
        description: '',
        videoUrl: '',
        duration: '',
        isFreePreview: false,
      })
    }
  }, [lesson, form, open])

  const handleSubmit = async (data: LessonFormValues) => {
    if (lesson) {
      // Update existing lesson
      const result = await updateLesson(lesson.id, {
        ...data,
        duration: data.duration,
      })
      if (result.success) {
        toast.success(result.message)
        onOpenChange(false)
        router.refresh()
      } else {
        toast.error(result.message)
      }
    } else {
      // Create new lesson
      onSubmit({
        ...data,
        duration: data.duration,
      })
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{lesson ? 'Edit Lesson' : 'Create Lesson'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="videoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Video URL (YouTube) *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://www.youtube.com/watch?v=..." />
                  </FormControl>
                  <FormDescription>
                    Enter the full YouTube URL for this lesson
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isFreePreview"
                render={({ field }) => (
                  <FormItem className="flex flex-col justify-end space-y-0">
                    <div className="flex items-center space-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Free Preview</FormLabel>
                    </div>
                    <FormDescription className="mt-2">
                      Allow students to view this lesson without enrolling
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {lesson ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

