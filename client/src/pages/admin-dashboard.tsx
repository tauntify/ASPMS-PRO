import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { formatSafeDate } from "@/lib/date-utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  Building2,
  FolderKanban,
  DollarSign,
  BarChart3,
  AlertCircle,
  Settings,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  User as User2,
  Eye
} from "lucide-react";
import { User } from "@shared/schema";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // Redirect if not admin
  if (user?.role !== "admin") {
    window.location.href = "/dashboard";
    return null;
  }

  // Fetch all users
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const res = await fetch("/api/users", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    }
  });

  // Fetch all projects
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ["/api/projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch projects");
      return res.json();
    }
  });

  // Impersonate user function
  const handleImpersonate = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/impersonate/${userId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('auth_token')}`
        },
        credentials: "include"
      });

      if (!res.ok) {
        throw new Error("Failed to impersonate user");
      }

      const data = await res.json();

      // Open in new tab with the impersonated user's token
      const newWindow = window.open('/dashboard', '_blank');
      if (newWindow) {
        // Wait for the window to load, then set the token
        newWindow.addEventListener('load', () => {
          newWindow.localStorage.setItem('auth_token', data.token);
          newWindow.location.href = '/dashboard';
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to view as user",
        variant: "destructive"
      });
    }
  };

  // Toggle user active status
  const toggleUserStatus = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isActive: !isActive })
      });
      if (!res.ok) throw new Error("Failed to update user status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Success",
        description: "User status updated successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive"
      });
    }
  });

  // Calculate statistics
  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.isActive).length,
    totalOrganizations: users.filter(u => u.accountType === "organization").length,
    totalIndividuals: users.filter(u => u.accountType === "individual").length,
    totalProjects: projects.length,
    principleUsers: users.filter(u => u.role === "principle").length,
    employeeUsers: users.filter(u => u.role === "employee").length,
    clientUsers: users.filter(u => u.role === "client").length,
  };

  // Filter users
  const filteredUsers = users.filter(u => {
    const matchesSearch = !searchQuery ||
      u.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "all" || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Get organizations (users with accountType=organization)
  const organizations = users.filter(u => u.accountType === "organization");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-3xl font-display font-bold">ARKA System Admin</h1>
                  <p className="text-muted-foreground">Platform Management Dashboard</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-primary border-primary">
                <Shield className="h-3 w-3 mr-1" />
                Administrator
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation("/admin/profile")}
              >
                <User2 className="h-4 w-4 mr-2" />
                Profile Settings
              </Button>
              <span className="text-sm text-muted-foreground">{user.fullName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.activeUsers} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Organizations
                </CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalOrganizations}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalIndividuals} individuals
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Projects
                </CardTitle>
                <FolderKanban className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalProjects}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Across all organizations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Revenue (Est.)
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ${(stats.totalOrganizations * 100) + (stats.totalIndividuals * 10)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Per month (estimated)
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="organizations">
              <Building2 className="h-4 w-4 mr-2" />
              Organizations
            </TabsTrigger>
            <TabsTrigger value="projects">
              <FolderKanban className="h-4 w-4 mr-2" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="payments">
              <DollarSign className="h-4 w-4 mr-2" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="logs">
              <AlertCircle className="h-4 w-4 mr-2" />
              Logs
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>
                      View and manage all platform users
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 w-64"
                      />
                    </div>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filter by role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="principle">Principle</SelectItem>
                        <SelectItem value="employee">Employee</SelectItem>
                        <SelectItem value="client">Client</SelectItem>
                        <SelectItem value="procurement">Procurement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading users...
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Account Type</TableHead>
                        <TableHead>Organization</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{u.fullName}</div>
                              <div className="text-sm text-muted-foreground">
                                @{u.username}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{u.email || "-"}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{u.role}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {u.accountType || "N/A"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {u.organizationName || "-"}
                          </TableCell>
                          <TableCell>
                            {u.isActive ? (
                              <Badge variant="default" className="bg-green-500">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                <XCircle className="h-3 w-3 mr-1" />
                                Suspended
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {u.role !== "admin" && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleImpersonate(u.id)}
                                  title="View as this user"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant={u.isActive ? "destructive" : "default"}
                                  onClick={() =>
                                    toggleUserStatus.mutate({
                                      userId: u.id,
                                      isActive: u.isActive as boolean
                                    })
                                  }
                                  disabled={toggleUserStatus.isPending}
                                >
                                  {u.isActive ? "Suspend" : "Activate"}
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Organizations Tab */}
          <TabsContent value="organizations">
            <Card>
              <CardHeader>
                <CardTitle>Organization Management</CardTitle>
                <CardDescription>
                  View all organization accounts and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organization</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Employees</TableHead>
                      <TableHead>Monthly Bill</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {organizations.map((org) => {
                      const employeeCount = users.filter(
                        u => u.role === "employee" && u.organizationName === org.organizationName
                      ).length;
                      const monthlyBill = 100 + (employeeCount * 10);

                      return (
                        <TableRow key={org.id}>
                          <TableCell className="font-medium">
                            {org.organizationName || "Unnamed"}
                          </TableCell>
                          <TableCell>{org.fullName}</TableCell>
                          <TableCell className="text-sm">{org.email}</TableCell>
                          <TableCell>{employeeCount}</TableCell>
                          <TableCell className="font-medium">
                            ${monthlyBill}/mo
                          </TableCell>
                          <TableCell>
                            {org.isActive ? (
                              <Badge variant="default" className="bg-green-500">
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="destructive">Suspended</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <CardTitle>Projects Overview</CardTitle>
                <CardDescription>
                  All projects across the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                {projectsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading projects...
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Project Name</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>Delivery Date</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {projects.map((project: any) => (
                        <TableRow key={project.id}>
                          <TableCell className="font-medium">
                            {project.name}
                          </TableCell>
                          <TableCell>{project.clientName || "-"}</TableCell>
                          <TableCell className="text-sm">
                            {formatSafeDate(project.startDate)}
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatSafeDate(project.deliveryDate)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatSafeDate(project.createdAt)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment Dashboard</CardTitle>
                <CardDescription>
                  Billing and subscription management (Stripe integration pending)
                </CardDescription>
              </CardHeader>
              <CardContent className="py-12 text-center">
                <DollarSign className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Payment Integration Coming Soon</h3>
                <p className="text-muted-foreground mb-6">
                  Stripe/PayFast integration will be added here
                </p>
                <div className="bg-muted/50 p-6 rounded-lg max-w-md mx-auto">
                  <h4 className="font-semibold mb-3">Estimated Monthly Revenue</h4>
                  <div className="text-4xl font-bold text-primary mb-2">
                    ${(stats.totalOrganizations * 100) + (stats.totalIndividuals * 10)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {stats.totalOrganizations} orgs × $100 + {stats.totalIndividuals} individuals × $10
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Usage Analytics</CardTitle>
                <CardDescription>
                  Platform usage metrics and statistics
                </CardDescription>
              </CardHeader>
              <CardContent className="py-12 text-center">
                <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Analytics Dashboard</h3>
                <p className="text-muted-foreground mb-6">
                  Firebase Analytics integration will be added here
                </p>
                <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{stats.principleUsers}</div>
                    <div className="text-sm text-muted-foreground mt-1">Principles</div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{stats.employeeUsers}</div>
                    <div className="text-sm text-muted-foreground mt-1">Employees</div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{stats.clientUsers}</div>
                    <div className="text-sm text-muted-foreground mt-1">Clients</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>Error Logs</CardTitle>
                <CardDescription>
                  Cloud Functions error logs and monitoring
                </CardDescription>
              </CardHeader>
              <CardContent className="py-12 text-center">
                <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Error Monitoring</h3>
                <p className="text-muted-foreground mb-6">
                  Cloud Functions logging integration will be added here
                </p>
                <Button variant="outline" onClick={() => window.open('https://console.firebase.google.com/project/aspms-pro-v1/functions', '_blank')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Open Firebase Console
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
