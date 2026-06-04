"use client"

import { useState, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import { Search, MoreVertical, ChevronLeft, ChevronRight, ChevronsUpDown, Files, Pencil, Trash2, FileSearch } from "lucide-react"
import Link from "next/link"
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

type SortField = "name" | "reports" | "lastUpdated" | null
type SortDirection = "asc" | "desc"

export default function FolderViewPage() {
  const router = useRouter()
  const params = useParams()
  const folderName = decodeURIComponent(params.id as string)
  const { getProjectsForFolder, addProject, renameProject, deleteProject } = useReports()
  const projects = getProjectsForFolder(folderName)
  const [searchQuery, setSearchQuery] = useState("")
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<SortField>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const [isRenameOpen, setIsRenameOpen] = useState(false)
  const [renamingProject, setRenamingProject] = useState<{ id: string; name: string } | null>(null)
  const [renameValue, setRenameValue] = useState("")

  // Filter projects based on search query
  const filteredProjects = useMemo(() => {
    return projects.filter((project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery, projects])

  // Sort projects
  const sortedProjects = useMemo(() => {
    if (!sortField) return filteredProjects
    return [...filteredProjects].sort((a, b) => {
      let comparison = 0
      if (sortField === "name") {
        comparison = a.name.localeCompare(b.name)
      } else if (sortField === "reports") {
        comparison = a.reports - b.reports
      } else if (sortField === "lastUpdated") {
        comparison = new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime()
      }
      return sortDirection === "asc" ? comparison : -comparison
    })
  }, [filteredProjects, sortField, sortDirection])

  // Paginate projects
  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage
    return sortedProjects.slice(startIndex, startIndex + rowsPerPage)
  }, [sortedProjects, currentPage, rowsPerPage])

  const totalPages = Math.ceil(sortedProjects.length / rowsPerPage)
  const startItem = sortedProjects.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0
  const endItem = Math.min(currentPage * rowsPerPage, sortedProjects.length)

  const handleSort = (field: "name" | "reports" | "lastUpdated") => {
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

  const handleAddProject = () => {
    if (newProjectName.trim()) {
      addProject(folderName, newProjectName)
      setCurrentPage(1)
    }
    setIsAddProjectOpen(false)
    setNewProjectName("")
  }

  const handleRenameProject = () => {
    if (renamingProject && renameValue.trim()) {
      renameProject(folderName, renamingProject.name, renameValue)
    }
    setIsRenameOpen(false)
    setRenamingProject(null)
    setRenameValue("")
  }

  const handleDeleteProject = (projectName: string) => {
    deleteProject(folderName, projectName)
    setOpenMenuId(null)
  }

  const openRenameModal = (project: { id: string; name: string }) => {
    setRenamingProject(project)
    setRenameValue(project.name)
    setIsRenameOpen(true)
    setOpenMenuId(null)
  }

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden">
      {/* Page Header - Sticky */}
      <div className="flex-shrink-0 p-6 pb-0">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            {folderName}
          </h1>
          <Button onClick={() => setIsAddProjectOpen(true)}>
            Add Project
          </Button>
        </div>

        {/* Search Toolbar */}
        <div className="mb-8">
          <div className="relative w-[420px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
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

      {/* Project Table with Sticky Header */}
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
                onClick={() => handleSort("reports")}
              >
                <div className="flex items-center gap-1">
                  Reports
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
          {sortedProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16">
              <FileSearch className="size-12 text-muted-foreground/50 mb-3" />
              <span className="text-muted-foreground">No projects found</span>
            </div>
          ) : (
            <Table className="table-fixed w-full">
              <TableBody>
                {paginatedProjects.map((project, index) => (
                  <TableRow
                    key={project.id}
                    className={`border-border cursor-pointer transition-colors duration-150 ease-out hover:bg-[#EEEDF5] ${
                      index % 2 === 0 ? "bg-white" : "bg-[#F9F8FC]"
                    }`}
                    onMouseEnter={() => setHoveredRow(project.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    onClick={() => router.push(`/project/${encodeURIComponent(project.name)}?folder=${encodeURIComponent(folderName)}`)}
                  >
<TableCell className="w-[50%] py-6 px-4 align-middle">
                      <div className="flex items-center gap-2">
                        <Files className="size-5 text-[#378ADD]" />
                        <span className="text-[#378ADD] font-medium hover:underline cursor-pointer">
                          {project.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="w-[20%] text-foreground text-sm align-middle py-6 pl-5 pr-4">
                      {project.reports}
                    </TableCell>
                    <TableCell className="w-[20%] text-muted-foreground text-sm align-middle py-6 pl-5 pr-4">
                      {project.lastUpdated}
                    </TableCell>
                    <TableCell className="w-[10%] align-middle py-6 px-4">
                      <div className="flex justify-end">
                        <DropdownMenu 
                          open={openMenuId === project.id} 
                          onOpenChange={(open) => setOpenMenuId(open ? project.id : null)}
                        >
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className={`text-muted-foreground hover:text-foreground ${
                                hoveredRow === project.id || openMenuId === project.id ? "opacity-100" : "opacity-0"
                              }`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenuItem onClick={() => openRenameModal(project)}>
                              <Pencil className="size-4" />
                              Rename
                            </DropdownMenuItem>
                            {project.reports === 0 && (
                              <DropdownMenuItem 
                                variant="destructive"
                                onClick={() => handleDeleteProject(project.name)}
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
          {sortedProjects.length > 0 ? `${startItem}–${endItem} of ${sortedProjects.length}` : "0 of 0"}
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

      {/* Add Project Modal */}
      <Dialog open={isAddProjectOpen} onOpenChange={setIsAddProjectOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Add Project</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="project-name" className="text-sm font-medium">
              Name
            </Label>
            <Input
              id="project-name"
              placeholder="Enter project name..."
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newProjectName.trim()) {
                  handleAddProject()
                }
              }}
              className="mt-2 focus-visible:ring-[var(--quire-yellow)] focus-visible:border-[var(--quire-yellow)]"
              autoFocus
            />
            <p className="mt-2 text-sm text-muted-foreground">
              This project will be created inside {folderName}.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddProjectOpen(false)
                setNewProjectName("")
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddProject}
              disabled={!newProjectName.trim()}
            >
              Add Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Project Modal */}
      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Rename Project</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="rename-project" className="text-sm font-medium">
              Name
            </Label>
            <Input
              id="rename-project"
              placeholder="Enter project name..."
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && renameValue.trim()) {
                  handleRenameProject()
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
                setRenamingProject(null)
                setRenameValue("")
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRenameProject}
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
