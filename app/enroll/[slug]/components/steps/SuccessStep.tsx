'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, BookOpen, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface SuccessStepProps {
  courseTitle: string
  courseSlug: string
}

export function SuccessStep({ courseTitle, courseSlug }: SuccessStepProps) {
  return (
    <div className="space-y-6">
      <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-green-600 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Enrollment Successful!</h2>
          <p className="text-muted-foreground">
            You have successfully enrolled in &quot;{courseTitle}&quot;
          </p>
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-2 gap-4">
        <Button asChild size="lg" className="w-full">
          <Link href={`/courses/${courseSlug}`}>
            <BookOpen className="h-4 w-4 mr-2" />
            Go to Course
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="w-full">
          <Link href="/explore">
            <ArrowRight className="h-4 w-4 mr-2" />
            Browse More Courses
          </Link>
        </Button>
      </div>
    </div>
  )
}

