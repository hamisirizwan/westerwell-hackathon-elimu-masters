'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Edit, Trash2, Calendar, Clock, Link as LinkIcon } from 'lucide-react'
import { toast } from 'sonner'
import { createSession } from '@/actions/sessions/createSession'
import { deleteSession } from '@/actions/sessions/deleteSession'
import { SessionDialog } from './SessionDialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'

interface Session {
  id: string
  title: string
  description?: string
  scheduledAt: string
  duration: number
  meetingLink?: string
  recordingUrl?: string
  order: number
}

interface SessionsManagerProps {
  courseId: string
  initialSessions: Session[]
}

export function SessionsManager({ courseId, initialSessions }: SessionsManagerProps) {
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>(initialSessions)
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false)

  // Sync sessions when initialSessions changes (after refresh)
  useEffect(() => {
    setSessions(initialSessions)
  }, [initialSessions])
  const [editingSession, setEditingSession] = useState<Session | null>(null)
  const [deleteSessionId, setDeleteSessionId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleCreateSession = async (data: { title: string; description?: string; scheduledAt: string; duration: number; meetingLink?: string; recordingUrl?: string }) => {
    const result = await createSession({
      courseId,
      ...data,
    })

    if (result.success) {
      toast.success(result.message)
      router.refresh()
    } else {
      toast.error(result.message)
    }
  }

  const handleDeleteSession = async () => {
    if (!deleteSessionId) return
    setIsDeleting(true)
    const result = await deleteSession(deleteSessionId)
    setIsDeleting(false)

    if (result.success) {
      toast.success(result.message)
      setDeleteSessionId(null)
      router.refresh()
    } else {
      toast.error(result.message)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Sessions</h2>
          <p className="text-sm text-muted-foreground">Schedule and manage live course sessions</p>
        </div>
        <Button onClick={() => { setEditingSession(null); setSessionDialogOpen(true) }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Session
        </Button>
      </div>

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No sessions yet. Create your first session to get started.</p>
            <Button onClick={() => { setEditingSession(null); setSessionDialogOpen(true) }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Session
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <Card key={session.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{session.title}</CardTitle>
                    {session.description && (
                      <p className="text-sm text-muted-foreground mt-1">{session.description}</p>
                    )}
                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(session.scheduledAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{session.duration} minutes</span>
                      </div>
                    </div>
                    {session.meetingLink && (
                      <div className="flex items-center gap-2 mt-2 text-sm">
                        <LinkIcon className="h-4 w-4 text-muted-foreground" />
                        <a
                          href={session.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Join Meeting
                        </a>
                      </div>
                    )}
                    {session.recordingUrl && (
                      <div className="flex items-center gap-2 mt-2 text-sm">
                        <LinkIcon className="h-4 w-4 text-muted-foreground" />
                        <a
                          href={session.recordingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View Recording
                        </a>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => { setEditingSession(session); setSessionDialogOpen(true) }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteSessionId(session.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Session Dialog */}
      <SessionDialog
        open={sessionDialogOpen}
        onOpenChange={setSessionDialogOpen}
        onSubmit={handleCreateSession}
        session={editingSession}
        courseId={courseId}
      />

      {/* Delete Session Dialog */}
      <AlertDialog open={!!deleteSessionId} onOpenChange={(open) => !open && setDeleteSessionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Session</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this session? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSession}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

