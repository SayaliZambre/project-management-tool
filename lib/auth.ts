import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { getUserByEmail, createUser } from "./db"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

export function generateToken(userId: number, email: string, role: string): string {
  return jwt.sign({ userId, email, role }, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

export async function authenticateUser(email: string, password: string) {
  const user = await getUserByEmail(email)
  if (!user) {
    return null
  }

  const isValid = await verifyPassword(password, user.password_hash)
  if (!isValid) {
    return null
  }

  const token = generateToken(user.id, user.email, user.role)
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    token,
  }
}

export async function registerUser(email: string, password: string, name: string, role = "Developer") {
  const existingUser = await getUserByEmail(email)
  if (existingUser) {
    throw new Error("User already exists")
  }

  const passwordHash = await hashPassword(password)
  const user = await createUser(email, passwordHash, name, role)

  const token = generateToken(user.id, user.email, user.role)
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    token,
  }
}
