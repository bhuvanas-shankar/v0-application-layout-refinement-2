"use client"

import { usePathname, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Folder, FolderOpen } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

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
    <div className="flex h-10 items-center border-b border-border bg-card px-3">
      {/* Left side: Toggle + divider + breadcrumb zone */}
      <div className="flex items-center gap-3">
        <SidebarTrigger className="size-6 text-foreground border border-border hover:bg-muted transition-colors duration-200 ease-out [&>svg]:size-3.5" />
        {(isFolderView || isProjectView) && (
          <Separator orientation="vertical" className="h-5 bg-border" />
        )}
        {/* Breadcrumb zone - Level 2: Folder View */}
        {isFolderView && folderName && (
          <div className="flex items-center gap-1.5 min-w-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link 
                  href="/" 
                  className="flex items-center gap-1.5 text-sm text-quire-link hover:underline"
                >
                  All reports
                </Link>
              </TooltipTrigger>
              <TooltipContent>All reports</TooltipContent>
            </Tooltip>
            <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex items-center gap-1.5 min-w-0 text-sm font-medium text-foreground">
                  <Folder className="size-3.5 shrink-0" />
                  <span className="truncate">{folderName}</span>
                </span>
              </TooltipTrigger>
              <TooltipContent>{`${folderName} - Folder`}</TooltipContent>
            </Tooltip>
          </div>
        )}
        {/* Breadcrumb zone - Level 3: Project Folder View */}
        {isProjectView && projectName && (
          <div className="flex items-center gap-1.5 min-w-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link 
                  href="/" 
                  className="flex items-center gap-1.5 text-sm text-quire-link hover:underline"
                >
                  All reports
                </Link>
              </TooltipTrigger>
              <TooltipContent>All reports</TooltipContent>
            </Tooltip>
            <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
            <Tooltip>
              <TooltipTrigger asChild>
                <Link 
                  href={`/folder/${encodeURIComponent(folderName)}`}
                  className="flex items-center gap-1.5 min-w-0 text-sm text-quire-link hover:underline"
                >
                  <Folder className="size-3.5 shrink-0" />
                  <span className="truncate">{folderName}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent>{`${folderName} - Folder`}</TooltipContent>
            </Tooltip>
            <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex items-center gap-1.5 min-w-0 text-sm font-medium text-foreground">
                  <FolderOpen className="size-3.5 shrink-0" />
                  <span className="truncate">{projectName}</span>
                </span>
              </TooltipTrigger>
              <TooltipContent>{`${projectName} - Project`}</TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>

      {/* Right side: reserved, empty for now */}
      <div className="ml-auto" />
    </div>
  )
}
