"use client"

import dynamic from "next/dynamic"
import { ReactNode } from "react"

// Dynamically import the actual SessionProvider with ssr disabled
// This prevents it from being evaluated during build/SSR
const ClientSessionProvider = dynamic(
  () => import("./ClientSessionProvider"),
  { ssr: false }
)

export default function SessionProvider({
  children,
}: {
  children: ReactNode
}) {
  // During SSR, just return children
  if (typeof window === "undefined") {
    return <>{children}</>
  }

  // On client side, use the dynamically imported provider
  return <ClientSessionProvider>{children}</ClientSessionProvider>
}
