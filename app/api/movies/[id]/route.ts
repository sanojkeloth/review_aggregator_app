import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateMovieSchema = z.object({
  title: z.string().min(1).optional(),
  releaseYear: z.number().int().min(1900).max(new Date().getFullYear() + 5).optional(),
  genre: z.array(z.string()).optional(),
  director: z.string().optional(),
  cast: z.array(z.string()).optional(),
  duration: z.number().int().positive().optional(),
  language: z.array(z.string()).optional(),
  posterUrl: z.string().url().optional().or(z.literal("")),
  trailerUrl: z.string().url().optional().or(z.literal("")),
  imdbRating: z.number().min(0).max(10).optional(),
  rtRating: z.number().min(0).max(100).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  folderId: z.string().optional().nullable(),
})

// GET /api/movies/[id] - Get a specific movie
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const movie = await prisma.movie.findUnique({
      where: { id: params.id },
      include: {
        folder: true,
        createdBy: {
          select: { name: true, email: true },
        },
        reviews: {
          orderBy: { createdAt: "desc" },
        },
        summaries: {
          orderBy: { version: "desc" },
          take: 1,
        },
        _count: {
          select: { reviews: true, summaries: true, pageViews: true },
        },
      },
    })

    if (!movie) {
      return NextResponse.json({ error: "Movie not found" }, { status: 404 })
    }

    return NextResponse.json(movie)
  } catch (error) {
    console.error("Error fetching movie:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT /api/movies/[id] - Update a movie
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateMovieSchema.parse(body)

    const movie = await prisma.movie.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        folder: true,
        createdBy: {
          select: { name: true, email: true },
        },
      },
    })

    return NextResponse.json(movie)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Error updating movie:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE /api/movies/[id] - Delete a movie
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.movie.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Movie deleted successfully" })
  } catch (error) {
    console.error("Error deleting movie:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
