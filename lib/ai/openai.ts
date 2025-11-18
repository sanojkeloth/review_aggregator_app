import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
})

export interface SummaryData {
  overallConsensus: string
  strengths: string[]
  weaknesses: string[]
  highlights: string[]
  recommendation: string
  sentiment: "POSITIVE" | "MIXED" | "NEGATIVE"
  sourceBreakdown: {
    positive: number
    mixed: number
    negative: number
  }
}

export async function generateMovieSummary(
  movieTitle: string,
  releaseYear: number,
  genre: string[],
  reviews: Array<{ sourceType: string; sourceName?: string; contentExtracted: string }>
): Promise<SummaryData> {
  const reviewsText = reviews
    .map((review, index) => {
      return `\n## Review ${index + 1} (${review.sourceType}${review.sourceName ? ` - ${review.sourceName}` : ""})\n${review.contentExtracted}`
    })
    .join("\n\n")

  const prompt = `You are a movie review aggregator. Analyze the following movie reviews from various sources and create a comprehensive, balanced summary.

Movie Title: ${movieTitle}
Release Year: ${releaseYear}
Genre: ${genre.join(", ")}

Reviews:
${reviewsText}

Generate a structured summary with the following format (respond in JSON):

{
  "overallConsensus": "2-3 sentences capturing the general opinion",
  "strengths": ["strength 1", "strength 2", "strength 3", ...],
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3", ...],
  "highlights": ["highlight 1", "highlight 2", ...],
  "recommendation": "Clear recommendation: 'Highly Recommended', 'Worth Watching', 'Mixed Bag', or 'Skip It'",
  "sentiment": "POSITIVE, MIXED, or NEGATIVE",
  "sourceBreakdown": {
    "positive": number of positive reviews,
    "mixed": number of mixed reviews,
    "negative": number of negative reviews
  }
}

Important:
- Be objective and balanced
- Avoid spoilers
- Cite contrasting opinions if they exist
- Keep language clear and engaging
- Ensure all arrays have at least 3 items where applicable`

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.7,
  })

  const result = JSON.parse(completion.choices[0].message.content || "{}")
  return result as SummaryData
}

export async function refineSummaryWithChat(
  currentSummary: SummaryData,
  movieTitle: string,
  userMessage: string
): Promise<SummaryData> {
  const prompt = `You are helping refine a movie review summary for "${movieTitle}".

Current summary:
${JSON.stringify(currentSummary, null, 2)}

User request: ${userMessage}

Please refine the summary according to the user's request and return the updated summary in the same JSON format.`

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.7,
  })

  const result = JSON.parse(completion.choices[0].message.content || "{}")
  return result as SummaryData
}

export { openai }
