import { useState } from "react";
import { Division, Item, InsertItem, Priority, Unit, priorityLevels, unitTypes } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit2, Trash2, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ItemManagementProps {
  division: Division | undefined;
  items: Item[];
  isLoading: boolean;
}

interface ItemFormData {
  description: string;
  unit: Unit;
  quantity: string;
  rate: string;
  priority: Priority;
}

const initialFormData: ItemFormData = {
  description: "",
  unit: "number",
  quantity: "",
  rate: "",
  priority: "Mid",
};

const priorityColors: Record<Priority, string> = {
  High: "bg-destructive/20 text-destructive border-destructive/50",
  Mid: "bg-chart-4/20 text-chart-4 border-chart-4/50",
  Low: "bg-chart-5/20 text-chart-5 border-chart-5/50",
};

export function ItemManagement({ division, items, isLoading }: ItemManagementProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<ItemFormData>(initialFormData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<Priority | "All">("All");
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: async (data: InsertItem) => {
      return await apiRequest("POST", "/api/items", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/summary"] });
      setIsAdding(false);
      setFormData(initialFormData);
      toast({
        title: "Item added",
        description: "New item has been added successfully.",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Item> & { id: string }) => {
      return await apiRequest("PATCH", `/api/items/${data.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/summary"] });
      setEditingId(null);
      toast({
        title: "Item updated",
        description: "Item has been updated successfully.",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/items/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/summary"] });
      setDeletingId(null);
      toast({
        title: "Item deleted",
        description: "Item has been removed successfully.",
      });
    },
  });

  const handleCreate = () => {
    if (!division) return;
    
    const quantity = parseFloat(formData.quantity);
    const rate = parseFloat(formData.rate);

    if (!formData.description.trim() || isNaN(quantity) || isNaN(rate)) {
      toast({
        title: "Invalid input",
        description: "Please fill all fields correctly.",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate({
      divisionId: division.id,
      description: formData.description.trim(),
      unit: formData.unit,
      quantity,
      rate,
      priority: formData.priority,
    });
  };

  const filteredItems = selectedPriority === "All" 
    ? items 
    : items.filter(item => item.priority === selectedPriority);

  const divisionTotal = items.reduce((sum, item) => sum + item.quantity * item.rate, 0);

  if (!division) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-display font-semibold text-foreground mb-2">
            No Division Selected
          </h3>
          <p className="text-sm text-muted-foreground">
            Select a division from the sidebar to manage its items
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Division Header */}
      <div className="border-b border-border bg-card/30 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-display font-bold text-foreground mb-1">
              {division.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              {items.length} items · Total: <span className="font-mono font-semibold text-primary">
                {divisionTotal.toLocaleString('en-PK')} PKR
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Priority Filter */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={selectedPriority === "All" ? "default" : "outline"}
                onClick={() => setSelectedPriority("All")}
                className="h-8"
                data-testid="filter-all"
              >
                All
              </Button>
              {priorityLevels.map((priority) => (
                <Button
                  key={priority}
                  size="sm"
                  variant={selectedPriority === priority ? "default" : "outline"}
                  onClick={() => setSelectedPriority(priority)}
                  className={`h-8 ${selectedPriority === priority ? priorityColors[priority] : ""}`}
                  data-testid={`filter-${priority.toLowerCase()}`}
                >
                  {priority}
                </Button>
              ))}
            </div>

            <Button
              onClick={() => setIsAdding(!isAdding)}
              data-testid="button-add-item"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>
        </div>

        {/* Add Item Form */}
        {isAdding && (
          <Card className="mt-4 p-4 border-primary/30 bg-card/50">
            <div className="grid grid-cols-5 gap-3">
              <div className="col-span-2">
                <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">
                  Description
                </label>
                <Input
                  placeholder="Item description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  data-testid="input-item-description"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">
                  Unit
                </label>
                <Select
                  value={formData.unit}
                  onValueChange={(value: Unit) => setFormData({ ...formData, unit: value })}
                >
                  <SelectTrigger data-testid="select-unit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {unitTypes.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">
                  Quantity
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  data-testid="input-item-quantity"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">
                  Rate (PKR)
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.rate}
                  onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                  data-testid="input-item-rate"
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-3">
              <div className="flex gap-2">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Priority:</span>
                {priorityLevels.map((priority) => (
                  <Button
                    key={priority}
                    size="sm"
                    variant={formData.priority === priority ? "default" : "outline"}
                    onClick={() => setFormData({ ...formData, priority })}
                    className={`h-7 ${formData.priority === priority ? priorityColors[priority] : ""}`}
                    data-testid={`priority-${priority.toLowerCase()}`}
                  >
                    {priority}
                  </Button>
                ))}
              </div>

              <div className="flex gap-2">
                {formData.quantity && formData.rate && (
                  <div className="text-sm font-mono font-semibold text-primary">
                    Total: {(parseFloat(formData.quantity) * parseFloat(formData.rate)).toLocaleString('en-PK')} PKR
                  </div>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAdding(false);
                    setFormData(initialFormData);
                  }}
                  data-testid="button-cancel-add"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={createMutation.isPending}
                  data-testid="button-save-item"
                >
                  Save Item
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Items Table */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 rounded-md bg-muted/20 animate-pulse" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground">
              {items.length === 0 ? "No items in this division" : "No items match the selected priority filter"}
            </p>
          </div>
        ) : (
          <Card className="border-border">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="font-display font-semibold uppercase text-xs tracking-wider">
                    Description
                  </TableHead>
                  <TableHead className="font-display font-semibold uppercase text-xs tracking-wider">
                    Unit
                  </TableHead>
                  <TableHead className="font-display font-semibold uppercase text-xs tracking-wider text-right">
                    Quantity
                  </TableHead>
                  <TableHead className="font-display font-semibold uppercase text-xs tracking-wider text-right">
                    Rate (PKR)
                  </TableHead>
                  <TableHead className="font-display font-semibold uppercase text-xs tracking-wider text-right">
                    Total (PKR)
                  </TableHead>
                  <TableHead className="font-display font-semibold uppercase text-xs tracking-wider">
                    Priority
                  </TableHead>
                  <TableHead className="font-display font-semibold uppercase text-xs tracking-wider text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow
                    key={item.id}
                    className="border-border hover-elevate"
                    data-testid={`row-item-${item.id}`}
                  >
                    <TableCell className="font-medium">{item.description}</TableCell>
                    <TableCell className="text-muted-foreground">{item.unit}</TableCell>
                    <TableCell className="text-right font-mono">{item.quantity}</TableCell>
                    <TableCell className="text-right font-mono">
                      {item.rate.toLocaleString('en-PK')}
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold text-primary">
                      {(item.quantity * item.rate).toLocaleString('en-PK')}
                    </TableCell>
                    <TableCell>
                      <Badge className={priorityColors[item.priority as Priority]} data-testid={`badge-priority-${item.id}`}>
                        {item.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          data-testid={`button-edit-item-${item.id}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive"
                          onClick={() => setDeletingId(item.id)}
                          data-testid={`button-delete-item-${item.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this item. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingId && deleteMutation.mutate(deletingId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
