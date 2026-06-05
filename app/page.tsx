"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Search, FolderOpenDot, MoreVertical, ChevronLeft, ChevronRight, ChevronsUpDown, Pencil, Trash2, FolderOpen } from "lucide-react"
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
import { useReports } from "@/contexts/reports-context"

type SortField = "name" | "projects" | "lastUpdated" | null
type SortDirection = "asc" | "desc"

export default function AllReportsPage() {
  const router = useRouter()
  const { folders, addFolder, renameFolder, deleteFolder } = useReports()
  const [searchQuery, setSearchQuery] = useState("")
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<SortField>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [isAddFolderOpen, setIsAddFolderOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [isRenameOpen, setIsRenameOpen] = useState(false)
  const [renamingFolder, setRenamingFolder] = useState<{ id: string; name: string } | null>(null)
  const [renameValue, setRenameValue] = useState("")

  // Filter folders based on search query
  const filteredFolders = useMemo(() => {
    return folders.filter((folder) =>
      folder.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery, folders])

  // Sort folders
  const sortedFolders = useMemo(() => {
    if (!sortField) return filteredFolders
    return [...filteredFolders].sort((a, b) => {
      let comparison = 0
      if (sortField === "name") {
        comparison = a.name.localeCompare(b.name)
      } else if (sortField === "projects") {
        comparison = a.projects - b.projects
      } else if (sortField === "lastUpdated") {
        comparison = new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime()
      }
      return sortDirection === "asc" ? comparison : -comparison
    })
  }, [filteredFolders, sortField, sortDirection])

  // Paginate folders
  const paginatedFolders = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage
    return sortedFolders.slice(startIndex, startIndex + rowsPerPage)
  }, [sortedFolders, currentPage, rowsPerPage])

  const totalPages = Math.ceil(sortedFolders.length / rowsPerPage)
  const startItem = (currentPage - 1) * rowsPerPage + 1
  const endItem = Math.min(currentPage * rowsPerPage, sortedFolders.length)

  const handleSort = (field: "name" | "projects" | "lastUpdated") => {
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

  const handleAddFolder = () => {
    if (newFolderName.trim()) {
      addFolder(newFolderName)
      setCurrentPage(1)
    }
    setIsAddFolderOpen(false)
    setNewFolderName("")
  }

  const handleRenameFolder = () => {
    if (renamingFolder && renameValue.trim()) {
      renameFolder(renamingFolder.name, renameValue)
    }
    setIsRenameOpen(false)
    setRenamingFolder(null)
    setRenameValue("")
  }

  const handleDeleteFolder = (folderName: string) => {
    deleteFolder(folderName)
    setOpenMenuId(null)
  }

  const openRenameModal = (folder: { id: string; name: string }) => {
    setRenamingFolder(folder)
    setRenameValue(folder.name)
    setIsRenameOpen(true)
    setOpenMenuId(null)
  }

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden">
      {/* Page Header - Sticky */}
      <div className="flex-shrink-0 p-6 pb-0">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            All Reports
          </h1>
          <Button onClick={() => setIsAddFolderOpen(true)}>
            Add Folder
          </Button>
        </div>

        {/* Search Toolbar */}
        <div className="mb-8">
          <div className="relative w-[420px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search folders..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-9 focus-visible:ring-[var(--quire-yellow)] focus-visible:border-[var(--quire-yellow)]"
            />
          </div>
        </div>
      </div>

      {/* Folder Table with Sticky Header */}
      <div className="flex-1 flex flex-col mx-6 mb-0 border border-border rounded-lg overflow-hidden bg-card shadow-sm">
        {/* Fixed Table Header */}
        <Table className="table-fixed w-full flex-shrink-0">
          <TableHeader>
            <TableRow className="border-b border-[var(--quire-black)] bg-[var(--quire-black)] hover:bg-[var(--quire-black)]">
              <TableHead 
                className="w-[50%] text-white text-xs font-semibold uppercase tracking-wide py-3 px-4 cursor-pointer select-none bg-[var(--quire-black)]"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center gap-1">
                  Name
                  <ChevronsUpDown className="size-3 opacity-60" />
                </div>
              </TableHead>
              <TableHead 
                className="w-[20%] text-white text-xs font-semibold uppercase tracking-wide py-3 px-4 cursor-pointer select-none bg-[var(--quire-black)]"
                onClick={() => handleSort("projects")}
              >
                <div className="flex items-center gap-1">
                  Projects
                  <ChevronsUpDown className="size-3 opacity-60" />
                </div>
              </TableHead>
              <TableHead 
                className="w-[20%] text-white text-xs font-semibold uppercase tracking-wide py-3 px-4 cursor-pointer select-none bg-[var(--quire-black)]"
                onClick={() => handleSort("lastUpdated")}
              >
                <div className="flex items-center gap-1">
                  Last Updated
                  <ChevronsUpDown className="size-3 opacity-60" />
                </div>
              </TableHead>
              <TableHead className="w-[10%] px-4 bg-[var(--quire-black)]"></TableHead>
            </TableRow>
          </TableHeader>
        </Table>

        {/* Scrollable Table Body */}
        <div className="flex-1 overflow-y-auto folder-list-scroll">
          {paginatedFolders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16">
              <FolderOpen className="size-12 text-muted-foreground/50 mb-3" />
              <span className="text-muted-foreground">No folders found</span>
            </div>
          ) : (
          <Table className="table-fixed w-full">
            <TableBody>
              {paginatedFolders.map((folder, index) => (
                <TableRow
                  key={folder.id}
                  className={`border-border cursor-pointer transition-colors duration-150 ease-out hover:bg-[#EEEDF5] ${
                    index % 2 === 0 ? "bg-white" : "bg-[#F9F8FC]"
                  }`}
                  onMouseEnter={() => setHoveredRow(folder.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  onClick={() => router.push(`/folder/${encodeURIComponent(folder.name)}`)}
                >
                  <TableCell className="w-[50%] py-5 px-4 align-middle">
                    <div className="flex items-center gap-2">
                      <FolderOpenDot className="size-5 text-quire-link fill-quire-link/10" />
                      <span className="text-quire-link font-medium hover:underline cursor-pointer">
                        {folder.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="w-[20%] text-foreground text-sm align-middle py-5 pl-5 pr-4">
                    {folder.projects}
                  </TableCell>
                  <TableCell className="w-[20%] text-muted-foreground text-sm align-middle py-5 pl-5 pr-4">
                    {folder.lastUpdated}
                  </TableCell>
                  <TableCell className="w-[10%] align-middle py-5 px-4">
                    <div className="flex justify-end">
                      <DropdownMenu 
                        open={openMenuId === folder.id} 
                        onOpenChange={(open) => setOpenMenuId(open ? folder.id : null)}
                      >
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className={`text-muted-foreground hover:text-foreground ${
                              hoveredRow === folder.id || openMenuId === folder.id ? "opacity-100" : "opacity-0"
                            }`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenuItem onClick={() => openRenameModal(folder)}>
                            <Pencil className="size-4" />
                            Rename
                          </DropdownMenuItem>
                          {folder.projects === 0 && (
                            <DropdownMenuItem 
                              variant="destructive"
                              onClick={() => handleDeleteFolder(folder.name)}
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
          {sortedFolders.length > 0 ? `${startItem}–${endItem} of ${sortedFolders.length}` : "0 of 0"}
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

      {/* Add Folder Modal */}
      <Dialog open={isAddFolderOpen} onOpenChange={setIsAddFolderOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Add Folder</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="folder-name" className="text-sm font-medium">
              Name
            </Label>
            <Input
              id="folder-name"
              placeholder="Enter folder name..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newFolderName.trim()) {
                  handleAddFolder()
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
                setIsAddFolderOpen(false)
                setNewFolderName("")
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddFolder}
              disabled={!newFolderName.trim()}
            >
              Add Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Folder Modal */}
      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Rename Folder</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="rename-folder" className="text-sm font-medium">
              Name
            </Label>
            <Input
              id="rename-folder"
              placeholder="Enter folder name..."
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && renameValue.trim()) {
                  handleRenameFolder()
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
                setRenamingFolder(null)
                setRenameValue("")
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRenameFolder}
              disabled={!renameValue.trim()}
            >
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
