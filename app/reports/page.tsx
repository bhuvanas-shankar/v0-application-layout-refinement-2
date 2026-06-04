"use client"

import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Avatar color variations with WCAG AA compliant foreground colors
const avatarColors = [
  { bg: "#221A4E", text: "white" },      // Navy - white text
  { bg: "#43AA8B", text: "white" },      // Green - white text
  { bg: "#7C3AED", text: "white" },      // Purple - white text
  { bg: "#0891B2", text: "white" },      // Cyan - white text
  { bg: "#DC2626", text: "white" },      // Red - white text
  { bg: "#CA8A04", text: "#221A4E" },    // Amber - navy text
]

const reports = [
  {
    id: "1",
    name: "Environmental Site Assessment - 123 Main St",
    status: "Data Entry",
    percentComplete: 55,
    lastModified: "May 6, 2026",
    author: { name: "Sarah Chen", initials: "SC", colorIndex: 0 },
  },
  {
    id: "2",
    name: "Quarterly Compliance Review Q1 2026",
    status: "Review",
    percentComplete: 85,
    lastModified: "May 5, 2026",
    author: { name: "Michael Torres", initials: "MT", colorIndex: 1 },
  },
  {
    id: "3",
    name: "R&D Tax Credit Analysis - FY2025",
    status: "Draft",
    percentComplete: 20,
    lastModified: "May 4, 2026",
    author: { name: "Emily Watson", initials: "EW", colorIndex: 2 },
  },
  {
    id: "4",
    name: "Soil Contamination Assessment - Industrial Park",
    status: "Final",
    percentComplete: 100,
    lastModified: "May 3, 2026",
    author: { name: "James Liu", initials: "JL", colorIndex: 3 },
  },
  {
    id: "5",
    name: "Groundwater Monitoring Report - Site B",
    status: "Data Entry",
    percentComplete: 45,
    lastModified: "May 2, 2026",
    author: { name: "Amanda Foster", initials: "AF", colorIndex: 4 },
  },
  {
    id: "6",
    name: "Annual Environmental Audit 2026",
    status: "Review",
    percentComplete: 90,
    lastModified: "May 1, 2026",
    author: { name: "Sarah Chen", initials: "SC", colorIndex: 0 },
  },
]

function StatusBadge({ status }: { status: string }) {
  // Colors based on Quire design system:
  // Draft = light gray, Active (Data Entry) = navy, In Review = coral, Complete (Final) = navy
  const styles: Record<string, string> = {
    "Draft": "bg-[#E8E5E0] text-[#5C5752]",
    "Data Entry": "bg-[#221A4E] text-white",
    "Review": "bg-[#F87171] text-white",
    "Final": "bg-[#221A4E] text-white",
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  )
}

function CircularProgress({ percentage }: { percentage: number }) {
  const radius = 16
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference
  const strokeColor = percentage === 100 ? "#43AA8B" : "#FFC146"

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="44" height="44" className="-rotate-90">
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke="#D6D3E4"
          strokeWidth="4"
        />
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <span className="absolute text-xs font-medium text-quire-navy">
        {percentage}
      </span>
    </div>
  )
}

export default function ReportsPage() {
  const router = useRouter()

  const handleRowClick = (reportId: string) => {
    router.push(`/reports/${reportId}`)
  }

  return (
    <div className="flex flex-1 flex-col p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold text-quire-navy">
          All Reports
        </h1>
      </div>

      {/* Report List Table */}
      <div className="border border-[#D6D3E4] rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#F8F7FC] hover:bg-[#F8F7FC] border-[#D6D3E4]">
              <TableHead className="text-quire-navy font-medium">Report Name</TableHead>
              <TableHead className="text-quire-navy font-medium">Status</TableHead>
              <TableHead className="text-quire-navy font-medium">% Complete</TableHead>
              <TableHead className="text-quire-navy font-medium">Last Modified</TableHead>
              <TableHead className="text-quire-navy font-medium">Modified By</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((report) => (
              <TableRow 
                key={report.id} 
                className="border-[#D6D3E4] hover:bg-[#F8F7FC] cursor-pointer transition-colors duration-150 ease-out"
                onClick={() => handleRowClick(report.id)}
              >
                <TableCell className="py-3 max-w-xs align-middle">
                  <span className="text-quire-navy font-medium truncate block">
                    {report.name}
                  </span>
                </TableCell>
                <TableCell className="align-middle">
                  <StatusBadge status={report.status} />
                </TableCell>
                <TableCell className="align-middle">
                  <CircularProgress percentage={report.percentComplete} />
                </TableCell>
                <TableCell className="text-quire-navy align-middle">
                  {report.lastModified}
                </TableCell>
                <TableCell className="align-middle">
                  <div className="flex items-center gap-2">
                    <Avatar className="size-7">
                      <AvatarFallback 
                        className="text-xs"
                        style={{ 
                          backgroundColor: avatarColors[report.author.colorIndex].bg,
                          color: avatarColors[report.author.colorIndex].text 
                        }}
                      >
                        {report.author.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-quire-navy">{report.author.name}</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
