import { AuthMarketingAside } from "./auth-marketing-aside"

interface AuthSplitShellProps {
  children: React.ReactNode
}

/**
 * Auth shell: left charcoal (`bg-surface`) vs right pitch-black (`bg-base`) on lg.
 * Clerk column is top-aligned with matching horizontal padding as the aside; the
 * form is offset so the card top aligns with the headline (logo row height + mb-10).
 */
export function AuthSplitShell({ children }: AuthSplitShellProps) {
  return (
    <div className="flex min-h-screen flex-col font-sans antialiased lg:flex-row">
      {/* Left: marketing on elevated charcoal */}
      <div className="hidden lg:flex lg:w-[55%] lg:shrink-0 lg:flex-col lg:justify-between lg:bg-surface">
        <AuthMarketingAside />
      </div>

      {/* Right: Clerk on pure base black */}
      <div className="flex flex-1 flex-col bg-base lg:w-[45%]">
        <header className="border-b border-surface-border bg-surface px-4 py-3 lg:hidden">
          <div className="flex items-center gap-2.5">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-brand text-[10px] font-bold text-black">
              G
            </span>
            <span className="text-sm font-semibold tracking-tight text-copy-primary">
              Ghost AI
            </span>
          </div>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-8 lg:items-stretch lg:justify-start lg:px-14 lg:pb-16 lg:pt-24">
          <div className="w-full max-w-md lg:mt-17">{children}</div>
        </div>
      </div>
    </div>
  )
}
