'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Copy, ExternalLink, MoreHorizontal, Pencil, Power, PowerOff, Loader2 } from "lucide-react"
import { type PaymentLinkListItem } from "@/actions/paymentLinks/getPaymentLinks"
import { deactivatePaymentLink, reactivatePaymentLink } from "@/actions/paymentLinks/deactivatePaymentLink"
import { useRouter } from 'next/navigation'

type Props = {
  links: PaymentLinkListItem[]
}

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  expired: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  exhausted: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function PaymentLinksTable({ links }: Props) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false)
  const [linkToDeactivate, setLinkToDeactivate] = useState<{ id: string; title: string } | null>(null)
  const [isDeactivating, setIsDeactivating] = useState(false)

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''

  const copyToClipboard = async (slug: string) => {
    const url = `${baseUrl}/pay/${slug}`
    await navigator.clipboard.writeText(url)
    toast.success('Link copied to clipboard!')
  }

  const handleDeactivateClick = (id: string, title: string) => {
    setLinkToDeactivate({ id, title })
    setDeactivateDialogOpen(true)
  }

  const handleDeactivateConfirm = async () => {
    if (!linkToDeactivate) return
    
    setIsDeactivating(true)
    
    const result = await deactivatePaymentLink(linkToDeactivate.id)
    
    setIsDeactivating(false)
    setDeactivateDialogOpen(false)
    
    if (result.success) {
      toast.success(result.message)
      router.refresh()
    } else {
      toast.error(result.message)
    }
    
    setLinkToDeactivate(null)
  }

  const handleReactivate = async (id: string) => {
    setLoadingId(id)
    
    const result = await reactivatePaymentLink(id)
    if (result.success) {
      toast.success(result.message)
      router.refresh()
    } else {
      toast.error(result.message)
    }
    
    setLoadingId(null)
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-center">Payments</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {links.map((link) => (
          <TableRow key={link.id}>
            <TableCell className="font-medium">{link.title}</TableCell>
            <TableCell>
              <Badge variant="secondary" className={statusColors[link.status]}>
                {link.status}
              </Badge>
            </TableCell>
            <TableCell className="text-center">
              {link.usageLimit ? `${link.usageCount}/${link.usageLimit}` : link.usageCount}
            </TableCell>
            <TableCell>{formatDate(link.createdAt)}</TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-1">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => copyToClipboard(link.slug)}
                  title="Copy Link"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  asChild
                  title="Open Link"
                >
                  <Link href={`/pay/${link.slug}`} target="_blank">
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={loadingId === link.id}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/links/${link.id}`}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {link.status === 'active' ? (
                      <DropdownMenuItem 
                        onClick={() => handleDeactivateClick(link.id, link.title)}
                        className="text-red-600"
                      >
                        <PowerOff className="h-4 w-4 mr-2" />
                        Deactivate
                      </DropdownMenuItem>
                    ) : link.status === 'inactive' ? (
                      <DropdownMenuItem 
                        onClick={() => handleReactivate(link.id)}
                        className="text-green-600"
                      >
                        <Power className="h-4 w-4 mr-2" />
                        Reactivate
                      </DropdownMenuItem>
                    ) : null}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>

      <AlertDialog open={deactivateDialogOpen} onOpenChange={setDeactivateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate payment link?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate &quot;{linkToDeactivate?.title}&quot;? 
              This link will no longer accept payments until reactivated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeactivating}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeactivateConfirm} 
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeactivating}
            >
              {isDeactivating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isDeactivating ? 'Deactivating...' : 'Deactivate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Table>
  )
}

