import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import { verifyToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authorization required" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { projectDescription, projectType, targetAudience, features } = await request.json()

    if (!projectDescription) {
      return NextResponse.json({ error: "Project description is required" }, { status: 400 })
    }

    const prompt = `You are a product manager expert at writing user stories. Generate comprehensive user stories for a software project based on the following information:

Project Description: ${projectDescription}
Project Type: ${projectType || "Web Application"}
Target Audience: ${targetAudience || "General users"}
Key Features: ${features || "Standard features"}

Please generate 8-12 user stories following this format:
- Title: Brief descriptive title
- Story: As a [user type], I want [goal] so that [benefit]
- Acceptance Criteria: 3-5 specific, testable criteria
- Priority: High/Medium/Low
- Estimated Effort: Small/Medium/Large

Make sure the user stories are:
1. Specific and actionable
2. Focused on user value
3. Testable with clear acceptance criteria
4. Properly prioritized
5. Cover different aspects of the project (authentication, core features, admin functions, etc.)

Format the response as a JSON array of objects with the following structure:
{
  "title": "string",
  "story": "string", 
  "acceptanceCriteria": ["string", "string", "string"],
  "priority": "High|Medium|Low",
  "estimatedEffort": "Small|Medium|Large"
}

Return only the JSON array, no additional text.`

    const { text } = await generateText({
      model: groq("llama-3.1-70b-versatile"),
      prompt,
      temperature: 0.7,
      maxTokens: 2000,
    })

    // Parse the generated text as JSON
    let userStories
    try {
      userStories = JSON.parse(text)
    } catch (parseError) {
      // If JSON parsing fails, try to extract JSON from the text
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        userStories = JSON.parse(jsonMatch[0])
      } else {
        throw new Error("Failed to parse AI response as JSON")
      }
    }

    return NextResponse.json({ userStories })
  } catch (error: any) {
    console.error("AI generation error:", error)
    return NextResponse.json({ error: error.message || "Failed to generate user stories" }, { status: 500 })
  }
}
