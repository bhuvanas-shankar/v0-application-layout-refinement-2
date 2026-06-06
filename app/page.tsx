"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  Folder,
  FolderOpen,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ChevronUp,
  ChevronDown,
  Pencil,
  Trash2,
  X,
} from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AddItemModal, type ItemType } from "@/components/add-item-modal"

type RowType = "folder" | "project"

interface ReportRow {
  id: string
  name: string
  type: RowType
  items: number
  lastUpdated: string
  created: string
  createdBy: string
}

type SortField = "name" | "lastUpdated"
type SortDirection = "asc" | "desc"

const SEED_ROWS: ReportRow[] = [
  { id: "1", name: "Brownfield Redevelopment - Site 4", type: "project", items: 8, lastUpdated: "Jan 15, 2026", created: "Mar 3, 2020", createdBy: "Sarah Chen" },
  { id: "2", name: "2015 Reports", type: "folder", items: 28, lastUpdated: "Jan 22, 2016", created: "Jun 14, 2014", createdBy: "Rachel Green" },
  { id: "3", name: "2016 Reports", type: "folder", items: 12, lastUpdated: "Jan 28, 2017", created: "Apr 11, 2016", createdBy: "Emily Watson" },
  { id: "4", name: "Former Rail Yard Assessment", type: "project", items: 12, lastUpdated: "Dec 2, 2025", created: "Jun 14, 2019", createdBy: "Michael Torres" },
  { id: "5", name: "2017 Reports", type: "folder", items: 8, lastUpdated: "Jan 23, 2018", created: "Jun 12, 2014", createdBy: "Amanda Foster" },
  { id: "6", name: "2018 Reports", type: "folder", items: 6, lastUpdated: "Jan 4, 2019", created: "Apr 9, 2017", createdBy: "Michael Torres" },
  { id: "7", name: "Coastal Wetlands Restoration Project", type: "project", items: 5, lastUpdated: "Nov 18, 2025", created: "Sep 22, 2021", createdBy: "James Liu" },
  { id: "8", name: "2019 Reports", type: "folder", items: 7, lastUpdated: "Jan 12, 2020", created: "Jun 10, 2015", createdBy: "James Liu" },
  { id: "9", name: "2020 Reports", type: "folder", items: 5, lastUpdated: "Dec 5, 2020", created: "Jan 8, 2018", createdBy: "Sarah Chen" },
  { id: "10", name: "2021 Reports", type: "folder", items: 9, lastUpdated: "Jan 20, 2022", created: "Mar 9, 2016", createdBy: "Michael Torres" },
  { id: "11", name: "2022 Reports", type: "folder", items: 7, lastUpdated: "Jan 18, 2023", created: "May 10, 2014", createdBy: "James Liu" },
  { id: "12", name: "2023 Reports", type: "folder", items: 8, lastUpdated: "Jan 7, 2024", created: "Nov 3, 2022", createdBy: "James Liu" },
  { id: "13", name: "2024 Reports", type: "folder", items: 6, lastUpdated: "Dec 22, 2024", created: "Jan 4, 2020", createdBy: "Emily Watson" },
  { id: "14", name: "2025 Reports", type: "folder", items: 3, lastUpdated: "Dec 8, 2025", created: "Mar 5, 2018", createdBy: "Amanda Foster" },
  { id: "15", name: "2026 Reports", type: "folder", items: 2, lastUpdated: "Mar 1, 2026", created: "Jan 10, 2024", createdBy: "Sarah Chen" },
  { id: "16", name: "Deep Dive Training Folder", type: "folder", items: 8, lastUpdated: "Mar 22, 2025", created: "Feb 14, 2019", createdBy: "Michael Torres" },
  { id: "17", name: "Demo Folder", type: "folder", items: 12, lastUpdated: "Feb 28, 2025", created: "Aug 3, 2017", createdBy: "Rachel Green" },
  { id: "18", name: "ESA Portfolio", type: "folder", items: 9, lastUpdated: "Dec 1, 2024", created: "May 6, 2016", createdBy: "Emily Watson" },
  { id: "19", name: "Phase I Inspections", type: "folder", items: 14, lastUpdated: "Nov 10, 2024", created: "Sep 18, 2015", createdBy: "James Liu" },
  { id: "20", name: "Asbestos Surveys", type: "folder", items: 6, lastUpdated: "Oct 5, 2024", created: "Mar 22, 2016", createdBy: "Sarah Chen" },
  { id: "21", name: "Phase II Investigations", type: "folder", items: 7, lastUpdated: "Sep 18, 2024", created: "Jul 4, 2015", createdBy: "Amanda Foster" },
  { id: "22", name: "Soil Contamination Studies", type: "folder", items: 5, lastUpdated: "Aug 3, 2024", created: "Dec 9, 2016", createdBy: "Michael Torres" },
  { id: "23", name: "Hazmat Assessments", type: "folder", items: 3, lastUpdated: "Jul 22, 2024", created: "Apr 17, 2015", createdBy: "Rachel Green" },
  { id: "24", name: "NEPA Reviews", type: "folder", items: 5, lastUpdated: "Feb 20, 2024", created: "Oct 2, 2014", createdBy: "Emily Watson" },
  { id: "25", name: "Wetlands Delineation", type: "folder", items: 3, lastUpdated: "Jan 8, 2024", created: "Jun 28, 2015", createdBy: "James Liu" },
  { id: "26", name: "Stormwater Management", type: "folder", items: 7, lastUpdated: "Dec 15, 2023", created: "Feb 11, 2016", createdBy: "Sarah Chen" },
  { id: "27", name: "Cultural Resources", type: "folder", items: 4, lastUpdated: "Nov 2, 2023", created: "Aug 14, 2014", createdBy: "Amanda Foster" },
  { id: "28", name: "Noise Impact Studies", type: "folder", items: 2, lastUpdated: "Oct 19, 2023", created: "Mar 30, 2017", createdBy: "Michael Torres" },
  { id: "29", name: "Traffic Impact Assessments", type: "folder", items: 6, lastUpdated: "Sep 7, 2023", created: "Nov 5, 2015", createdBy: "Rachel Green" },
  { id: "30", name: "Geotechnical Reports", type: "folder", items: 11, lastUpdated: "Aug 24, 2023", created: "Jan 19, 2016", createdBy: "Emily Watson" },
  { id: "31", name: "Air Quality Reports", type: "folder", items: 6, lastUpdated: "Apr 11, 2024", created: "Jul 7, 2014", createdBy: "James Liu" },
  { id: "32", name: "Remediation Projects", type: "folder", items: 9, lastUpdated: "Mar 5, 2024", created: "Sep 22, 2015", createdBy: "Sarah Chen" },
]

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

// Deterministic hash so each person always maps to the same color
function getAvatarColor(name: string): { bg: string; text: string } {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % avatarColors.length
  return avatarColors[index]
}

// Get initials from a person's name
function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

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

export default function AllReportsPage() {
  const router = useRouter()
  const [rows, setRows] = useState<ReportRow[]>(SEED_ROWS)
  const [searchQuery, setSearchQuery] = useState("")
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [isAddItemOpen, setIsAddItemOpen] = useState(false)
  const [isRenameOpen, setIsRenameOpen] = useState(false)
  const [renamingRow, setRenamingRow] = useState<ReportRow | null>(null)
  const [renameValue, setRenameValue] = useState("")

  // Filter rows by name (case-insensitive, real time)
  const filteredRows = useMemo(() => {
    return rows.filter((row) =>
      row.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery, rows])

  // Sort rows — sort state persists across pages
  const sortedRows = useMemo(() => {
    if (!sortField) return filteredRows
    return [...filteredRows].sort((a, b) => {
      let comparison = 0
      if (sortField === "name") {
        comparison = a.name.localeCompare(b.name)
      } else if (sortField === "lastUpdated") {
        comparison = new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime()
      }
      return sortDirection === "asc" ? comparison : -comparison
    })
  }, [filteredRows, sortField, sortDirection])

  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage
    return sortedRows.slice(startIndex, startIndex + rowsPerPage)
  }, [sortedRows, currentPage, rowsPerPage])

  const totalPages = Math.ceil(sortedRows.length / rowsPerPage)
  const startItem = (currentPage - 1) * rowsPerPage + 1
  const endItem = Math.min(currentPage * rowsPerPage, sortedRows.length)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleRowsPerPageChange = (value: string) => {
    setRowsPerPage(Number(value))
    setCurrentPage(1)
  }

  const handleNavigate = (row: ReportRow) => {
    if (row.type === "folder") {
      router.push(`/folder/${encodeURIComponent(row.name)}`)
    } else {
      router.push(`/project/${encodeURIComponent(row.name)}`)
    }
  }

  const handleAddItem = ({ type, name }: { type: ItemType; name: string; description?: string }) => {
    const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    const newRow: ReportRow = {
      id: String(Date.now()),
      name: name.trim(),
      type,
      items: 0,
      lastUpdated: today,
      created: today,
      createdBy: "John Doe",
    }
    setRows((prev) => [newRow, ...prev])
    setCurrentPage(1)
  }

  const handleRenameRow = () => {
    if (renamingRow && renameValue.trim()) {
      setRows((prev) =>
        prev.map((row) => (row.id === renamingRow.id ? { ...row, name: renameValue.trim() } : row))
      )
    }
    setIsRenameOpen(false)
    setRenamingRow(null)
    setRenameValue("")
  }

  const handleDeleteRow = (id: string) => {
    setRows((prev) => prev.filter((row) => row.id !== id))
    setOpenMenuId(null)
  }

  const openRenameModal = (row: ReportRow) => {
    setRenamingRow(row)
    setRenameValue(row.name)
    setIsRenameOpen(true)
    setOpenMenuId(null)
  }

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden">
      {/* Content row: title (left) + search (center) + Add (right) */}
      <div className="flex-shrink-0 p-6 pb-0">
        <div className="mb-8 flex items-center gap-4">
          <h1 className="font-heading text-2xl font-semibold text-foreground flex items-center gap-2 min-w-0 flex-1">
            <span className="truncate">All Reports</span>
          </h1>
          <div className="relative w-[320px] flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
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
          <Button className="flex-none" onClick={() => setIsAddItemOpen(true)}>
            Add
          </Button>
        </div>
      </div>

      {/* Table with sticky header */}
      <div className="flex-1 flex flex-col mx-6 mb-0 border border-border rounded-lg overflow-hidden bg-card shadow-sm">
        <Table className="table-fixed w-full flex-shrink-0">
          <TableHeader>
            <TableRow className="border-b border-[var(--quire-black)] bg-[var(--quire-black)] hover:bg-[var(--quire-black)]">
              <TableHead
                className="w-[28%] text-white text-xs font-semibold uppercase tracking-wide py-3 px-4 cursor-pointer select-none bg-[var(--quire-black)]"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center gap-1">
                  Name
                  <SortIndicator active={sortField === "name"} direction={sortDirection} />
                </div>
              </TableHead>
              <TableHead className="w-[12%] text-white text-xs font-semibold uppercase tracking-wide py-3 px-4 bg-[var(--quire-black)]">
                Type
              </TableHead>
              <TableHead className="w-[10%] text-white text-xs font-semibold uppercase tracking-wide py-3 px-4 bg-[var(--quire-black)]">
                Items
              </TableHead>
              <TableHead
                className="w-[16%] text-white text-xs font-semibold uppercase tracking-wide py-3 px-4 cursor-pointer select-none bg-[var(--quire-black)]"
                onClick={() => handleSort("lastUpdated")}
              >
                <div className="flex items-center gap-1">
                  Last Updated
                  <SortIndicator active={sortField === "lastUpdated"} direction={sortDirection} />
                </div>
              </TableHead>
              <TableHead className="w-[14%] text-white text-xs font-semibold uppercase tracking-wide py-3 px-4 bg-[var(--quire-black)]">
                Created
              </TableHead>
              <TableHead className="w-[14%] text-white text-xs font-semibold uppercase tracking-wide py-3 px-4 bg-[var(--quire-black)]">
                Created By
              </TableHead>
              <TableHead className="w-[6%] px-4 bg-[var(--quire-black)]"></TableHead>
            </TableRow>
          </TableHeader>
        </Table>

        <div className="flex-1 overflow-y-auto folder-list-scroll">
          {paginatedRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16">
              <FolderOpen className="size-12 text-muted-foreground/50 mb-3" />
              <span className="text-muted-foreground">Nothing here yet</span>
            </div>
          ) : (
            <Table className="table-fixed w-full">
              <TableBody>
                {paginatedRows.map((row, index) => (
                  <TableRow
                    key={row.id}
                    className={`border-border cursor-pointer transition-colors duration-150 ease-out hover:bg-[#EEEDF5] ${
                      index % 2 === 0 ? "bg-white" : "bg-[#F9F8FC]"
                    }`}
                    onMouseEnter={() => setHoveredRow(row.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    onClick={() => handleNavigate(row)}
                  >
                    <TableCell className="w-[28%] py-5 px-4 align-middle">
                      <div className="flex items-center gap-2">
                        {row.type === "folder" ? (
                          <Folder className="size-5 shrink-0 text-quire-link fill-quire-link/10" />
                        ) : (
                          <FolderOpen className="size-5 shrink-0 text-quire-link" />
                        )}
                        <span className="text-quire-link font-medium hover:underline cursor-pointer truncate">
                          {row.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="w-[12%] py-5 px-4 align-middle">
                      {row.type === "folder" ? (
                        <Badge className="bg-quire-link/10 text-quire-link hover:bg-quire-link/10 border-transparent font-medium">
                          Folder
                        </Badge>
                      ) : (
                        <Badge className="bg-quire-success/10 text-quire-success hover:bg-quire-success/10 border-transparent font-medium">
                          Project
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="w-[10%] text-foreground text-sm align-middle py-5 px-4">
                      {row.items}
                    </TableCell>
                    <TableCell className="w-[16%] text-muted-foreground text-sm align-middle py-5 px-4">
                      {row.lastUpdated}
                    </TableCell>
                    <TableCell className="w-[14%] text-muted-foreground text-sm align-middle py-5 px-4">
                      {row.created}
                    </TableCell>
                    <TableCell className="w-[14%] text-muted-foreground text-sm align-middle py-5 px-4">
                      {(() => {
                        const colors = getAvatarColor(row.createdBy)
                        return (
                          <div className="flex items-center gap-2 min-w-0">
                            <Avatar className="size-6 shrink-0">
                              <AvatarFallback className={`text-[10px] font-medium ${colors.bg} ${colors.text}`}>
                                {getInitials(row.createdBy)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="truncate">{row.createdBy}</span>
                          </div>
                        )
                      })()}
                    </TableCell>
                    <TableCell className="w-[6%] align-middle py-5 px-4">
                      <div className="flex justify-end">
                        <DropdownMenu
                          open={openMenuId === row.id}
                          onOpenChange={(open) => setOpenMenuId(open ? row.id : null)}
                        >
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className={`text-muted-foreground hover:text-foreground ${
                                hoveredRow === row.id || openMenuId === row.id ? "opacity-100" : "opacity-0"
                              }`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenuItem onClick={() => openRenameModal(row)}>
                              <Pencil className="size-4" />
                              Rename
                            </DropdownMenuItem>
                            {row.items === 0 && (
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => handleDeleteRow(row.id)}
                              >
                                <Trash2 className="size-4" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Pagination */}
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
          {sortedRows.length > 0 ? `${startItem}–${endItem} of ${sortedRows.length}` : "0 of 0"}
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

      {/* Add Folder/Project Modal */}
      <AddItemModal
        open={isAddItemOpen}
        onOpenChange={setIsAddItemOpen}
        allowedTypes={["folder", "project"]}
        defaultType="folder"
        location="All Reports"
        onCreate={handleAddItem}
      />

      {/* Rename Modal */}
      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Rename</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="rename-row" className="text-sm font-medium">
              Name
            </Label>
            <Input
              id="rename-row"
              placeholder="Enter name..."
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && renameValue.trim()) {
                  handleRenameRow()
                }
              }}
              className="mt-2 focus-visible:ring-[var(--quire-yellow)] focus-visible:border-[var(--quire-yellow)]"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRenameOpen(false)
                setRenamingRow(null)
                setRenameValue("")
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleRenameRow} disabled={!renameValue.trim()}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
