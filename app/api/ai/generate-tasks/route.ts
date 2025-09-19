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

    const { userStory, projectContext } = await request.json()

    if (!userStory) {
      return NextResponse.json({ error: "User story is required" }, { status: 400 })
    }

    const prompt = `You are a technical project manager. Break down the following user story into specific, actionable development tasks.

User Story: ${userStory}
Project Context: ${projectContext || "Web application development"}

Generate 3-8 development tasks that would be needed to implement this user story. Each task should be:
1. Specific and actionable
2. Focused on a single responsibility
3. Implementable by a developer
4. Include technical considerations

For each task, provide:
- Title: Clear, concise task title
- Description: Detailed description of what needs to be done
- Priority: High/Medium/Low (based on dependencies and importance)
- Estimated Hours: 1-8 hours realistic estimate
- Category: Frontend/Backend/Database/Testing/DevOps

Format the response as a JSON array of objects with this structure:
{
  "title": "string",
  "description": "string",
  "priority": "High|Medium|Low", 
  "estimatedHours": number,
  "category": "Frontend|Backend|Database|Testing|DevOps"
}

Return only the JSON array, no additional text.`

    const { text } = await generateText({
      model: groq("llama-3.1-70b-versatile"),
      prompt,
      temperature: 0.6,
      maxTokens: 1500,
    })

    // Parse the generated text as JSON
    let tasks
    try {
      tasks = JSON.parse(text)
    } catch (parseError) {
      // If JSON parsing fails, try to extract JSON from the text
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        tasks = JSON.parse(jsonMatch[0])
      } else {
        throw new Error("Failed to parse AI response as JSON")
      }
    }

    return NextResponse.json({ tasks })
  } catch (error: any) {
    console.error("AI task generation error:", error)
    return NextResponse.json({ error: error.message || "Failed to generate tasks" }, { status: 500 })
  }
}
