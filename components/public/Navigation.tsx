"use client"

import Link from "next/link"
import { Film } from "lucide-react"

export default function Navigation() {
  return (
    <nav className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Film className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">MovieReview AI</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-neutral-700 dark:text-neutral-300 hover:text-primary transition-colors"
            >
              Home
            </Link>
            <Link
              href="/movies"
              className="text-neutral-700 dark:text-neutral-300 hover:text-primary transition-colors"
            >
              Browse
            </Link>
            <Link
              href="/admin"
              className="text-neutral-700 dark:text-neutral-300 hover:text-primary transition-colors"
            >
              Admin
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 rounded-md text-neutral-700 dark:text-neutral-300">
            <svg
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
      </div>
    </nav>
  )
}
