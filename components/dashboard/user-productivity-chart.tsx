"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface UserProductivityChartProps {
  userProductivity: Array<{
    id: number
    name: string
    tasks_completed: number
  }>
}

export function UserProductivityChart({ userProductivity }: UserProductivityChartProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const maxTasks = Math.max(...userProductivity.map((u) => u.tasks_completed), 1)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Productivity</CardTitle>
        <CardDescription>Tasks completed in the last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {userProductivity.map((user, index) => (
            <div key={user.id} className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 flex-1">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <div className="flex items-center space-x-2">
                    <div
                      className="h-2 bg-primary rounded-full"
                      style={{ width: `${(user.tasks_completed / maxTasks) * 100}px`, minWidth: "4px" }}
                    />
                    <span className="text-xs text-muted-foreground">{user.tasks_completed} tasks</span>
                  </div>
                </div>
              </div>
              <Badge variant={index < 3 ? "default" : "outline"}>#{index + 1}</Badge>
            </div>
          ))}
          {userProductivity.length === 0 && (
            <p className="text-center text-muted-foreground py-4">No productivity data available</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
