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
  /** Optional context label, e.g. the parent folder name. */
  parentName?: string
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
  parentName,
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
          <DialogTitle>Add {showTypeChooser ? "Item" : typeMeta[type].label}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Type chooser cards */}
          {showTypeChooser && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Type</Label>
              <div className="grid grid-cols-2 gap-3">
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
                        "relative flex flex-col items-center gap-2 rounded-lg border p-4 text-center transition-colors",
                        selected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40 hover:bg-muted/50",
                      )}
                      aria-pressed={selected}
                    >
                      {/* Centered radio indicator */}
                      <span
                        className={cn(
                          "absolute right-2 top-2 flex size-4 items-center justify-center rounded-full border",
                          selected ? "border-primary bg-primary" : "border-border",
                        )}
                      >
                        {selected && <Check className="size-2.5 text-primary-foreground" />}
                      </span>
                      <Icon className="size-6 text-primary" />
                      <span className="text-sm font-medium text-foreground">{meta.label}</span>
                      <span className="text-xs text-muted-foreground leading-snug">
                        {meta.description}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Name field */}
          <div className="space-y-2">
            <Label htmlFor="item-name" className="text-sm font-medium">
              Name
            </Label>
            <Input
              id="item-name"
              placeholder={`Enter ${typeMeta[type].label.toLowerCase()} name...`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && isValid) handleCreate()
              }}
              className="focus-visible:ring-[var(--quire-yellow)] focus-visible:border-[var(--quire-yellow)]"
              autoFocus
            />
            {trimmedName ? (
              <p className="text-sm text-muted-foreground">
                {trimmedName} - {typeMeta[type].label}
              </p>
            ) : parentName ? (
              <p className="text-sm text-muted-foreground">
                This {typeMeta[type].label.toLowerCase()} will be created inside {parentName}.
              </p>
            ) : null}
          </div>

          {/* Description field — projects only */}
          {type === "project" && (
            <div className="space-y-2">
              <Label htmlFor="item-description" className="text-sm font-medium">
                Description
                <span className="ml-1 font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="item-description"
                placeholder="Add a short description..."
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
            Add {typeMeta[type].label}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
