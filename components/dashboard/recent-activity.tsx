"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CheckSquare, Clock } from "lucide-react"

interface RecentActivityProps {
  recentActivity: Array<{
    type: string
    title: string
    status: string
    user_name: string
    updated_at: string
    project_name: string
  }>
}

export function RecentActivity({ recentActivity }: RecentActivityProps) {
  const getInitials = (name: string) => {
    if (!name) return "?"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Done":
        return "secondary"
      case "In Progress":
        return "default"
      case "To Do":
        return "outline"
      default:
        return "outline"
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest updates from your team</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                {activity.type === "task" && <CheckSquare className="h-4 w-4" />}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium line-clamp-1">{activity.title}</p>
                  <span className="text-xs text-muted-foreground">{formatTimeAgo(activity.updated_at)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={getStatusBadgeVariant(activity.status)} className="text-xs">
                    {activity.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">in {activity.project_name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Avatar className="h-4 w-4">
                    <AvatarFallback className="text-xs">{getInitials(activity.user_name)}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">by {activity.user_name}</span>
                </div>
              </div>
            </div>
          ))}
          {recentActivity.length === 0 && (
            <div className="text-center py-8">
              <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No recent activity</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
