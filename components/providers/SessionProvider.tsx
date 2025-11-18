"use client"

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"
import { ReactNode } from "react"

export default function SessionProvider({
  children,
}: {
  children: ReactNode
}) {
  // Skip SessionProvider during SSR/build to prevent context errors
  if (typeof window === "undefined") {
    return <>{children}</>
  }

  // Only use SessionProvider on client side
  return (
    <NextAuthSessionProvider
      refetchInterval={0}
      refetchOnWindowFocus={false}
    >
      {children}
    </NextAuthSessionProvider>
  )
}
