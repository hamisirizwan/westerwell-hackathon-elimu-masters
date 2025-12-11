'use client'

import { useState } from 'react'
import { COUNTRIES, type Country } from '@/lib/currency/countries'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface CountryStepProps {
  onSelect: (country: Country) => void
  selectedCountry: Country | null
}

export function CountryStep({ onSelect, selectedCountry }: CountryStepProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCountries = COUNTRIES.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Select Your Country</h2>
        <p className="text-muted-foreground">
          Choose your country to see available payment methods and currency conversion
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search for your country..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 max-h-[500px] overflow-y-auto">
        {filteredCountries.map((country) => (
          <Card
            key={country.code}
            className={selectedCountry?.code === country.code 
              ? 'border-primary bg-primary/5 cursor-pointer' 
              : 'cursor-pointer hover:border-primary/50 transition-colors'
            }
            onClick={() => onSelect(country)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{country.name}</p>
                  <p className="text-sm text-muted-foreground">{country.currency}</p>
                </div>
                {selectedCountry?.code === country.code && (
                  <div className="h-2 w-2 rounded-full bg-primary" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCountries.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          No countries found matching &quot;{searchQuery}&quot;
        </p>
      )}
    </div>
  )
}

