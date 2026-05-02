"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { flushSync } from "react-dom"
import { Copy, Loader2, Trash2, UserPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

export interface CollaboratorRow {
  id: string
  email: string
  createdAt: string
  displayName: string | null
  imageUrl: string | null
}

interface ShareDialogProps {
  projectId: string
  isOwner: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
}

function rowInitials(email: string, displayName: string | null): string {
  if (displayName) {
    const parts = displayName.trim().split(/\s+/)
    const a = parts[0]?.[0]
    const b = parts[1]?.[0]
    const pair = `${a ?? ""}${b ?? ""}`.toUpperCase()
    if (pair.length > 0) return pair
  }
  const local = email.split("@")[0] ?? email
  return local.slice(0, 2).toUpperCase() || "?"
}

async function fetchCollaboratorsFromApi(
  projectId: string,
  signal?: AbortSignal,
): Promise<CollaboratorRow[]> {
  const res = await fetch(`/api/projects/${projectId}/collaborators`, {
    signal,
  })
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(data.error ?? "Failed to load collaborators")
  }
  const data = (await res.json()) as { collaborators: CollaboratorRow[] }
  return data.collaborators
}

export function ShareDialog({
  projectId,
  isOwner,
  open,
  onOpenChange,
}: ShareDialogProps) {
  const [collaborators, setCollaborators] = useState<CollaboratorRow[]>([])
  const [loading, setLoading] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [invitePending, setInvitePending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [removePendingIds, setRemovePendingIds] = useState(
    () => new Set<string>(),
  )
  const copyTimeoutRef = useRef<number | null>(null)

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) {
        if (copyTimeoutRef.current !== null) {
          clearTimeout(copyTimeoutRef.current)
          copyTimeoutRef.current = null
        }
        setCopied(false)
        setInviteEmail("")
        setError(null)
        setRemovePendingIds(new Set())
      }
      onOpenChange(next)
    },
    [onOpenChange],
  )

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current !== null) {
        clearTimeout(copyTimeoutRef.current)
        copyTimeoutRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!open) return

    const ac = new AbortController()

    void (async () => {
      setLoading(true)
      setError(null)
      try {
        const rows = await fetchCollaboratorsFromApi(projectId, ac.signal)
        if (!ac.signal.aborted) {
          setCollaborators(rows)
        }
      } catch (e) {
        if (ac.signal.aborted) return
        setError(e instanceof Error ? e.message : "Something went wrong")
      } finally {
        if (!ac.signal.aborted) {
          setLoading(false)
        }
      }
    })()

    return () => ac.abort()
  }, [open, projectId])

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/editor/${projectId}`
      : ""

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      if (copyTimeoutRef.current !== null) {
        clearTimeout(copyTimeoutRef.current)
        copyTimeoutRef.current = null
      }
      setCopied(true)
      copyTimeoutRef.current = window.setTimeout(() => {
        copyTimeoutRef.current = null
        setCopied(false)
      }, 2000)
    } catch {
      setError("Could not copy link")
    }
  }

  const invite = async () => {
    if (!inviteEmail.trim() || invitePending) return
    setInvitePending(true)
    setError(null)
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        error?: string
        collaborator?: CollaboratorRow
      }
      if (!res.ok) {
        throw new Error(data.error ?? "Invite failed")
      }
      setInviteEmail("")
      const added = data.collaborator
      if (!added) {
        throw new Error("Invite succeeded without collaborator payload")
      }
      setCollaborators((prev) => [...prev, added])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invite failed")
    } finally {
      setInvitePending(false)
    }
  }

  const remove = async (collaboratorId: string) => {
    let acquired = false
    flushSync(() => {
      setRemovePendingIds((prev) => {
        if (prev.has(collaboratorId)) return prev
        acquired = true
        return new Set(prev).add(collaboratorId)
      })
    })
    if (!acquired) return

    setError(null)
    try {
      const res = await fetch(
        `/api/projects/${projectId}/collaborators/${collaboratorId}`,
        { method: "DELETE" },
      )
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(data.error ?? "Remove failed")
      }
      setCollaborators((prev) => prev.filter((c) => c.id !== collaboratorId))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Remove failed")
    } finally {
      setRemovePendingIds((prev) => {
        const next = new Set(prev)
        next.delete(collaboratorId)
        return next
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="rounded-3xl sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>Share project</DialogTitle>
          <DialogDescription>
            {isOwner
              ? "Invite collaborators by email. People you add can open this workspace from their editor."
              : "People who have access to this project."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Input
              readOnly
              value={shareUrl}
              className="font-mono text-xs"
              aria-label="Project link"
            />
            <Button
              type="button"
              variant="outline"
              className="shrink-0 gap-1.5"
              onClick={() => void copyLink()}
            >
              <Copy className="h-4 w-4" />
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>

          {error ? (
            <p className="text-xs text-error" role="alert">
              {error}
            </p>
          ) : null}

          {isOwner ? (
            <div className="flex gap-2">
              <Input
                placeholder="Email address"
                type="email"
                autoComplete="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    void invite()
                  }
                }}
              />
              <Button
                type="button"
                disabled={invitePending || !inviteEmail.trim()}
                onClick={() => void invite()}
                className="shrink-0 gap-1"
              >
                <UserPlus className="h-4 w-4" />
                Invite
              </Button>
            </div>
          ) : null}

          <div>
            <p className="mb-2 text-xs font-medium text-copy-muted">
              Collaborators
            </p>
            {loading ? (
              <p className="text-sm text-copy-muted">Loading…</p>
            ) : collaborators.length === 0 ? (
              <p className="text-sm text-copy-muted">No collaborators yet.</p>
            ) : (
              <ScrollArea className="max-h-56">
                <ul className="flex flex-col gap-2 pr-2">
                  {collaborators.map((c) => (
                    <li
                      key={c.id}
                      className="flex items-center gap-3 rounded-2xl border border-surface-border bg-elevated/60 px-3 py-2"
                    >
                      {c.imageUrl ? (
                        // Clerk CDN URLs vary by env; plain img avoids optimizer domain config.
                        // eslint-disable-next-line @next/next/no-img-element -- external Clerk avatar URLs
                        <img
                          src={c.imageUrl}
                          alt=""
                          className="h-9 w-9 rounded-full object-cover"
                          width={36}
                          height={36}
                        />
                      ) : (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-subtle text-xs font-medium text-copy-secondary">
                          {rowInitials(c.email, c.displayName)}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-copy-primary">
                          {c.displayName ?? c.email}
                        </p>
                        {c.displayName ? (
                          <p className="truncate text-xs text-copy-muted">
                            {c.email}
                          </p>
                        ) : null}
                      </div>
                      {isOwner ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="text-copy-muted hover:text-destructive"
                          aria-label={`Remove ${c.email}`}
                          disabled={removePendingIds.has(c.id)}
                          aria-busy={removePendingIds.has(c.id)}
                          onClick={() => void remove(c.id)}
                        >
                          {removePendingIds.has(c.id) ? (
                            <Loader2
                              className="h-4 w-4 animate-spin"
                              aria-hidden
                            />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
