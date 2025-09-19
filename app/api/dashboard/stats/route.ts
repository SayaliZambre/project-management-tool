import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
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

    // Get overall statistics
    const [projectStats] = await sql`
      SELECT 
        COUNT(*) as total_projects,
        COUNT(CASE WHEN status = 'Active' THEN 1 END) as active_projects,
        COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed_projects,
        COUNT(CASE WHEN status = 'On Hold' THEN 1 END) as on_hold_projects
      FROM projects
    `

    const [taskStats] = await sql`
      SELECT 
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN status = 'To Do' THEN 1 END) as todo_tasks,
        COUNT(CASE WHEN status = 'In Progress' THEN 1 END) as in_progress_tasks,
        COUNT(CASE WHEN status = 'Done' THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN priority = 'High' THEN 1 END) as high_priority_tasks,
        COUNT(CASE WHEN due_date < CURRENT_DATE AND status != 'Done' THEN 1 END) as overdue_tasks
      FROM tasks
    `

    const [userStats] = await sql`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'Admin' THEN 1 END) as admin_users,
        COUNT(CASE WHEN role = 'Manager' THEN 1 END) as manager_users,
        COUNT(CASE WHEN role = 'Developer' THEN 1 END) as developer_users
      FROM users
    `

    // Get task completion rate over time (last 30 days)
    const taskCompletionTrend = await sql`
      SELECT 
        DATE(updated_at) as date,
        COUNT(*) as completed_tasks
      FROM tasks 
      WHERE status = 'Done' 
        AND updated_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(updated_at)
      ORDER BY date DESC
      LIMIT 30
    `

    // Get project progress
    const projectProgress = await sql`
      SELECT 
        p.id,
        p.name,
        p.status,
        COUNT(t.id) as total_tasks,
        COUNT(CASE WHEN t.status = 'Done' THEN 1 END) as completed_tasks,
        CASE 
          WHEN COUNT(t.id) = 0 THEN 0
          ELSE ROUND((COUNT(CASE WHEN t.status = 'Done' THEN 1 END) * 100.0) / COUNT(t.id), 2)
        END as completion_percentage
      FROM projects p
      LEFT JOIN tasks t ON p.id = t.project_id
      WHERE p.status = 'Active'
      GROUP BY p.id, p.name, p.status
      ORDER BY completion_percentage DESC
      LIMIT 10
    `

    // Get user productivity (tasks completed in last 30 days)
    const userProductivity = await sql`
      SELECT 
        u.id,
        u.name,
        COUNT(t.id) as tasks_completed
      FROM users u
      LEFT JOIN tasks t ON u.id = t.assigned_to 
        AND t.status = 'Done' 
        AND t.updated_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY u.id, u.name
      ORDER BY tasks_completed DESC
      LIMIT 10
    `

    // Get recent activity
    const recentActivity = await sql`
      SELECT 
        'task' as type,
        t.title as title,
        t.status,
        u.name as user_name,
        t.updated_at,
        p.name as project_name
      FROM tasks t
      JOIN users u ON t.assigned_to = u.id
      JOIN projects p ON t.project_id = p.id
      WHERE t.updated_at >= CURRENT_DATE - INTERVAL '7 days'
      ORDER BY t.updated_at DESC
      LIMIT 20
    `

    return NextResponse.json({
      projectStats,
      taskStats,
      userStats,
      taskCompletionTrend,
      projectProgress,
      userProductivity,
      recentActivity,
    })
  } catch (error) {
    console.error("Get dashboard stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
