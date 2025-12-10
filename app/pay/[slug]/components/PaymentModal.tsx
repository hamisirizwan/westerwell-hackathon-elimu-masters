'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { toast } from 'sonner'
import { CheckCircle2, Loader2, Smartphone } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type PaymentStep = 'phone' | 'processing' | 'success'

type Props = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  amount: number
  currency: string
  customerName: string
  customerEmail: string
}

export function PaymentModal({
  isOpen,
  onClose,
  onSuccess,
  amount,
  currency,
  customerName,
  customerEmail,
}: Props) {
  const [step, setStep] = useState<PaymentStep>('phone')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [processingMessage, setProcessingMessage] = useState('')

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('phone')
      setPhoneNumber('')
      setPhoneError('')
      setProcessingMessage('')
    }
  }, [isOpen])

  const validatePhone = (phone: string): boolean => {
    // Kenyan phone number validation (254XXXXXXXXX or 07XXXXXXXX or 01XXXXXXXX)
    const kenyanPhoneRegex = /^(?:254|\+254|0)?([17]\d{8})$/
    return kenyanPhoneRegex.test(phone.replace(/\s/g, ''))
  }

  const formatPhoneForDisplay = (phone: string): string => {
    const cleaned = phone.replace(/\s/g, '').replace(/^\+/, '')
    if (cleaned.startsWith('254')) {
      return `+${cleaned}`
    } else if (cleaned.startsWith('0')) {
      return `+254${cleaned.slice(1)}`
    }
    return `+254${cleaned}`
  }

  const handleSubmitPhone = async () => {
    setPhoneError('')

    if (!phoneNumber.trim()) {
      setPhoneError('Phone number is required')
      return
    }

    if (!validatePhone(phoneNumber)) {
      setPhoneError('Please enter a valid M-Pesa phone number')
      return
    }

    // Move to processing step
    setStep('processing')
    await simulateMpesaPayment()
  }

  const simulateMpesaPayment = async () => {
    // Simulate STK Push sent
    setProcessingMessage('Sending STK push to your phone...')
    await delay(1500)

    setProcessingMessage('Please enter your M-Pesa PIN on your phone...')
    await delay(2000)

    // Simulate query polling
    setProcessingMessage('Processing payment...')
    await delay(1500)

    // Simulate random success/failure (80% success rate for demo)
    const isSuccess = Math.random() > 0.2

    if (isSuccess) {
      setStep('success')
    } else {
      // Payment failed
      toast.error('Payment failed. Please try again.', {
        description: 'The transaction was cancelled or timed out.',
      })
      onClose()
    }
  }

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  const handleClose = () => {
    if (step === 'processing') {
      // Don't allow closing during processing
      return
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        showCloseButton={step !== 'processing' && step !== 'success'}
        className="sm:max-w-[400px]"
        onPointerDownOutside={(e) => {
          if (step === 'processing' || step === 'success') {
            e.preventDefault()
          }
        }}
        onEscapeKeyDown={(e) => {
          if (step === 'processing' || step === 'success') {
            e.preventDefault()
          }
        }}
      >
        <AnimatePresence mode="wait">
          {step === 'phone' && (
            <motion.div
              key="phone"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader className="text-center sm:text-center">
                <DialogTitle className="text-xl">Pay with M-Pesa</DialogTitle>
                <DialogDescription>
                  Enter your M-Pesa phone number to receive the payment prompt
                </DialogDescription>
              </DialogHeader>

              <div className="mt-6 space-y-4">
                {/* Amount Display */}
                <div className="rounded-lg bg-muted p-4 text-center">
                  <p className="text-sm text-muted-foreground">Amount to pay</p>
                  <p className="text-2xl font-bold text-foreground">
                    {currency} {amount.toLocaleString()}
                  </p>
                </div>

                {/* Phone Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    M-Pesa Phone Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      +254
                    </span>
                    <Input
                      type="tel"
                      placeholder="eg 712345678"
                      value={phoneNumber}
                      onChange={(e) => {
                        setPhoneNumber(e.target.value)
                        setPhoneError('')
                      }}
                      className="pl-14"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSubmitPhone()
                        }
                      }}
                    />
                  </div>
                  {phoneError && (
                    <p className="text-sm text-destructive">{phoneError}</p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleSubmitPhone}
                  className="w-full h-12 text-base font-medium"
                >
                  Pay {currency} {amount.toLocaleString()}
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="py-8"
            >
              <div className="flex flex-col items-center text-center">
                {/* Animated Phone with Pulse */}
                <div className="relative mb-6">
                  <motion.div
                    className="absolute inset-0 rounded-full bg-primary"
                    animate={{
                      scale: [1, 1.4, 1],
                      opacity: [0.4, 0, 0.4],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    style={{
                      width: '80px',
                      height: '80px',
                      top: '-10px',
                      left: '-10px',
                    }}
                  />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Smartphone className="h-8 w-8 text-primary" />
                  </div>
                </div>

                {/* Processing Text */}
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Check Your Phone
                </h3>
                <p className="text-muted-foreground mb-4">{processingMessage}</p>

                {/* Spinner */}
                <Loader2 className="h-6 w-6 animate-spin text-primary" />

                {/* Amount Reminder */}
                <div className="mt-6 rounded-lg bg-muted px-6 py-3">
                  <p className="text-sm text-muted-foreground">
                    Amount: <span className="font-semibold text-foreground">{currency} {amount.toLocaleString()}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Phone: <span className="font-semibold text-foreground">{formatPhoneForDisplay(phoneNumber)}</span>
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ 
                duration: 0.4, 
                type: 'spring',
                stiffness: 200,
                damping: 15
              }}
              className="py-8"
            >
              <div className="flex flex-col items-center text-center">
                {/* Success Checkmark Animation */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 15,
                    delay: 0.1,
                  }}
                  className="mb-6"
                >
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        type: 'spring',
                        stiffness: 200,
                        damping: 12,
                        delay: 0.3,
                      }}
                    >
                      <CheckCircle2 className="h-12 w-12 text-primary" />
                    </motion.div>
                  </div>
                </motion.div>

                {/* Success Text */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Payment Successful!
                  </h3>
                  <p className="text-muted-foreground">
                    Your payment of {currency} {amount.toLocaleString()} has been received.
                  </p>
                </motion.div>

                {/* Transaction Details */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6 w-full rounded-lg bg-muted p-4 text-left"
                >
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount</span>
                      <span className="font-medium text-foreground">{currency} {amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone</span>
                      <span className="font-medium text-foreground">{formatPhoneForDisplay(phoneNumber)}</span>
                    </div>
                  </div>
                </motion.div>

                {/* Done Button */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-6 w-full"
                >
                  <Button
                    onClick={onSuccess}
                    className="w-full"
                  >
                    Done
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
