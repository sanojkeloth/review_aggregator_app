import MovieGrid from "@/components/public/MovieGrid"
import SearchBar from "@/components/public/SearchBar"
import Navigation from "@/components/public/Navigation"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-neutral-900 to-neutral-800 py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Find Your Next Movie
          </h1>
          <p className="text-xl md:text-2xl text-neutral-300 mb-8 max-w-3xl mx-auto">
            AI-powered movie reviews aggregated from trusted sources.
            Make informed decisions in seconds.
          </p>
          <SearchBar />
        </div>
      </section>

      {/* Movies Grid */}
      <section className="max-w-7xl mx-auto py-12 px-4">
        <MovieGrid />
      </section>
    </div>
  )
}
