"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Settings, 
  User, 
  GraduationCap, 
  BookOpen, 
  PlusCircle,
  Users,
  ShieldCheck
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { LogoutButton } from "@/components/LogoutButton"

const mainItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: BookOpen, label: "My Courses", href: "/courses" },
]

const adminItems = [
  { icon: PlusCircle, label: "Create Course", href: "/admin/courses/create" },
  { icon: BookOpen, label: "Manage Courses", href: "/admin/courses" },
  { icon: Users, label: "Students", href: "/admin/students" },
]

const accountItems = [
  { icon: User, label: "Profile", href: "/profile" },
  { icon: Settings, label: "Settings", href: "/settings" },
]

interface AccountSidebarProps {
  isAdmin: boolean
}

export function AccountSidebar({ isAdmin }: AccountSidebarProps) {
  const pathname = usePathname()

  const isActiveLink = (href: string) => {
    if (href === '/courses') {
      return pathname === '/courses' || (pathname.startsWith('/courses/') && !pathname.includes('/admin'))
    }
    if (href === '/admin/courses') {
      return pathname === '/admin/courses' || (pathname.startsWith('/admin/courses/') && !pathname.includes('/create'))
    }
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="border-b border-sidebar-border/50">
        <div className="flex items-center gap-2 px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-sm font-semibold text-sidebar-foreground">Elimu Masters</h2>
            <p className="text-xs text-sidebar-foreground/60">Learning Platform</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-sidebar-foreground/70 px-2 mb-1">
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActiveLink(item.href)}
                    className="h-10 px-3 py-2 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:font-medium transition-colors duration-200"
                  >
                    <Link href={item.href} className="flex items-center gap-3 w-full">
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <>
            <SidebarSeparator className="my-2" />

            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-medium text-sidebar-foreground/70 px-2 mb-1 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" />
                Admin
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActiveLink(item.href)}
                        className="h-10 px-3 py-2 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:font-medium transition-colors duration-200"
                      >
                        <Link href={item.href} className="flex items-center gap-3 w-full">
                          <item.icon className="h-4 w-4 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        <SidebarSeparator className="my-2" />

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-sidebar-foreground/70 px-2 mb-1">
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    className="h-10 px-3 py-2 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:font-medium transition-colors duration-200"
                  >
                    <Link href={item.href} className="flex items-center gap-3 w-full">
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/50 p-4">
        <LogoutButton />
      </SidebarFooter>
    </Sidebar>
  )
}

