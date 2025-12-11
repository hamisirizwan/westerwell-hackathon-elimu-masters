// Activity Type enum - shared between client and server
export const ActivityType = {
  ENROLLMENT_CREATED: 'enrollment_created',
  ENROLLMENT_COMPLETED: 'enrollment_completed',
  PAYMENT_MADE: 'payment_made',
  COURSE_STARTED: 'course_started',
  LESSON_COMPLETED: 'lesson_completed',
  MODULE_COMPLETED: 'module_completed',
  CERTIFICATE_EARNED: 'certificate_earned',
  PROFILE_UPDATED: 'profile_updated',
} as const

export type ActivityTypeValue = typeof ActivityType[keyof typeof ActivityType]

