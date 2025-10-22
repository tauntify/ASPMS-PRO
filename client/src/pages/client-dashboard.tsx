import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth, logout } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Project, 
  ProjectAssignment, 
  Division, 
  Item, 
  Task, 
  Comment, 
  ProjectFinancials,
  User,
} from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  LogOut,
  ExternalLink,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Calendar,
  DollarSign,
  FileText,
  MessageSquare,
  Users,
  Package,
  ArrowLeft,
  Send,
} from "lucide-react";
import { format } from "date-fns";

interface ProjectWithDetails extends Project {
  financials?: ProjectFinancials;
  health: "excellent" | "good" | "warning" | "critical";
  score: number;
}

export default function ClientDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");

  // Fetch project assignments for this client
  const { data: assignments = [] } = useQuery<ProjectAssignment[]>({
    queryKey: ["/api/assignments", user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/assignments?userId=${user?.id}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch assignments");
      return res.json();
    },
    enabled: !!user?.id,
  });

  // Get assigned project IDs
  const assignedProjectIds = assignments.map(a => a.projectId);

  // Fetch all projects
  const { data: allProjects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Filter to only assigned projects
  const assignedProjects = allProjects.filter(p => assignedProjectIds.includes(p.id));

  // Fetch divisions for selected project
  const { data: divisions = [] } = useQuery<Division[]>({
    queryKey: ["/api/divisions", selectedProjectId],
    queryFn: async () => {
      const res = await fetch(`/api/divisions?projectId=${selectedProjectId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch divisions");
      return res.json();
    },
    enabled: !!selectedProjectId,
  });

  // Fetch items for selected project
  const { data: items = [] } = useQuery<Item[]>({
    queryKey: ["/api/items", selectedProjectId],
    queryFn: async () => {
      const res = await fetch(`/api/items?projectId=${selectedProjectId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch items");
      return res.json();
    },
    enabled: !!selectedProjectId,
  });

  // Fetch tasks for selected project
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks", selectedProjectId],
    queryFn: async () => {
      const res = await fetch(`/api/tasks?projectId=${selectedProjectId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch tasks");
      return res.json();
    },
    enabled: !!selectedProjectId,
  });

  // Fetch financials for selected project
  const { data: financials } = useQuery<ProjectFinancials>({
    queryKey: ["/api/financials", selectedProjectId],
    queryFn: async () => {
      const res = await fetch(`/api/financials/${selectedProjectId}`, {
        credentials: "include",
      });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!selectedProjectId,
  });

  // Fetch comments for selected project
  const { data: comments = [] } = useQuery<Comment[]>({
    queryKey: ["/api/comments", selectedProjectId],
    queryFn: async () => {
      const res = await fetch(`/api/comments?projectId=${selectedProjectId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch comments");
      return res.json();
    },
    enabled: !!selectedProjectId,
  });

  // Fetch all users for displaying employee names
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const res = await fetch("/api/users", {
        credentials: "include",
      });
      if (!res.ok) return [];
      return res.json();
    },
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (comment: string) => {
      const res = await apiRequest("POST", "/api/comments", {
        projectId: selectedProjectId,
        userId: user?.id,
        comment,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comments", selectedProjectId] });
      setNewComment("");
      toast({
        title: "Comment added",
        description: "Your comment has been posted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add comment.",
        variant: "destructive",
      });
    },
  });

  // Calculate project health with financials
  const projectsWithDetails: ProjectWithDetails[] = assignedProjects.map(project => {
    // Get tasks for this project
    const projectTasks = tasks.filter(t => t.projectId === project.id);
    const completedTasks = projectTasks.filter(t => t.status === "Done").length;
    const totalTasks = projectTasks.length;
    const taskCompletion = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 100;

    // Get items for this project
    const projectItems = items.filter(i => {
      const itemDivision = divisions.find(d => d.id === i.divisionId);
      return itemDivision?.projectId === project.id;
    });
    const completedItems = projectItems.filter(i => i.status === "Installed" || i.status === "Delivered").length;
    const totalItems = projectItems.length;
    const itemCompletion = totalItems > 0 ? (completedItems / totalItems) * 100 : 100;

    const score = (taskCompletion + itemCompletion) / 2;
    
    let health: ProjectWithDetails["health"] = "excellent";
    if (score < 40) health = "critical";
    else if (score < 60) health = "warning";
    else if (score < 80) health = "good";

    return { ...project, health, score };
  });

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout.",
        variant: "destructive",
      });
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim()) {
      toast({
        title: "Error",
        description: "Please enter a comment.",
        variant: "destructive",
      });
      return;
    }
    addCommentMutation.mutate(newComment);
  };

  const getHealthColor = (health: ProjectWithDetails["health"]) => {
    switch (health) {
      case "excellent":
        return "text-green-500 border-green-500/50 bg-green-500/10";
      case "good":
        return "text-blue-500 border-blue-500/50 bg-blue-500/10";
      case "warning":
        return "text-yellow-500 border-yellow-500/50 bg-yellow-500/10";
      case "critical":
        return "text-red-500 border-red-500/50 bg-red-500/10";
    }
  };

  const getHealthIcon = (health: ProjectWithDetails["health"]) => {
    switch (health) {
      case "excellent":
        return <CheckCircle2 className="w-5 h-5" />;
      case "good":
        return <TrendingUp className="w-5 h-5" />;
      case "warning":
      case "critical":
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const selectedProject = projectsWithDetails.find(p => p.id === selectedProjectId);
  const selectedFinancials = financials;

  // Calculate overall progress for selected project
  const calculateProgress = () => {
    if (!selectedProjectId) return 0;
    
    const projectItems = items.filter(i => {
      const itemDivision = divisions.find(d => d.id === i.divisionId);
      return itemDivision?.projectId === selectedProjectId;
    });
    
    const completedItems = projectItems.filter(i => 
      i.status === "Installed" || i.status === "Delivered"
    ).length;
    
    return projectItems.length > 0 ? (completedItems / projectItems.length) * 100 : 0;
  };

  // Group items by division
  const itemsByDivision = divisions.map(div => ({
    division: div,
    items: items.filter(i => i.divisionId === div.id),
  }));

  // Group tasks by employee
  const tasksByEmployee = tasks.reduce((acc, task) => {
    const employeeId = task.employeeId;
    if (!acc[employeeId]) {
      acc[employeeId] = [];
    }
    acc[employeeId].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-primary/30 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-primary/20 border border-primary/50 flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-primary" />
            </div>
            <div>
              <a
                href="https://arka.pk"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 group"
                data-testid="link-arka-website"
              >
                <h1 className="text-2xl font-display font-bold text-foreground tracking-wide">
                  ARKA SERVICES
                </h1>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">
                Client Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 rounded-md bg-primary/10 border border-primary/40">
              <Avatar data-testid="avatar-client">
                <AvatarFallback className="bg-primary/20 text-primary font-display">
                  {user?.fullName?.split(" ").map((n) => n[0]).join("").toUpperCase() || "CL"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold text-foreground" data-testid="text-client-name">
                  {user?.fullName || "Client"}
                </p>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Client
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-destructive/50 text-destructive hover:bg-destructive/10"
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-[1600px] mx-auto space-y-6">
          {!selectedProjectId ? (
            /* My Projects View */
            <>
              <div className="flex items-center gap-3 mb-6">
                <Briefcase className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-display font-bold text-foreground">
                  My Projects
                </h2>
              </div>

              {projectsWithDetails.length === 0 ? (
                <Card className="p-12">
                  <div className="text-center">
                    <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2" data-testid="text-no-projects">
                      No Projects Assigned
                    </h3>
                    <p className="text-muted-foreground">
                      You don't have any projects assigned yet. Please contact ARKA Services for assistance.
                    </p>
                  </div>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projectsWithDetails.map(project => (
                    <Card
                      key={project.id}
                      className={`p-6 border cursor-pointer hover-elevate ${getHealthColor(project.health)}`}
                      onClick={() => setSelectedProjectId(project.id)}
                      data-testid={`card-project-${project.id}`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-display font-bold text-foreground mb-1" data-testid={`text-project-name-${project.id}`}>
                            {project.name}
                          </h3>
                          {project.projectTitle && (
                            <p className="text-sm text-muted-foreground" data-testid={`text-project-title-${project.id}`}>
                              {project.projectTitle}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {getHealthIcon(project.health)}
                          <span className="text-sm font-mono font-bold" data-testid={`text-health-score-${project.id}`}>
                            {project.score.toFixed(0)}%
                          </span>
                        </div>
                      </div>

                      <Separator className="mb-4" />

                      <div className="space-y-3">
                        {project.startDate && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Start:</span>
                            <span className="text-foreground font-medium" data-testid={`text-start-date-${project.id}`}>
                              {format(new Date(project.startDate), "dd MMM yyyy")}
                            </span>
                          </div>
                        )}

                        {project.deliveryDate && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Delivery:</span>
                            <span className="text-foreground font-medium" data-testid={`text-delivery-date-${project.id}`}>
                              {format(new Date(project.deliveryDate), "dd MMM yyyy")}
                            </span>
                          </div>
                        )}

                        <div className="pt-2">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-muted-foreground uppercase tracking-wider">
                              Progress
                            </span>
                            <span className="text-xs font-mono font-bold text-foreground" data-testid={`text-progress-${project.id}`}>
                              {project.score.toFixed(0)}%
                            </span>
                          </div>
                          <Progress value={project.score} className="h-2" />
                        </div>

                        <Badge variant="outline" className="capitalize w-full justify-center">
                          {project.health}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* Project Details View */
            <>
              <div className="flex items-center gap-4 mb-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedProjectId(null)}
                  data-testid="button-back"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Projects
                </Button>
                <div className="flex-1">
                  <h2 className="text-2xl font-display font-bold text-foreground" data-testid="text-selected-project-name">
                    {selectedProject?.name}
                  </h2>
                  {selectedProject?.projectTitle && (
                    <p className="text-muted-foreground">{selectedProject.projectTitle}</p>
                  )}
                </div>
              </div>

              {/* Project Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Health Score
                    </h3>
                  </div>
                  <p className={`text-4xl font-display font-bold ${getHealthColor(selectedProject?.health || "good")}`} data-testid="text-detail-health-score">
                    {selectedProject?.score.toFixed(0)}%
                  </p>
                  <Badge variant="outline" className="mt-2 capitalize">
                    {selectedProject?.health}
                  </Badge>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Package className="w-5 h-5 text-blue-500" />
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Overall Progress
                    </h3>
                  </div>
                  <p className="text-4xl font-display font-bold text-foreground" data-testid="text-detail-progress">
                    {calculateProgress().toFixed(0)}%
                  </p>
                  <Progress value={calculateProgress()} className="h-2 mt-2" />
                </Card>

                {selectedFinancials && (
                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <DollarSign className="w-5 h-5 text-green-500" />
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Payment Status
                      </h3>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Received: <span className="font-semibold text-foreground" data-testid="text-amount-received">
                          PKR {Number(selectedFinancials.amountReceived).toLocaleString()}
                        </span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Contract: <span className="font-semibold text-foreground" data-testid="text-contract-value">
                          PKR {Number(selectedFinancials.contractValue).toLocaleString()}
                        </span>
                      </p>
                      <Progress 
                        value={(Number(selectedFinancials.amountReceived) / Number(selectedFinancials.contractValue)) * 100} 
                        className="h-2 mt-2" 
                      />
                    </div>
                  </Card>
                )}
              </div>

              {/* Divisions and Items */}
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-display font-bold text-foreground">
                    Division & Item Breakdown
                  </h3>
                </div>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {itemsByDivision.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8" data-testid="text-no-divisions">
                        No divisions found for this project.
                      </p>
                    ) : (
                      itemsByDivision.map(({ division, items: divItems }) => (
                        <Card key={division.id} className="p-4" data-testid={`card-division-${division.id}`}>
                          <h4 className="font-semibold text-foreground mb-3" data-testid={`text-division-name-${division.id}`}>
                            {division.name}
                          </h4>
                          <div className="space-y-2">
                            {divItems.length === 0 ? (
                              <p className="text-sm text-muted-foreground">No items in this division.</p>
                            ) : (
                              divItems.map(item => (
                                <div key={item.id} className="flex items-center justify-between gap-4 py-2 border-b border-border last:border-0" data-testid={`item-${item.id}`}>
                                  <div className="flex-1">
                                    <p className="text-sm text-foreground" data-testid={`text-item-desc-${item.id}`}>
                                      {item.description}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {Number(item.quantity).toLocaleString()} {item.unit} @ PKR {Number(item.rate).toLocaleString()}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <Badge variant="outline" className="capitalize" data-testid={`badge-priority-${item.id}`}>
                                      {item.priority}
                                    </Badge>
                                    <Badge variant={item.status === "Delivered" || item.status === "Installed" ? "default" : "secondary"} data-testid={`badge-status-${item.id}`}>
                                      {item.status}
                                    </Badge>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </Card>

              {/* Task Progress by Employee */}
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-display font-bold text-foreground">
                    Task Progress by Employee
                  </h3>
                </div>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    {Object.keys(tasksByEmployee).length === 0 ? (
                      <p className="text-center text-muted-foreground py-8" data-testid="text-no-tasks">
                        No tasks assigned for this project.
                      </p>
                    ) : (
                      Object.entries(tasksByEmployee).map(([employeeId, empTasks]) => {
                        const employee = users.find(u => u.id === employeeId);
                        const completedTasks = empTasks.filter(t => t.status === "Done").length;
                        const progress = (completedTasks / empTasks.length) * 100;

                        return (
                          <Card key={employeeId} className="p-4" data-testid={`card-employee-${employeeId}`}>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarFallback className="bg-primary/20 text-primary">
                                    {employee?.fullName?.charAt(0).toUpperCase() || "E"}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-semibold text-foreground" data-testid={`text-employee-name-${employeeId}`}>
                                    {employee?.fullName || "Unknown Employee"}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {completedTasks} of {empTasks.length} tasks completed
                                  </p>
                                </div>
                              </div>
                              <span className="text-sm font-mono font-bold text-foreground" data-testid={`text-employee-progress-${employeeId}`}>
                                {progress.toFixed(0)}%
                              </span>
                            </div>
                            <Progress value={progress} className="h-2 mb-3" />
                            <div className="space-y-1">
                              {empTasks.map(task => (
                                <div key={task.id} className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground" data-testid={`text-task-type-${task.id}`}>
                                    {task.taskType}
                                  </span>
                                  <Badge 
                                    variant={task.status === "Done" ? "default" : task.status === "In Progress" ? "secondary" : "outline"}
                                    data-testid={`badge-task-status-${task.id}`}
                                  >
                                    {task.status}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </Card>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>
              </Card>

              {/* Comments Section */}
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-display font-bold text-foreground">
                    Comments
                  </h3>
                </div>
                <ScrollArea className="h-[300px] mb-4">
                  <div className="space-y-4">
                    {comments.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8" data-testid="text-no-comments">
                        No comments yet. Be the first to comment!
                      </p>
                    ) : (
                      comments.map(comment => {
                        const commentUser = users.find(u => u.id === comment.userId);
                        return (
                          <div key={comment.id} className="flex gap-3" data-testid={`comment-${comment.id}`}>
                            <Avatar>
                              <AvatarFallback className="bg-primary/20 text-primary">
                                {commentUser?.fullName?.charAt(0).toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold text-foreground text-sm" data-testid={`text-comment-user-${comment.id}`}>
                                  {commentUser?.fullName || "Unknown User"}
                                </p>
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(comment.createdAt), "dd MMM yyyy, HH:mm")}
                                </span>
                              </div>
                              <p className="text-sm text-foreground" data-testid={`text-comment-content-${comment.id}`}>
                                {comment.comment}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>

                <div className="flex gap-3">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1"
                    rows={3}
                    data-testid="textarea-comment"
                  />
                  <Button
                    onClick={handleAddComment}
                    disabled={addCommentMutation.isPending || !newComment.trim()}
                    data-testid="button-add-comment"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
