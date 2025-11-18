"use client"

import Link from "next/link"
import Image from "next/image"
import { ThumbsUp, ThumbsDown, Minus } from "lucide-react"

interface Movie {
  id: string
  title: string
  releaseYear: number
  genre: string[]
  posterUrl?: string
  summaries: Array<{
    sentiment: "POSITIVE" | "MIXED" | "NEGATIVE"
    recommendation: string
  }>
  _count: {
    reviews: number
  }
}

export default function MovieCard({ movie }: { movie: Movie }) {
  const latestSummary = movie.summaries[0]
  const sentiment = latestSummary?.sentiment || "MIXED"

  const sentimentConfig = {
    POSITIVE: {
      icon: ThumbsUp,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-950",
      label: "Recommended",
    },
    NEGATIVE: {
      icon: ThumbsDown,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-950",
      label: "Not Recommended",
    },
    MIXED: {
      icon: Minus,
      color: "text-yellow-600 dark:text-yellow-400",
      bg: "bg-yellow-50 dark:bg-yellow-950",
      label: "Mixed Reviews",
    },
  }

  const config = sentimentConfig[sentiment]
  const SentimentIcon = config.icon

  return (
    <Link href={`/movies/${movie.id}`}>
      <div className="group cursor-pointer bg-white dark:bg-neutral-900 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        {/* Poster */}
        <div className="relative h-96 bg-neutral-200 dark:bg-neutral-800">
          {movie.posterUrl ? (
            <Image
              src={movie.posterUrl}
              alt={movie.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-neutral-400">
              <span className="text-6xl">🎬</span>
            </div>
          )}
          {/* Sentiment Badge */}
          <div className={`absolute top-4 right-4 ${config.bg} ${config.color} px-3 py-1 rounded-full flex items-center gap-1 text-sm font-semibold`}>
            <SentimentIcon className="h-4 w-4" />
            <span className="hidden sm:inline">{config.label}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-bold text-lg mb-1 line-clamp-2 group-hover:text-primary transition-colors">
            {movie.title}
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">
            {movie.releaseYear} • {movie.genre.slice(0, 2).join(", ")}
          </p>
          {latestSummary && (
            <p className="text-sm text-neutral-600 dark:text-neutral-300 line-clamp-2">
              {latestSummary.recommendation}
            </p>
          )}
          <div className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">
            {movie._count.reviews} reviews aggregated
          </div>
        </div>
      </div>
    </Link>
  )
}
