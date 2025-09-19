"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface ProjectProgressChartProps {
  projectProgress: Array<{
    id: number
    name: string
    status: string
    total_tasks: number
    completed_tasks: number
    completion_percentage: number
  }>
}

export function ProjectProgressChart({ projectProgress }: ProjectProgressChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Progress</CardTitle>
        <CardDescription>Track completion status of active projects</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {projectProgress.map((project) => (
            <div key={project.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">{project.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {project.completed_tasks} of {project.total_tasks} tasks completed
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{project.completion_percentage}%</Badge>
                </div>
              </div>
              <Progress value={project.completion_percentage} className="h-2" />
            </div>
          ))}
          {projectProgress.length === 0 && (
            <p className="text-center text-muted-foreground py-4">No active projects found</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
