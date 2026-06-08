"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Files, UserPen, LogOut, ChevronRight } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"

const navItems = [
  {
    title: "All Reports",
    url: "/",
    icon: Files,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar quire-sidebar-bg relative overflow-hidden">

      {/* Subtle grid lines — no dots, just thin strokes */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.15]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <line x1="40" y1="0" x2="40" y2="40" stroke="white" strokeWidth="0.5" />
            <line x1="0" y1="40" x2="40" y2="40" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Header - Company identity */}
      <SidebarHeader className="relative z-10 py-4 px-2 group-data-[collapsible=icon]:px-0">
        <div className="flex items-center gap-3 w-full group-data-[collapsible=icon]:justify-center">
          <Avatar className="size-8 shrink-0 rounded-md">
            <AvatarImage src="/company-logo.png" alt="Acme Inc" />
            <AvatarFallback className="rounded-md bg-accent text-accent-foreground text-xs font-semibold">
              A
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <span className="truncate text-sm font-semibold text-sidebar-foreground">Acme Inc</span>
          )}
        </div>
      </SidebarHeader>

      <div className="relative z-10 border-t border-sidebar-border" />

      {/* Nav items */}
      <SidebarContent className="relative z-10 py-2 px-0">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu className="gap-0 group-data-[collapsible=icon]:items-center">
              {navItems.map((item) => {
                const isActive = item.url === "/" 
                  ? pathname === "/" || pathname.startsWith("/folder") || pathname.startsWith("/project")
                  : pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={`
                        relative transition-all duration-150 ease-out px-4
                        text-sidebar-foreground/70
                        hover:bg-white/[0.06] hover:text-sidebar-accent-foreground
                        data-[active=true]:bg-white/[0.07] data-[active=true]:text-white
                      `}
                    >
                      <Link href={item.url}>
                        {isActive && (
                          <>
                            {/* Yellow left rule */}
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 bg-sidebar-primary rounded-r shadow-[0_0_6px_1px_rgba(255,193,70,0.7)]" />
                            {/* Icon accent glow */}
                          </>
                        )}
                        <item.icon className={`size-4 ${isActive ? "text-sidebar-primary" : ""}`} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User profile - above footer */}
      <div className="relative z-10 mt-auto group-data-[collapsible=icon]:px-0">
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.06] cursor-pointer text-left w-full group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2 transition-colors duration-150">
              <Avatar className="size-8 shrink-0 ring-1 ring-white/10">
                <AvatarImage src="/user-avatar.png" alt="John Doe" />
                <AvatarFallback className="bg-[#6B74E8] text-white text-xs font-medium">
                  JD
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium text-white/90">John Doe</span>
                  <span className="truncate text-xs text-white/40">
                    johndoe@acmeinc.com
                  </span>
                </div>
              )}
              {!isCollapsed && (
                <ChevronRight className="ml-auto size-4 text-white/70" />
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent 
            side="right" 
            align="end" 
            sideOffset={8}
            className="w-64 p-0 border-border bg-popover"
          >
            {/* User identity row */}
            <div className="flex items-center gap-3 p-3">
              <Avatar className="size-10 shrink-0">
                <AvatarImage src="/user-avatar.png" alt="John Doe" />
                <AvatarFallback className="bg-[#6B74E8] text-white text-sm font-medium">
                  JD
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium text-popover-foreground">John Doe</span>
                <span className="truncate text-xs text-popover-foreground/60">
                  johndoe@acmeinc.com
                </span>
              </div>
            </div>

            <Separator className="bg-border" />

            {/* Menu items */}
            <div className="py-1">
              <button className="flex w-full items-center gap-3 px-3 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors duration-150 ease-out">
                <UserPen className="size-4" />
                <span>Edit Profile</span>
              </button>
              <button className="flex w-full items-center gap-3 px-3 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors duration-150 ease-out">
                <LogOut className="size-4" />
                <span>Log out</span>
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Separator */}
      <div className="relative z-10 border-t border-sidebar-border" />

      {/* Footer - Powered by Quire — solid bg to mask the grid */}
      <SidebarFooter className="relative z-10 py-3 px-2 group-data-[collapsible=icon]:px-0 bg-[#160E35]">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          {!isCollapsed && (
            <span className="text-[9px] font-medium text-white/60">
              Powered by
            </span>
          )}
          {isCollapsed ? (
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Quire-Icon-Outline-Yellow-r1gnSDKqIDND0QyKclmfv81tOEh0Rj.png"
              alt="Quire"
              width={20}
              height={20}
              className="object-contain"
            />
          ) : (
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Quire-Logo-Wordmark-Yellow-A5y28eAFBq6XUW8vkxfEEDuWxW4zG0.png"
              alt="Quire"
              width={70}
              height={20}
              className="object-contain"
            />
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
