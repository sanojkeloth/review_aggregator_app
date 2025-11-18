import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateMovieSummary } from "@/lib/ai/openai"
import { extractContent } from "@/lib/extractors"

// POST /api/movies/[id]/summarize - Generate AI summary
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Get movie details
    const movie = await prisma.movie.findUnique({
      where: { id },
      include: {
        reviews: true,
      },
    })

    if (!movie) {
      return NextResponse.json({ error: "Movie not found" }, { status: 404 })
    }

    if (movie.reviews.length === 0) {
      return NextResponse.json(
        { error: "No reviews available to summarize" },
        { status: 400 }
      )
    }

    // Process reviews that haven't been extracted yet
    const unprocessedReviews = movie.reviews.filter(
      (review) => review.status === "PENDING" && !review.contentExtracted
    )

    for (const review of unprocessedReviews) {
      try {
        await prisma.review.update({
          where: { id: review.id },
          data: { status: "PROCESSING" },
        })

        const content = await extractContent(review.sourceType, review.sourceUrl)

        await prisma.review.update({
          where: { id: review.id },
          data: {
            contentExtracted: content,
            status: "PROCESSED",
            processedAt: new Date(),
          },
        })
      } catch (extractionError) {
        console.error(`Failed to extract review ${review.id}:`, extractionError)
        await prisma.review.update({
          where: { id: review.id },
          data: {
            status: "FAILED",
            errorMessage: extractionError instanceof Error ? extractionError.message : "Unknown error",
          },
        })
      }
    }

    // Get all processed reviews
    const processedReviews = await prisma.review.findMany({
      where: {
        movieId: id,
        status: "PROCESSED",
        contentExtracted: { not: null },
      },
    })

    if (processedReviews.length === 0) {
      return NextResponse.json(
        { error: "No successfully processed reviews available" },
        { status: 400 }
      )
    }

    // Generate summary using AI
    const summaryData = await generateMovieSummary(
      movie.title,
      movie.releaseYear,
      movie.genre,
      processedReviews.map((r) => ({
        sourceType: r.sourceType,
        sourceName: r.sourceName || undefined,
        contentExtracted: r.contentExtracted || "",
      }))
    )

    // Get the latest version number
    const latestSummary = await prisma.summary.findFirst({
      where: { movieId: id },
      orderBy: { version: "desc" },
    })

    const newVersion = (latestSummary?.version || 0) + 1

    // Save summary to database
    const summary = await prisma.summary.create({
      data: {
        movieId: id,
        version: newVersion,
        summaryType: "DETAILED",
        overallConsensus: summaryData.overallConsensus,
        strengths: summaryData.strengths,
        weaknesses: summaryData.weaknesses,
        highlights: summaryData.highlights,
        recommendation: summaryData.recommendation,
        sentiment: summaryData.sentiment,
        sourceBreakdown: summaryData.sourceBreakdown,
        createdById: session.user.id,
      },
    })

    return NextResponse.json(summary)
  } catch (error) {
    console.error("Error generating summary:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
