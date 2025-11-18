import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Validation schema for creating a movie
const createMovieSchema = z.object({
  title: z.string().min(1, "Title is required"),
  releaseYear: z.number().int().min(1900).max(new Date().getFullYear() + 5),
  genre: z.array(z.string()).min(1, "At least one genre is required"),
  director: z.string().optional(),
  cast: z.array(z.string()).optional().default([]),
  duration: z.number().int().positive().optional(),
  language: z.array(z.string()).min(1, "At least one language is required"),
  posterUrl: z.string().url().optional().or(z.literal("")),
  trailerUrl: z.string().url().optional().or(z.literal("")),
  imdbRating: z.number().min(0).max(10).optional(),
  rtRating: z.number().min(0).max(100).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional().default("DRAFT"),
  folderId: z.string().optional(),
})

// GET /api/movies - List all movies with filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const genre = searchParams.get("genre")
    const folderId = searchParams.get("folderId")
    const search = searchParams.get("search")

    const where: any = {}
    if (status) where.status = status
    if (genre) where.genre = { has: genre }
    if (folderId) where.folderId = folderId
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { director: { contains: search, mode: "insensitive" } },
        { cast: { hasSome: [search] } },
      ]
    }

    const movies = await prisma.movie.findMany({
      where,
      include: {
        folder: true,
        createdBy: {
          select: { name: true, email: true },
        },
        _count: {
          select: { reviews: true, summaries: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    })

    return NextResponse.json(movies)
  } catch (error) {
    console.error("Error fetching movies:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/movies - Create a new movie
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createMovieSchema.parse(body)

    const movie = await prisma.movie.create({
      data: {
        ...validatedData,
        createdById: session.user.id,
      },
      include: {
        folder: true,
        createdBy: {
          select: { name: true, email: true },
        },
      },
    })

    return NextResponse.json(movie, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }
    console.error("Error creating movie:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
