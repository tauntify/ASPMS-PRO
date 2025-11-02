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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { FileText, Plus, Download, Send, DollarSign, Trash2, Edit } from "lucide-react";
import { format } from "date-fns";

interface Invoice {
  id: string;
  invoiceNumber: string;
  projectId: string;
  clientId: string;
  issueDate: Date;
  dueDate: Date;
  paymentTerms: string;
  status: "Draft" | "Sent" | "Paid" | "Overdue" | "Cancelled";
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  overheadRate: number;
  overheadAmount: number;
  gaRate: number;
  gaAmount: number;
  total: number;
  amountPaid: number;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date;
}

interface InvoiceLineItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  category: "Labor" | "Materials" | "Milestone" | "Other";
}

interface Project {
  id: string;
  projectName: string;
}

interface Client {
  id: string;
  name: string;
}

export default function BillingInvoicing() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLineItemDialogOpen, setIsLineItemDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterProject, setFilterProject] = useState<string>("all");

  // Fetch projects
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Fetch clients
  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  // Fetch invoices
  const { data: invoices = [], isLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices", filterProject, filterStatus],
    queryFn: async () => {
      let url = "/api/invoices";
      const params = new URLSearchParams();
      if (filterProject !== "all") params.append("projectId", filterProject);
      if (filterStatus !== "all") params.append("status", filterStatus);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch invoices");
      const data = await response.json();
      return data.map((inv: any) => ({
        ...inv,
        issueDate: new Date(inv.issueDate),
        dueDate: new Date(inv.dueDate),
        createdAt: new Date(inv.createdAt),
        updatedAt: new Date(inv.updatedAt),
        paidAt: inv.paidAt ? new Date(inv.paidAt) : undefined,
      }));
    },
  });

  // Fetch line items for selected invoice
  const { data: lineItems = [] } = useQuery<InvoiceLineItem[]>({
    queryKey: ["/api/invoices", selectedInvoice?.id, "items"],
    enabled: !!selectedInvoice,
    queryFn: async () => {
      const response = await fetch(`/api/invoices/${selectedInvoice!.id}/items`, {
      });
      if (!response.ok) throw new Error("Failed to fetch line items");
      return response.json();
    },
  });

  // Create invoice mutation
  const createInvoiceMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiFetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create invoice");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({ title: "Success", description: "Invoice created successfully" });
      setIsCreateDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Add line item mutation
  const addLineItemMutation = useMutation({
    mutationFn: async ({ invoiceId, data }: { invoiceId: string; data: any }) => {
      const response = await fetch(`/api/invoices/${invoiceId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to add line item");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({ title: "Success", description: "Line item added" });
      setIsLineItemDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Update invoice status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(`/api/invoices/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update status");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({ title: "Success", description: "Invoice status updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Delete invoice mutation
  const deleteInvoiceMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/invoices/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete invoice");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({ title: "Success", description: "Invoice deleted" });
      setSelectedInvoice(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleCreateInvoice = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const issueDate = new Date(formData.get("issueDate") as string);
    const dueDate = new Date(formData.get("dueDate") as string);

    createInvoiceMutation.mutate({
      projectId: formData.get("projectId"),
      clientId: formData.get("clientId"),
      issueDate: issueDate.toISOString(),
      dueDate: dueDate.toISOString(),
      paymentTerms: formData.get("paymentTerms"),
      taxRate: parseFloat(formData.get("taxRate") as string) || 0,
      overheadRate: parseFloat(formData.get("overheadRate") as string) || 0,
      gaRate: parseFloat(formData.get("gaRate") as string) || 0,
      notes: formData.get("notes") || undefined,
    });
  };

  const handleAddLineItem = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    const formData = new FormData(e.currentTarget);
    addLineItemMutation.mutate({
      invoiceId: selectedInvoice.id,
      data: {
        description: formData.get("description"),
        quantity: parseFloat(formData.get("quantity") as string),
        unitPrice: parseFloat(formData.get("unitPrice") as string),
        category: formData.get("category"),
      },
    });
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
      Draft: { variant: "secondary" },
      Sent: { variant: "default" },
      Paid: { variant: "outline", className: "bg-green-50 text-green-700 border-green-200" },
      Overdue: { variant: "destructive" },
      Cancelled: { variant: "outline", className: "bg-gray-50 text-gray-700 border-gray-200" },
    };
    const cfg = config[status] || { variant: "default" };
    return <Badge variant={cfg.variant} className={cfg.className}>{status}</Badge>;
  };

  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
  const totalOutstanding = totalInvoiced - totalPaid;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing & Invoicing</h1>
          <p className="text-muted-foreground">Manage client invoices and payments</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <form onSubmit={handleCreateInvoice}>
              <DialogHeader>
                <DialogTitle>Create New Invoice</DialogTitle>
                <DialogDescription>Create an invoice for a project</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
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
                  <div className="grid gap-2">
                    <Label htmlFor="clientId">Client *</Label>
                    <Select name="clientId" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="issueDate">Issue Date *</Label>
                    <Input
                      id="issueDate"
                      name="issueDate"
                      type="date"
                      required
                      defaultValue={format(new Date(), "yyyy-MM-dd")}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="dueDate">Due Date *</Label>
                    <Input
                      id="dueDate"
                      name="dueDate"
                      type="date"
                      required
                      defaultValue={format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd")}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="paymentTerms">Payment Terms *</Label>
                  <Select name="paymentTerms" defaultValue="Net 30" required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Due on Receipt">Due on Receipt</SelectItem>
                      <SelectItem value="Net 15">Net 15</SelectItem>
                      <SelectItem value="Net 30">Net 30</SelectItem>
                      <SelectItem value="Net 45">Net 45</SelectItem>
                      <SelectItem value="Net 60">Net 60</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="taxRate">Tax Rate (%)</Label>
                    <Input
                      id="taxRate"
                      name="taxRate"
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue="17"
                      placeholder="17"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="overheadRate">Overhead (%)</Label>
                    <Input
                      id="overheadRate"
                      name="overheadRate"
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue="10"
                      placeholder="10"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="gaRate">G&A (%)</Label>
                    <Input
                      id="gaRate"
                      name="gaRate"
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue="5"
                      placeholder="5"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Additional notes or terms"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createInvoiceMutation.isPending}>
                  {createInvoiceMutation.isPending ? "Creating..." : "Create Invoice"}
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
            <CardTitle className="text-sm font-medium">Total Invoiced</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">PKR {totalInvoiced.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{invoices.length} invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">PKR {totalPaid.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {totalInvoiced > 0 ? `${((totalPaid / totalInvoiced) * 100).toFixed(0)}% collected` : "0% collected"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">PKR {totalOutstanding.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Pending collection</p>
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
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Sent">Sent</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>Manage and track client invoices</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No invoices found. Create your first invoice to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                    <TableCell>{format(invoice.issueDate, "MMM dd, yyyy")}</TableCell>
                    <TableCell>{format(invoice.dueDate, "MMM dd, yyyy")}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{invoice.projectId}</TableCell>
                    <TableCell className="text-right font-medium">
                      PKR {invoice.total.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">PKR {invoice.amountPaid.toLocaleString()}</TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedInvoice(invoice)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      {invoice.status === "Draft" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => updateStatusMutation.mutate({ id: invoice.id, status: "Sent" })}
                            disabled={updateStatusMutation.isPending}
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Send
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteInvoiceMutation.mutate(invoice.id)}
                            disabled={deleteInvoiceMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Invoice Details Dialog */}
      {selectedInvoice && (
        <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Invoice {selectedInvoice.invoiceNumber}</DialogTitle>
              <DialogDescription>
                {getStatusBadge(selectedInvoice.status)}
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="items" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="items">Line Items</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>
              <TabsContent value="items" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Line Items</h3>
                  {selectedInvoice.status === "Draft" && (
                    <Button
                      size="sm"
                      onClick={() => setIsLineItemDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Item
                    </Button>
                  )}
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">PKR {item.unitPrice.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-medium">
                          PKR {item.amount.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="space-y-2 border-t pt-4">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-medium">PKR {selectedInvoice.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Tax ({selectedInvoice.taxRate}%):</span>
                    <span>PKR {selectedInvoice.taxAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Overhead ({selectedInvoice.overheadRate}%):</span>
                    <span>PKR {selectedInvoice.overheadAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>G&A ({selectedInvoice.gaRate}%):</span>
                    <span>PKR {selectedInvoice.gaAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>PKR {selectedInvoice.total.toLocaleString()}</span>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="details" className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Project ID</Label>
                      <p className="font-medium">{selectedInvoice.projectId}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Client ID</Label>
                      <p className="font-medium">{selectedInvoice.clientId}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Issue Date</Label>
                      <p className="font-medium">{format(selectedInvoice.issueDate, "PPP")}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Due Date</Label>
                      <p className="font-medium">{format(selectedInvoice.dueDate, "PPP")}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Payment Terms</Label>
                    <p className="font-medium">{selectedInvoice.paymentTerms}</p>
                  </div>
                  {selectedInvoice.notes && (
                    <div>
                      <Label className="text-muted-foreground">Notes</Label>
                      <p className="text-sm">{selectedInvoice.notes}</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedInvoice(null)}>
                Close
              </Button>
              {selectedInvoice.status === "Sent" && (
                <Button
                  onClick={() => {
                    updateStatusMutation.mutate({ id: selectedInvoice.id, status: "Paid" });
                    setSelectedInvoice(null);
                  }}
                >
                  Mark as Paid
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Line Item Dialog */}
      <Dialog open={isLineItemDialogOpen} onOpenChange={setIsLineItemDialogOpen}>
        <DialogContent>
          <form onSubmit={handleAddLineItem}>
            <DialogHeader>
              <DialogTitle>Add Line Item</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="description">Description *</Label>
                <Input id="description" name="description" required placeholder="Service or item description" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="1"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="unitPrice">Unit Price *</Label>
                  <Input
                    id="unitPrice"
                    name="unitPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category *</Label>
                <Select name="category" defaultValue="Labor" required>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Labor">Labor</SelectItem>
                    <SelectItem value="Materials">Materials</SelectItem>
                    <SelectItem value="Milestone">Milestone</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsLineItemDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addLineItemMutation.isPending}>
                {addLineItemMutation.isPending ? "Adding..." : "Add Line Item"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
