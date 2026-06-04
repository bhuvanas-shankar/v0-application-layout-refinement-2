"use client"

import { usePathname, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

export function ContentToolbar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // Determine navigation level and extract names from URL
  const isFolderView = pathname.startsWith("/folder/")
  const isProjectView = pathname.startsWith("/project/")
  
  // Extract folder name from URL path
  const folderName = isFolderView 
    ? decodeURIComponent(pathname.split("/folder/")[1] || "")
    : searchParams.get("folder") 
      ? decodeURIComponent(searchParams.get("folder") as string)
      : ""
  
  // Extract project name from URL path
  const projectName = isProjectView
    ? decodeURIComponent(pathname.split("/project/")[1]?.split("?")[0] || "")
    : ""

  return (
    <div className="flex h-12 items-center border-b border-border bg-card px-3">
      {/* Left side: Toggle + divider + breadcrumb zone */}
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-foreground border border-border hover:bg-muted transition-colors duration-200 ease-out" />
        <Separator orientation="vertical" className="h-5 bg-border" />
        {/* Breadcrumb zone - Level 2: Folder View */}
        {isFolderView && folderName && (
          <div className="flex items-center gap-1.5">
            <Link 
              href="/" 
              className="text-sm text-[#378ADD] hover:underline"
            >
              All reports
            </Link>
            <ChevronRight className="size-3.5 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              {folderName}
            </span>
          </div>
        )}
        {/* Breadcrumb zone - Level 3: Project Folder View */}
        {isProjectView && projectName && (
          <div className="flex items-center gap-1.5">
            <Link 
              href="/" 
              className="text-sm text-[#378ADD] hover:underline"
            >
              All reports
            </Link>
            <ChevronRight className="size-3.5 text-muted-foreground" />
            <Link 
              href={`/folder/${encodeURIComponent(folderName)}`}
              className="text-sm text-[#378ADD] hover:underline"
            >
              {folderName}
            </Link>
            <ChevronRight className="size-3.5 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              {projectName}
            </span>
          </div>
        )}
      </div>

      {/* Right side: reserved, empty for now */}
      <div className="ml-auto" />
    </div>
  )
}
