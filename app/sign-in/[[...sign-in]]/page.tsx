import { SignIn } from "@clerk/nextjs"

import { AuthSplitShell } from "@/components/auth/auth-split-shell"

const signInAppearance = {
  elements: {
    rootBox: "w-full font-sans",
    card: "font-sans shadow-none",
  },
} as const

export default function SignInPage() {
  return (
    <AuthSplitShell>
      <SignIn appearance={signInAppearance} />
    </AuthSplitShell>
  )
}
