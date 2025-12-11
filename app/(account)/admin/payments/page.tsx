import { getAllPayments } from "@/actions/enrollments/getAllPayments"
import { CreditCard } from "lucide-react"
import { PaymentsTable } from "./components/PaymentsTable"
import { Card, CardContent } from "@/components/ui/card"

export const metadata = {
  title: 'All Payments',
  description: 'View all course payments',
}

export default async function AdminPaymentsPage() {
  const result = await getAllPayments()

  const payments = result.success ? result.data || [] : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">All Payments</h1>
        <p className="text-muted-foreground mt-1">
          View all course payments across the platform
        </p>
      </div>

      {payments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4 mb-4">
              <CreditCard className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No payments yet</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              Payment records will appear here once students start making payments.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div>
          <div className="text-sm text-muted-foreground mb-4">
            {payments.length} payment{payments.length !== 1 ? 's' : ''} total
          </div>
          <PaymentsTable payments={payments} />
        </div>
      )}
    </div>
  )
}

