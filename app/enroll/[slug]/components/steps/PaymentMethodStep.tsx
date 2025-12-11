'use client'

import { getPaymentMethodsForCountry, type PaymentMethodType } from '@/lib/payments/methods'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, ArrowRight, CreditCard, Smartphone } from 'lucide-react'

interface PaymentMethodStepProps {
  countryCode: string
  onSelect: (method: PaymentMethodType) => void
  selectedMethod: PaymentMethodType | null
  onBack: () => void
}

export function PaymentMethodStep({ 
  countryCode, 
  onSelect, 
  selectedMethod, 
  onBack 
}: PaymentMethodStepProps) {
  const availableMethods = getPaymentMethodsForCountry(countryCode)

  const getMethodIcon = (requiresCard: boolean) => {
    return requiresCard ? CreditCard : Smartphone
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Choose Payment Method</h2>
        <p className="text-muted-foreground">
          Select how you&apos;d like to pay for this course
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {availableMethods.map((method) => {
          const Icon = getMethodIcon(method.requiresCard)
          const isSelected = selectedMethod === method.id

          return (
            <Card
              key={method.id}
              className={isSelected 
                ? 'border-primary bg-primary/5 cursor-pointer' 
                : 'cursor-pointer hover:border-primary/50 transition-colors'
              }
              onClick={() => onSelect(method.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={isSelected 
                    ? 'p-3 rounded-lg bg-primary/10' 
                    : 'p-3 rounded-lg bg-muted'
                  }>
                    <Icon className={isSelected ? 'h-6 w-6 text-primary' : 'h-6 w-6'} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{method.name}</h3>
                    <p className="text-sm text-muted-foreground">{method.description}</p>
                  </div>
                  {isSelected && (
                    <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {availableMethods.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              No payment methods available for this country. Please select a different country.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button 
          onClick={() => selectedMethod && onSelect(selectedMethod)} 
          disabled={!selectedMethod}
          className="flex-1"
        >
          Continue
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

