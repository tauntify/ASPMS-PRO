import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Project, User } from "@shared/schema";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Assign Task Dialog Component
export function AssignTaskDialog({ 
  open, 
  onOpenChange, 
  projects, 
  employees 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  projects: Project[]; 
  employees: User[];
}) {
  const { toast } = useToast();
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [taskType, setTaskType] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>();

  const assignTaskMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/tasks", {
        projectId: selectedProject,
        employeeId: selectedEmployee,
        taskType,
        description,
        status: "Undone",
        dueDate: dueDate?.toISOString(),
        assignedBy: "", // Will be set by backend from req.user
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Success",
        description: "Task assigned successfully!",
      });
      setSelectedProject("");
      setSelectedEmployee("");
      setTaskType("");
      setDescription("");
      setDueDate(undefined);
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign task",
        variant: "destructive",
      });
    },
  });

  const handleAssign = () => {
    if (!selectedProject || !selectedEmployee || !taskType) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    assignTaskMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Task to Employee</DialogTitle>
          <DialogDescription>
            Assign a task to an employee for a specific project
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Project *</label>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger data-testid="select-task-project">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Employee *</label>
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger data-testid="select-task-employee">
                <SelectValue placeholder="Select an employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map(employee => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Task Type *</label>
            <Select value={taskType} onValueChange={setTaskType}>
              <SelectTrigger data-testid="select-task-type">
                <SelectValue placeholder="Select task type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Design CAD">Design CAD</SelectItem>
                <SelectItem value="IFCs">IFCs</SelectItem>
                <SelectItem value="3D Rendering">3D Rendering</SelectItem>
                <SelectItem value="Procurement">Procurement</SelectItem>
                <SelectItem value="Site Visits">Site Visits</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Description</label>
            <Textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description"
              className="resize-none"
              data-testid="input-task-description"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Due Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  data-testid="button-task-due-date"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-task"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAssign}
              disabled={assignTaskMutation.isPending}
              data-testid="button-submit-task"
            >
              {assignTaskMutation.isPending ? "Assigning..." : "Assign Task"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Edit User Dialog Component
export function EditUserDialog({ 
  open, 
  onOpenChange, 
  user 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  user: User | null;
}) {
  const { toast } = useToast();

  const userSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    fullName: z.string().min(1, "Full name is required"),
    password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
    isActive: z.number(),
  });

  const form = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: "",
      fullName: "",
      password: "",
      isActive: 1,
    },
  });

  // Update form when user changes
  useEffect(() => {
    if (user) {
      form.reset({
        username: user.username,
        fullName: user.fullName,
        password: "",
        isActive: user.isActive,
      });
    }
  }, [user, form]);

  const updateUserMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!user) return;
      const updates: any = {
        username: data.username,
        fullName: data.fullName,
        isActive: data.isActive,
      };
      // Only include password if it's provided
      if (data.password && data.password.length > 0) {
        updates.password = data.password;
      }
      const res = await apiRequest("PATCH", `/api/users/${user.id}`, updates);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Success",
        description: "User updated successfully!",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    updateUserMutation.mutate(data);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User Account</DialogTitle>
          <DialogDescription>
            Update user information and credentials for {user.fullName}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter full name" {...field} data-testid="input-edit-fullname" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter username" {...field} data-testid="input-edit-username" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password (leave blank to keep current)</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter new password" {...field} data-testid="input-edit-password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select 
                    value={field.value.toString()} 
                    onValueChange={(value) => field.onChange(parseInt(value))}
                  >
                    <FormControl>
                      <SelectTrigger data-testid="select-edit-status">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Active</SelectItem>
                      <SelectItem value="0">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel-edit-user"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updateUserMutation.isPending}
                data-testid="button-submit-edit-user"
              >
                {updateUserMutation.isPending ? "Updating..." : "Update User"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
