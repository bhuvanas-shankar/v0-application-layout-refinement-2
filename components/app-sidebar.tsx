"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Files, UserPen, LogOut } from "lucide-react"

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
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "All Reports",
    url: "/reports",
    icon: Files,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      {/* Header - Company identity */}
      <SidebarHeader className="py-4 px-2 group-data-[collapsible=icon]:px-0">
        <div className="flex items-center gap-3 w-full group-data-[collapsible=icon]:justify-center">
          <Avatar className="size-8 shrink-0 rounded-md">
            <AvatarImage src="/company-logo.png" alt="Acme Inc" />
            <AvatarFallback className="rounded-md bg-[#FFC146] text-[#221A4E] text-xs font-semibold">
              A
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <span className="truncate text-sm font-semibold text-[#221A4E]">Acme Inc</span>
          )}
        </div>
      </SidebarHeader>

      <div className="border-t border-[#D6D3E4]" />

      {/* Nav items */}
      <SidebarContent className="py-2 px-2 group-data-[collapsible=icon]:px-0">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu className="group-data-[collapsible=icon]:items-center">
              {navItems.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={`
                        text-[#221A4E] transition-colors duration-150 ease-out
                        hover:bg-white hover:text-[#221A4E]
                        data-[active=true]:bg-white data-[active=true]:text-[#221A4E]
                        relative
                      `}
                    >
                      <Link href={item.url}>
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 bg-[#FFC146] rounded-r" />
                        )}
                        <item.icon className="size-4 text-[#221A4E]" />
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
      <div className="mt-auto px-2 pb-3 group-data-[collapsible=icon]:px-0">
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-3 rounded-md py-2 hover:bg-white cursor-pointer text-left w-full group-data-[collapsible=icon]:justify-center">
              <Avatar className="size-8 shrink-0">
                <AvatarImage src="/user-avatar.png" alt="John Doe" />
                <AvatarFallback className="bg-[#221A4E] text-white text-xs font-medium">
                  JD
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium text-[#221A4E]">John Doe</span>
                  <span className="truncate text-xs text-[#221A4E]/60">
                    johndoe@acmeinc.com
                  </span>
                </div>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent 
            side="right" 
            align="end" 
            sideOffset={8}
            className="w-64 p-0 border-[#D6D3E4] bg-white"
          >
            {/* User identity row */}
            <div className="flex items-center gap-3 p-3">
              <Avatar className="size-10 shrink-0">
                <AvatarImage src="/user-avatar.png" alt="John Doe" />
                <AvatarFallback className="bg-[#221A4E] text-white text-sm font-medium">
                  JD
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium text-[#221A4E]">John Doe</span>
                <span className="truncate text-xs text-[#221A4E]/60">
                  johndoe@acmeinc.com
                </span>
              </div>
            </div>

            <Separator className="bg-[#D6D3E4]" />

            {/* Menu items */}
            <div className="py-1">
              <button className="flex w-full items-center gap-3 px-3 py-2 text-sm text-[#221A4E] hover:bg-[#EFEEF6] transition-colors duration-150 ease-out">
                <UserPen className="size-4" />
                <span>Edit Profile</span>
              </button>
              <button className="flex w-full items-center gap-3 px-3 py-2 text-sm text-[#221A4E] hover:bg-[#EFEEF6] transition-colors duration-150 ease-out">
                <LogOut className="size-4" />
                <span>Log out</span>
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="border-t border-[#D6D3E4]" />

      {/* Footer - Powered by Quire */}
      <SidebarFooter className="py-3 px-2 group-data-[collapsible=icon]:px-0">
        <div className="flex flex-col gap-1 group-data-[collapsible=icon]:items-center">
          {!isCollapsed && (
            <span className="text-[10px] font-medium text-[#221A4E]/60 uppercase tracking-wide">
              Powered by
            </span>
          )}
          <div className="flex items-center h-7">
            <Image
              src="/quire-icon.png"
              alt="Quire"
              width={28}
              height={28}
              className="object-contain hidden group-data-[collapsible=icon]:block"
            />
            <Image
              src="/quire-logo.png"
              alt="Quire"
              width={98}
              height={28}
              className="object-contain object-left block group-data-[collapsible=icon]:hidden"
            />
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
