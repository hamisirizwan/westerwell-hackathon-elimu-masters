import { Card, CardContent } from "@/components/ui/card"
import { CreatePaymentLinkForm } from "./components/CreatePaymentLinkForm"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function CreatePaymentLinkPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/links">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create Payment Link</h1>
          <p className="text-muted-foreground mt-1">
            Set up a new payment link to receive payments
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <CreatePaymentLinkForm />
        </CardContent>
      </Card>
    </div>
  )
}

