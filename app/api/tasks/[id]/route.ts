import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
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

    const taskId = Number.parseInt(params.id)
    const tasks = await sql`
      SELECT t.*, u1.name as assigned_to_name, u2.name as created_by_name, p.name as project_name
      FROM tasks t
      LEFT JOIN users u1 ON t.assigned_to = u1.id
      LEFT JOIN users u2 ON t.created_by = u2.id
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.id = ${taskId}
    `

    if (tasks.length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    return NextResponse.json(tasks[0])
  } catch (error) {
    console.error("Get task error:", error)
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

    const taskId = Number.parseInt(params.id)
    const { title, description, status, priority, assignedTo, dueDate } = await request.json()

    const updatedTask = await sql`
      UPDATE tasks 
      SET 
        title = COALESCE(${title}, title),
        description = COALESCE(${description}, description),
        status = COALESCE(${status}, status),
        priority = COALESCE(${priority}, priority),
        assigned_to = COALESCE(${assignedTo}, assigned_to),
        due_date = COALESCE(${dueDate}, due_date),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${taskId}
      RETURNING *
    `

    if (updatedTask.length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    return NextResponse.json(updatedTask[0])
  } catch (error) {
    console.error("Update task error:", error)
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

    const taskId = Number.parseInt(params.id)

    // Check if user has permission to delete this task
    const tasks = await sql`
      SELECT t.*, p.created_by as project_owner
      FROM tasks t
      JOIN projects p ON t.project_id = p.id
      WHERE t.id = ${taskId}
    `

    if (tasks.length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    const task = tasks[0]

    // Only task creator, project owner, or admin can delete
    if (
      task.created_by !== decoded.userId &&
      task.project_owner !== decoded.userId &&
      decoded.role !== "Admin" &&
      decoded.role !== "Manager"
    ) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    await sql`DELETE FROM tasks WHERE id = ${taskId}`

    return NextResponse.json({ message: "Task deleted successfully" })
  } catch (error) {
    console.error("Delete task error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
