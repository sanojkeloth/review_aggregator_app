import MovieCard from "./MovieCard"

async function getMovies() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
    const res = await fetch(`${baseUrl}/api/public/movies?limit=12`, {
      cache: "no-store",
    })

    if (!res.ok) {
      throw new Error("Failed to fetch movies")
    }

    return res.json()
  } catch (error) {
    console.error("Error fetching movies:", error)
    return { movies: [], pagination: { page: 1, limit: 12, total: 0, totalPages: 0 } }
  }
}

export default async function MovieGrid() {
  const { movies } = await getMovies()

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
