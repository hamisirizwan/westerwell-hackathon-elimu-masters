'use client'

import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

interface EnrollButtonProps {
  courseId: string
}

export function EnrollButton({ courseId }: EnrollButtonProps) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleEnroll = () => {
    if (status === 'loading') return

    if (!session?.user) {
      // Save course ID to localStorage
      localStorage.setItem('enrollAfterLogin', courseId)
      setShowLoginDialog(true)
      return
    }

    // User is logged in, proceed to enrollment page
    setIsLoading(true)
    router.push(`/enroll/${courseId}`)
  }

  const handleLoginConfirm = () => {
    setShowLoginDialog(false)
    router.push('/login')
  }

  return (
    <>
      <Button 
        size="lg" 
        className="flex-1"
        onClick={handleEnroll}
        disabled={status === 'loading'}
      >
        {status === 'loading' ? 'Loading...' : 'Enroll Now'}
      </Button>

      <AlertDialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Login Required</AlertDialogTitle>
            <AlertDialogDescription>
              You need to be logged in to enroll in this course. Please log in to continue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLoginConfirm}>
              Go to Login
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
