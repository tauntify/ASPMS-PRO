import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Users,
  UserCog,
  Briefcase,
  ClipboardList,
  Clock,
  ShoppingCart,
  Receipt,
  FileText,
  DollarSign,
  Settings,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OverviewLeftSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function OverviewLeftSidebar({ activeSection, onSectionChange }: OverviewLeftSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "projects", label: "Projects", icon: Briefcase },
    { id: "clients", label: "Clients", icon: Users },
    { id: "employees", label: "Employees", icon: UserCog },
    { id: "hr", label: "HR Management", icon: ClipboardList },
    { id: "accounts", label: "Accounts", icon: DollarSign },
    { id: "timesheet", label: "Timesheet", icon: Clock },
    { id: "procurement", label: "Procurement", icon: ShoppingCart },
    { id: "invoices", label: "Invoices", icon: Receipt },
    { id: "reports", label: "Reports", icon: FileText },
  ];

  return (
    <div
      className={cn(
        "relative bg-card border-r border-border transition-all duration-300 flex flex-col h-full",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Collapse/Expand Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 z-10 h-6 w-6 rounded-full border border-border bg-background shadow-md hover:bg-accent"
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>

      {/* Sidebar Content */}
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                "w-full justify-start gap-3 transition-all",
                isCollapsed && "justify-center px-2",
                isActive && "bg-primary text-primary-foreground shadow-md"
              )}
            >
              <Icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-primary-foreground")} />
              {!isCollapsed && (
                <span className={cn("truncate", isActive && "font-semibold")}>{item.label}</span>
              )}
            </Button>
          );
        })}
      </div>

      {/* Settings at Bottom */}
      <div className="border-t border-border p-3">
        <Button
          variant={activeSection === "settings" ? "default" : "ghost"}
          onClick={() => onSectionChange("settings")}
          className={cn(
            "w-full justify-start gap-3",
            isCollapsed && "justify-center px-2"
          )}
        >
          <Settings className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && <span className="truncate">Settings</span>}
        </Button>
      </div>
    </div>
  );
}
