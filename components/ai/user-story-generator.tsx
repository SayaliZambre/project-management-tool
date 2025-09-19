"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { Loader2, Sparkles, Copy, Plus } from "lucide-react"

interface UserStory {
  title: string
  story: string
  acceptanceCriteria: string[]
  priority: string
  estimatedEffort: string
}

export function UserStoryGenerator() {
  const [projectDescription, setProjectDescription] = useState("")
  const [projectType, setProjectType] = useState("")
  const [targetAudience, setTargetAudience] = useState("")
  const [features, setFeatures] = useState("")
  const [userStories, setUserStories] = useState<UserStory[]>([])
  const [loading, setLoading] = useState(false)
  const { token } = useAuth()

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/ai/generate-stories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectDescription,
          projectType,
          targetAudience,
          features,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setUserStories(data.userStories)
        toast({
          title: "Success",
          description: `Generated ${data.userStories.length} user stories`,
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to generate user stories",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate user stories",
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

  const getEffortBadgeVariant = (effort: string) => {
    switch (effort) {
      case "Large":
        return "destructive"
      case "Medium":
        return "default"
      case "Small":
        return "secondary"
      default:
        return "outline"
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "User story copied to clipboard",
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5" />
            <span>AI User Story Generator</span>
          </CardTitle>
          <CardDescription>
            Generate comprehensive user stories for your project using AI. Provide project details to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Project Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your project, its goals, and main functionality..."
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                required
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Project Type</Label>
                <Select value={projectType} onValueChange={setProjectType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Web Application">Web Application</SelectItem>
                    <SelectItem value="Mobile App">Mobile App</SelectItem>
                    <SelectItem value="Desktop Software">Desktop Software</SelectItem>
                    <SelectItem value="API/Backend Service">API/Backend Service</SelectItem>
                    <SelectItem value="E-commerce Platform">E-commerce Platform</SelectItem>
                    <SelectItem value="SaaS Platform">SaaS Platform</SelectItem>
                    <SelectItem value="Content Management System">Content Management System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="audience">Target Audience</Label>
                <Input
                  id="audience"
                  placeholder="e.g., Small business owners, Students, Developers"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="features">Key Features</Label>
              <Textarea
                id="features"
                placeholder="List the main features and functionality you want to include..."
                value={features}
                onChange={(e) => setFeatures(e.target.value)}
                rows={3}
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Sparkles className="mr-2 h-4 w-4" />
              Generate User Stories
            </Button>
          </form>
        </CardContent>
      </Card>

      {userStories.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Generated User Stories ({userStories.length})</h3>
            <Button variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Create Tasks from Stories
            </Button>
          </div>

          <div className="grid gap-4">
            {userStories.map((story, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-lg">{story.title}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getPriorityBadgeVariant(story.priority)}>{story.priority}</Badge>
                        <Badge variant={getEffortBadgeVariant(story.estimatedEffort)}>{story.estimatedEffort}</Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(
                          `${story.title}\n\n${story.story}\n\nAcceptance Criteria:\n${story.acceptanceCriteria.map((c, i) => `${i + 1}. ${c}`).join("\n")}`,
                        )
                      }
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">User Story</h4>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">{story.story}</p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Acceptance Criteria</h4>
                    <ul className="space-y-1">
                      {story.acceptanceCriteria.map((criteria, criteriaIndex) => (
                        <li key={criteriaIndex} className="text-sm text-muted-foreground flex items-start space-x-2">
                          <span className="text-primary font-medium">{criteriaIndex + 1}.</span>
                          <span>{criteria}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
