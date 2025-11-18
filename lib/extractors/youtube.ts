import axios from "axios"

export async function extractYouTubeContent(url: string): Promise<string> {
  try {
    // Extract video ID from URL
    const videoId = extractVideoId(url)
    if (!videoId) {
      throw new Error("Invalid YouTube URL")
    }

    // Try to get transcript using youtube-transcript library
    try {
      const { YoutubeTranscript } = await import("youtube-transcript")
      const transcript = await YoutubeTranscript.fetchTranscript(videoId)
      const text = transcript.map((item: any) => item.text).join(" ")
      return text
    } catch (transcriptError) {
      console.error("Transcript extraction failed:", transcriptError)

      // Fallback: Get video metadata and comments as review content
      // In production, you would use YouTube Data API
      return `[YouTube video: ${url}]\nTranscript unavailable. Please add YouTube Data API integration for better content extraction.`
    }
  } catch (error) {
    console.error("YouTube extraction error:", error)
    throw new Error("Failed to extract YouTube content")
  }
}

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  return null
}
