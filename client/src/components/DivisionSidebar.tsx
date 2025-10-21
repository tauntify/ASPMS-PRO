import { useState } from "react";
import { Division, Item, InsertDivision } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Edit2, Trash2, FolderOpen } from "lucide-react";
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

interface DivisionSidebarProps {
  projectId: string;
  divisions: Division[];
  items: Item[];
  selectedDivisionId: string | null;
  onSelectDivision: (id: string | null) => void;
  isLoading: boolean;
}

export function DivisionSidebar({
  projectId,
  divisions,
  items,
  selectedDivisionId,
  onSelectDivision,
  isLoading,
}: DivisionSidebarProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newDivisionName, setNewDivisionName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: async (data: InsertDivision) => {
      return await apiRequest("POST", "/api/divisions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (query) => 
        query.queryKey[0]?.toString().startsWith('/api/divisions')
      });
      queryClient.invalidateQueries({ predicate: (query) => 
        query.queryKey[0]?.toString().startsWith('/api/summary')
      });
      setIsAdding(false);
      setNewDivisionName("");
      toast({
        title: "Division created",
        description: "New division has been added successfully.",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      return await apiRequest("PATCH", `/api/divisions/${id}`, { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (query) => 
        query.queryKey[0]?.toString().startsWith('/api/divisions')
      });
      queryClient.invalidateQueries({ predicate: (query) => 
        query.queryKey[0]?.toString().startsWith('/api/summary')
      });
      setEditingId(null);
      toast({
        title: "Division updated",
        description: "Division name has been changed successfully.",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/divisions/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (query) => 
        query.queryKey[0]?.toString().startsWith('/api/divisions')
      });
      queryClient.invalidateQueries({ predicate: (query) => 
        query.queryKey[0]?.toString().startsWith('/api/items')
      });
      queryClient.invalidateQueries({ predicate: (query) => 
        query.queryKey[0]?.toString().startsWith('/api/summary')
      });
      setDeletingId(null);
      if (selectedDivisionId === deletingId) {
        onSelectDivision(null);
      }
      toast({
        title: "Division deleted",
        description: "Division and all its items have been removed.",
      });
    },
  });

  const handleCreate = () => {
    if (newDivisionName.trim()) {
      createMutation.mutate({
        projectId,
        name: newDivisionName.trim(),
        order: divisions.length,
      });
    }
  };

  const handleUpdate = (id: string) => {
    if (editingName.trim()) {
      updateMutation.mutate({ id, name: editingName.trim() });
    }
  };

  const getDivisionTotal = (divisionId: string) => {
    return items
      .filter((item) => item.divisionId === divisionId)
      .reduce((sum, item) => sum + Number(item.quantity) * Number(item.rate), 0);
  };

  const getDivisionItemCount = (divisionId: string) => {
    return items.filter((item) => item.divisionId === divisionId).length;
  };

  return (
    <div className="w-80 border-r border-border bg-card/30 backdrop-blur-sm flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-display font-semibold text-foreground uppercase tracking-wider">
            Divisions
          </h2>
          <Button
            size="icon"
            variant="outline"
            onClick={() => setIsAdding(true)}
            className="h-8 w-8 border-primary/50"
            data-testid="button-add-division"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {isAdding && (
          <div className="flex gap-2 mb-3">
            <Input
              placeholder="Division name"
              value={newDivisionName}
              onChange={(e) => setNewDivisionName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
                if (e.key === "Escape") {
                  setIsAdding(false);
                  setNewDivisionName("");
                }
              }}
              autoFocus
              className="h-8 text-sm border-primary/50"
              data-testid="input-division-name"
            />
            <Button
              size="sm"
              onClick={handleCreate}
              disabled={!newDivisionName.trim() || createMutation.isPending}
              className="h-8"
              data-testid="button-create-division"
            >
              Add
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 rounded-md bg-muted/20 animate-pulse"
              />
            ))}
          </div>
        ) : divisions.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground">No divisions yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Click the + button to create one
            </p>
          </div>
        ) : (
          divisions.map((division) => (
            <Card
              key={division.id}
              className={`p-4 cursor-pointer transition-all hover-elevate ${
                selectedDivisionId === division.id
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card/50"
              }`}
              onClick={() => onSelectDivision(division.id)}
              data-testid={`card-division-${division.id}`}
            >
              <div className="flex items-start justify-between gap-2">
                {editingId === division.id ? (
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleUpdate(division.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                    className="h-7 text-sm"
                    data-testid={`input-edit-division-${division.id}`}
                  />
                ) : (
                  <h3 className="font-display font-medium text-foreground text-sm">
                    {division.name}
                  </h3>
                )}
                
                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                  {editingId === division.id ? (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => handleUpdate(division.id)}
                      disabled={updateMutation.isPending}
                      data-testid={`button-save-division-${division.id}`}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  ) : (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => {
                          setEditingId(division.id);
                          setEditingName(division.name);
                        }}
                        data-testid={`button-edit-division-${division.id}`}
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive"
                        onClick={() => setDeletingId(division.id)}
                        data-testid={`button-delete-division-${division.id}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Items
                  </p>
                  <p className="text-sm font-mono font-semibold text-foreground">
                    {getDivisionItemCount(division.id)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Total PKR
                  </p>
                  <p className="text-sm font-mono font-semibold text-primary">
                    {getDivisionTotal(division.id).toLocaleString('en-PK', { maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Division?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this division and all its items. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingId && deleteMutation.mutate(deletingId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
