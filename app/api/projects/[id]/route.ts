import { type NextRequest, NextResponse } from "next/server"
import { getProjectById, sql } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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
    const project = await getProjectById(projectId)

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Get project members
    const members = await sql`
      SELECT pm.role as project_role, u.id, u.name, u.email, u.role as user_role
      FROM project_members pm
      JOIN users u ON pm.user_id = u.id
      WHERE pm.project_id = ${projectId}
    `

    return NextResponse.json({ ...project, members })
  } catch (error) {
    console.error("Get project error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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
    const { name, description, status, startDate, endDate } = await request.json()

    // Check if user has permission to edit this project
    const project = await getProjectById(projectId)
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Only project owner, admin, or manager can edit
    if (project.created_by !== decoded.userId && decoded.role !== "Admin" && decoded.role !== "Manager") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const updatedProject = await sql`
      UPDATE projects 
      SET 
        name = COALESCE(${name}, name),
        description = COALESCE(${description}, description),
        status = COALESCE(${status}, status),
        start_date = COALESCE(${startDate}, start_date),
        end_date = COALESCE(${endDate}, end_date),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${projectId}
      RETURNING *
    `

    return NextResponse.json(updatedProject[0])
  } catch (error) {
    console.error("Update project error:", error)
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

    // Check if user has permission to delete this project
    const project = await getProjectById(projectId)
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Only project owner or admin can delete
    if (project.created_by !== decoded.userId && decoded.role !== "Admin") {
      return NextResponse.json({ error: "Only project owner or admin can delete projects" }, { status: 403 })
    }

    await sql`DELETE FROM projects WHERE id = ${projectId}`

    return NextResponse.json({ message: "Project deleted successfully" })
  } catch (error) {
    console.error("Delete project error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
