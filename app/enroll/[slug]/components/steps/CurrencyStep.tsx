'use client'

import { useEffect } from 'react'
import { calculateConversion, formatCurrency, type CurrencyConversion } from '@/lib/currency/converter'
import { type CurrencyCode } from '@/lib/currency/rates'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, ArrowRight, Info } from 'lucide-react'

interface CurrencyStepProps {
  amount: number
  fromCurrency: CurrencyCode
  toCurrency: CurrencyCode
  onConfirm: (conversion: CurrencyConversion) => void
  onBack: () => void
}

export function CurrencyStep({ 
  amount, 
  fromCurrency, 
  toCurrency, 
  onConfirm, 
  onBack 
}: CurrencyStepProps) {
  const conversion = calculateConversion(amount, fromCurrency, toCurrency)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Currency Conversion</h2>
        <p className="text-muted-foreground">
          Your payment will be converted to your local currency
        </p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between py-4 border-b">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Original Price</p>
              <p className="text-2xl font-bold">
                {formatCurrency(conversion.originalAmount, conversion.originalCurrency)}
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Your Price</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(conversion.convertedAmount, conversion.convertedCurrency)}
              </p>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Exchange Rate</span>
              <span className="font-medium">
                1 {fromCurrency} = {conversion.exchangeRate.toFixed(4)} {toCurrency}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Rate Date</span>
              <span className="font-medium">{conversion.rateDate}</span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-900 dark:text-blue-100">
              Exchange rates are approximate. The final amount may vary slightly based on the payment provider&apos;s rates at the time of transaction.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={() => onConfirm(conversion)} className="flex-1">
          Continue
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

