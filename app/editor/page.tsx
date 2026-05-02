"use client"

import { useState } from "react"
import { EditorNavbar } from "@/components/editor/editor-navbar"
import { ProjectSidebar } from "@/components/editor/project-sidebar"

export default function EditorPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="relative h-screen bg-base overflow-hidden">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onSidebarToggle={() => setIsSidebarOpen((prev) => !prev)}
      />
      <ProjectSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <main className="flex h-full items-center justify-center pt-12">
        <p className="text-copy-muted text-sm">Canvas coming soon</p>
      </main>
    </div>
  )
}
