"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { ProjectProgressChart } from "@/components/dashboard/project-progress-chart"
import { UserProductivityChart } from "@/components/dashboard/user-productivity-chart"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { TaskCompletionTrend } from "@/components/dashboard/task-completion-trend"
import { useRouter } from "next/navigation"
import { FolderOpen, CheckSquare, Users, Plus, Sparkles, TrendingUp } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"

interface DashboardData {
  projectStats: any
  taskStats: any
  userStats: any
  taskCompletionTrend: any[]
  projectProgress: any[]
  userProductivity: any[]
  recentActivity: any[]
}

function Dashboard() {
  const { user, token } = useAuth()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/dashboard/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch dashboard data",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Navbar />
        <div className="flex items-center justify-center p-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
            <p className="text-muted-foreground animate-pulse">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Navbar />
        <div className="container-responsive py-8">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">Failed to load dashboard data</p>
            <Button onClick={fetchDashboardData} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Navbar />
      <main className="container-responsive py-8">
        <div className="space-y-8 fade-in">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-blue-600 bg-clip-text text-transparent">
                  Welcome back, {user?.name}!
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl">
                  Here's what's happening with your projects today. Stay on top of your team's progress and
                  achievements.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button asChild className="shadow-lg hover:shadow-xl transition-all duration-200">
                  <Link href="/ai">
                    <Sparkles className="mr-2 h-4 w-4" />
                    AI Assistant
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="slide-up">
            <StatsCards
              projectStats={dashboardData.projectStats}
              taskStats={dashboardData.taskStats}
              userStats={dashboardData.userStats}
            />
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="slide-up" style={{ animationDelay: "0.1s" }}>
              <TaskCompletionTrend taskCompletionTrend={dashboardData.taskCompletionTrend} />
            </div>
            <div className="slide-up" style={{ animationDelay: "0.2s" }}>
              <ProjectProgressChart projectProgress={dashboardData.projectProgress} />
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="slide-up" style={{ animationDelay: "0.3s" }}>
              <UserProductivityChart userProductivity={dashboardData.userProductivity} />
            </div>
            <div className="slide-up" style={{ animationDelay: "0.4s" }}>
              <RecentActivity recentActivity={dashboardData.recentActivity} />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card
              className="card-hover border-2 border-transparent hover:border-primary/20 slide-up"
              style={{ animationDelay: "0.5s" }}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                    <CardDescription>Get started with common tasks</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start h-12 text-left" variant="ghost" asChild>
                  <Link href="/projects">
                    <FolderOpen className="mr-3 h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">View All Projects</div>
                      <div className="text-xs text-muted-foreground">Manage your project portfolio</div>
                    </div>
                  </Link>
                </Button>
                <Button className="w-full justify-start h-12 text-left" variant="ghost" asChild>
                  <Link href="/tasks">
                    <CheckSquare className="mr-3 h-5 w-5 text-blue-500" />
                    <div>
                      <div className="font-medium">View All Tasks</div>
                      <div className="text-xs text-muted-foreground">Track your team's progress</div>
                    </div>
                  </Link>
                </Button>
                {(user?.role === "Admin" || user?.role === "Manager") && (
                  <Button className="w-full justify-start h-12 text-left" variant="ghost" asChild>
                    <Link href="/users">
                      <Users className="mr-3 h-5 w-5 text-green-500" />
                      <div>
                        <div className="font-medium">Manage Team</div>
                        <div className="text-xs text-muted-foreground">Oversee team members</div>
                      </div>
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card
              className="card-hover border-2 border-transparent hover:border-primary/20 slide-up"
              style={{ animationDelay: "0.6s" }}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <Plus className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Create New</CardTitle>
                    <CardDescription>Start something new</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full justify-start h-12 text-left shadow-md hover:shadow-lg transition-all duration-200"
                  asChild
                >
                  <Link href="/projects">
                    <Plus className="mr-3 h-5 w-5" />
                    <div>
                      <div className="font-medium">New Project</div>
                      <div className="text-xs text-primary-foreground/80">Create a new project</div>
                    </div>
                  </Link>
                </Button>
                <Button className="w-full justify-start h-12 text-left bg-transparent" variant="outline" asChild>
                  <Link href="/tasks">
                    <Plus className="mr-3 h-5 w-5" />
                    <div>
                      <div className="font-medium">New Task</div>
                      <div className="text-xs text-muted-foreground">Add a new task</div>
                    </div>
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card
              className="card-hover border-2 border-transparent hover:border-primary/20 slide-up md:col-span-2 lg:col-span-1"
              style={{ animationDelay: "0.7s" }}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">AI Assistant</CardTitle>
                    <CardDescription>Boost your productivity</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full justify-start h-12 text-left bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  asChild
                >
                  <Link href="/ai">
                    <Sparkles className="mr-3 h-5 w-5" />
                    <div>
                      <div className="font-medium">Generate User Stories</div>
                      <div className="text-xs text-white/80">AI-powered story creation</div>
                    </div>
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    router.push("/auth")
    return null
  }

  return <Dashboard />
}
