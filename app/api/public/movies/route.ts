import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/public/movies - List published movies (no auth required)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const genre = searchParams.get("genre")
    const language = searchParams.get("language")
    const search = searchParams.get("search")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")
    const skip = (page - 1) * limit

    const where: any = { status: "PUBLISHED" }

    if (genre) where.genre = { has: genre }
    if (language) where.language = { has: language }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { director: { contains: search, mode: "insensitive" } },
        { cast: { hasSome: [search] } },
      ]
    }

    const [movies, total] = await Promise.all([
      prisma.movie.findMany({
        where,
        include: {
          summaries: {
            orderBy: { version: "desc" },
            take: 1,
          },
          _count: {
            select: { reviews: true },
          },
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.movie.count({ where }),
    ])

    return NextResponse.json({
      movies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching public movies:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
