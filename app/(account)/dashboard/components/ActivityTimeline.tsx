'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ActivityType } from "@/lib/enums/activityType"
import { BookOpen, GraduationCap, CreditCard, Play, CheckCircle, Award, User } from "lucide-react"
import { formatCurrency } from "@/lib/currency/converter"
import { CurrencyCode } from "@/lib/currency/rates"

interface Activity {
  id: string
  activityType: string
  title: string
  description?: string
  metadata?: {
    courseId?: string
    courseTitle?: string
    enrollmentId?: string
    paymentId?: string
    paymentAmount?: number
    paymentCurrency?: string
    lessonId?: string
    lessonTitle?: string
    moduleId?: string
    moduleTitle?: string
    certificateId?: string
  }
  createdAt: string
}

interface ActivityTimelineProps {
  activities: Activity[]
}

const getActivityIcon = (activityType: string) => {
  switch (activityType) {
    case ActivityType.ENROLLMENT_CREATED:
      return <BookOpen className="h-4 w-4 text-blue-500" />
    case ActivityType.ENROLLMENT_COMPLETED:
      return <GraduationCap className="h-4 w-4 text-green-500" />
    case ActivityType.PAYMENT_MADE:
      return <CreditCard className="h-4 w-4 text-purple-500" />
    case ActivityType.COURSE_STARTED:
      return <Play className="h-4 w-4 text-orange-500" />
    case ActivityType.LESSON_COMPLETED:
    case ActivityType.MODULE_COMPLETED:
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case ActivityType.CERTIFICATE_EARNED:
      return <Award className="h-4 w-4 text-yellow-500" />
    case ActivityType.PROFILE_UPDATED:
      return <User className="h-4 w-4 text-gray-500" />
    default:
      return <CheckCircle className="h-4 w-4 text-muted-foreground" />
  }
}

const formatActivityTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No recent activity to display
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
          
          <div className="space-y-6">
            {activities.map((activity, index) => (
              <div key={activity.id} className="relative flex gap-4">
                {/* Icon */}
                <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background border-2 border-border">
                  {getActivityIcon(activity.activityType)}
                </div>
                
                {/* Content */}
                <div className="flex-1 pb-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{activity.title}</p>
                      {activity.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {activity.description}
                        </p>
                      )}
                      {activity.metadata?.paymentAmount && (
                        <p className="text-sm font-medium text-purple-600 mt-1">
                          {formatCurrency(
                            activity.metadata.paymentAmount,
                            (activity.metadata.paymentCurrency || 'USD') as CurrencyCode
                          )}
                        </p>
                      )}
                      {activity.metadata?.courseTitle && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {activity.metadata.courseTitle}
                        </p>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatActivityTime(activity.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

