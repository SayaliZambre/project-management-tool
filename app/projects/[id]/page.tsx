"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar, Users, Edit } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"

interface ProjectMember {
  id: number
  name: string
  email: string
  user_role: string
  project_role: string
}

interface ProjectDetails {
  id: number
  name: string
  description: string
  status: string
  start_date: string
  end_date: string
  created_by: number
  created_by_name: string
  created_at: string
  members: ProjectMember[]
}

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<ProjectDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const { user, token } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/auth")
      return
    }
    fetchProject()
  }, [user])

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setProject(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch project details",
          variant: "destructive",
        })
        router.push("/projects")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch project details",
        variant: "destructive",
      })
      router.push("/projects")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Active":
        return "default"
      case "Completed":
        return "secondary"
      case "On Hold":
        return "outline"
      default:
        return "outline"
    }
  }

  const canEditProject = () => {
    return project?.created_by === user?.id || user?.role === "Admin" || user?.role === "Manager"
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!project) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto py-6">
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/projects">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Projects
              </Link>
            </Button>
          </div>

          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">{project.name}</h1>
              <div className="flex items-center space-x-4">
                <Badge variant={getStatusBadgeVariant(project.status)}>{project.status}</Badge>
                <span className="text-sm text-muted-foreground">Created by {project.created_by_name}</span>
              </div>
            </div>
            {canEditProject() && (
              <Button asChild>
                <Link href={`/projects/${project.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Project
                </Link>
              </Button>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{project.description || "No description provided."}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Project Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>Start Date:</strong>{" "}
                      {project.start_date ? new Date(project.start_date).toLocaleDateString() : "Not set"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>End Date:</strong>{" "}
                      {project.end_date ? new Date(project.end_date).toLocaleDateString() : "Not set"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span>Team Members</span>
                    </CardTitle>
                    {canEditProject() && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/projects/${project.id}/members`}>Manage</Link>
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {project.members.map((member) => (
                      <div key={member.id} className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">{getInitials(member.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{member.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {member.project_role}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                    <Link href={`/tasks?projectId=${project.id}`}>View Tasks</Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    Add New Task
                  </Button>
                  {canEditProject() && (
                    <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                      <Link href={`/projects/${project.id}/members`}>Manage Members</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
