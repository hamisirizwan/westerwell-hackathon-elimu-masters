'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Link as LinkIcon, ExternalLink, Video } from 'lucide-react'

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

interface LiveLearningProps {
  course: {
    id: string
    title: string
    slug: string
    thumbnail?: string
    category?: string
    level?: string
  }
  sessions: Session[]
}

export function LiveLearning({ course, sessions }: LiveLearningProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) > new Date()
  }

  const isPast = (dateString: string) => {
    return new Date(dateString) < new Date()
  }

  // Sort sessions: upcoming first, then past
  const sortedSessions = [...sessions].sort((a, b) => {
    const aDate = new Date(a.scheduledAt)
    const bDate = new Date(b.scheduledAt)
    const aUpcoming = isUpcoming(a.scheduledAt)
    const bUpcoming = isUpcoming(b.scheduledAt)

    if (aUpcoming && !bUpcoming) return -1
    if (!aUpcoming && bUpcoming) return 1
    return aDate.getTime() - bDate.getTime()
  })

  return (
    <div className="space-y-6">
      {sessions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No sessions scheduled yet. Check back later!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedSessions.map((session) => {
            const upcoming = isUpcoming(session.scheduledAt)
            const past = isPast(session.scheduledAt)

            return (
              <Card key={session.id} className={upcoming ? 'border-primary/50' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{session.title}</CardTitle>
                        {upcoming && (
                          <Badge variant="default" className="bg-green-600">
                            Upcoming
                          </Badge>
                        )}
                        {past && (
                          <Badge variant="secondary">
                            Completed
                          </Badge>
                        )}
                      </div>
                      {session.description && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {session.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(session.scheduledAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{session.duration} minutes</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {session.meetingLink && upcoming && (
                    <Button asChild className="w-full sm:w-auto">
                      <a
                        href={session.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <Video className="h-4 w-4" />
                        Join Live Session
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  )}
                  {session.recordingUrl && past && (
                    <Button asChild variant="outline" className="w-full sm:w-auto">
                      <a
                        href={session.recordingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <LinkIcon className="h-4 w-4" />
                        Watch Recording
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  )}
                  {!session.meetingLink && upcoming && (
                    <p className="text-sm text-muted-foreground">
                      Meeting link will be available closer to the session time.
                    </p>
                  )}
                  {!session.recordingUrl && past && (
                    <p className="text-sm text-muted-foreground">
                      Recording will be available soon.
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

