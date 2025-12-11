'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ModulesManager } from './ModulesManager'
import { SessionsManager } from './SessionsManager'
import { BookOpen, Video } from 'lucide-react'

interface Course {
  id: string
  title: string
  courseType: 'self-paced' | 'live'
  modules?: Array<{
    id: string
    title: string
    description?: string
    order: number
    lessons: Array<{
      id: string
      title: string
      description?: string
      videoUrl: string
      duration?: number
      order: number
      isFreePreview: boolean
    }>
  }>
  sessions?: Array<{
    id: string
    title: string
    description?: string
    scheduledAt: string
    duration: number
    meetingLink?: string
    recordingUrl?: string
    order: number
  }>
}

interface CourseContentManagerProps {
  course: Course
}

export function CourseContentManager({ course }: CourseContentManagerProps) {
  const [activeTab, setActiveTab] = useState<'modules' | 'sessions'>(
    course.courseType === 'self-paced' ? 'modules' : 'sessions'
  )

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {course.courseType === 'self-paced' && (
          <Button
            variant={activeTab === 'modules' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('modules')}
            className="rounded-b-none"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Modules & Lessons
          </Button>
        )}
        {course.courseType === 'live' && (
          <Button
            variant={activeTab === 'sessions' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('sessions')}
            className="rounded-b-none"
          >
            <Video className="h-4 w-4 mr-2" />
            Sessions
          </Button>
        )}
      </div>

      {/* Content */}
      {activeTab === 'modules' && course.courseType === 'self-paced' && (
        <ModulesManager courseId={course.id} initialModules={course.modules || []} />
      )}
      {activeTab === 'sessions' && course.courseType === 'live' && (
        <SessionsManager courseId={course.id} initialSessions={course.sessions || []} />
      )}
    </div>
  )
}

