import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Receipt, Plus, Upload, Check, X, DollarSign, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface Expense {
  id: string;
  employeeId: string;
  projectId: string;
  category: string;
  amount: number;
  date: Date;
  description: string;
  receiptUrl?: string;
  status: "Pending" | "Approved" | "Rejected" | "Reimbursed";
  submittedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  reimbursedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface Project {
  id: string;
  projectName: string;
}

interface User {
  id: string;
  email: string;
  role: string;
}

export default function ExpenseTracking() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterProject, setFilterProject] = useState<string>("all");
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  // Fetch user info
  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });

  // Fetch projects
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Fetch expenses
  const { data: expenses = [], isLoading } = useQuery<Expense[]>({
    queryKey: ["/api/expenses", user?.id, filterProject, filterStatus],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return [];
      let url = `/api/expenses?employeeId=${user.id}`;
      if (filterProject !== "all") url += `&projectId=${filterProject}`;
      if (filterStatus !== "all") url += `&status=${filterStatus}`;

      const response = await fetch(url, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch expenses");
      const data = await response.json();
      return data.map((exp: any) => ({
        ...exp,
        date: new Date(exp.date),
        submittedAt: new Date(exp.submittedAt),
        approvedAt: exp.approvedAt ? new Date(exp.approvedAt) : undefined,
        reimbursedAt: exp.reimbursedAt ? new Date(exp.reimbursedAt) : undefined,
        createdAt: new Date(exp.createdAt),
        updatedAt: new Date(exp.updatedAt),
      }));
    },
  });

  // Create expense mutation
  const createExpenseMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiFetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create expense");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      toast({ title: "Success", description: "Expense submitted successfully" });
      setIsCreateDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Approve expense mutation (Principle only)
  const approveExpenseMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/expenses/${id}/approve`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to approve expense");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      toast({ title: "Success", description: "Expense approved" });
      setSelectedExpense(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Reject expense mutation (Principle only)
  const rejectExpenseMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const response = await fetch(`/api/expenses/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (!response.ok) throw new Error("Failed to reject expense");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      toast({ title: "Success", description: "Expense rejected" });
      setSelectedExpense(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Mark as reimbursed mutation (Principle only)
  const reimburseMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/expenses/${id}/reimburse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reimbursementDate: new Date().toISOString() }),
      });
      if (!response.ok) throw new Error("Failed to mark as reimbursed");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      toast({ title: "Success", description: "Expense marked as reimbursed" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Delete expense mutation
  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/expenses/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete expense");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      toast({ title: "Success", description: "Expense deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleCreateExpense = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    createExpenseMutation.mutate({
      employeeId: user?.id,
      projectId: formData.get("projectId"),
      category: formData.get("category"),
      amount: parseFloat(formData.get("amount") as string),
      date: new Date(formData.get("date") as string).toISOString(),
      description: formData.get("description"),
      receiptUrl: formData.get("receiptUrl") || undefined,
    });
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
      Pending: { variant: "secondary" },
      Approved: { variant: "outline", className: "bg-green-50 text-green-700 border-green-200" },
      Rejected: { variant: "destructive" },
      Reimbursed: { variant: "outline", className: "bg-blue-50 text-blue-700 border-blue-200" },
    };
    const cfg = config[status] || { variant: "default" };
    return <Badge variant={cfg.variant} className={cfg.className}>{status}</Badge>;
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      Fuel: "⛽",
      Materials: "🛠️",
      "Site Visit": "🏗️",
      Transportation: "🚗",
      Equipment: "🔧",
      Meals: "🍽️",
      Accommodation: "🏨",
      Other: "📋",
    };
    return icons[category] || "📋";
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const pendingExpenses = expenses.filter(e => e.status === "Pending").reduce((sum, e) => sum + e.amount, 0);
  const approvedExpenses = expenses.filter(e => e.status === "Approved").reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expense Tracking</h1>
          <p className="text-muted-foreground">Track and manage project expenses</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleCreateExpense}>
              <DialogHeader>
                <DialogTitle>Submit Expense</DialogTitle>
                <DialogDescription>Record a project-related expense</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="projectId">Project *</Label>
                  <Select name="projectId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.projectName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select name="category" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fuel">⛽ Fuel</SelectItem>
                        <SelectItem value="Materials">🛠️ Materials</SelectItem>
                        <SelectItem value="Site Visit">🏗️ Site Visit</SelectItem>
                        <SelectItem value="Transportation">🚗 Transportation</SelectItem>
                        <SelectItem value="Equipment">🔧 Equipment</SelectItem>
                        <SelectItem value="Meals">🍽️ Meals</SelectItem>
                        <SelectItem value="Accommodation">🏨 Accommodation</SelectItem>
                        <SelectItem value="Other">📋 Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Amount (PKR) *</Label>
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    required
                    defaultValue={format(new Date(), "yyyy-MM-dd")}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    required
                    placeholder="Describe the expense"
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="receiptUrl">Receipt URL (Optional)</Label>
                  <Input
                    id="receiptUrl"
                    name="receiptUrl"
                    type="url"
                    placeholder="https://..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload receipt to cloud storage and paste the URL here
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createExpenseMutation.isPending}>
                  {createExpenseMutation.isPending ? "Submitting..." : "Submit Expense"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">PKR {totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{expenses.length} expenses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">PKR {pendingExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {expenses.filter(e => e.status === "Pending").length} pending
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">PKR {approvedExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {expenses.filter(e => e.status === "Approved").length} approved
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>Project</Label>
              <Select value={filterProject} onValueChange={setFilterProject}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.projectName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Reimbursed">Reimbursed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Expenses</CardTitle>
          <CardDescription>Your submitted project expenses</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No expenses found. Submit your first expense to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{format(expense.date, "MMM dd, yyyy")}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-2">
                        <span>{getCategoryIcon(expense.category)}</span>
                        <span className="text-sm">{expense.category}</span>
                      </span>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                      {expense.description}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{expense.projectId}</TableCell>
                    <TableCell className="text-right font-medium">
                      PKR {expense.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(expense.status)}</TableCell>
                    <TableCell className="text-right space-x-2">
                      {expense.receiptUrl && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(expense.receiptUrl, "_blank")}
                        >
                          <Receipt className="h-4 w-4" />
                        </Button>
                      )}
                      {user?.role === "principle" && expense.status === "Pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => approveExpenseMutation.mutate(expense.id)}
                            disabled={approveExpenseMutation.isPending}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setSelectedExpense(expense)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      {user?.role === "principle" && expense.status === "Approved" && (
                        <Button
                          size="sm"
                          onClick={() => reimburseMutation.mutate(expense.id)}
                          disabled={reimburseMutation.isPending}
                        >
                          <DollarSign className="h-4 w-4 mr-1" />
                          Reimburse
                        </Button>
                      )}
                      {user?.role === "employee" && expense.status === "Pending" && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteExpenseMutation.mutate(expense.id)}
                          disabled={deleteExpenseMutation.isPending}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                      {expense.status === "Rejected" && expense.rejectionReason && (
                        <p className="text-xs text-destructive mt-1">{expense.rejectionReason}</p>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      {selectedExpense && (
        <Dialog open={!!selectedExpense} onOpenChange={() => setSelectedExpense(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Expense</DialogTitle>
              <DialogDescription>
                Provide a reason for rejecting this expense (optional)
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                rejectExpenseMutation.mutate({
                  id: selectedExpense.id,
                  reason: formData.get("reason") as string | undefined,
                });
              }}
            >
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="reason">Reason</Label>
                  <Textarea
                    id="reason"
                    name="reason"
                    placeholder="Explain why this expense is being rejected"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setSelectedExpense(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="destructive" disabled={rejectExpenseMutation.isPending}>
                  {rejectExpenseMutation.isPending ? "Rejecting..." : "Reject Expense"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
