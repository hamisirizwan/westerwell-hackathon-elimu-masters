'use client'

import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StudentStats } from './StudentStats'
import { AdminStats } from './AdminStats'

interface DashboardViewSwitcherProps {
  isAdmin: boolean
  adminStats: {
    totalCourses: number
    publishedCourses: number
    totalStudents: number
    totalEnrollments: number
    activeEnrollments: number
    totalPayments: number
    totalRevenue: number
    paymentsOverTime: Array<{ date: string; count: number; amount: number }>
    enrollmentsOverTime: Array<{ date: string; count: number }>
  }
  studentStats: {
    enrolledCourses: number
    activeCourses: number
    completedCourses: number
    hoursLearned: number
    certificates: number
  } | null
  activities?: Array<{
    id: string
    activityType: string
    title: string
    description?: string
    metadata?: Record<string, any>
    createdAt: string
  }>
}

export function DashboardViewSwitcher({ isAdmin, adminStats, studentStats, activities = [] }: DashboardViewSwitcherProps) {
  const [view, setView] = useState<'admin' | 'student'>('admin')

  // If not admin, only show student view
  if (!isAdmin) {
    return studentStats ? <StudentStats stats={studentStats} activities={activities} /> : null
  }

  // If admin, show switcher and appropriate view
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div />
        <Select value={view} onValueChange={(value: 'admin' | 'student') => setView(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin View</SelectItem>
            <SelectItem value="student">Student View</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {view === 'admin' ? (
        <AdminStats stats={adminStats} />
      ) : (
        studentStats ? (
          <StudentStats stats={studentStats} activities={activities} />
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No student stats available
          </div>
        )
      )}
    </div>
  )
}

