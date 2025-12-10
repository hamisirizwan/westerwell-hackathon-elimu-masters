import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AccountSidebar } from './components/AccountSidebar'
import { AccountHeader } from './components/AccountHeader'
import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { UserRole } from '@/db/models/UserModel'

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  const isAdmin = session.user.role === UserRole.ADMIN

  return (
    <SidebarProvider>
      <AccountSidebar isAdmin={isAdmin} />
      <SidebarInset className="flex flex-col h-screen overflow-hidden">
        <AccountHeader />
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto p-6 w-full">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

