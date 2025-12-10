'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface EnrollButtonProps {
  courseSlug: string
  price: number
  currency: string
  isLoggedIn: boolean
}

export function EnrollButton({ courseSlug, price, currency, isLoggedIn }: EnrollButtonProps) {
  const router = useRouter()
  const [showLoginModal, setShowLoginModal] = useState(false)

  const handleEnrollClick = () => {
    if (isLoggedIn) {
      // User is logged in, navigate to enrollment page
      router.push(`/enroll/${courseSlug}`)
    } else {
      // User is not logged in, show login modal
      setShowLoginModal(true)
    }
  }

  const handleLoginClick = () => {
    // Save course slug to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('enrollAfterLogin', courseSlug)
    }
    setShowLoginModal(false)
    router.push('/login')
  }

  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return 'Free'
    return `${currency} ${price.toLocaleString()}`
  }

  return (
    <>
      <Button 
        className="w-full sm:w-auto min-w-[200px]" 
        size="lg"
        onClick={handleEnrollClick}
      >
        {price === 0 ? 'Enroll for Free' : 'Enroll Now'}
      </Button>

      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
            <DialogDescription>
              You need to be logged in to enroll in this course. Please log in to continue.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowLoginModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleLoginClick}>
              Go to Login
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

