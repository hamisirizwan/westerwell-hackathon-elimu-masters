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
import { Button } from '@/components/ui/button'
import { updateSession } from '@/actions/sessions/updateSession'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

const sessionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(150, 'Title cannot exceed 150 characters'),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
  scheduledAt: z.string().min(1, 'Scheduled date/time is required'),
  duration: z.string().min(1, 'Duration is required').transform((val) => parseFloat(val)),
  meetingLink: z.string().url('Invalid meeting link').optional().or(z.literal('')),
  recordingUrl: z.string().url('Invalid recording URL').optional().or(z.literal('')),
})

type SessionFormValues = z.infer<typeof sessionSchema>

interface SessionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: { title: string; description?: string; scheduledAt: string; duration: number; meetingLink?: string; recordingUrl?: string }) => void
  session?: { id: string; title: string; description?: string; scheduledAt: string; duration: number; meetingLink?: string; recordingUrl?: string } | null
  courseId: string
}

export function SessionDialog({ open, onOpenChange, onSubmit, session, courseId }: SessionDialogProps) {
  const router = useRouter()
  const form = useForm<SessionFormValues>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      title: '',
      description: '',
      scheduledAt: '',
      duration: 60,
      meetingLink: '',
      recordingUrl: '',
    },
  })

  useEffect(() => {
    if (session) {
      // Format date for datetime-local input
      const date = new Date(session.scheduledAt)
      const localDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16)

      form.reset({
        title: session.title,
        description: session.description || '',
        scheduledAt: localDateTime,
        duration: session.duration.toString(),
        meetingLink: session.meetingLink || '',
        recordingUrl: session.recordingUrl || '',
      })
    } else {
      form.reset({
        title: '',
        description: '',
        scheduledAt: '',
        duration: 60,
        meetingLink: '',
        recordingUrl: '',
      })
    }
  }, [session, form, open])

  const handleSubmit = async (data: SessionFormValues) => {
    // Convert local datetime to ISO string
    const scheduledAt = new Date(data.scheduledAt).toISOString()

    if (session) {
      // Update existing session
      const result = await updateSession(session.id, {
        ...data,
        scheduledAt,
      })
      if (result.success) {
        toast.success(result.message)
        onOpenChange(false)
        router.refresh()
      } else {
        toast.error(result.message)
      }
    } else {
      // Create new session
      onSubmit({
        ...data,
        scheduledAt,
      })
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{session ? 'Edit Session' : 'Create Session'}</DialogTitle>
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
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="scheduledAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scheduled Date & Time *</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="meetingLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meeting Link (Google Meet)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://meet.google.com/..." />
                  </FormControl>
                  <FormDescription>
                    The Google Meet link for this session
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="recordingUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recording URL</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://..." />
                  </FormControl>
                  <FormDescription>
                    Link to the session recording (can be added after the session)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                {session ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

