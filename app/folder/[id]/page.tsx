"use client"

import { useState, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import {
  Search,
  Folder,
  FolderOpen,
  SearchX,
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
import { AddItemModal } from "@/components/add-item-modal"
import { useReports, type ItemWithCounts } from "@/contexts/reports-context"

type FolderRow = ItemWithCounts

type SortField = "name" | "lastUpdated" | "created"
type SortDirection = "asc" | "desc"

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

type ItemType = "folder" | "project"

export default function FolderViewPage() {
  const router = useRouter()
  const params = useParams()
  const folderName = decodeURIComponent(params.id as string)
  const { getFolderItems, addItem, renameItem, deleteItem, getSort, setSort } = useReports()
  const sortKey = `folder:${folderName}`

  const rows = getFolderItems(folderName)
  const [searchQuery, setSearchQuery] = useState("")
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [currentPage, setCurrentPage] = useState(1)
  // Sort state is read from the shared context so it persists across navigation
  const { field: sortFieldRaw, direction: sortDirection } = getSort(sortKey)
  const sortField = sortFieldRaw as SortField | null
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
      } else if (sortField === "created") {
        comparison = new Date(a.created).getTime() - new Date(b.created).getTime()
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
      setSort(sortKey, field, sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSort(sortKey, field, "asc")
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
    addItem(folderName, trimmed, type)
    setCurrentPage(1)
    setIsAddOpen(false)
  }

  const handleRenameRow = () => {
    if (renamingRow && renameValue.trim()) {
      renameItem(folderName, renamingRow.name, renameValue.trim())
    }
    setIsRenameOpen(false)
    setRenamingRow(null)
    setRenameValue("")
  }

  const handleDeleteRow = (name: string) => {
    deleteItem(folderName, name)
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
              <TableHead
                className="w-[14%] text-white text-xs font-semibold uppercase tracking-wide py-3 px-4 cursor-pointer select-none bg-[var(--quire-black)]"
                onClick={() => handleSort("created")}
              >
                <div className="flex items-center gap-1">
                  Created
                  <SortIndicator active={sortField === "created"} direction={sortDirection} />
                </div>
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
              <SearchX className="size-12 text-muted-foreground/50 mb-3" />
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
                                onClick={() => handleDeleteRow(row.name)}
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
