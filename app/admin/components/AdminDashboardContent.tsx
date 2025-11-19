"use client"

import { useSession, signIn } from "next-auth/react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Film, Plus, Search, LogOut } from "lucide-react"

export default function AdminDashboardContent() {
  const { data: session, status } = useSession()
  const [movies, setMovies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (status === "authenticated") {
      fetchMovies()
    }
  }, [status])

  async function fetchMovies() {
    try {
      const res = await fetch("/api/movies")
      if (res.ok) {
        const data = await res.json()
        setMovies(data)
      }
    } catch (error) {
      console.error("Error fetching movies:", error)
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <div className="text-center max-w-md p-8 bg-white dark:bg-neutral-800 rounded-lg shadow-lg">
          <Film className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Admin Portal</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            Sign in with your Google account to access the admin dashboard.
          </p>
          <button
            onClick={() => signIn("google")}
            className="w-full bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-semibold"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    )
  }

  const filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Header */}
      <header className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Film className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold">Movie Review Admin</h1>
                <p className="text-sm text-neutral-500">Content Management System</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                {session?.user?.email}
              </span>
              <Link
                href="/"
                className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-primary"
              >
                View Site
              </Link>
              <button
                onClick={() => signIn()}
                className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow">
            <div className="text-2xl font-bold">{movies.length}</div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">Total Movies</div>
          </div>
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow">
            <div className="text-2xl font-bold">
              {movies.filter((m) => m.status === "PUBLISHED").length}
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">Published</div>
          </div>
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow">
            <div className="text-2xl font-bold">
              {movies.filter((m) => m.status === "DRAFT").length}
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">Drafts</div>
          </div>
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow">
            <div className="text-2xl font-bold">
              {movies.reduce((acc, m) => acc + (m._count?.reviews || 0), 0)}
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">Total Reviews</div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex justify-between items-center mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search movies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <Link
            href="/admin/movies/new"
            className="ml-4 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Movie
          </Link>
        </div>

        {/* Movies List */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading movies...</p>
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-neutral-800 rounded-lg">
            <p className="text-neutral-500 dark:text-neutral-400 mb-4">
              {searchTerm ? "No movies found matching your search." : "No movies yet. Create your first movie!"}
            </p>
            {!searchTerm && (
              <Link
                href="/admin/movies/new"
                className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Add Your First Movie
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
              <thead className="bg-neutral-50 dark:bg-neutral-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Movie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Year
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Reviews
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                {filteredMovies.map((movie) => (
                  <tr key={movie.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">{movie.title}</div>
                      <div className="text-sm text-neutral-500">{movie.genre.join(", ")}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {movie.releaseYear}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          movie.status === "PUBLISHED"
                            ? "bg-green-100 text-green-800"
                            : movie.status === "DRAFT"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {movie.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {movie._count?.reviews || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        href={`/admin/movies/${movie.id}`}
                        className="text-primary hover:text-primary/80 font-medium"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
