import type { LucideIcon } from "lucide-react"
import { Cpu, FileText, Users } from "lucide-react"

const features: { title: string; description: string; icon: LucideIcon }[] = [
  {
    title: "AI Architecture Generation",
    description:
      "Describe your system. AI maps it to nodes and edges on a live canvas.",
    icon: Cpu,
  },
  {
    title: "Real-time Collaboration",
    description:
      "Live cursors, presence indicators, and shared node editing across your team.",
    icon: Users,
  },
  {
    title: "Instant Spec Generation",
    description:
      "Export a complete Markdown technical spec directly from the canvas graph.",
    icon: FileText,
  },
]

export function AuthMarketingAside() {
  return (
    <aside className="flex h-full w-full flex-col justify-between px-10 py-12 lg:px-14 lg:pb-16 lg:pt-24">
      <div className="max-w-sm">
        <div className="mb-10 flex items-center gap-2.5">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-brand text-[11px] font-bold text-black">
            G
          </span>
          <span className="text-sm font-semibold tracking-tight text-copy-primary">
            Ghost AI
          </span>
        </div>

        <h1 className="text-balance text-4xl font-bold leading-[1.15] tracking-tight text-copy-primary sm:text-5xl">
          Design systems at the speed of thought.
        </h1>
        <p className="mt-4 text-pretty text-sm leading-relaxed text-copy-secondary sm:text-[0.9375rem]">
          Describe your architecture in plain English. Ghost AI maps it to a
          shared canvas your whole team can refine in real time.
        </p>

        <ul className="mt-8 space-y-6">
          {features.map(({ title, description, icon: Icon }) => (
            <li key={title} className="flex gap-4">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand/15 text-brand ring-1 ring-brand/30">
                <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold text-copy-primary">
                  {title}
                </p>
                <p className="mt-0.5 text-sm leading-relaxed text-copy-muted">
                  {description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-12 text-xs text-copy-faint">
        © {new Date().getFullYear()} Ghost AI. All rights reserved.
      </p>
    </aside>
  )
}
