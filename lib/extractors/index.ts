import { extractYouTubeContent } from "./youtube"
import { extractWebContent, extractInstagramContent } from "./web"

export async function extractContent(
  sourceType: string,
  sourceUrl: string
): Promise<string> {
  try {
    switch (sourceType) {
      case "YOUTUBE":
        return await extractYouTubeContent(sourceUrl)

      case "INSTAGRAM":
        return await extractInstagramContent(sourceUrl)

      case "ARTICLE":
      case "BLOG":
      case "WEBSITE":
        return await extractWebContent(sourceUrl)

      case "PDF":
        // PDF extraction would require additional libraries like pdf-parse
        return `[PDF document: ${sourceUrl}]\nPDF extraction not yet implemented. Please add pdf-parse library.`

      default:
        throw new Error(`Unsupported source type: ${sourceType}`)
    }
  } catch (error) {
    console.error(`Content extraction failed for ${sourceType}:`, error)
    throw error
  }
}
