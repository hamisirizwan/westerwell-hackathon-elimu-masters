import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getPaymentLinks } from "@/actions/paymentLinks/getPaymentLinks"
import { Plus, ExternalLink, Copy, MoreHorizontal } from "lucide-react"
import Link from "next/link"
import { PaymentLinksTable } from "./components/PaymentLinksTable"

export default async function PaymentLinksPage() {
  const result = await getPaymentLinks({ status: 'all', limit: 50 })

  const links = result.success ? result.data?.links || [] : []
  const totalCount = result.data?.pagination?.totalCount || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payment Links</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage your payment links
          </p>
        </div>
        <Button asChild>
          <Link href="/links/create">
            <Plus className="h-4 w-4 mr-2" />
            Create Link
          </Link>
        </Button>
      </div>

      {links.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-muted p-4 mb-4">
            <ExternalLink className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No payment links yet</h3>
          <p className="text-muted-foreground text-center mb-6 max-w-sm">
            Create your first payment link to start accepting payments from anyone, anywhere.
          </p>
          <Button asChild>
            <Link href="/links/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Link
            </Link>
          </Button>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              All Links ({totalCount})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PaymentLinksTable links={links} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

