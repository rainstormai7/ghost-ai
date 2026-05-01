"use client"

import { Plus, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ProjectSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function ProjectSidebar({ isOpen, onClose }: ProjectSidebarProps) {
  return (
    <div
      className={cn(
        "fixed left-0 top-0 z-40 flex h-full w-72 flex-col border-r border-surface-border bg-surface transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex items-center justify-between border-b border-surface-border px-4 py-3">
        <span className="text-sm font-semibold text-copy-primary">Projects</span>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden px-3 py-3">
        <Tabs defaultValue="my-projects" className="flex flex-1 flex-col">
          <TabsList className="w-full">
            <TabsTrigger value="my-projects" className="flex-1">
              Mr Projects
            </TabsTrigger>
            <TabsTrigger value="shared" className="flex-1">
              Shared
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="my-projects"
            className="flex flex-1 items-center justify-center"
          >
            <p className="text-sm text-copy-muted">No projects yet</p>
          </TabsContent>

          <TabsContent
            value="shared"
            className="flex flex-1 items-center justify-center"
          >
            <p className="text-sm text-copy-muted">No shared projects</p>
          </TabsContent>
        </Tabs>
      </div>

      <div className="border-t border-surface-border px-3 py-3">
        <Button variant="outline" className="w-full gap-2">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>
    </div>
  )
}
