'use client'

import { Country } from '@/lib/currency/countries'
import { CurrencyCode } from '@/lib/currency/rates'
import { PaymentMethodType } from '@/lib/payments/methods'
import { CurrencyConversion, formatCurrency } from '@/lib/currency/converter'
import { COUNTRIES } from '@/lib/currency/countries'
import { getPaymentMethodsForCountry } from '@/lib/payments/methods'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowRight, Info, CreditCard, Smartphone } from 'lucide-react'

interface EnrollmentLeftPanelProps {
  coursePrice: number
  courseCurrency: CurrencyCode
  selectedCountry: Country | null
  conversion: CurrencyConversion | null
  selectedPaymentMethod: PaymentMethodType | null
  onCountryChange: (countryCode: string) => void
  onPaymentMethodSelect: (method: PaymentMethodType) => void
}

export function EnrollmentLeftPanel({
  coursePrice,
  courseCurrency,
  selectedCountry,
  conversion,
  selectedPaymentMethod,
  onCountryChange,
  onPaymentMethodSelect,
}: EnrollmentLeftPanelProps) {
  const availablePaymentMethods = selectedCountry
    ? getPaymentMethodsForCountry(selectedCountry.code)
    : []

  const getMethodIcon = (requiresCard: boolean) => {
    return requiresCard ? CreditCard : Smartphone
  }

  return (
    <div className="space-y-6">
      {/* Country Selection */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Select Country</h2>
          <p className="text-sm text-muted-foreground">
            Choose your country to see available payment methods
          </p>
        </div>
        <Select
          value={selectedCountry?.code || ''}
          onValueChange={onCountryChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select your country" />
          </SelectTrigger>
          <SelectContent>
            {COUNTRIES.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                {country.name} ({country.currency})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Currency Conversion Info */}
      {selectedCountry && conversion && (
        <Card className="border-0 shadow-none bg-muted/30">
          <CardContent className="p-6 space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Price Conversion</h3>
              <div className="flex items-center justify-between py-4 border-b">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Original Price</p>
                  <p className="text-xl font-bold">
                    {formatCurrency(conversion.originalAmount, conversion.originalCurrency)}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground mx-4" />
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-1">Your Price</p>
                  <p className="text-xl font-bold text-primary">
                    {formatCurrency(conversion.convertedAmount, conversion.convertedCurrency)}
                  </p>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-3 mt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Exchange Rate</span>
                  <span className="font-medium">
                    1 {conversion.originalCurrency} = {conversion.exchangeRate.toFixed(4)} {conversion.convertedCurrency}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800 mt-4">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-900 dark:text-blue-100">
                  Exchange rates are approximate. Final amount may vary based on payment provider rates.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Method Selection */}
      {selectedCountry && (
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">Payment Method</h3>
            <p className="text-sm text-muted-foreground">
              Select how you&apos;d like to pay
            </p>
          </div>

          {availablePaymentMethods.length > 0 ? (
            <div className="space-y-3">
              {availablePaymentMethods.map((method) => {
                const Icon = getMethodIcon(method.requiresCard)
                const isSelected = selectedPaymentMethod === method.id

                return (
                  <Card
                    key={method.id}
                    className={isSelected 
                      ? 'border-0 shadow-none bg-primary/5 cursor-pointer' 
                      : 'border-0 shadow-none bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors'
                    }
                    onClick={() => onPaymentMethodSelect(method.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={isSelected 
                          ? 'p-2 rounded-lg bg-primary/10' 
                          : 'p-2 rounded-lg bg-muted'
                        }>
                          <Icon className={isSelected ? 'h-5 w-5 text-primary' : 'h-5 w-5'} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{method.name}</h4>
                          <p className="text-xs text-muted-foreground">{method.description}</p>
                        </div>
                        {isSelected && (
                          <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card className="border-0 shadow-none bg-muted/30">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  No payment methods available for this country.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {!selectedCountry && (
        <Card className="border-0 shadow-none bg-muted/30">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Please select your country to see available payment methods and price conversion.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

