import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createReviewSchema = z.object({
  sourceUrl: z.string().url("Invalid URL"),
  sourceType: z.enum(["YOUTUBE", "INSTAGRAM", "ARTICLE", "BLOG", "WEBSITE", "PDF", "OTHER"]),
  sourceName: z.string().optional(),
})

// GET /api/movies/[id]/reviews - Get all reviews for a movie
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const reviews = await prisma.review.findMany({
      where: { movieId: id },
      include: {
        addedBy: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(reviews)
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/movies/[id]/reviews - Add a review link
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createReviewSchema.parse(body)

    const { id } = await params

    // Check if movie exists
    const movie = await prisma.movie.findUnique({
      where: { id },
    })

    if (!movie) {
      return NextResponse.json({ error: "Movie not found" }, { status: 404 })
    }

    const review = await prisma.review.create({
      data: {
        movieId: id,
        addedById: session.user.id,
        ...validatedData,
      },
      include: {
        addedBy: {
          select: { name: true, email: true },
        },
      },
    })

    // TODO: Queue background job to extract content
    // This will be implemented in the content extraction service

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }
    console.error("Error creating review:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
