"use client"
import { useAuth } from "@/contexts/auth-context"
import { Navbar } from "@/components/layout/navbar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserStoryGenerator } from "@/components/ai/user-story-generator"
import { TaskGenerator } from "@/components/ai/task-generator"
import { useRouter } from "next/navigation"
import { Sparkles, Zap } from "lucide-react"

export default function AIPage() {
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto py-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">AI Assistant</h1>
            <p className="text-muted-foreground">
              Use AI to generate user stories and break them down into development tasks
            </p>
          </div>

          <Tabs defaultValue="stories" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="stories" className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4" />
                <span>User Stories</span>
              </TabsTrigger>
              <TabsTrigger value="tasks" className="flex items-center space-x-2">
                <Zap className="h-4 w-4" />
                <span>Task Breakdown</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="stories">
              <UserStoryGenerator />
            </TabsContent>

            <TabsContent value="tasks">
              <TaskGenerator />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
