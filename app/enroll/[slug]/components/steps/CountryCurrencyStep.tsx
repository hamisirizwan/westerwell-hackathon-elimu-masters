'use client'

import { useState, useEffect } from 'react'
import { COUNTRIES, type Country } from '@/lib/currency/countries'
import { calculateConversion, formatCurrency, type CurrencyConversion } from '@/lib/currency/converter'
import { type CurrencyCode } from '@/lib/currency/rates'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowRight, Info } from 'lucide-react'

interface CountryCurrencyStepProps {
  amount: number
  fromCurrency: CurrencyCode
  selectedCountry: Country | null
  onConfirm: (country: Country, conversion: CurrencyConversion) => void
}

export function CountryCurrencyStep({
  amount,
  fromCurrency,
  selectedCountry,
  onConfirm,
}: CountryCurrencyStepProps) {
  const [country, setCountry] = useState<Country | null>(selectedCountry)
  const [conversion, setConversion] = useState<CurrencyConversion | null>(null)

  useEffect(() => {
    if (country) {
      const converted = calculateConversion(amount, fromCurrency, country.currency)
      setConversion(converted)
    } else {
      setConversion(null)
    }
  }, [country, amount, fromCurrency])

  const handleContinue = () => {
    if (country && conversion) {
      onConfirm(country, conversion)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Select Your Country</h2>
        <p className="text-muted-foreground">
          Choose your country to see available payment methods and currency conversion
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Country</label>
          <Select
            value={country?.code || ''}
            onValueChange={(value) => {
              const selected = COUNTRIES.find(c => c.code === value)
              setCountry(selected || null)
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select your country" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((countryOption) => (
                <SelectItem key={countryOption.code} value={countryOption.code}>
                  {countryOption.name} ({countryOption.currency})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {country && conversion && (
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
                    1 {fromCurrency} = {conversion.exchangeRate.toFixed(4)} {conversion.convertedCurrency}
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
        )}
      </div>

      <div className="flex gap-4">
        <Button
          onClick={handleContinue}
          disabled={!country || !conversion}
          className="flex-1"
        >
          Continue
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

