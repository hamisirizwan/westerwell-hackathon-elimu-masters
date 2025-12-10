'use server'

import { auth } from '@/lib/auth/auth'
import dbConnect from '@/db/dbConnect'
import { Course } from '@/db/models/CourseModel'
import { UserRole } from '@/db/models/UserModel'

interface GetCoursesParams {
  status?: 'all' | 'draft' | 'published' | 'archived'
  limit?: number
  page?: number
}

export async function getCourses(params: GetCoursesParams = {}) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { success: false, message: 'You must be logged in' }
    }

    // Only admins can see all courses
    if (session.user.role !== UserRole.ADMIN) {
      return { success: false, message: 'Unauthorized' }
    }

    const { status = 'all', limit = 50, page = 1 } = params

    await dbConnect()

    const query: Record<string, unknown> = {}
    
    if (status !== 'all') {
      query.status = status
    }

    const skip = (page - 1) * limit

    const [courses, totalCount] = await Promise.all([
      Course.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('instructor', 'username email')
        .lean(),
      Course.countDocuments(query),
    ])

    return {
      success: true,
      data: {
        courses: courses.map((course: any) => ({
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
          status: course.status,
          enrollmentCount: course.enrollmentCount,
          instructor: course.instructor ? {
            id: course.instructor._id.toString(),
            username: course.instructor.username,
            email: course.instructor.email,
          } : null,
          createdAt: course.createdAt.toISOString(),
          updatedAt: course.updatedAt.toISOString(),
        })),
        pagination: {
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          currentPage: page,
          limit,
        },
      },
    }
  } catch (error) {
    console.error('Get courses error:', error)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

