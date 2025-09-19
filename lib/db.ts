import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

export const sql = neon(process.env.DATABASE_URL)

// Database helper functions
export async function getUsers() {
  return await sql`SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC`
}

export async function getUserById(id: number) {
  const users = await sql`SELECT id, email, name, role, created_at FROM users WHERE id = ${id}`
  return users[0] || null
}

export async function getUserByEmail(email: string) {
  const users = await sql`SELECT * FROM users WHERE email = ${email}`
  return users[0] || null
}

export async function createUser(email: string, passwordHash: string, name: string, role: string) {
  const users = await sql`
    INSERT INTO users (email, password_hash, name, role)
    VALUES (${email}, ${passwordHash}, ${name}, ${role})
    RETURNING id, email, name, role, created_at
  `
  return users[0]
}

export async function getProjects() {
  return await sql`
    SELECT p.*, u.name as created_by_name
    FROM projects p
    LEFT JOIN users u ON p.created_by = u.id
    ORDER BY p.created_at DESC
  `
}

export async function getProjectById(id: number) {
  const projects = await sql`
    SELECT p.*, u.name as created_by_name
    FROM projects p
    LEFT JOIN users u ON p.created_by = u.id
    WHERE p.id = ${id}
  `
  return projects[0] || null
}

export async function createProject(
  name: string,
  description: string,
  startDate: string,
  endDate: string,
  createdBy: number,
) {
  const projects = await sql`
    INSERT INTO projects (name, description, start_date, end_date, created_by)
    VALUES (${name}, ${description}, ${startDate}, ${endDate}, ${createdBy})
    RETURNING *
  `
  return projects[0]
}

export async function getTasks(projectId?: number) {
  if (projectId) {
    return await sql`
      SELECT t.*, u1.name as assigned_to_name, u2.name as created_by_name, p.name as project_name
      FROM tasks t
      LEFT JOIN users u1 ON t.assigned_to = u1.id
      LEFT JOIN users u2 ON t.created_by = u2.id
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.project_id = ${projectId}
      ORDER BY t.created_at DESC
    `
  }

  return await sql`
    SELECT t.*, u1.name as assigned_to_name, u2.name as created_by_name, p.name as project_name
    FROM tasks t
    LEFT JOIN users u1 ON t.assigned_to = u1.id
    LEFT JOIN users u2 ON t.created_by = u2.id
    LEFT JOIN projects p ON t.project_id = p.id
    ORDER BY t.created_at DESC
  `
}

export async function createTask(
  title: string,
  description: string,
  priority: string,
  projectId: number,
  assignedTo: number,
  createdBy: number,
  dueDate?: string,
) {
  const tasks = await sql`
    INSERT INTO tasks (title, description, priority, project_id, assigned_to, created_by, due_date)
    VALUES (${title}, ${description}, ${priority}, ${projectId}, ${assignedTo}, ${createdBy}, ${dueDate})
    RETURNING *
  `
  return tasks[0]
}

export async function updateTaskStatus(id: number, status: string) {
  const tasks = await sql`
    UPDATE tasks SET status = ${status}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `
  return tasks[0]
}
