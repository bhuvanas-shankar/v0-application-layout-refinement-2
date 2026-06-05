"use client"

import { createContext, useContext, useState, useMemo, ReactNode } from "react"

// Types
interface Folder {
  id: string
  name: string
  type?: "folder" | "project"
  description?: string
  created?: string
  createdBy?: string
}

interface Project {
  id: string
  name: string
  type?: "folder" | "project"
  description?: string
  created?: string
  createdBy?: string
}

interface Report {
  id: string
  name: string
  status: "Draft" | "Data Entry" | "Review" | "Final"
  complete: number
  lastModified: string
  modifiedBy: string
}

interface FolderWithCounts extends Folder {
  projects: number
  lastUpdated: string
}

interface ProjectWithCounts extends Project {
  reports: number
  lastUpdated: string
}

interface ReportsContextType {
  folders: FolderWithCounts[]
  addFolder: (name: string, type?: "folder" | "project", description?: string) => void
  renameFolder: (oldName: string, newName: string) => void
  deleteFolder: (folderName: string) => void
  getProjectsForFolder: (folderName: string) => ProjectWithCounts[]
  addProject: (folderName: string, projectName: string, type?: "folder" | "project", description?: string) => void
  renameProject: (folderName: string, oldName: string, newName: string) => void
  deleteProject: (folderName: string, projectName: string) => void
  getReportsForProject: (folderName: string, projectName: string) => Report[]
  addReport: (folderName: string, projectName: string, reportName: string) => void
}

// Initial seed data - 32 folders (just name and id)
const initialFolders: Folder[] = [
  { id: "1", name: "2015 Reports" },
  { id: "2", name: "2016 Reports" },
  { id: "3", name: "2017 Reports" },
  { id: "4", name: "2018 Reports" },
  { id: "5", name: "2019 Reports" },
  { id: "6", name: "2020 Reports" },
  { id: "7", name: "2021 Reports" },
  { id: "8", name: "2022 Reports" },
  { id: "9", name: "2023 Reports" },
  { id: "10", name: "2024 Reports" },
  { id: "11", name: "2025 Reports" },
  { id: "12", name: "Environmental Assessments" },
  { id: "13", name: "Site Investigations" },
  { id: "14", name: "Remediation Projects" },
  { id: "15", name: "Air Quality Studies" },
  { id: "16", name: "Water Quality Reports" },
  { id: "17", name: "Soil Contamination" },
  { id: "18", name: "Hazardous Materials" },
  { id: "19", name: "Compliance Documents" },
  { id: "20", name: "Permit Applications" },
  { id: "21", name: "Risk Assessments" },
  { id: "22", name: "Health & Safety Plans" },
  { id: "23", name: "Monitoring Reports" },
  { id: "24", name: "Closure Documents" },
  { id: "25", name: "Client: Acme Corp" },
  { id: "26", name: "Client: Beta Industries" },
  { id: "27", name: "Client: City of Springfield" },
  { id: "28", name: "Client: Delta Manufacturing" },
  { id: "29", name: "Client: Echo Energy" },
  { id: "30", name: "Client: Foxtrot Properties" },
  { id: "31", name: "Archived 2010-2014" },
  { id: "32", name: "Templates & Standards" },
]

// Initial seed data - 28 projects for "2015 Reports"
const initialProjects2015: Project[] = [
  { id: "1", name: "Phase II ESA - Industrial Site A" },
  { id: "2", name: "Phase I ESA - 4400 Harbor Boulevard" },
  { id: "3", name: "Phase I ESA - Oakwood Business Park" },
  { id: "4", name: "Phase I ESA - 1200 Riverside Drive" },
  { id: "5", name: "Phase I ESA - Former Dry Cleaner Site" },
  { id: "6", name: "Phase II ESA - Riverfront Redevelopment" },
  { id: "7", name: "Asbestos Survey - City Hall Annex" },
  { id: "8", name: "Asbestos Survey - Lincoln Elementary School" },
  { id: "9", name: "Asbestos Survey - Harborview Community Center" },
  { id: "10", name: "Lead Paint Assessment - 800 Commerce Street" },
  { id: "11", name: "Lead Paint Assessment - Municipal Services Building" },
  { id: "12", name: "Mold Assessment - Westfield Office Complex" },
  { id: "13", name: "Soil Contamination Study - Mill Road Corridor" },
  { id: "14", name: "Soil Contamination Study - East Industrial Depot" },
  { id: "15", name: "Remediation Report - Bayside Manufacturing" },
  { id: "16", name: "Remediation Report - North County Landfill" },
  { id: "17", name: "Groundwater Monitoring - Eastside Plume" },
  { id: "18", name: "Groundwater Monitoring - Former Gas Station Network" },
  { id: "19", name: "Air Quality Monitoring - Port District Q1" },
  { id: "20", name: "Air Quality Monitoring - Port District Q2" },
  { id: "21", name: "Wetlands Delineation - Creekside Development" },
  { id: "22", name: "Wetlands Delineation - Highway 9 Expansion Zone" },
  { id: "23", name: "NEPA Review - Regional Transit Corridor" },
  { id: "24", name: "Cultural Resources Survey - Old Town District" },
  { id: "25", name: "Noise Impact Study - Airport Perimeter" },
  { id: "26", name: "Traffic Impact Assessment - Downtown Mixed Use" },
  { id: "27", name: "Geotechnical Report - Bayview Bridge Replacement" },
  { id: "28", name: "Hazmat Assessment - Warehouse District Block 4" },
]

// Initial seed data - 30 reports for "Phase II ESA - Industrial Site A"
const initialReportsPhaseII: Report[] = [
  { id: "1", name: "Phase II ESA Report - Building A Soil Investigation", status: "Final", complete: 100, lastModified: "Dec 18, 2015", modifiedBy: "Sarah Chen" },
  { id: "2", name: "Phase II ESA Report - Building B Underground Storage Tanks", status: "Final", complete: 100, lastModified: "Dec 5, 2015", modifiedBy: "Michael Torres" },
  { id: "3", name: "Remedial Investigation - North Lot Soil Boring Summary", status: "Review", complete: 88, lastModified: "Nov 20, 2015", modifiedBy: "James Liu" },
  { id: "4", name: "Laboratory Analytical Results - Round 1 Sampling", status: "Final", complete: 100, lastModified: "Nov 6, 2015", modifiedBy: "Sarah Chen" },
  { id: "5", name: "Laboratory Analytical Results - Round 2 Sampling", status: "Review", complete: 75, lastModified: "Oct 22, 2015", modifiedBy: "Emily Watson" },
  { id: "6", name: "Groundwater Monitoring Well Installation Report", status: "Final", complete: 100, lastModified: "Oct 8, 2015", modifiedBy: "Michael Torres" },
  { id: "7", name: "Groundwater Sampling Results - Q1", status: "Final", complete: 100, lastModified: "Sep 24, 2015", modifiedBy: "Sarah Chen" },
  { id: "8", name: "Groundwater Sampling Results - Q2", status: "Data Entry", complete: 55, lastModified: "Sep 10, 2015", modifiedBy: "Amanda Foster" },
  { id: "9", name: "Vapor Intrusion Assessment - Building A", status: "Final", complete: 100, lastModified: "Aug 27, 2015", modifiedBy: "James Liu" },
  { id: "10", name: "Vapor Intrusion Assessment - Building B", status: "Review", complete: 82, lastModified: "Aug 13, 2015", modifiedBy: "Sarah Chen" },
  { id: "11", name: "Preliminary Remediation Goals Report", status: "Final", complete: 100, lastModified: "Jul 30, 2015", modifiedBy: "Emily Watson" },
  { id: "12", name: "Remedial Action Plan - Draft", status: "Data Entry", complete: 45, lastModified: "Jul 16, 2015", modifiedBy: "Michael Torres" },
  { id: "13", name: "Remedial Action Plan - Final", status: "Draft", complete: 20, lastModified: "Jul 2, 2015", modifiedBy: "Amanda Foster" },
  { id: "14", name: "Health and Safety Plan", status: "Final", complete: 100, lastModified: "Jun 18, 2015", modifiedBy: "Sarah Chen" },
  { id: "15", name: "Community Air Monitoring Plan", status: "Final", complete: 100, lastModified: "Jun 4, 2015", modifiedBy: "James Liu" },
  { id: "16", name: "Soil Excavation Completion Report", status: "Review", complete: 91, lastModified: "May 21, 2015", modifiedBy: "Emily Watson" },
  { id: "17", name: "Confirmation Sampling Results", status: "Data Entry", complete: 60, lastModified: "May 7, 2015", modifiedBy: "Michael Torres" },
  { id: "18", name: "Regulatory Correspondence - DTSC Response Letter", status: "Final", complete: 100, lastModified: "Apr 23, 2015", modifiedBy: "Sarah Chen" },
  { id: "19", name: "Regulatory Correspondence - Regional Water Board", status: "Review", complete: 70, lastModified: "Apr 9, 2015", modifiedBy: "James Liu" },
  { id: "20", name: "Site Characterization Summary", status: "Final", complete: 100, lastModified: "Mar 26, 2015", modifiedBy: "Amanda Foster" },
  { id: "21", name: "Risk Assessment Report", status: "Data Entry", complete: 35, lastModified: "Mar 12, 2015", modifiedBy: "Emily Watson" },
  { id: "22", name: "Feasibility Study", status: "Draft", complete: 15, lastModified: "Feb 26, 2015", modifiedBy: "Michael Torres" },
  { id: "23", name: "Engineering Controls Plan", status: "Final", complete: 100, lastModified: "Feb 12, 2015", modifiedBy: "Sarah Chen" },
  { id: "24", name: "Long Term Monitoring Plan", status: "Review", complete: 80, lastModified: "Jan 29, 2015", modifiedBy: "James Liu" },
  { id: "25", name: "Annual Groundwater Monitoring Report 2015", status: "Data Entry", complete: 50, lastModified: "Jan 15, 2015", modifiedBy: "Amanda Foster" },
  { id: "26", name: "Annual Groundwater Monitoring Report 2014", status: "Final", complete: 100, lastModified: "Jan 1, 2015", modifiedBy: "Sarah Chen" },
  { id: "27", name: "Site Closure Request", status: "Draft", complete: 10, lastModified: "Dec 18, 2014", modifiedBy: "Emily Watson" },
  { id: "28", name: "No Further Action Letter - Draft", status: "Draft", complete: 5, lastModified: "Dec 4, 2014", modifiedBy: "Michael Torres" },
  { id: "29", name: "Quarterly Progress Report - Q3", status: "Final", complete: 100, lastModified: "Nov 20, 2014", modifiedBy: "Sarah Chen" },
  { id: "30", name: "Quarterly Progress Report - Q4", status: "Data Entry", complete: 40, lastModified: "Nov 6, 2014", modifiedBy: "James Liu" },
]

// Seed projects for other folders
const initialProjects2016: Project[] = [
  { id: "101", name: "Phase I ESA - Downtown Redevelopment" },
  { id: "102", name: "Phase II ESA - Former Manufacturing Plant" },
  { id: "103", name: "Asbestos Survey - County Courthouse" },
  { id: "104", name: "Lead Paint Assessment - Historic District" },
  { id: "105", name: "Soil Vapor Survey - Tech Campus" },
  { id: "106", name: "Groundwater Investigation - Marina District" },
  { id: "107", name: "Remediation Oversight - Fuel Station" },
  { id: "108", name: "NEPA Documentation - Highway 101 Expansion" },
  { id: "109", name: "Wetlands Survey - Coastal Preserve" },
  { id: "110", name: "Air Quality Monitoring - Industrial Corridor Q1" },
  { id: "111", name: "Air Quality Monitoring - Industrial Corridor Q2" },
  { id: "112", name: "Hazmat Assessment - Rail Yard" },
]

const initialProjects2017: Project[] = [
  { id: "201", name: "Phase I ESA - Sunrise Business Park" },
  { id: "202", name: "Phase II ESA - Waterfront Complex" },
  { id: "203", name: "Asbestos Survey - Memorial Hospital Wing" },
  { id: "204", name: "Mold Assessment - University Library" },
  { id: "205", name: "Soil Contamination Study - Transit Hub" },
  { id: "206", name: "Groundwater Monitoring - Aerospace Facility" },
  { id: "207", name: "Risk Assessment - Brownfield Site" },
  { id: "208", name: "Cultural Resources Survey - Heritage Park" },
]

const initialProjects2018: Project[] = [
  { id: "301", name: "Phase I ESA - Retail Center Expansion" },
  { id: "302", name: "Phase II ESA - Chemical Storage Facility" },
  { id: "303", name: "Lead Paint Survey - School District Buildings" },
  { id: "304", name: "Vapor Intrusion Assessment - Office Complex" },
  { id: "305", name: "Remediation Report - Dry Cleaner Site" },
  { id: "306", name: "Stormwater Management Plan - Mixed Use Development" },
]

const initialProjects2019: Project[] = [
  { id: "401", name: "Phase I ESA - Logistics Center" },
  { id: "402", name: "Asbestos Abatement Plan - Power Plant" },
  { id: "403", name: "Soil Assessment - Agricultural Conversion" },
  { id: "404", name: "Groundwater Treatment System Design" },
  { id: "405", name: "Air Emissions Inventory - Manufacturing" },
  { id: "406", name: "Noise Impact Study - Airport Expansion" },
  { id: "407", name: "Traffic Analysis - Distribution Center" },
]

const initialProjects2020: Project[] = [
  { id: "501", name: "Phase I ESA - Data Center Campus" },
  { id: "502", name: "Phase II ESA - Former Gas Station Network" },
  { id: "503", name: "Indoor Air Quality Study - Office Tower" },
  { id: "504", name: "Contamination Assessment - Landfill Adjacent" },
  { id: "505", name: "Wetlands Delineation - Solar Farm Site" },
]

const initialProjects2021: Project[] = [
  { id: "601", name: "Phase I ESA - Electric Vehicle Facility" },
  { id: "602", name: "Phase II ESA - Urban Infill Project" },
  { id: "603", name: "Asbestos Survey - Convention Center" },
  { id: "604", name: "Soil Vapor Extraction Design" },
  { id: "605", name: "Groundwater Monitoring - Plume Migration" },
  { id: "606", name: "CEQA Documentation - Transit Village" },
  { id: "607", name: "Hazmat Closure - Industrial Warehouse" },
  { id: "608", name: "Remedial Action Plan - TCE Site" },
  { id: "609", name: "Risk Communication Plan - Community" },
]

const initialProjects2022: Project[] = [
  { id: "701", name: "Phase I ESA - Biotech Campus" },
  { id: "702", name: "Lead Assessment - Affordable Housing" },
  { id: "703", name: "Mold Remediation Plan - Flood Damage" },
  { id: "704", name: "Air Quality Permit - Food Processing" },
  { id: "705", name: "Stormwater Compliance - Warehouse District" },
  { id: "706", name: "Environmental Monitoring - Construction" },
  { id: "707", name: "Geotechnical Investigation - High Rise" },
]

const initialProjects2023: Project[] = [
  { id: "801", name: "Phase I ESA - Mixed Use Tower" },
  { id: "802", name: "Phase II ESA - Petroleum Contamination" },
  { id: "803", name: "PFAS Investigation - Water Supply" },
  { id: "804", name: "Vapor Barrier Design - Residential" },
  { id: "805", name: "Groundwater Treatment Optimization" },
  { id: "806", name: "Environmental Due Diligence - Portfolio" },
  { id: "807", name: "Closure Report - Voluntary Cleanup" },
  { id: "808", name: "Sustainability Assessment - Campus" },
]

const initialProjects2024: Project[] = [
  { id: "901", name: "Phase I ESA - Renewable Energy Site" },
  { id: "902", name: "PFAS Remediation Feasibility Study" },
  { id: "903", name: "Indoor Environmental Quality - Retrofit" },
  { id: "904", name: "Brownfield Redevelopment Plan" },
  { id: "905", name: "Climate Resilience Assessment" },
  { id: "906", name: "Environmental Compliance Audit" },
]

const initialProjects2025: Project[] = [
  { id: "1001", name: "Phase I ESA - Innovation District" },
  { id: "1002", name: "Environmental Impact Report - Transit" },
  { id: "1003", name: "Emerging Contaminants Study" },
]

// Deterministic pseudo-random number generator (seeded)
function seededRandom(seed: number): () => number {
  return function() {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }
}

// Locale-independent date formatting
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
function formatDate(date: Date): string {
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

// Seed reports for projects in other folders (deterministic)
const seedReports = (projectName: string, count: number, year: number, startMonth: number, seed: number): Report[] => {
  const random = seededRandom(seed)
  const statuses: Array<"Draft" | "Data Entry" | "Review" | "Final"> = ["Draft", "Data Entry", "Review", "Final"]
  const authors = ["Sarah Chen", "Michael Torres", "James Liu", "Emily Watson", "Amanda Foster", "David Kim", "Rachel Green"]
  const reports: Report[] = []
  
  for (let i = 0; i < count; i++) {
    const month = ((startMonth - i) % 12) + 1
    const adjustedYear = year - Math.floor((startMonth - i - 1) / 12)
    const day = Math.floor(random() * 28) + 1
    const date = new Date(adjustedYear, month - 1, day)
    const statusIndex = Math.min(Math.floor(random() * 4), 3)
    const complete = statuses[statusIndex] === "Final" ? 100 : Math.floor(random() * 80) + 10
    
    reports.push({
      id: `${projectName}-${i}`,
      name: `${projectName} - Report ${i + 1}`,
      status: statuses[statusIndex],
      complete: statuses[statusIndex] === "Final" ? 100 : complete,
      lastModified: formatDate(date),
      modifiedBy: authors[Math.floor(random() * authors.length)],
    })
  }
  
  return reports
}

// Generate reports for all seeded projects (deterministic)
const generateReportsForFolder = (projects: Project[], year: number): Record<string, Report[]> => {
  const random = seededRandom(year * 1000)
  const result: Record<string, Report[]> = {}
  projects.forEach((project, index) => {
    const reportCount = Math.floor(random() * 8) + 2 // 2-9 reports per project
    result[project.name] = seedReports(project.name, reportCount, year, 12 - index, year * 100 + index)
  })
  return result
}

// Generate reports for 2015 projects (except Phase II ESA - Industrial Site A and one empty project)
const generate2015Reports = (): Record<string, Report[]> => {
  const random = seededRandom(2015000)
  const result: Record<string, Report[]> = {
    "Phase II ESA - Industrial Site A": initialReportsPhaseII,
    // Leave "Phase I ESA - Oakwood Business Park" empty (0 reports)
    "Phase I ESA - Oakwood Business Park": [],
  }
  
  // Generate reports for all other 2015 projects
  const projectsToSeed = initialProjects2015.filter(p => 
    p.name !== "Phase II ESA - Industrial Site A" && 
    p.name !== "Phase I ESA - Oakwood Business Park"
  )
  
  projectsToSeed.forEach((project, index) => {
    const reportCount = Math.floor(random() * 6) + 3 // 3-8 reports per project
    result[project.name] = seedReports(project.name, reportCount, 2015, 12 - (index % 12), 2015 * 100 + index)
  })
  
  return result
}

// Helper to get most recent date from an array of items with date field
function getMostRecentDate(items: { lastModified?: string; lastUpdated?: string }[], defaultDate: string): string {
  if (items.length === 0) return defaultDate
  
  const dates = items.map(item => {
    const dateStr = item.lastModified || item.lastUpdated || defaultDate
    return new Date(dateStr).getTime()
  }).filter(d => !isNaN(d))
  
  if (dates.length === 0) return defaultDate
  
  const mostRecent = new Date(Math.max(...dates))
  return formatDate(mostRecent)
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined)

export function ReportsProvider({ children }: { children: ReactNode }) {
  const [folders, setFolders] = useState<Folder[]>(initialFolders)
  // projects[folderName] = Project[]
  const [projects, setProjects] = useState<Record<string, Project[]>>({
    "2015 Reports": initialProjects2015,
    "2016 Reports": initialProjects2016,
    "2017 Reports": initialProjects2017,
    "2018 Reports": initialProjects2018,
    "2019 Reports": initialProjects2019,
    "2020 Reports": initialProjects2020,
    "2021 Reports": initialProjects2021,
    "2022 Reports": initialProjects2022,
    "2023 Reports": initialProjects2023,
    "2024 Reports": initialProjects2024,
    "2025 Reports": initialProjects2025,
  })
  // reports[folderName][projectName] = Report[]
  const [reports, setReports] = useState<Record<string, Record<string, Report[]>>>(() => ({
    "2015 Reports": generate2015Reports(),
    "2016 Reports": generateReportsForFolder(initialProjects2016, 2016),
    "2017 Reports": generateReportsForFolder(initialProjects2017, 2017),
    "2018 Reports": generateReportsForFolder(initialProjects2018, 2018),
    "2019 Reports": generateReportsForFolder(initialProjects2019, 2019),
    "2020 Reports": generateReportsForFolder(initialProjects2020, 2020),
    "2021 Reports": generateReportsForFolder(initialProjects2021, 2021),
    "2022 Reports": generateReportsForFolder(initialProjects2022, 2022),
    "2023 Reports": generateReportsForFolder(initialProjects2023, 2023),
    "2024 Reports": generateReportsForFolder(initialProjects2024, 2024),
    "2025 Reports": generateReportsForFolder(initialProjects2025, 2025),
  }))

  // Get projects for a folder with calculated reports count and lastUpdated
  const getProjectsForFolder = (folderName: string): ProjectWithCounts[] => {
    const folderProjects = projects[folderName] || []
    const folderReports = reports[folderName] || {}
    const today = formatDate(new Date())
    
    return folderProjects.map(project => {
      const projectReports = folderReports[project.name] || []
      return {
        ...project,
        reports: projectReports.length,
        lastUpdated: getMostRecentDate(projectReports, today),
      }
    })
  }

  // Get reports for a specific project
  const getReportsForProject = (folderName: string, projectName: string): Report[] => {
    return reports[folderName]?.[projectName] || []
  }

  // Calculate folder counts dynamically
  const foldersWithCounts: FolderWithCounts[] = useMemo(() => {
    const today = formatDate(new Date())
    
    return folders.map(folder => {
      const folderProjects = projects[folder.name] || []
      const folderReports = reports[folder.name] || {}
      
      // Get all reports across all projects in this folder
      const allReportsInFolder = Object.values(folderReports).flat()
      
      return {
        ...folder,
        projects: folderProjects.length,
        lastUpdated: getMostRecentDate(allReportsInFolder, today),
      }
    })
  }, [folders, projects, reports])

  const addFolder = (name: string, type: "folder" | "project" = "folder", description?: string) => {
    const today = formatDate(new Date())
    const newFolder: Folder = {
      id: String(Date.now()),
      name: name.trim(),
      type,
      created: today,
      createdBy: "John Doe",
      ...(type === "project" ? { description: description?.trim() || undefined } : {}),
    }
    setFolders((prev) => [newFolder, ...prev])
  }

  const renameFolder = (oldName: string, newName: string) => {
    const trimmedNewName = newName.trim()
    if (!trimmedNewName || oldName === trimmedNewName) return

    // Update folder name
    setFolders((prev) =>
      prev.map((folder) =>
        folder.name === oldName ? { ...folder, name: trimmedNewName } : folder
      )
    )

    // Update projects reference
    setProjects((prev) => {
      const updated = { ...prev }
      if (updated[oldName]) {
        updated[trimmedNewName] = updated[oldName]
        delete updated[oldName]
      }
      return updated
    })

    // Update reports reference
    setReports((prev) => {
      const updated = { ...prev }
      if (updated[oldName]) {
        updated[trimmedNewName] = updated[oldName]
        delete updated[oldName]
      }
      return updated
    })
  }

  const deleteFolder = (folderName: string) => {
    // Only allow deletion if folder has no projects
    const folderProjects = projects[folderName] || []
    if (folderProjects.length > 0) return

    setFolders((prev) => prev.filter((folder) => folder.name !== folderName))
    
    // Clean up projects and reports references
    setProjects((prev) => {
      const updated = { ...prev }
      delete updated[folderName]
      return updated
    })
    
    setReports((prev) => {
      const updated = { ...prev }
      delete updated[folderName]
      return updated
    })
  }

  const addProject = (folderName: string, projectName: string, type: "folder" | "project" = "project", description?: string) => {
    const today = formatDate(new Date())
    const newProject: Project = {
      id: String(Date.now()),
      name: projectName.trim(),
      type,
      created: today,
      createdBy: "John Doe",
      ...(type === "project" ? { description: description?.trim() || undefined } : {}),
    }
    
    setProjects((prev) => ({
      ...prev,
      [folderName]: [newProject, ...(prev[folderName] || [])],
    }))
  }

  const renameProject = (folderName: string, oldName: string, newName: string) => {
    const trimmedNewName = newName.trim()
    if (!trimmedNewName || oldName === trimmedNewName) return

    // Update project name in projects list
    setProjects((prev) => ({
      ...prev,
      [folderName]: (prev[folderName] || []).map((project) =>
        project.name === oldName ? { ...project, name: trimmedNewName } : project
      ),
    }))

    // Update reports reference
    setReports((prev) => {
      const folderReports = prev[folderName] || {}
      if (!folderReports[oldName]) return prev

      const updatedFolderReports = { ...folderReports }
      updatedFolderReports[trimmedNewName] = updatedFolderReports[oldName]
      delete updatedFolderReports[oldName]

      return {
        ...prev,
        [folderName]: updatedFolderReports,
      }
    })
  }

  const deleteProject = (folderName: string, projectName: string) => {
    // Only allow deletion if project has no reports
    const projectReports = reports[folderName]?.[projectName] || []
    if (projectReports.length > 0) return

    setProjects((prev) => ({
      ...prev,
      [folderName]: (prev[folderName] || []).filter((project) => project.name !== projectName),
    }))

    // Clean up reports reference
    setReports((prev) => {
      const folderReports = prev[folderName] || {}
      const updatedFolderReports = { ...folderReports }
      delete updatedFolderReports[projectName]

      return {
        ...prev,
        [folderName]: updatedFolderReports,
      }
    })
  }

  const addReport = (folderName: string, projectName: string, reportName: string) => {
    const today = formatDate(new Date())
    const newReport: Report = {
      id: String(Date.now()),
      name: reportName.trim(),
      status: "Draft",
      complete: 0,
      lastModified: today,
      modifiedBy: "Current User",
    }
    
    setReports((prev) => ({
      ...prev,
      [folderName]: {
        ...(prev[folderName] || {}),
        [projectName]: [newReport, ...(prev[folderName]?.[projectName] || [])],
      },
    }))
  }

  return (
    <ReportsContext.Provider value={{ 
      folders: foldersWithCounts, 
      addFolder,
      renameFolder,
      deleteFolder,
      getProjectsForFolder,
      addProject,
      renameProject,
      deleteProject,
      getReportsForProject,
      addReport,
    }}>
      {children}
    </ReportsContext.Provider>
  )
}

export function useReports() {
  const context = useContext(ReportsContext)
  if (context === undefined) {
    throw new Error("useReports must be used within a ReportsProvider")
  }
  return context
}
