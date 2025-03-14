import { useQuery } from "@tanstack/react-query";
import { Project } from "@shared/schema";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Bot, Key, Calendar, BarChart3 } from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    onError: (error) => {
      toast({
        title: "Error loading projects",
        description: error instanceof Error ? error.message : "Failed to load projects",
        variant: "destructive",
      });
    }
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your chatbots and monitor their performance</p>
        </div>
        <Link href="/generate-api">
          <Button className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Create New Chatbot
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <Bot className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-gray-500">Total Chatbots</p>
              <p className="text-2xl font-bold">{projects?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <Key className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-gray-500">Active API Keys</p>
              <p className="text-2xl font-bold">{projects?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <Calendar className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-gray-500">Last Created</p>
              <p className="text-2xl font-bold">
                {projects && projects.length > 0
                  ? new Date(projects[0].createdAt).toLocaleDateString()
                  : "-"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {(!projects || projects.length === 0) ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bot className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl font-semibold text-gray-900 mb-2">
              No Chatbots Yet
            </p>
            <p className="text-gray-600 mb-6">
              Create your first chatbot to start engaging with your customers
            </p>
            <Link href="/generate-api">
              <Button>Create Your First Chatbot</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    {project.name}
                  </CardTitle>
                  <BarChart3 className="h-5 w-5 text-gray-400" />
                </div>
                <CardDescription>{project.botName}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Service Type</p>
                    <p className="text-gray-900">{project.serviceType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">API Key</p>
                    <p className="text-sm font-mono bg-gray-50 p-2 rounded-md break-all">
                      {project.apiKey}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Created</p>
                    <p className="text-gray-900">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}