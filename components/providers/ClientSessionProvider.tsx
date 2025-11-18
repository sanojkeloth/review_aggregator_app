"use client"

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"
import { ReactNode } from "react"

export default function ClientSessionProvider({
  children,
}: {
  children: ReactNode
}) {
  return (
    <NextAuthSessionProvider
      refetchInterval={0}
      refetchOnWindowFocus={false}
    >
      {children}
    </NextAuthSessionProvider>
  )
}
