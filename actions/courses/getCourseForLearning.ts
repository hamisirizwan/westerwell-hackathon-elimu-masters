'use server'

import { auth } from '@/lib/auth/auth'
import dbConnect from '@/db/dbConnect'
import { Course } from '@/db/models/CourseModel'
import { Module } from '@/db/models/ModuleModel'
import { Lesson } from '@/db/models/LessonModel'
import { Session } from '@/db/models/SessionModel'
import { Enrollment } from '@/db/models/EnrollmentModel'
import { EnrollmentStatus } from '@/db/models/EnrollmentModel'
import mongoose from 'mongoose'

export async function getCourseForLearning(courseSlug: string) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { success: false, message: 'You must be logged in to access course content' }
    }

    await dbConnect()

    // Find the course
    const course = await Course.findOne({ slug: courseSlug }).lean()

    if (!course) {
      return { success: false, message: 'Course not found' }
    }

    // Verify student is enrolled and has active enrollment
    const enrollment = await Enrollment.findOne({
      course: course._id,
      student: new mongoose.Types.ObjectId(session.user.id),
    }).lean()

    if (!enrollment) {
      return { success: false, message: 'You are not enrolled in this course' }
    }

    if (enrollment.enrollmentStatus !== EnrollmentStatus.ACTIVE) {
      return { 
        success: false, 
        message: `Your enrollment is ${enrollment.enrollmentStatus.toLowerCase()}. Please complete payment to access course content.` 
      }
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
      const courseSessions = await Session.find({ course: course._id })
        .sort({ order: 1 })
        .lean()

      sessions = courseSessions.map((sessionRecord: any) => ({
        id: sessionRecord._id.toString(),
        title: sessionRecord.title,
        description: sessionRecord.description,
        scheduledAt: sessionRecord.scheduledAt.toISOString(),
        duration: sessionRecord.duration,
        meetingLink: sessionRecord.meetingLink,
        recordingUrl: sessionRecord.recordingUrl,
        order: sessionRecord.order,
      }))
    }

    return {
      success: true,
      data: {
        course: {
          id: course._id.toString(),
          title: course.title,
          slug: course.slug,
          description: course.description,
          thumbnail: course.thumbnail,
          courseType: course.courseType,
          category: course.category,
          level: course.level,
        },
        enrollment: {
          id: enrollment._id.toString(),
          status: enrollment.enrollmentStatus,
          isFullyPaid: enrollment.paidAmount >= enrollment.totalExpectedPayment,
        },
        modules,
        sessions,
      },
    }
  } catch (error) {
    console.error('Get course for learning error:', error)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

