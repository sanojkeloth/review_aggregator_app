import axios from "axios"
import * as cheerio from "cheerio"

export async function extractWebContent(url: string): Promise<string> {
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      timeout: 15000,
    })

    const html = response.data
    const $ = cheerio.load(html)

    // Remove unwanted elements
    $("script, style, nav, header, footer, iframe, .advertisement, .ads, .social-share").remove()

    // Try to extract main content from common article selectors
    const contentSelectors = [
      "article",
      '[role="main"]',
      ".article-content",
      ".post-content",
      ".entry-content",
      ".content",
      "main",
    ]

    let content = ""
    for (const selector of contentSelectors) {
      const element = $(selector)
      if (element.length > 0) {
        content = element.text().trim()
        if (content.length > 200) {
          break
        }
      }
    }

    // Fallback to body if no content found
    if (!content || content.length < 200) {
      content = $("body").text().trim()
    }

    // Clean up whitespace
    content = content.replace(/\s+/g, " ").trim()

    if (!content || content.length < 100) {
      throw new Error("Insufficient content extracted")
    }

    return content
  } catch (error) {
    console.error("Web extraction error:", error)
    throw new Error("Failed to extract web content")
  }
}

export async function extractInstagramContent(url: string): Promise<string> {
  // Instagram scraping is complex due to authentication requirements
  // In production, use Instagram Graph API or a dedicated service
  // For now, return a placeholder
  return `[Instagram post: ${url}]\nInstagram content extraction requires Instagram Graph API integration. Please add your access token.`
}
