"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { Loader2, Zap, Copy } from "lucide-react"

interface GeneratedTask {
  title: string
  description: string
  priority: string
  estimatedHours: number
  category: string
}

interface TaskGeneratorProps {
  userStory?: string
  onTasksGenerated?: (tasks: GeneratedTask[]) => void
}

export function TaskGenerator({ userStory: initialUserStory, onTasksGenerated }: TaskGeneratorProps) {
  const [userStory, setUserStory] = useState(initialUserStory || "")
  const [projectContext, setProjectContext] = useState("")
  const [tasks, setTasks] = useState<GeneratedTask[]>([])
  const [loading, setLoading] = useState(false)
  const { token } = useAuth()

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/ai/generate-tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userStory,
          projectContext,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setTasks(data.tasks)
        onTasksGenerated?.(data.tasks)
        toast({
          title: "Success",
          description: `Generated ${data.tasks.length} development tasks`,
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to generate tasks",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate tasks",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

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

  const getCategoryBadgeVariant = (category: string) => {
    switch (category) {
      case "Frontend":
        return "default"
      case "Backend":
        return "secondary"
      case "Database":
        return "outline"
      case "Testing":
        return "destructive"
      case "DevOps":
        return "secondary"
      default:
        return "outline"
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "Task details copied to clipboard",
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>AI Task Generator</span>
          </CardTitle>
          <CardDescription>
            Break down user stories into specific development tasks using AI. Perfect for sprint planning.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userStory">User Story *</Label>
              <Textarea
                id="userStory"
                placeholder="Enter the user story you want to break down into tasks..."
                value={userStory}
                onChange={(e) => setUserStory(e.target.value)}
                required
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="context">Project Context</Label>
              <Textarea
                id="context"
                placeholder="Provide additional context about your project, tech stack, or specific requirements..."
                value={projectContext}
                onChange={(e) => setProjectContext(e.target.value)}
                rows={3}
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Zap className="mr-2 h-4 w-4" />
              Generate Development Tasks
            </Button>
          </form>
        </CardContent>
      </Card>

      {tasks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Generated Tasks ({tasks.length})</h3>
            <div className="text-sm text-muted-foreground">
              Total estimated: {tasks.reduce((sum, task) => sum + task.estimatedHours, 0)} hours
            </div>
          </div>

          <div className="grid gap-4">
            {tasks.map((task, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-lg">{task.title}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getPriorityBadgeVariant(task.priority)}>{task.priority}</Badge>
                        <Badge variant={getCategoryBadgeVariant(task.category)}>{task.category}</Badge>
                        <Badge variant="outline">{task.estimatedHours}h</Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(
                          `${task.title}\n\n${task.description}\n\nPriority: ${task.priority}\nCategory: ${task.category}\nEstimated: ${task.estimatedHours} hours`,
                        )
                      }
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{task.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
