"use client"

import dynamic from "next/dynamic"
import { ReactNode } from "react"

// Dynamically import SessionProvider with ssr disabled to prevent build errors
const SessionProvider = dynamic(
  () => import("next-auth/react").then((mod) => mod.SessionProvider),
  { ssr: false }
)

export default function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  return <SessionProvider>{children}</SessionProvider>
}
