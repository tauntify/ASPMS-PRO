import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth, logout } from "@/lib/auth";
import { Project, ProcurementItem, InsertProcurementItem } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShoppingCart,
  Package,
  CheckCircle2,
  DollarSign,
  Plus,
  LogOut,
  ExternalLink,
  Edit2,
  Save,
  X,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

interface EditFormData {
  executionCost?: number;
  billNumber?: string;
  rentalDetails?: string;
  notes?: string;
}

export default function ProcurementDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<EditFormData>({});

  // Fetch projects
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Fetch procurement items for all projects
  const { data: allProcurement = [], isLoading } = useQuery<ProcurementItem[]>({
    queryKey: ["/api/procurement/all"],
    queryFn: async () => {
      const procurementData: ProcurementItem[] = [];
      for (const project of projects) {
        try {
          const res = await fetch(`/api/procurement?projectId=${project.id}`, {
            credentials: "include",
          });
          if (res.ok) {
            const data = await res.json();
            procurementData.push(...data);
          }
        } catch (error) {
          console.error(`Failed to fetch procurement for project ${project.id}`, error);
        }
      }
      return procurementData;
    },
    enabled: projects.length > 0,
  });

  // Filter procurement items by selected project
  const filteredProcurement =
    selectedProject === "all"
      ? allProcurement
      : allProcurement.filter((item) => item.projectId === selectedProject);

  // Calculate statistics
  const stats = {
    totalItems: filteredProcurement.length,
    pendingPurchase: filteredProcurement.filter((item) => item.isPurchased === 0).length,
    purchasedItems: filteredProcurement.filter((item) => item.isPurchased === 1).length,
    totalCost: filteredProcurement.reduce(
      (sum, item) => sum + Number(item.projectCost) * Number(item.quantity),
      0
    ),
  };

  // Update procurement item mutation
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<ProcurementItem>;
    }) => {
      const res = await apiRequest("PATCH", `/api/procurement/${id}`, updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/procurement/all"] });
      toast({
        title: "Success",
        description: "Procurement item updated successfully",
      });
      setEditingItemId(null);
      setEditFormData({});
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update procurement item",
        variant: "destructive",
      });
    },
  });

  // Add procurement item mutation
  const addMutation = useMutation({
    mutationFn: async (data: InsertProcurementItem) => {
      const res = await apiRequest("POST", "/api/procurement", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/procurement/all"] });
      toast({
        title: "Success",
        description: "Procurement item added successfully",
      });
      setIsAddDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add procurement item",
        variant: "destructive",
      });
    },
  });

  const handleLogout = async () => {
    await logout();
  };

  const handleTogglePurchased = async (item: ProcurementItem) => {
    const newStatus = item.isPurchased === 1 ? 0 : 1;
    const updates: Partial<ProcurementItem> = {
      isPurchased: newStatus,
    };

    if (newStatus === 1 && user) {
      updates.purchasedBy = user.id;
      updates.purchasedDate = new Date();
    }

    await updateMutation.mutateAsync({ id: item.id, updates });
  };

  const handleStartEdit = (item: ProcurementItem) => {
    setEditingItemId(item.id);
    setEditFormData({
      executionCost: item.executionCost ? Number(item.executionCost) : undefined,
      billNumber: item.billNumber || "",
      rentalDetails: item.rentalDetails || "",
      notes: item.notes || "",
    });
  };

  const handleSaveEdit = async (itemId: string) => {
    const updates: Partial<ProcurementItem> = {
      billNumber: editFormData.billNumber,
      rentalDetails: editFormData.rentalDetails,
      notes: editFormData.notes,
    };
    
    if (editFormData.executionCost !== undefined) {
      updates.executionCost = String(editFormData.executionCost) as any;
    }
    
    await updateMutation.mutateAsync({ id: itemId, updates });
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditFormData({});
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    return project?.name || "Unknown Project";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-primary/30 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-primary/20 border border-primary/50 flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-primary" />
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
                Procurement Dashboard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 rounded-md bg-primary/10 border border-primary/40">
              <Avatar data-testid="avatar-user">
                <AvatarFallback className="bg-primary/20 text-primary font-display">
                  {user?.fullName?.split(" ").map((n) => n[0]).join("").toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold text-foreground" data-testid="text-user-name">
                  {user?.fullName || "User"}
                </p>
                <p className="text-xs text-muted-foreground uppercase tracking-wide" data-testid="text-user-role">
                  Procurement
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
        <div className="max-w-[1800px] mx-auto space-y-6">
          {/* Overview Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6 hover-elevate" data-testid="card-total-items">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Total Items
                  </p>
                  <p className="text-3xl font-display font-bold text-foreground mt-1" data-testid="text-total-items">
                    {stats.totalItems}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-md bg-primary/20 border border-primary/50 flex items-center justify-center">
                  <Package className="w-6 h-6 text-primary" />
                </div>
              </div>
            </Card>

            <Card className="p-6 hover-elevate" data-testid="card-pending-purchase">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Pending Purchase
                  </p>
                  <p className="text-3xl font-display font-bold text-foreground mt-1" data-testid="text-pending-purchase">
                    {stats.pendingPurchase}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-md bg-orange-500/20 border border-orange-500/50 flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-orange-500" />
                </div>
              </div>
            </Card>

            <Card className="p-6 hover-elevate" data-testid="card-purchased-items">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Purchased Items
                  </p>
                  <p className="text-3xl font-display font-bold text-foreground mt-1" data-testid="text-purchased-items">
                    {stats.purchasedItems}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-md bg-green-500/20 border border-green-500/50 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </Card>

            <Card className="p-6 hover-elevate" data-testid="card-total-cost">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Total Cost
                  </p>
                  <p className="text-3xl font-display font-bold text-foreground mt-1" data-testid="text-total-cost">
                    {stats.totalCost.toLocaleString("en-PK")}
                  </p>
                  <p className="text-xs text-muted-foreground">PKR</p>
                </div>
                <div className="w-12 h-12 rounded-md bg-blue-500/20 border border-blue-500/50 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </Card>
          </div>

          {/* Procurement Items Table */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-display font-bold text-foreground">
                Procurement Items
              </h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="project-filter" className="text-sm text-muted-foreground">
                    Filter by Project:
                  </Label>
                  <Select value={selectedProject} onValueChange={setSelectedProject}>
                    <SelectTrigger className="w-[250px]" data-testid="select-project-filter">
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Projects</SelectItem>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="default" size="sm" data-testid="button-add-item">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add Procurement Item</DialogTitle>
                      <DialogDescription>
                        Add a new procurement item to track purchases
                      </DialogDescription>
                    </DialogHeader>
                    <AddProcurementForm
                      projects={projects}
                      onSubmit={(data) => addMutation.mutate(data)}
                      isLoading={addMutation.isPending}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" data-testid="loader-procurement"></div>
                <p className="mt-4 text-muted-foreground">Loading procurement items...</p>
              </div>
            ) : filteredProcurement.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground" data-testid="text-no-items">
                  No procurement items found
                </p>
              </div>
            ) : (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Project Cost</TableHead>
                      <TableHead>Execution Cost</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Bill Number</TableHead>
                      <TableHead>Rental Details</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProcurement.map((item) => (
                      <TableRow key={item.id} data-testid={`row-item-${item.id}`}>
                        <TableCell className="font-medium">{item.itemName}</TableCell>
                        <TableCell>{getProjectName(item.projectId)}</TableCell>
                        <TableCell>{Number(item.quantity).toLocaleString()}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>
                          {(Number(item.projectCost) * Number(item.quantity)).toLocaleString("en-PK")} PKR
                        </TableCell>
                        <TableCell>
                          {editingItemId === item.id ? (
                            <Input
                              type="number"
                              value={editFormData.executionCost !== undefined ? String(editFormData.executionCost) : ""}
                              onChange={(e) =>
                                setEditFormData({
                                  ...editFormData,
                                  executionCost: e.target.value ? Number(e.target.value) : undefined,
                                })
                              }
                              className="w-32"
                              data-testid={`input-execution-cost-${item.id}`}
                            />
                          ) : item.executionCost ? (
                            `${(Number(item.executionCost) * Number(item.quantity)).toLocaleString("en-PK")} PKR`
                          ) : (
                            <span className="text-muted-foreground">Not set</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={item.isPurchased === 1}
                              onCheckedChange={() => handleTogglePurchased(item)}
                              disabled={updateMutation.isPending}
                              data-testid={`switch-purchased-${item.id}`}
                            />
                            <Badge variant={item.isPurchased === 1 ? "default" : "secondary"}>
                              {item.isPurchased === 1 ? "Purchased" : "Pending"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {editingItemId === item.id ? (
                            <Input
                              value={editFormData.billNumber || ""}
                              onChange={(e) =>
                                setEditFormData({ ...editFormData, billNumber: e.target.value })
                              }
                              className="w-32"
                              placeholder="Bill #"
                              data-testid={`input-bill-number-${item.id}`}
                            />
                          ) : item.billNumber ? (
                            item.billNumber
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingItemId === item.id ? (
                            <Input
                              value={editFormData.rentalDetails || ""}
                              onChange={(e) =>
                                setEditFormData({ ...editFormData, rentalDetails: e.target.value })
                              }
                              className="w-32"
                              placeholder="RFT, SFT, etc."
                              data-testid={`input-rental-details-${item.id}`}
                            />
                          ) : item.rentalDetails ? (
                            item.rentalDetails
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingItemId === item.id ? (
                            <div className="flex items-center gap-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleSaveEdit(item.id)}
                                disabled={updateMutation.isPending}
                                data-testid={`button-save-${item.id}`}
                              >
                                <Save className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={handleCancelEdit}
                                disabled={updateMutation.isPending}
                                data-testid={`button-cancel-${item.id}`}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleStartEdit(item)}
                              data-testid={`button-edit-${item.id}`}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function AddProcurementForm({
  projects,
  onSubmit,
  isLoading,
}: {
  projects: Project[];
  onSubmit: (data: InsertProcurementItem) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<Partial<InsertProcurementItem>>({
    projectId: "",
    itemName: "",
    quantity: 0,
    unit: "",
    projectCost: 0,
    executionCost: 0,
    billNumber: "",
    rentalDetails: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.projectId ||
      !formData.itemName ||
      !formData.quantity ||
      !formData.unit ||
      formData.projectCost === undefined
    ) {
      return;
    }
    onSubmit(formData as InsertProcurementItem);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="project">Project *</Label>
          <Select
            value={formData.projectId}
            onValueChange={(value) => setFormData({ ...formData, projectId: value })}
          >
            <SelectTrigger data-testid="select-project">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="itemName">Item Name *</Label>
          <Input
            id="itemName"
            value={formData.itemName}
            onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
            placeholder="e.g., Steel Beams"
            data-testid="input-item-name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity *</Label>
          <Input
            id="quantity"
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
            placeholder="0"
            data-testid="input-quantity"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit">Unit *</Label>
          <Input
            id="unit"
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            placeholder="e.g., pieces, kg, rft, sft"
            data-testid="input-unit"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="projectCost">Project Cost (per unit) *</Label>
          <Input
            id="projectCost"
            type="number"
            value={formData.projectCost}
            onChange={(e) => setFormData({ ...formData, projectCost: Number(e.target.value) })}
            placeholder="0"
            data-testid="input-project-cost"
          />
          <p className="text-xs text-muted-foreground">Cost visible to client</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="executionCost">Execution Cost (per unit)</Label>
          <Input
            id="executionCost"
            type="number"
            value={formData.executionCost}
            onChange={(e) =>
              setFormData({ ...formData, executionCost: Number(e.target.value) })
            }
            placeholder="0"
            data-testid="input-execution-cost"
          />
          <p className="text-xs text-muted-foreground">Actual cost, visible only to principle</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="billNumber">Bill Number</Label>
          <Input
            id="billNumber"
            value={formData.billNumber || ""}
            onChange={(e) => setFormData({ ...formData, billNumber: e.target.value })}
            placeholder="Optional"
            data-testid="input-bill-number"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rentalDetails">Rental Details</Label>
          <Input
            id="rentalDetails"
            value={formData.rentalDetails || ""}
            onChange={(e) => setFormData({ ...formData, rentalDetails: e.target.value })}
            placeholder="e.g., RFT, SFT"
            data-testid="input-rental-details"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes || ""}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Additional notes..."
          rows={3}
          data-testid="textarea-notes"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isLoading} data-testid="button-submit-procurement">
          {isLoading ? "Adding..." : "Add Procurement Item"}
        </Button>
      </div>
    </form>
  );
}
