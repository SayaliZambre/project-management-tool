import { type NextRequest, NextResponse } from "next/server"
import { getProjectById, sql } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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

    const projectId = Number.parseInt(params.id)
    const { userId, role = "Member" } = await request.json()

    // Check if user has permission to add members
    const project = await getProjectById(projectId)
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    if (project.created_by !== decoded.userId && decoded.role !== "Admin" && decoded.role !== "Manager") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    // Add member to project
    const member = await sql`
      INSERT INTO project_members (project_id, user_id, role)
      VALUES (${projectId}, ${userId}, ${role})
      ON CONFLICT (project_id, user_id) DO UPDATE SET role = ${role}
      RETURNING *
    `

    return NextResponse.json(member[0], { status: 201 })
  } catch (error) {
    console.error("Add project member error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    const projectId = Number.parseInt(params.id)
    const { userId } = await request.json()

    // Check if user has permission to remove members
    const project = await getProjectById(projectId)
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    if (project.created_by !== decoded.userId && decoded.role !== "Admin" && decoded.role !== "Manager") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    await sql`
      DELETE FROM project_members 
      WHERE project_id = ${projectId} AND user_id = ${userId}
    `

    return NextResponse.json({ message: "Member removed successfully" })
  } catch (error) {
    console.error("Remove project member error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
