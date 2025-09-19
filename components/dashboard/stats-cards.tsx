"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Users, FolderOpen, CheckSquare, AlertTriangle, Clock } from "lucide-react"

interface StatsCardsProps {
  projectStats: any
  taskStats: any
  userStats: any
}

export function StatsCards({ projectStats, taskStats, userStats }: StatsCardsProps) {
  const completionRate =
    taskStats.total_tasks > 0 ? Math.round((taskStats.completed_tasks / taskStats.total_tasks) * 100) : 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
          <FolderOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{projectStats.total_projects}</div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
            <Badge variant="default" className="text-xs">
              {projectStats.active_projects} Active
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {projectStats.completed_projects} Done
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          <CheckSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{taskStats.total_tasks}</div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
            <Badge variant="outline" className="text-xs">
              {taskStats.todo_tasks} To Do
            </Badge>
            <Badge variant="default" className="text-xs">
              {taskStats.in_progress_tasks} Active
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Team Members</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{userStats.total_users}</div>
          <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
            <span>{userStats.admin_users} Admins</span>
            <span>•</span>
            <span>{userStats.manager_users} Managers</span>
            <span>•</span>
            <span>{userStats.developer_users} Devs</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completionRate}%</div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
            {taskStats.overdue_tasks > 0 && (
              <div className="flex items-center space-x-1 text-destructive">
                <AlertTriangle className="h-3 w-3" />
                <span>{taskStats.overdue_tasks} overdue</span>
              </div>
            )}
            {taskStats.high_priority_tasks > 0 && (
              <div className="flex items-center space-x-1 text-orange-600">
                <Clock className="h-3 w-3" />
                <span>{taskStats.high_priority_tasks} high priority</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
