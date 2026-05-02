import Link from "next/link"
import { Lock } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function AccessDenied() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-base px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-surface-border bg-surface text-copy-muted">
          <Lock className="h-7 w-7" aria-hidden />
        </div>
        <div className="max-w-sm space-y-2">
          <h1 className="font-heading text-lg font-medium text-copy-primary">
            No access to this project
          </h1>
          <p className="text-sm text-copy-muted">
            You don&apos;t have permission to open this workspace, or it doesn&apos;t exist.
          </p>
        </div>
      </div>
      <Link href="/editor" className={cn(buttonVariants({ variant: "outline" }))}>
        Back to editor
      </Link>
    </div>
  )
}
