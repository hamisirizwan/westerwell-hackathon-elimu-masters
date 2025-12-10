import { Card, CardContent } from "@/components/ui/card"
import { EditPaymentLinkForm } from "./components/EditPaymentLinkForm"
import { ShareLinkSection } from "./components/ShareLinkSection"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { getPaymentLink } from "@/actions/paymentLinks/getPaymentLink"
import { notFound } from "next/navigation"
import { config } from "@/lib/config"

type Props = {
  params: Promise<{ id: string }>
}

export default async function PaymentLinkDetailsPage({ params }: Props) {
  const { id } = await params
  const result = await getPaymentLink(id)

  if (!result.success || !result.data) {
    notFound()
  }

  const link = result.data

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/links">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Payment Link</h1>
          <p className="text-muted-foreground mt-1">
            Update your payment link settings
          </p>
        </div>
      </div>

      <ShareLinkSection slug={link.slug} baseUrl={config.baseUrl} />

      <Card>
        <CardContent className="pt-6">
          <EditPaymentLinkForm link={link} />
        </CardContent>
      </Card>
    </div>
  )
}

