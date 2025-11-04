import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, FolderOpen, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Project {
  id: number;
  name: string;
  clientName?: string;
  status?: string;
}

export default function ProjectSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingProject, setEditingProject] = useState<number | null>(null);
  const [newName, setNewName] = useState("");

  // Fetch all projects
  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Rename mutation
  const renameMutation = useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      const response = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error("Failed to rename project");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Success",
        description: "Project renamed successfully",
      });
      setEditingProject(null);
      setNewName("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to rename project",
        variant: "destructive",
      });
    },
  });

  const handleStartEdit = (project: Project) => {
    setEditingProject(project.id);
    setNewName(project.name);
  };

  const handleCancelEdit = () => {
    setEditingProject(null);
    setNewName("");
  };

  const handleSaveRename = (id: number) => {
    if (!newName.trim()) {
      toast({
        title: "Validation Error",
        description: "Project name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    renameMutation.mutate({ id, name: newName.trim() });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderOpen className="w-5 h-5" />
          Project Settings & Rename
        </CardTitle>
        <CardDescription>
          Change the permanent display name of any project (used throughout the system)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Renaming a project will update its display name everywhere in the system. This action is
            logged for audit purposes.
          </AlertDescription>
        </Alert>

        {projects.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FolderOpen className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>No projects found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-primary/50 transition-colors"
              >
                {editingProject === project.id ? (
                  <>
                    <div className="flex-1">
                      <Label htmlFor={`project-name-${project.id}`} className="text-xs text-muted-foreground">
                        Project Name
                      </Label>
                      <Input
                        id={`project-name-${project.id}`}
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="mt-1"
                        placeholder="Enter new project name"
                        autoFocus
                      />
                      {project.clientName && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Client: {project.clientName}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleSaveRename(project.id)}
                        disabled={renameMutation.isPending}
                        size="sm"
                      >
                        {renameMutation.isPending ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        onClick={handleCancelEdit}
                        disabled={renameMutation.isPending}
                        variant="outline"
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{project.name}</div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        {project.clientName && <span>Client: {project.clientName}</span>}
                        {project.status && (
                          <>
                            <span>•</span>
                            <span>Status: {project.status}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleStartEdit(project)}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Pencil className="w-3 h-3" />
                      Rename
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
