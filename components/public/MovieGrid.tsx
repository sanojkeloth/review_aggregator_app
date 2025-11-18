"use client"

import { useEffect, useState } from "react"
import MovieCard from "./MovieCard"

export default function MovieGrid() {
  const [movies, setMovies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMovies() {
      try {
        const res = await fetch("/api/public/movies?limit=12", {
          cache: "no-store",
        })

        if (res.ok) {
          const data = await res.json()
          setMovies(data.movies || [])
        }
      } catch (error) {
        console.error("Error fetching movies:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMovies()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-neutral-200 dark:bg-neutral-800 h-96 rounded-lg"></div>
          </div>
        ))}
      </div>
    )
  }

  if (movies.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-neutral-500 dark:text-neutral-400">
          No movies available yet. Check back soon!
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Latest Reviews</h2>
        <div className="flex gap-2">
          {/* Filter options can go here */}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {movies.map((movie: any) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  )
}
