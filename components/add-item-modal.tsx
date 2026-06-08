"use client"

import { useState, useEffect } from "react"
import { Folder, FolderOpen, Check } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export type ItemType = "folder" | "project"

interface AddItemModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Restrict the modal to a single creatable type. When omitted, the user can choose. */
  allowedTypes?: ItemType[]
  /** Default selected type when the modal opens. */
  defaultType?: ItemType
  /** Where the new item will be created, e.g. "All Reports" or a folder name. */
  location: string
  onCreate: (args: { type: ItemType; name: string; description?: string }) => void
}

const typeMeta: Record<ItemType, { label: string; description: string; icon: typeof Folder }> = {
  folder: {
    label: "Folder",
    description: "Organizes projects into a group",
    icon: Folder,
  },
  project: {
    label: "Project",
    description: "Holds the reports you work on",
    icon: FolderOpen,
  },
}

export function AddItemModal({
  open,
  onOpenChange,
  allowedTypes = ["folder", "project"],
  defaultType,
  location,
  onCreate,
}: AddItemModalProps) {
  const [type, setType] = useState<ItemType>(defaultType ?? allowedTypes[0])
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  // Reset internal state whenever the modal is (re)opened
  useEffect(() => {
    if (open) {
      setType(defaultType ?? allowedTypes[0])
      setName("")
      setDescription("")
    }
  }, [open, defaultType, allowedTypes])

  const trimmedName = name.trim()
  const isValid = trimmedName.length > 0
  const showTypeChooser = allowedTypes.length > 1

  const handleCreate = () => {
    if (!isValid) return
    onCreate({
      type,
      name: trimmedName,
      description: type === "project" ? description.trim() || undefined : undefined,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add new</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Type selector cards — stacked vertically */}
          {showTypeChooser && (
            <div className="space-y-2">
              {allowedTypes.map((t) => {
                const meta = typeMeta[t]
                const Icon = meta.icon
                const selected = type === t
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={cn(
                      "relative flex w-full items-center gap-3 rounded-lg p-4 text-left transition-colors",
                      selected
                        ? "border-2 border-[var(--quire-black)] bg-muted/50"
                        : "border-[0.5px] border-border hover:bg-muted/30",
                    )}
                    aria-pressed={selected}
                  >
                    <Icon className="size-6 shrink-0 text-foreground" />
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-medium text-foreground">{meta.label}</span>
                      <span className="block text-xs text-muted-foreground">{meta.description}</span>
                    </span>
                    {/* Radio indicator */}
                    <span
                      className={cn(
                        "flex size-4 shrink-0 items-center justify-center rounded-full border",
                        selected ? "border-[var(--quire-black)] bg-[var(--quire-black)]" : "border-border",
                      )}
                    >
                      {selected && <Check className="size-2.5 text-white" />}
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          {/* Name field */}
          <div className="space-y-2">
            <Label htmlFor="item-name" className="text-sm font-medium">
              Name
            </Label>
            <Input
              id="item-name"
              placeholder="Enter a name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && isValid) handleCreate()
              }}
              className="focus-visible:ring-[var(--quire-yellow)] focus-visible:border-[var(--quire-yellow)]"
              autoFocus
            />
            {/* Dynamic helper text: e.g. "Folder will be added to All Reports" */}
            <p className="text-sm text-muted-foreground">
              {typeMeta[type].label} will be added to {location}
            </p>
          </div>

          {/* Description field — projects only */}
          {type === "project" && (
            <div className="space-y-2">
              <Label htmlFor="item-description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="item-description"
                placeholder="Enter a description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="resize-none focus-visible:ring-[var(--quire-yellow)] focus-visible:border-[var(--quire-yellow)]"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!isValid}>
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
