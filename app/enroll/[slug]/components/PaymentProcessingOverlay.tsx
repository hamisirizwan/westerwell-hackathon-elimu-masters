'use client'

import { Loader2, CheckCircle2 } from 'lucide-react'

interface PaymentProcessingOverlayProps {
  stage: 'verifying' | 'success' | 'enrolling'
  progress?: number
}

export function PaymentProcessingOverlay({ stage, progress }: PaymentProcessingOverlayProps) {
  const getStageContent = () => {
    switch (stage) {
      case 'verifying':
        return {
          icon: <Loader2 className="h-12 w-12 animate-spin text-primary" />,
          title: 'Verifying Payment',
          description: 'Please wait while we verify your payment...',
        }
      case 'success':
        return {
          icon: <CheckCircle2 className="h-12 w-12 text-green-600" />,
          title: 'Payment Successful!',
          description: 'Your payment has been confirmed',
        }
      case 'enrolling':
        return {
          icon: <Loader2 className="h-12 w-12 animate-spin text-primary" />,
          title: 'Enrolling You to Course',
          description: 'Setting up your course access...',
        }
      default:
        return null
    }
  }

  const content = getStageContent()

  if (!content) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative bg-card rounded-lg shadow-lg border p-8 max-w-md w-full mx-4">
        <div className="flex flex-col items-center text-center space-y-4">
          {content.icon}
          <div>
            <h3 className="text-xl font-semibold mb-2">{content.title}</h3>
            <p className="text-sm text-muted-foreground">{content.description}</p>
          </div>
          
          {stage === 'enrolling' && progress !== undefined && (
            <div className="w-full mt-4">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">{progress}%</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

