"use client"

import dynamic from "next/dynamic"

// Dynamically import the admin dashboard content with ssr disabled
// This prevents next-auth/react from being evaluated during build
const AdminDashboardContent = dynamic(
  () => import("./components/AdminDashboardContent"),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    )
  }
)

export default function AdminDashboard() {
  return <AdminDashboardContent />
}
