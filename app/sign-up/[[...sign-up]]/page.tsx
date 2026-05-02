import { SignUp } from "@clerk/nextjs"

import { AuthSplitShell } from "@/components/auth/auth-split-shell"

const signUpAppearance = {
  elements: {
    rootBox: "w-full font-sans",
    card: "font-sans shadow-none",
  },
} as const

export default function SignUpPage() {
  return (
    <AuthSplitShell>
      <SignUp appearance={signUpAppearance} />
    </AuthSplitShell>
  )
}
