import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { refineSummaryWithChat, SummaryData } from "@/lib/ai/openai"
import { z } from "zod"

const chatSchema = z.object({
  message: z.string().min(1, "Message is required"),
})

// POST /api/movies/[id]/chat - Refine summary with AI chat
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
    const { message } = chatSchema.parse(body)

    const { id } = await params

    // Get movie details
    const movie = await prisma.movie.findUnique({
      where: { id },
    })

    if (!movie) {
      return NextResponse.json({ error: "Movie not found" }, { status: 404 })
    }

    // Get latest summary
    const latestSummary = await prisma.summary.findFirst({
      where: { movieId: id },
      orderBy: { version: "desc" },
    })

    if (!latestSummary) {
      return NextResponse.json(
        { error: "No summary available. Please generate a summary first." },
        { status: 400 }
      )
    }

    // Prepare current summary data
    const currentSummary: SummaryData = {
      overallConsensus: latestSummary.overallConsensus,
      strengths: latestSummary.strengths,
      weaknesses: latestSummary.weaknesses,
      highlights: latestSummary.highlights,
      recommendation: latestSummary.recommendation,
      sentiment: latestSummary.sentiment,
      sourceBreakdown: latestSummary.sourceBreakdown as {
        positive: number
        mixed: number
        negative: number
      },
    }

    // Get AI refinement
    const refinedSummary = await refineSummaryWithChat(
      currentSummary,
      movie.title,
      message
    )

    // Create new summary version
    const newSummary = await prisma.summary.create({
      data: {
        movieId: id,
        version: latestSummary.version + 1,
        summaryType: latestSummary.summaryType,
        overallConsensus: refinedSummary.overallConsensus,
        strengths: refinedSummary.strengths,
        weaknesses: refinedSummary.weaknesses,
        highlights: refinedSummary.highlights,
        recommendation: refinedSummary.recommendation,
        sentiment: refinedSummary.sentiment,
        sourceBreakdown: refinedSummary.sourceBreakdown,
        createdById: session.user.id,
      },
    })

    // Save chat history
    await prisma.chatHistory.create({
      data: {
        movieId: id,
        userId: session.user.id,
        message,
        response: `Summary updated to version ${newSummary.version}`,
        summaryVersionBefore: latestSummary.version,
        summaryVersionAfter: newSummary.version,
      },
    })

    return NextResponse.json({
      summary: newSummary,
      message: "Summary refined successfully",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }
    console.error("Error in chat refinement:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// GET /api/movies/[id]/chat - Get chat history
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

    const chatHistory = await prisma.chatHistory.findMany({
      where: { movieId: id },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: "asc" },
    })

    return NextResponse.json(chatHistory)
  } catch (error) {
    console.error("Error fetching chat history:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
