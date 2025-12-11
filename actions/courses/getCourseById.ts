'use server'

import { auth } from '@/lib/auth/auth'
import dbConnect from '@/db/dbConnect'
import { Course } from '@/db/models/CourseModel'
import { Module } from '@/db/models/ModuleModel'
import { Lesson } from '@/db/models/LessonModel'
import { Session } from '@/db/models/SessionModel'
import { UserRole } from '@/db/models/UserModel'

export async function getCourseById(courseId: string) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { success: false, message: 'You must be logged in' }
    }

    if (session.user.role !== UserRole.ADMIN) {
      return { success: false, message: 'Only administrators can view course details' }
    }

    await dbConnect()

    const course = await Course.findById(courseId)
      .populate('instructor', 'username email')
      .lean()

    if (!course) {
      return { success: false, message: 'Course not found' }
    }

    // Get modules with lessons for self-paced courses
    let modules: any[] = []
    if (course.courseType === 'self-paced') {
      const courseModules = await Module.find({ course: courseId })
        .sort({ order: 1 })
        .lean()

      for (const mod of courseModules) {
        const lessons = await Lesson.find({ module: mod._id })
          .sort({ order: 1 })
          .lean()

        modules.push({
          id: mod._id.toString(),
          title: mod.title,
          description: mod.description,
          order: mod.order,
          lessons: lessons.map((lesson: any) => ({
            id: lesson._id.toString(),
            title: lesson.title,
            description: lesson.description,
            videoUrl: lesson.videoUrl,
            duration: lesson.duration,
            order: lesson.order,
            isFreePreview: lesson.isFreePreview,
          })),
        })
      }
    }

    // Get sessions for live courses
    let sessions: any[] = []
    if (course.courseType === 'live') {
      const courseSessions = await Session.find({ course: courseId })
        .sort({ order: 1 })
        .lean()

      sessions = courseSessions.map((session: any) => ({
        id: session._id.toString(),
        title: session.title,
        description: session.description,
        scheduledAt: session.scheduledAt.toISOString(),
        duration: session.duration,
        meetingLink: session.meetingLink,
        recordingUrl: session.recordingUrl,
        order: session.order,
      }))
    }

    return {
      success: true,
      data: {
        id: course._id.toString(),
        title: course.title,
        slug: course.slug,
        description: course.description,
        thumbnail: course.thumbnail,
        courseType: course.courseType,
        price: course.price,
        currency: course.currency,
        category: course.category,
        level: course.level,
        language: course.language,
        estimatedDuration: course.estimatedDuration,
        learningOutcomes: course.learningOutcomes || [],
        requirements: course.requirements || [],
        status: course.status,
        enrollmentCount: course.enrollmentCount,
        startDate: course.startDate?.toISOString(),
        endDate: course.endDate?.toISOString(),
        maxStudents: course.maxStudents,
        instructor: course.instructor ? {
          id: (course.instructor as any)._id.toString(),
          username: (course.instructor as any).username,
          email: (course.instructor as any).email,
        } : null,
        modules,
        sessions,
      },
    }
  } catch (error) {
    console.error('Get course by ID error:', error)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

