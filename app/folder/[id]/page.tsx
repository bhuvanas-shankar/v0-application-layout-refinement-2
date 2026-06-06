"use client"

import { useState, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
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
import { AddItemModal } from "@/components/add-item-modal"

type RowType = "folder" | "project"

interface FolderRow {
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

const SEED_ROWS: FolderRow[] = [
  { id: "1", name: "Phase II ESA - Industrial Site A", type: "project", items: 30, lastUpdated: "Dec 18, 2015", created: "Jan 5, 2015", createdBy: "Amanda Foster" },
  { id: "2", name: "Phase I ESA - 4400 Harbor Boulevard", type: "project", items: 6, lastUpdated: "Nov 14, 2015", created: "Mar 12, 2015", createdBy: "Rachel Green" },
  { id: "3", name: "ESA Sub-folder 2014", type: "folder", items: 6, lastUpdated: "Nov 1, 2014", created: "Oct 14, 2014", createdBy: "Sarah Chen" },
  { id: "4", name: "Phase I ESA - Oakwood Business Park", type: "project", items: 3, lastUpdated: "Oct 30, 2015", created: "Feb 4, 2015", createdBy: "Sarah Chen" },
  { id: "5", name: "Phase I ESA - 1200 Riverside Drive", type: "project", items: 5, lastUpdated: "Oct 12, 2015", created: "Apr 18, 2015", createdBy: "Emily Watson" },
  { id: "6", name: "Archived Projects 2014", type: "folder", items: 8, lastUpdated: "Oct 14, 2014", created: "Aug 18, 2014", createdBy: "Rachel Green" },
  { id: "7", name: "Phase I ESA - Former Dry Cleaner Site", type: "project", items: 6, lastUpdated: "Sep 28, 2015", created: "Jan 22, 2015", createdBy: "James Liu" },
  { id: "8", name: "Phase II ESA - Riverfront Redevelopment", type: "project", items: 8, lastUpdated: "Sep 10, 2015", created: "Jun 21, 2015", createdBy: "Rachel Green" },
  { id: "9", name: "ESA Sub-folder 2013", type: "folder", items: 4, lastUpdated: "Oct 28, 2014", created: "Sep 3, 2013", createdBy: "Michael Torres" },
  { id: "10", name: "Asbestos Survey - City Hall Annex", type: "project", items: 8, lastUpdated: "Aug 25, 2015", created: "Aug 22, 2015", createdBy: "Sarah Chen" },
  { id: "11", name: "Asbestos Survey - Lincoln Elementary School", type: "project", items: 8, lastUpdated: "Aug 8, 2015", created: "Apr 17, 2015", createdBy: "James Liu" },
  { id: "12", name: "Archived Projects 2013", type: "folder", items: 5, lastUpdated: "Sep 30, 2014", created: "Jul 2, 2013", createdBy: "Emily Watson" },
  { id: "13", name: "Asbestos Survey - Harborview Community Center", type: "project", items: 5, lastUpdated: "Jul 22, 2015", created: "Feb 28, 2015", createdBy: "Michael Torres" },
  { id: "14", name: "Lead Paint Assessment - 800 Commerce Street", type: "project", items: 4, lastUpdated: "Jul 6, 2015", created: "May 10, 2015", createdBy: "Emily Watson" },
  { id: "15", name: "Lead Paint Assessment - Municipal Services Building", type: "project", items: 7, lastUpdated: "Jun 19, 2015", created: "Dec 18, 2014", createdBy: "Emily Watson" },
  { id: "16", name: "Mold Assessment - Westfield Office Complex", type: "project", items: 8, lastUpdated: "Jun 3, 2015", created: "Apr 9, 2015", createdBy: "Michael Torres" },
  { id: "17", name: "Soil Contamination Study - Mill Road Corridor", type: "project", items: 7, lastUpdated: "May 18, 2015", created: "Aug 4, 2015", createdBy: "Emily Watson" },
  { id: "18", name: "Soil Contamination Study - East Industrial Depot", type: "project", items: 8, lastUpdated: "May 1, 2015", created: "May 4, 2015", createdBy: "Emily Watson" },
  { id: "19", name: "Remediation Report - Bayside Manufacturing", type: "project", items: 8, lastUpdated: "Apr 15, 2015", created: "Feb 28, 2015", createdBy: "Rachel Green" },
  { id: "20", name: "Remediation Report - North County Landfill", type: "project", items: 8, lastUpdated: "Mar 30, 2015", created: "Jan 6, 2015", createdBy: "David Kim" },
  { id: "21", name: "Groundwater Monitoring - Eastside Plume", type: "project", items: 8, lastUpdated: "Mar 13, 2015", created: "May 1, 2015", createdBy: "Sarah Chen" },
  { id: "22", name: "Groundwater Monitoring - Former Gas Station Network", type: "project", items: 4, lastUpdated: "Feb 25, 2015", created: "Nov 14, 2014", createdBy: "Amanda Foster" },
  { id: "23", name: "Air Quality Monitoring - Port District Q1", type: "project", items: 8, lastUpdated: "Feb 9, 2015", created: "Dec 17, 2014", createdBy: "Emily Watson" },
  { id: "24", name: "Air Quality Monitoring - Port District Q2", type: "project", items: 8, lastUpdated: "Jan 23, 2015", created: "Jun 17, 2014", createdBy: "James Liu" },
  { id: "25", name: "Wetlands Delineation - Creekside Development", type: "project", items: 8, lastUpdated: "Jan 7, 2015", created: "Aug 24, 2014", createdBy: "James Liu" },
  { id: "26", name: "Wetlands Delineation - Highway 9 Expansion Zone", type: "project", items: 6, lastUpdated: "Dec 18, 2014", created: "Jun 17, 2014", createdBy: "James Liu" },
  { id: "27", name: "NEPA Review - Regional Transit Corridor", type: "project", items: 8, lastUpdated: "Dec 1, 2014", created: "Nov 20, 2014", createdBy: "David Kim" },
  { id: "28", name: "Cultural Resources Survey - Old Town District", type: "project", items: 8, lastUpdated: "Nov 14, 2014", created: "Nov 20, 2014", createdBy: "David Kim" },
]

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

type ItemType = "folder" | "project"

export default function FolderViewPage() {
  const router = useRouter()
  const params = useParams()
  const folderName = decodeURIComponent(params.id as string)

  const [rows, setRows] = useState<FolderRow[]>(SEED_ROWS)
  const [searchQuery, setSearchQuery] = useState("")
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isRenameOpen, setIsRenameOpen] = useState(false)
  const [renamingRow, setRenamingRow] = useState<FolderRow | null>(null)
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
  const startItem = sortedRows.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0
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

  const handleNavigate = (row: FolderRow) => {
    if (row.type === "folder") {
      router.push(`/folder/${encodeURIComponent(row.name)}`)
    } else {
      router.push(`/project/${encodeURIComponent(row.name)}?folder=${encodeURIComponent(folderName)}`)
    }
  }

  const handleAddItem = ({ type, name }: { type: ItemType; name: string; description?: string }) => {
    const trimmed = name.trim()
    if (!trimmed) return
    const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    const newRow: FolderRow = {
      id: String(Date.now()),
      name: trimmed,
      type,
      items: 0,
      lastUpdated: today,
      created: today,
      createdBy: "John Doe",
    }
    setRows((prev) => [newRow, ...prev])
    setCurrentPage(1)
    setIsAddOpen(false)
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

  const openRenameModal = (row: FolderRow) => {
    setRenamingRow(row)
    setRenameValue(row.name)
    setIsRenameOpen(true)
    setOpenMenuId(null)
  }

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden">
      {/* Content row: title + badge (left) + search (center) + Add (right) */}
      <div className="flex-shrink-0 p-6 pb-0">
        <div className="mb-8 flex items-center gap-4">
          <h1 className="font-heading text-2xl font-semibold text-foreground flex items-center gap-2 min-w-0 flex-1">
            <Folder className="size-6 shrink-0 text-foreground" />
            <span className="truncate">{folderName}</span>
            <Badge className="ml-1 shrink-0 bg-quire-link/10 text-quire-link hover:bg-quire-link/10 border-transparent font-medium">
              Folder
            </Badge>
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
              className="pl-9 focus-visible:ring-[var(--quire-yellow)] focus-visible:border-[var(--quire-yellow)]"
            />
          </div>
          <Button className="flex-none" onClick={() => setIsAddOpen(true)}>
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
                    <TableCell className="w-[14%] text-muted-foreground text-sm align-middle py-5 px-4 truncate">
                      {row.createdBy}
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

      {/* Add new Modal */}
      <AddItemModal
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        allowedTypes={["folder", "project"]}
        defaultType="folder"
        location={folderName}
        onCreate={handleAddItem}
      />

      {/* Rename Modal */}
      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Rename</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="rename-item" className="text-sm font-medium">
              Name
            </Label>
            <Input
              id="rename-item"
              placeholder="Enter a name..."
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
