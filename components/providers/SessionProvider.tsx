"use client"

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"
import { ReactNode, useEffect, useState } from "react"

export default function SessionProvider({
  children,
}: {
  children: ReactNode
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // During SSR and initial render, just return children without SessionProvider
  if (!mounted) {
    return <>{children}</>
  }

  // Only render SessionProvider on client side after mount
  return (
    <NextAuthSessionProvider
      refetchInterval={0}
      refetchOnWindowFocus={false}
    >
      {children}
    </NextAuthSessionProvider>
  )
}
