"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Calendar } from "lucide-react"

interface Task {
  id: number
  title: string
  description: string
  status: string
  priority: string
  project_id: number
  project_name: string
  assigned_to: number
  assigned_to_name: string
  created_by: number
  created_by_name: string
  due_date: string
  created_at: string
}

interface TaskKanbanProps {
  tasks: Task[]
  onStatusChange: (taskId: number, newStatus: string) => void
  onTaskUpdate: () => void
}

const STATUSES = [
  { key: "To Do", label: "To Do", color: "bg-gray-100" },
  { key: "In Progress", label: "In Progress", color: "bg-blue-100" },
  { key: "Done", label: "Done", color: "bg-green-100" },
]

export function TaskKanban({ tasks, onStatusChange, onTaskUpdate }: TaskKanbanProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case "High":
        return "destructive"
      case "Medium":
        return "default"
      case "Low":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getInitials = (name: string) => {
    if (!name) return "?"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    if (draggedTask && draggedTask.status !== newStatus) {
      onStatusChange(draggedTask.id, newStatus)
    }
    setDraggedTask(null)
  }

  const getTasksByStatus = (status: string) => {
    return tasks.filter((task) => task.status === status)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {STATUSES.map((status) => {
        const statusTasks = getTasksByStatus(status.key)
        return (
          <div
            key={status.key}
            className={`rounded-lg p-4 ${status.color} min-h-[500px]`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status.key)}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">{status.label}</h3>
              <Badge variant="outline">{statusTasks.length}</Badge>
            </div>

            <div className="space-y-3">
              {statusTasks.map((task) => (
                <Card
                  key={task.id}
                  className="cursor-move hover:shadow-md transition-shadow bg-white"
                  draggable
                  onDragStart={(e) => handleDragStart(e, task)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-sm line-clamp-2">{task.title}</CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-6 w-6 p-0">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Move to</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {STATUSES.filter((s) => s.key !== task.status).map((s) => (
                            <DropdownMenuItem key={s.key} onClick={() => onStatusChange(task.id, s.key)}>
                              {s.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <Badge variant={getPriorityBadgeVariant(task.priority)} className="w-fit">
                      {task.priority}
                    </Badge>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    {task.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                    )}

                    <div className="text-xs text-muted-foreground">
                      <strong>Project:</strong> {task.project_name}
                    </div>

                    {task.assigned_to_name && (
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-xs">{getInitials(task.assigned_to_name)}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">{task.assigned_to_name}</span>
                      </div>
                    )}

                    {task.due_date && (
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(task.due_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
