"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ItemType = "folder" | "project"

// A node in the tree. Folders contain other items (subfolders + projects);
// projects contain reports. Counts are NEVER stored — they are always derived
// from the actual children so the data can never be inconsistent.
export interface Item {
  id: string
  name: string
  type: ItemType
  created: string
  createdBy: string
}

export interface ItemWithCounts extends Item {
  items: number // derived: # of children (folder) or # of reports (project)
  lastUpdated: string // derived: most recent report date among descendants
}

export interface Report {
  id: string
  name: string
  status: "Draft" | "Data Entry" | "Review" | "Final"
  complete: number
  lastModified: string
  modifiedBy: string
}

// Persisted sort state so a user's sort selection survives navigation.
type SortDirection = "asc" | "desc"
interface SortState {
  field: string | null
  direction: SortDirection
}

// The constant parent key used for the root ("All Reports") level.
export const ROOT_PARENT = "__root__"

interface ReportsContextType {
  // Read
  getRootItems: () => ItemWithCounts[]
  getFolderItems: (folderName: string) => ItemWithCounts[]
  getReportsForProject: (parentName: string, projectName: string) => Report[]
  // Mutate
  addItem: (parentName: string, name: string, type: ItemType) => void
  renameItem: (parentName: string, oldName: string, newName: string) => void
  deleteItem: (parentName: string, name: string) => void
  addReport: (parentName: string, projectName: string, reportName: string) => void
  // Sort persistence
  getSort: (key: string) => SortState
  setSort: (key: string, field: string | null, direction: SortDirection) => void
}

// ---------------------------------------------------------------------------
// Deterministic helpers
// ---------------------------------------------------------------------------

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
function formatDate(date: Date): string {
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

function seededRandom(seed: number): () => number {
  let s = seed % 233280
  if (s <= 0) s += 233280
  return function () {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

function hashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = s.charCodeAt(i) + ((h << 5) - h)
  }
  return Math.abs(h)
}

const AUTHORS = [
  "Sarah Chen",
  "Michael Torres",
  "James Liu",
  "Emily Watson",
  "Amanda Foster",
  "David Kim",
  "Rachel Green",
]

// Deterministic created date + author derived from a name (stable across renders).
function makeMeta(name: string): { created: string; createdBy: string } {
  const r = seededRandom(hashStr(name) + 7)
  const year = 2014 + Math.floor(r() * 10) // 2014–2023
  const month = Math.floor(r() * 12)
  const day = Math.floor(r() * 28) + 1
  return {
    created: formatDate(new Date(year, month, day)),
    createdBy: AUTHORS[Math.floor(r() * AUTHORS.length)],
  }
}

function makeItem(name: string, type: ItemType): Item {
  const meta = makeMeta(name)
  return { id: `seed-${hashStr(name)}-${type}`, name, type, ...meta }
}

// Deterministically generate reports for a project.
function seedReports(projectName: string, count: number, year: number): Report[] {
  const random = seededRandom(hashStr(projectName) + year)
  const statuses: Array<Report["status"]> = ["Draft", "Data Entry", "Review", "Final"]
  const reports: Report[] = []
  for (let i = 0; i < count; i++) {
    const month = (12 - (i % 12) - 1 + 12) % 12
    const adjustedYear = year - Math.floor(i / 12)
    const day = Math.floor(random() * 28) + 1
    const status = statuses[Math.min(Math.floor(random() * 4), 3)]
    const complete = status === "Final" ? 100 : Math.floor(random() * 80) + 10
    reports.push({
      id: `${projectName}-r${i}`,
      name: `${projectName} - Report ${i + 1}`,
      status,
      complete,
      lastModified: formatDate(new Date(adjustedYear, month, day)),
      modifiedBy: AUTHORS[Math.floor(random() * AUTHORS.length)],
    })
  }
  return reports
}

// ---------------------------------------------------------------------------
// Seed data — the year folders keep their curated project names; one project
// keeps a fully curated report list. Everything else is generated
// deterministically. Counts are derived, so they are always consistent.
// ---------------------------------------------------------------------------

const projects2015 = [
  "Phase II ESA - Industrial Site A",
  "Phase I ESA - 4400 Harbor Boulevard",
  "Phase I ESA - Oakwood Business Park",
  "Phase I ESA - 1200 Riverside Drive",
  "Phase I ESA - Former Dry Cleaner Site",
  "Phase II ESA - Riverfront Redevelopment",
  "Asbestos Survey - City Hall Annex",
  "Asbestos Survey - Lincoln Elementary School",
  "Asbestos Survey - Harborview Community Center",
  "Lead Paint Assessment - 800 Commerce Street",
  "Lead Paint Assessment - Municipal Services Building",
  "Mold Assessment - Westfield Office Complex",
  "Soil Contamination Study - Mill Road Corridor",
  "Soil Contamination Study - East Industrial Depot",
  "Remediation Report - Bayside Manufacturing",
  "Remediation Report - North County Landfill",
  "Groundwater Monitoring - Eastside Plume",
  "Groundwater Monitoring - Former Gas Station Network",
  "Air Quality Monitoring - Port District Q1",
  "Air Quality Monitoring - Port District Q2",
  "Wetlands Delineation - Creekside Development",
  "Wetlands Delineation - Highway 9 Expansion Zone",
  "NEPA Review - Regional Transit Corridor",
  "Cultural Resources Survey - Old Town District",
  "Noise Impact Study - Airport Perimeter",
  "Traffic Impact Assessment - Downtown Mixed Use",
  "Geotechnical Report - Bayview Bridge Replacement",
  "Hazmat Assessment - Warehouse District Block 4",
]

// Fully curated reports for the flagship project.
const reportsPhaseII: Report[] = [
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
]

// Curated project names for the other year folders (counts derive from length).
const yearProjectNames: Record<string, string[]> = {
  "2016 Reports": [
    "Phase I ESA - Downtown Redevelopment",
    "Phase II ESA - Former Manufacturing Plant",
    "Asbestos Survey - County Courthouse",
    "Lead Paint Assessment - Historic District",
    "Soil Vapor Survey - Tech Campus",
    "Groundwater Investigation - Marina District",
    "Remediation Oversight - Fuel Station",
    "NEPA Documentation - Highway 101 Expansion",
    "Wetlands Survey - Coastal Preserve",
    "Air Quality Monitoring - Industrial Corridor Q1",
    "Air Quality Monitoring - Industrial Corridor Q2",
    "Hazmat Assessment - Rail Yard",
  ],
  "2017 Reports": [
    "Phase I ESA - Sunrise Business Park",
    "Phase II ESA - Waterfront Complex",
    "Asbestos Survey - Memorial Hospital Wing",
    "Mold Assessment - University Library",
    "Soil Contamination Study - Transit Hub",
    "Groundwater Monitoring - Aerospace Facility",
    "Risk Assessment - Brownfield Site",
    "Cultural Resources Survey - Heritage Park",
  ],
  "2018 Reports": [],
  "2019 Reports": [
    "Phase I ESA - Logistics Center",
    "Asbestos Abatement Plan - Power Plant",
    "Soil Assessment - Agricultural Conversion",
    "Groundwater Treatment System Design",
    "Air Emissions Inventory - Manufacturing",
    "Noise Impact Study - Airport Expansion",
    "Traffic Analysis - Distribution Center",
  ],
  "2020 Reports": [
    "Phase I ESA - Data Center Campus",
    "Phase II ESA - Former Gas Station Network",
    "Indoor Air Quality Study - Office Tower",
    "Contamination Assessment - Landfill Adjacent",
    "Wetlands Delineation - Solar Farm Site",
  ],
  "2021 Reports": [
    "Phase I ESA - Electric Vehicle Facility",
    "Phase II ESA - Urban Infill Project",
    "Asbestos Survey - Convention Center",
    "Soil Vapor Extraction Design",
    "Groundwater Monitoring - Plume Migration",
    "CEQA Documentation - Transit Village",
    "Hazmat Closure - Industrial Warehouse",
    "Remedial Action Plan - TCE Site",
    "Risk Communication Plan - Community",
  ],
  "2022 Reports": [
    "Phase I ESA - Biotech Campus",
    "Lead Assessment - Affordable Housing",
    "Mold Remediation Plan - Flood Damage",
    "Air Quality Permit - Food Processing",
    "Stormwater Compliance - Warehouse District",
    "Environmental Monitoring - Construction",
    "Geotechnical Investigation - High Rise",
  ],
  "2023 Reports": [
    "Phase I ESA - Mixed Use Tower",
    "Phase II ESA - Petroleum Contamination",
    "PFAS Investigation - Water Supply",
    "Vapor Barrier Design - Residential",
    "Groundwater Treatment Optimization",
    "Environmental Due Diligence - Portfolio",
    "Closure Report - Voluntary Cleanup",
    "Sustainability Assessment - Campus",
  ],
  "2024 Reports": [
    "Phase I ESA - Renewable Energy Site",
    "PFAS Remediation Feasibility Study",
    "Indoor Environmental Quality - Retrofit",
    "Brownfield Redevelopment Plan",
    "Climate Resilience Assessment",
    "Environmental Compliance Audit",
  ],
  "2025 Reports": [
    "Phase I ESA - Innovation District",
    "Environmental Impact Report - Transit",
    "Emerging Contaminants Study",
  ],
}

// Root-level projects (live directly under "All Reports", no parent folder).
const rootProjectSeeds: Array<{ name: string; reports: number; year: number }> = [
  { name: "Brownfield Redevelopment - Site 4", reports: 8, year: 2024 },
  { name: "Former Rail Yard Assessment", reports: 12, year: 2023 },
  { name: "Coastal Wetlands Restoration Project", reports: 0, year: 2025 },
]

// Themed folders that get deterministically generated project children.
const themedFolderSeeds: Array<{ name: string; count: number; year: number }> = [
  { name: "Environmental Assessments", count: 7, year: 2022 },
  { name: "Site Investigations", count: 6, year: 2021 },
  { name: "Remediation Projects", count: 9, year: 2023 },
  { name: "Air Quality Studies", count: 4, year: 2020 },
  { name: "Water Quality Reports", count: 5, year: 2019 },
  { name: "Hazardous Materials", count: 3, year: 2018 },
  { name: "Compliance Documents", count: 6, year: 2024 },
  { name: "Risk Assessments", count: 5, year: 2022 },
  { name: "Monitoring Reports", count: 8, year: 2021 },
  { name: "Client: Acme Corp", count: 6, year: 2023 },
  { name: "Client: Beta Industries", count: 4, year: 2020 },
  { name: "Templates & Standards", count: 3, year: 2017 },
]

// Subfolders nested inside other folders (demonstrates the folder-in-folder model).
const subfolderSeeds: Array<{ parent: string; name: string; count: number; year: number }> = [
  { parent: "Site Investigations", name: "Pre-2015 Archive", count: 4, year: 2013 },
  { parent: "Remediation Projects", name: "Closed Cases", count: 3, year: 2019 },
]

const TYPE_POOL = [
  "Phase I ESA",
  "Phase II ESA",
  "Asbestos Survey",
  "Lead Paint Assessment",
  "Soil Vapor Survey",
  "Groundwater Monitoring",
  "Remediation Oversight",
  "Air Quality Study",
  "Wetlands Delineation",
]
const SITE_POOL = [
  "Harbor Industrial Park",
  "Riverside Complex",
  "Downtown Lot 7",
  "Oakwood Terminal",
  "Mill Creek Site",
  "Eastgate Facility",
  "Cedar Junction",
  "Maple Avenue Depot",
  "Lakeshore Property",
  "Pine Hollow Yard",
  "Granite Quarry",
  "Sunset Commerce Center",
]

function generateProjectNames(folderName: string, count: number): string[] {
  const offset = hashStr(folderName) % SITE_POOL.length
  const names: string[] = []
  for (let i = 0; i < count; i++) {
    const type = TYPE_POOL[i % TYPE_POOL.length]
    const site = SITE_POOL[(i + offset) % SITE_POOL.length]
    names.push(`${type} - ${site}`)
  }
  return names
}

interface SeedResult {
  rootItems: Item[]
  childrenByParent: Record<string, Item[]>
  reportsByPath: Record<string, Report[]>
}

function buildSeed(): SeedResult {
  const rootItems: Item[] = []
  const childrenByParent: Record<string, Item[]> = {}
  const reportsByPath: Record<string, Report[]> = {}

  // 1) Root-level projects
  rootProjectSeeds.forEach((rp) => {
    rootItems.push(makeItem(rp.name, "project"))
    reportsByPath[`${ROOT_PARENT}/${rp.name}`] = seedReports(rp.name, rp.reports, rp.year)
  })

  // Helper to register a project under a parent with generated reports.
  const addProjectChild = (parent: string, projectName: string, reportCount: number, year: number) => {
    childrenByParent[parent] = childrenByParent[parent] || []
    childrenByParent[parent].push(makeItem(projectName, "project"))
    reportsByPath[`${parent}/${projectName}`] = seedReports(projectName, reportCount, year)
  }

  // 2) Year folders with curated project lists
  const registerYearFolder = (folderName: string, names: string[], year: number, curated?: Record<string, Report[]>) => {
    rootItems.push(makeItem(folderName, "folder"))
    childrenByParent[folderName] = []
    const random = seededRandom(year * 1000 + 3)
    names.forEach((projectName) => {
      childrenByParent[folderName].push(makeItem(projectName, "project"))
      if (curated && curated[projectName]) {
        reportsByPath[`${folderName}/${projectName}`] = curated[projectName]
      } else {
        const count = Math.floor(random() * 7) + 2 // 2–8 reports
        reportsByPath[`${folderName}/${projectName}`] = seedReports(projectName, count, year)
      }
    })
  }

  // Flagship 2015 folder: one curated project, one intentionally empty, rest generated.
  registerYearFolder("2015 Reports", projects2015, 2015, {
    "Phase II ESA - Industrial Site A": reportsPhaseII,
    "Phase I ESA - Oakwood Business Park": [], // intentionally empty (0 reports)
  })

  Object.entries(yearProjectNames).forEach(([folderName, names]) => {
    const year = parseInt(folderName.slice(0, 4), 10) || 2020
    registerYearFolder(folderName, names, year)
  })

  // 3) Themed folders with generated children
  themedFolderSeeds.forEach((tf) => {
    rootItems.push(makeItem(tf.name, "folder"))
    childrenByParent[tf.name] = childrenByParent[tf.name] || []
    const random = seededRandom(hashStr(tf.name) + tf.year)
    generateProjectNames(tf.name, tf.count).forEach((projectName) => {
      const count = Math.floor(random() * 7) + 2
      addProjectChild(tf.name, projectName, count, tf.year)
    })
  })

  // 4) Subfolders nested inside existing folders
  subfolderSeeds.forEach((sf) => {
    childrenByParent[sf.parent] = childrenByParent[sf.parent] || []
    childrenByParent[sf.parent].push(makeItem(sf.name, "folder"))
    childrenByParent[sf.name] = childrenByParent[sf.name] || []
    const random = seededRandom(hashStr(sf.name) + sf.year)
    generateProjectNames(sf.name, sf.count).forEach((projectName) => {
      const count = Math.floor(random() * 6) + 2
      addProjectChild(sf.name, projectName, count, sf.year)
    })
  })

  // Pin "2015 Reports" and "2016 Reports" to the top of the root listing.
  const pinnedNames = ["2015 Reports", "2016 Reports"]
  const pinned = pinnedNames
    .map((name) => rootItems.find((item) => item.name === name))
    .filter((item): item is Item => Boolean(item))
  const rest = rootItems.filter((item) => !pinnedNames.includes(item.name))
  const orderedRootItems = [...pinned, ...rest]

  return { rootItems: orderedRootItems, childrenByParent, reportsByPath }
}

const SEED = buildSeed()

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const ReportsContext = createContext<ReportsContextType | undefined>(undefined)

export function ReportsProvider({ children }: { children: ReactNode }) {
  const [rootItems, setRootItems] = useState<Item[]>(SEED.rootItems)
  const [childrenByParent, setChildrenByParent] = useState<Record<string, Item[]>>(SEED.childrenByParent)
  const [reportsByPath, setReportsByPath] = useState<Record<string, Report[]>>(SEED.reportsByPath)

  const today = formatDate(new Date())

  // Collect every report under a folder, recursing through subfolders.
  const collectReports = useCallback(
    (folderName: string, seen = new Set<string>()): Report[] => {
      if (seen.has(folderName)) return []
      seen.add(folderName)
      const acc: Report[] = []
      const kids = childrenByParent[folderName] || []
      for (const kid of kids) {
        if (kid.type === "project") {
          acc.push(...(reportsByPath[`${folderName}/${kid.name}`] || []))
        } else {
          acc.push(...collectReports(kid.name, seen))
        }
      }
      return acc
    },
    [childrenByParent, reportsByPath],
  )

  const mostRecent = useCallback(
    (reports: Report[]): string => {
      if (reports.length === 0) return today
      const times = reports
        .map((r) => new Date(r.lastModified).getTime())
        .filter((t) => !isNaN(t))
      if (times.length === 0) return today
      return formatDate(new Date(Math.max(...times)))
    },
    [today],
  )

  // Map a raw Item to an ItemWithCounts under a given parent.
  const decorate = useCallback(
    (item: Item, parentName: string): ItemWithCounts => {
      if (item.type === "project") {
        const reports = reportsByPath[`${parentName}/${item.name}`] || []
        return { ...item, items: reports.length, lastUpdated: mostRecent(reports) }
      }
      const kids = childrenByParent[item.name] || []
      return { ...item, items: kids.length, lastUpdated: mostRecent(collectReports(item.name)) }
    },
    [reportsByPath, childrenByParent, collectReports, mostRecent],
  )

  const getRootItems = useCallback(
    (): ItemWithCounts[] => rootItems.map((item) => decorate(item, ROOT_PARENT)),
    [rootItems, decorate],
  )

  const getFolderItems = useCallback(
    (folderName: string): ItemWithCounts[] =>
      (childrenByParent[folderName] || []).map((item) => decorate(item, folderName)),
    [childrenByParent, decorate],
  )

  const getReportsForProject = useCallback(
    (parentName: string, projectName: string): Report[] =>
      reportsByPath[`${parentName || ROOT_PARENT}/${projectName}`] || [],
    [reportsByPath],
  )

  // -------------------------- Mutations --------------------------

  const addItem = useCallback((parentName: string, name: string, type: ItemType) => {
    const trimmed = name.trim()
    if (!trimmed) return
    const meta = makeMeta(trimmed)
    const newItem: Item = { id: String(Date.now()), name: trimmed, type, ...meta, created: today }
    if (parentName === ROOT_PARENT) {
      setRootItems((prev) => [newItem, ...prev])
    } else {
      setChildrenByParent((prev) => ({
        ...prev,
        [parentName]: [newItem, ...(prev[parentName] || [])],
      }))
    }
    if (type === "folder") {
      setChildrenByParent((prev) => ({ ...prev, [trimmed]: prev[trimmed] || [] }))
    }
  }, [today])

  const renameItem = useCallback((parentName: string, oldName: string, newName: string) => {
    const trimmed = newName.trim()
    if (!trimmed || trimmed === oldName) return

    const renameInList = (list: Item[]) =>
      list.map((it) => (it.name === oldName ? { ...it, name: trimmed } : it))

    if (parentName === ROOT_PARENT) {
      setRootItems((prev) => renameInList(prev))
    } else {
      setChildrenByParent((prev) => ({ ...prev, [parentName]: renameInList(prev[parentName] || []) }))
    }

    // Re-key any children / reports that referenced the old name as a parent.
    setChildrenByParent((prev) => {
      if (!prev[oldName]) return prev
      const updated = { ...prev }
      updated[trimmed] = updated[oldName]
      delete updated[oldName]
      return updated
    })
    setReportsByPath((prev) => {
      const updated: Record<string, Report[]> = {}
      for (const [key, value] of Object.entries(prev)) {
        if (key.startsWith(`${oldName}/`)) {
          updated[`${trimmed}/${key.slice(oldName.length + 1)}`] = value
        } else if (key === `${parentName}/${oldName}`) {
          updated[`${parentName}/${trimmed}`] = value
        } else {
          updated[key] = value
        }
      }
      return updated
    })
  }, [])

  const deleteItem = useCallback((parentName: string, name: string) => {
    const removeFromList = (list: Item[]) => list.filter((it) => it.name !== name)
    if (parentName === ROOT_PARENT) {
      setRootItems((prev) => removeFromList(prev))
    } else {
      setChildrenByParent((prev) => ({ ...prev, [parentName]: removeFromList(prev[parentName] || []) }))
    }
    setChildrenByParent((prev) => {
      if (!(name in prev)) return prev
      const updated = { ...prev }
      delete updated[name]
      return updated
    })
    setReportsByPath((prev) => {
      const updated: Record<string, Report[]> = {}
      for (const [key, value] of Object.entries(prev)) {
        if (key === `${parentName}/${name}` || key.startsWith(`${name}/`)) continue
        updated[key] = value
      }
      return updated
    })
  }, [])

  const addReport = useCallback((parentName: string, projectName: string, reportName: string) => {
    const trimmed = reportName.trim()
    if (!trimmed) return
    const newReport: Report = {
      id: String(Date.now()),
      name: trimmed,
      status: "Draft",
      complete: 0,
      lastModified: today,
      modifiedBy: "Current User",
    }
    const key = `${parentName || ROOT_PARENT}/${projectName}`
    setReportsByPath((prev) => ({ ...prev, [key]: [newReport, ...(prev[key] || [])] }))
  }, [today])

  // -------------------------- Sort persistence --------------------------

  const [sortByKey, setSortByKey] = useState<Record<string, SortState>>({})

  const getSort = useCallback(
    (key: string): SortState => sortByKey[key] ?? { field: null, direction: "asc" },
    [sortByKey],
  )

  const setSort = useCallback((key: string, field: string | null, direction: SortDirection) => {
    setSortByKey((prev) => ({ ...prev, [key]: { field, direction } }))
  }, [])

  return (
    <ReportsContext.Provider
      value={{
        getRootItems,
        getFolderItems,
        getReportsForProject,
        addItem,
        renameItem,
        deleteItem,
        addReport,
        getSort,
        setSort,
      }}
    >
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
