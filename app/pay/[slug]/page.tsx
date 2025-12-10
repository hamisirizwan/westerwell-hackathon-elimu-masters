import { getPaymentLinkBySlug } from "@/actions/paymentLinks/getPaymentLink"
import { notFound } from "next/navigation"
import { PaymentForm } from "./components/PaymentForm"
import { AlertCircle } from "lucide-react"
import { Metadata } from "next"

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const result = await getPaymentLinkBySlug(slug)

  if (!result.success || !result.data) {
    return {
      title: 'Payment Link',
      description: 'Make a payment',
    }
  }

  const link = result.data
  const amountText = link.amountType === 'fixed' && link.amount
    ? `${link.currency} ${link.amount.toLocaleString()}`
    : link.amountType === 'flexible' && link.minAmount
      ? `From ${link.currency} ${link.minAmount.toLocaleString()}`
      : ''

  return {
    title: link.title,
    description: link.description || `Pay ${amountText}`.trim(),
    openGraph: {
      title: link.title,
      description: link.description || `Pay ${amountText}`.trim(),
    },
  }
}

export default async function PayPage({ params }: Props) {
  const { slug } = await params
  const result = await getPaymentLinkBySlug(slug)

  if (!result.success) {
    // If it's an error like expired/exhausted, show error page
    if (result.message && result.message !== 'Payment link not found') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="text-center max-w-md">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Link Unavailable</h1>
            <p className="text-gray-600">{result.message}</p>
          </div>
        </div>
      )
    }
    notFound()
  }

  const link = result.data!

  // Format the display amount
  const displayAmount = link.amountType === 'fixed' && link.amount 
    ? `${link.currency} ${link.amount.toLocaleString()}`
    : link.amountType === 'flexible' && link.minAmount
      ? `From ${link.currency} ${link.minAmount.toLocaleString()}`
      : null

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel - Payment Info */}
      <div className="lg:w-1/2 bg-white p-8 lg:p-16 flex flex-col justify-between min-h-[300px] lg:min-h-screen">
        <div>
          <h1 className="text-2xl lg:text-3xl font-medium text-gray-900">
            {link.title}
          </h1>
          {displayAmount && (
            <p className="text-2xl lg:text-3xl font-bold text-gray-900 mt-2">
              {displayAmount}
            </p>
          )}
          {link.description && (
            <p className="text-gray-600 mt-4">{link.description}</p>
          )}
        </div>
        
        {/* Footer */}
        <div className="mt-8 lg:mt-0">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>powered by <span className="font-semibold text-gray-700">SendFlow</span></span>
            <span className="text-gray-300">|</span>
            <a href="/terms-of-service" className="hover:text-gray-700">Terms</a>
            <a href="/privacy-policy" className="hover:text-gray-700">Privacy</a>
          </div>
        </div>
      </div>

      {/* Right Panel - Checkout Form */}
      <div className="lg:w-1/2 bg-gray-50 p-8 lg:p-16 flex items-start lg:items-center justify-center">
        <div className="w-full max-w-md">
          <PaymentForm 
            title={link.title}
            description={link.description}
            amountType={link.amountType}
            amount={link.amount}
            minAmount={link.minAmount}
            maxAmount={link.maxAmount}
            currency={link.currency}
          />
        </div>
      </div>
    </div>
  )
}

