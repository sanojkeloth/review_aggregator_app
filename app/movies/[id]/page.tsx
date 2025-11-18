import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import Navigation from "@/components/public/Navigation"
import { ThumbsUp, ThumbsDown, Minus, ExternalLink, Youtube, Instagram, FileText, Globe } from "lucide-react"

async function getMovie(id: string) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
    const res = await fetch(`${baseUrl}/api/public/movies/${id}`, {
      cache: "no-store",
    })

    if (!res.ok) {
      return null
    }

    return res.json()
  } catch (error) {
    console.error("Error fetching movie:", error)
    return null
  }
}

export default async function MovieDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const movie = await getMovie(params.id)

  if (!movie) {
    notFound()
  }

  const latestSummary = movie.summaries[0]
  const sentiment = latestSummary?.sentiment || "MIXED"

  const sentimentConfig = {
    POSITIVE: { icon: ThumbsUp, color: "text-green-600", bg: "bg-green-50", label: "Recommended" },
    NEGATIVE: { icon: ThumbsDown, color: "text-red-600", bg: "bg-red-50", label: "Not Recommended" },
    MIXED: { icon: Minus, color: "text-yellow-600", bg: "bg-yellow-50", label: "Mixed Reviews" },
  }

  const config = sentimentConfig[sentiment]
  const SentimentIcon = config.icon

  const sourceIcons: Record<string, any> = {
    YOUTUBE: Youtube,
    INSTAGRAM: Instagram,
    ARTICLE: FileText,
    BLOG: FileText,
    WEBSITE: Globe,
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto py-12 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Poster */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <div className="relative h-[600px] bg-neutral-200 dark:bg-neutral-800 rounded-lg overflow-hidden shadow-xl">
                {movie.posterUrl ? (
                  <Image
                    src={movie.posterUrl}
                    alt={movie.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-neutral-400">
                    <span className="text-9xl">🎬</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-2">
            {/* Title and Metadata */}
            <div className="mb-8">
              <div className={`inline-flex items-center gap-2 ${config.bg} ${config.color} px-4 py-2 rounded-full mb-4`}>
                <SentimentIcon className="h-5 w-5" />
                <span className="font-semibold">{config.label}</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-4">{movie.title}</h1>

              <div className="flex flex-wrap gap-4 text-neutral-600 dark:text-neutral-400 mb-4">
                <span>{movie.releaseYear}</span>
                {movie.duration && <span>• {movie.duration} min</span>}
                {movie.language.length > 0 && <span>• {movie.language.join(", ")}</span>}
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {movie.genre.map((g: string) => (
                  <span
                    key={g}
                    className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-full text-sm"
                  >
                    {g}
                  </span>
                ))}
              </div>

              {movie.director && (
                <p className="text-neutral-600 dark:text-neutral-400">
                  <span className="font-semibold">Director:</span> {movie.director}
                </p>
              )}

              {movie.cast.length > 0 && (
                <p className="text-neutral-600 dark:text-neutral-400">
                  <span className="font-semibold">Cast:</span> {movie.cast.join(", ")}
                </p>
              )}
            </div>

            {/* Trailer */}
            {movie.trailerUrl && (
              <div className="mb-8">
                <iframe
                  width="100%"
                  height="400"
                  src={movie.trailerUrl.replace("watch?v=", "embed/")}
                  title="Movie trailer"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded-lg"
                ></iframe>
              </div>
            )}

            {/* AI Summary */}
            {latestSummary && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">AI-Generated Summary</h2>

                <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg p-6 space-y-6">
                  {/* Overall Consensus */}
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Overall Consensus</h3>
                    <p className="text-neutral-700 dark:text-neutral-300">
                      {latestSummary.overallConsensus}
                    </p>
                  </div>

                  {/* Strengths */}
                  {latestSummary.strengths.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg mb-2 text-green-600">Strengths</h3>
                      <ul className="list-disc list-inside space-y-1 text-neutral-700 dark:text-neutral-300">
                        {latestSummary.strengths.map((strength: string, idx: number) => (
                          <li key={idx}>{strength}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Weaknesses */}
                  {latestSummary.weaknesses.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg mb-2 text-red-600">Weaknesses</h3>
                      <ul className="list-disc list-inside space-y-1 text-neutral-700 dark:text-neutral-300">
                        {latestSummary.weaknesses.map((weakness: string, idx: number) => (
                          <li key={idx}>{weakness}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Key Highlights */}
                  {latestSummary.highlights.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Key Highlights</h3>
                      <ul className="list-disc list-inside space-y-1 text-neutral-700 dark:text-neutral-300">
                        {latestSummary.highlights.map((highlight: string, idx: number) => (
                          <li key={idx}>{highlight}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendation */}
                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-lg mb-2">Should You Watch?</h3>
                    <p className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                      {latestSummary.recommendation}
                    </p>
                  </div>

                  {/* Source Breakdown */}
                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-lg mb-3">Source Breakdown</h3>
                    <div className="flex gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {latestSummary.sourceBreakdown.positive || 0}
                        </div>
                        <div className="text-sm text-neutral-600">Positive</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                          {latestSummary.sourceBreakdown.mixed || 0}
                        </div>
                        <div className="text-sm text-neutral-600">Mixed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {latestSummary.sourceBreakdown.negative || 0}
                        </div>
                        <div className="text-sm text-neutral-600">Negative</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Review Sources */}
            {movie.reviews.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">
                  Review Sources ({movie.reviews.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {movie.reviews.map((review: any) => {
                    const SourceIcon = sourceIcons[review.sourceType] || Globe
                    return (
                      <a
                        key={review.id}
                        href={review.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-white dark:bg-neutral-900 rounded-lg shadow hover:shadow-lg transition-shadow"
                      >
                        <SourceIcon className="h-5 w-5 text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {review.sourceName || review.sourceType}
                          </p>
                          <p className="text-sm text-neutral-500 truncate">
                            {review.sourceUrl}
                          </p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                      </a>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
