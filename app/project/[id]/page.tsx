"use client"

import { useState, useMemo } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Search, ChevronLeft, ChevronRight, ChevronsUpDown, ChevronUp, ChevronDown, FileText, SearchX, FolderOpen, X } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useReports, ROOT_PARENT } from "@/contexts/reports-context"

type SortField = "name" | "status" | "complete" | "lastModified" | "modifiedBy" | null
type SortDirection = "asc" | "desc"
type StatusFilter = "all" | "Draft" | "Data Entry" | "Review" | "Final"

// Status pill colors
const statusColors: Record<string, { bg: string; text: string }> = {
  "Draft": { bg: "bg-gray-100", text: "text-gray-700" },
  "Data Entry": { bg: "bg-amber-100", text: "text-amber-700" },
  "Review": { bg: "bg-blue-100", text: "text-blue-700" },
  "Final": { bg: "bg-green-100", text: "text-green-700" },
}

// Avatar color schemes using Quire design tokens with optimal contrast
const avatarColors: Array<{ bg: string; text: string }> = [
  { bg: "bg-[#221A4E]", text: "text-white" },           // quire-navy - white text
  { bg: "bg-[#43AA8B]", text: "text-white" },           // quire-success - white text
  { bg: "bg-[#FFC146]", text: "text-[#221A4E]" },       // quire-yellow - navy text
  { bg: "bg-[#6E6790]", text: "text-white" },           // quire-muted - white text
  { bg: "bg-[#378ADD]", text: "text-white" },           // blue accent - white text
  { bg: "bg-[#2D2460]", text: "text-white" },           // quire-navy-light - white text
  { bg: "bg-[#E05C5C]", text: "text-white" },           // destructive red - white text
]

// Deterministic hash function for consistent avatar colors
function getAvatarColor(name: string): { bg: string; text: string } {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % avatarColors.length
  return avatarColors[index]
}

// Completion arc component
function CompletionArc({ percent }: { percent: number }) {
  const radius = 13
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percent / 100) * circumference
  const isComplete = percent === 100
  const strokeColor = isComplete ? "var(--quire-success)" : "var(--quire-yellow)"

  return (
    <div className="relative flex items-center justify-center size-8">
      <svg width="32" height="32" viewBox="0 0 32 32" className="-rotate-90">
        <circle
          cx="16"
          cy="16"
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="3"
        />
        <circle
          cx="16"
          cy="16"
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <span className="absolute text-[10px] font-medium text-foreground">{percent}</span>
    </div>
  )
}

// Get initials from name
function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

// Three-state sort indicator: default up-down, or single arrow in Quire yellow when active
function SortIndicator({ active, direction }: { active: boolean; direction: SortDirection }) {
  if (!active) {
    return <ChevronsUpDown className="size-3 opacity-60" />
  }
  return direction === "asc" ? (
    <ChevronUp className="size-3 text-[var(--quire-yellow)]" />
  ) : (
    <ChevronDown className="size-3 text-[var(--quire-yellow)]" />
  )
}

export default function ProjectFolderViewPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const projectName = decodeURIComponent(params.id as string)
  // Root-level projects have no ?folder= param — they live under ROOT_PARENT.
  const folderParam = searchParams.get("folder")
  const folderName = folderParam ? decodeURIComponent(folderParam) : ROOT_PARENT
  
  const { getReportsForProject, getSort, setSort } = useReports()
  const reports = getReportsForProject(folderName, projectName)
  const sortKey = `project:${folderName}/${projectName}`
  
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [currentPage, setCurrentPage] = useState(1)
  // Sort state is read from the shared context so it persists across navigation
  const { field: sortFieldRaw, direction: sortDirection } = getSort(sortKey)
  const sortField = sortFieldRaw as SortField

  // Filter reports based on search query and status
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesSearch = report.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === "all" || report.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [searchQuery, statusFilter, reports])

  // Sort reports
  const sortedReports = useMemo(() => {
    if (!sortField) return filteredReports
    return [...filteredReports].sort((a, b) => {
      let comparison = 0
      if (sortField === "name") {
        comparison = a.name.localeCompare(b.name)
      } else if (sortField === "status") {
        comparison = a.status.localeCompare(b.status)
      } else if (sortField === "complete") {
        comparison = a.complete - b.complete
      } else if (sortField === "lastModified") {
        comparison = new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime()
      } else if (sortField === "modifiedBy") {
        comparison = a.modifiedBy.localeCompare(b.modifiedBy)
      }
      return sortDirection === "asc" ? comparison : -comparison
    })
  }, [filteredReports, sortField, sortDirection])

  // Paginate reports
  const paginatedReports = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage
    return sortedReports.slice(startIndex, startIndex + rowsPerPage)
  }, [sortedReports, currentPage, rowsPerPage])

  const totalPages = Math.ceil(sortedReports.length / rowsPerPage)
  const startItem = sortedReports.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0
  const endItem = Math.min(currentPage * rowsPerPage, sortedReports.length)

  const handleSort = (field: "name" | "status" | "complete" | "lastModified" | "modifiedBy") => {
    if (sortField === field) {
      setSort(sortKey, field, sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSort(sortKey, field, "asc")
    }
  }

  const handleRowsPerPageChange = (value: string) => {
    setRowsPerPage(Number(value))
    setCurrentPage(1)
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value as StatusFilter)
    setCurrentPage(1)
  }

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden">
      {/* Page Header - Sticky */}
      <div className="flex-shrink-0 p-6 pb-0">
        {/* Content row — single horizontal row */}
        <div className="mb-8 flex items-center gap-4">
          {/* Left: icon + title + Project badge */}
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <FolderOpen className="size-6 shrink-0 text-foreground" />
            <h1 className="font-heading text-2xl font-semibold text-foreground truncate">
              {projectName}
            </h1>
            <Badge className="ml-1 shrink-0 bg-quire-success/10 text-quire-success hover:bg-quire-success/10 border-transparent font-medium">
              Project
            </Badge>
          </div>

          {/* Middle left: search input */}
          <div className="relative w-[280px] shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-9 pr-9 focus-visible:ring-[var(--quire-yellow)] focus-visible:border-[var(--quire-yellow)]"
            />
            {searchQuery && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setSearchQuery("")
                  setCurrentPage(1)
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Middle right: status filter */}
          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="w-[160px] shrink-0">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Data Entry">Data Entry</SelectItem>
              <SelectItem value="Review">Review</SelectItem>
              <SelectItem value="Final">Final</SelectItem>
            </SelectContent>
          </Select>

          {/* Right: disabled Add Report button */}
          <Button disabled className="w-[130px] shrink-0 opacity-50 cursor-not-allowed">
            Add Report
          </Button>
        </div>
      </div>

      {/* Report Table with Sticky Header */}
      <div className="flex-1 flex flex-col mx-6 mb-0 border border-border rounded-lg overflow-hidden bg-card shadow-sm">
        {/* Fixed Table Header */}
        <Table className="table-fixed w-full flex-shrink-0">
          <TableHeader>
            <TableRow className="border-b border-[var(--quire-black)] bg-[var(--quire-black)] hover:bg-[var(--quire-black)]">
              <TableHead 
                className="w-[35%] text-white text-xs font-semibold uppercase tracking-wide py-3 px-4 cursor-pointer select-none bg-[var(--quire-black)]"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center gap-1">
                  Report Name
                  <SortIndicator active={sortField === "name"} direction={sortDirection} />
                </div>
              </TableHead>
              <TableHead className="w-[12%] text-white text-xs font-semibold uppercase tracking-wide py-3 px-4 bg-[var(--quire-black)]">
                Status
              </TableHead>
              <TableHead className="w-[12%] text-white text-xs font-semibold uppercase tracking-wide py-3 px-4 bg-[var(--quire-black)]">
                Complete
              </TableHead>
              <TableHead 
                className="w-[18%] text-white text-xs font-semibold uppercase tracking-wide py-3 px-4 cursor-pointer select-none bg-[var(--quire-black)]"
                onClick={() => handleSort("lastModified")}
              >
                <div className="flex items-center gap-1">
                  Last Modified
                  <SortIndicator active={sortField === "lastModified"} direction={sortDirection} />
                </div>
              </TableHead>
              <TableHead className="w-[23%] text-white text-xs font-semibold uppercase tracking-wide py-3 px-4 bg-[var(--quire-black)]">
                Modified By
              </TableHead>
            </TableRow>
          </TableHeader>
        </Table>

        {/* Scrollable Table Body */}
        <div className="flex-1 overflow-y-auto folder-list-scroll">
          {sortedReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16">
              <SearchX className="size-12 text-muted-foreground/50 mb-3" />
              <span className="text-muted-foreground">Nothing here yet</span>
            </div>
          ) : (
            <Table className="table-fixed w-full">
              <TableBody>
                {paginatedReports.map((report, index) => (
                  <TableRow
                    key={report.id}
                    className={`border-border cursor-pointer transition-colors duration-150 ease-out hover:bg-[#EEEDF5] ${
                      index % 2 === 0 ? "bg-white" : "bg-[#F9F8FC]"
                    }`}
                  >
                    <TableCell className="w-[35%] py-5 px-4 align-middle">
                      <div className="flex items-center gap-2">
                        <FileText className="size-5 text-quire-link" />
                        <span className="text-quire-link font-medium hover:underline cursor-pointer">
                          {report.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="w-[12%] align-middle py-5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[report.status].bg} ${statusColors[report.status].text}`}>
                        {report.status}
                      </span>
                    </TableCell>
                    <TableCell className="w-[12%] align-middle py-5 px-4">
                      <CompletionArc percent={report.complete} />
                    </TableCell>
                    <TableCell className="w-[18%] text-muted-foreground text-sm align-middle py-5 px-4">
                      {report.lastModified}
                    </TableCell>
                    <TableCell className="w-[23%] align-middle py-5 px-4">
                      <div className="flex items-center gap-2">
                        {(() => {
                          const colors = getAvatarColor(report.modifiedBy)
                          return (
                            <Avatar className="size-6">
                              <AvatarFallback className={`text-[10px] font-medium ${colors.bg} ${colors.text}`}>
                                {getInitials(report.modifiedBy)}
                              </AvatarFallback>
                            </Avatar>
                          )
                        })()}
                        <span className="text-sm text-foreground">{report.modifiedBy}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Pagination - Sticky at bottom */}
      <div className="flex-shrink-0 p-6 pt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows per page</span>
          <Select value={String(rowsPerPage)} onValueChange={handleRowsPerPageChange}>
            <SelectTrigger className="w-[70px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <span className="text-sm text-muted-foreground">
          {sortedReports.length > 0 ? `${startItem}–${endItem} of ${sortedReports.length}` : "0 of 0"}
        </span>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-sm text-muted-foreground px-2">
            Page {currentPage} of {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
