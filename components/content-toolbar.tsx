"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

export function ContentToolbar() {
  return (
    <div className="flex h-12 items-center border-b border-[#D6D3E4] bg-white px-3">
      {/* Left side: Toggle + divider + breadcrumb zone */}
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-[#221A4E] border border-[#D6D3E4] hover:bg-[#EFEEF6] transition-colors duration-200 ease-out" />
        <Separator orientation="vertical" className="h-5 bg-[#D6D3E4]" />
        {/* Breadcrumb zone - empty on Dashboard and All Reports */}
        <div className="flex items-center">
          {/* Will populate with crumb trail on deeper views */}
        </div>
      </div>

      {/* Right side: reserved, empty for now */}
      <div className="ml-auto" />
    </div>
  )
}
