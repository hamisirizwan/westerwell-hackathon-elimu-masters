'use server'

import dbConnect from '@/db/dbConnect'
import { Course } from '@/db/models/CourseModel'
import { Module } from '@/db/models/ModuleModel'
import { Lesson } from '@/db/models/LessonModel'
import { Session } from '@/db/models/SessionModel'

export async function getCourseBySlug(slug: string) {
  try {
    await dbConnect()

    const course = await Course.findOne({ slug })
      .populate('instructor', 'username email')
      .lean()

    if (!course) {
      return { success: false, message: 'Course not found' }
    }

    // Only show published courses to the public
    if (course.status !== 'published') {
      return { success: false, message: 'Course not found' }
    }

    // Get modules with lessons for self-paced courses
    let modules: any[] = []
    if (course.courseType === 'self-paced') {
      const courseModules = await Module.find({ course: course._id })
        .sort({ order: 1 })
        .lean()

      for (const mod of courseModules) {
        const lessons = await Lesson.find({ module: mod._id })
          .sort({ order: 1 })
          .select('title description duration order isFreePreview')
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
      const courseSessions = await Session.find({ course: course._id })
        .sort({ order: 1 })
        .lean()

      sessions = courseSessions.map((session: any) => ({
        id: session._id.toString(),
        title: session.title,
        description: session.description,
        scheduledAt: session.scheduledAt.toISOString(),
        duration: session.duration,
        order: session.order,
      }))
    }

    // Calculate total duration
    let totalDuration = 0
    if (course.courseType === 'self-paced') {
      for (const mod of modules) {
        for (const lesson of mod.lessons) {
          totalDuration += lesson.duration || 0
        }
      }
    } else {
      for (const session of sessions) {
        totalDuration += session.duration || 0
      }
    }

    // Count total lessons
    const totalLessons = modules.reduce((acc, mod) => acc + mod.lessons.length, 0)

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
        enrollmentCount: course.enrollmentCount,
        startDate: course.startDate?.toISOString(),
        endDate: course.endDate?.toISOString(),
        maxStudents: course.maxStudents,
        instructor: course.instructor ? {
          id: (course.instructor as any)._id.toString(),
          username: (course.instructor as any).username,
        } : null,
        modules,
        sessions,
        totalDuration,
        totalLessons,
        totalSessions: sessions.length,
      },
    }
  } catch (error) {
    console.error('Get course by slug error:', error)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

