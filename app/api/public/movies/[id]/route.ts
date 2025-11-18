import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/public/movies/[id] - Get movie detail (no auth required)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const movie = await prisma.movie.findUnique({
      where: {
        id: params.id,
        status: "PUBLISHED", // Only show published movies
      },
      include: {
        summaries: {
          orderBy: { version: "desc" },
          take: 1,
        },
        reviews: {
          where: { status: "PROCESSED" },
          select: {
            id: true,
            sourceUrl: true,
            sourceType: true,
            sourceName: true,
          },
        },
        _count: {
          select: { reviews: true, pageViews: true },
        },
      },
    })

    if (!movie) {
      return NextResponse.json({ error: "Movie not found" }, { status: 404 })
    }

    // Track page view (in background, don't await)
    const userIp = request.headers.get("x-forwarded-for") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    prisma.pageView
      .create({
        data: {
          movieId: params.id,
          userIp,
          userAgent,
        },
      })
      .catch((error) => console.error("Failed to track page view:", error))

    return NextResponse.json(movie)
  } catch (error) {
    console.error("Error fetching public movie:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
