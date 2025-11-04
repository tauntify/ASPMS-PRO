import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import {
  Settings,
  Shield,
  Presentation,
  GitBranch,
  Video,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NavItem {
  icon: any;
  label: string;
  href: string;
  roles?: string[];
}

const actionButtons: NavItem[] = [
  {
    icon: Presentation,
    label: "Whiteboard",
    href: "/whiteboard",
  },
  {
    icon: GitBranch,
    label: "Structure",
    href: "/structure",
  },
  {
    icon: Video,
    label: "Meeting",
    href: "/meeting",
  },
];

const bottomItems: NavItem[] = [
  {
    icon: Shield,
    label: "Admin Panel",
    href: "/admin",
    roles: ["admin"],
  },
  {
    icon: Settings,
    label: "Settings",
    href: "/settings",
  },
];

export default function MainSidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const filteredBottomItems = bottomItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(user?.role || "");
  });

  // Update CSS variable for sidebar width
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--sidebar-width',
      isCollapsed ? '4rem' : '16rem'
    );
  }, [isCollapsed]);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-[#1f2937] border-r border-gray-700 flex flex-col z-50 overflow-hidden transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Collapse/Expand Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 z-10 h-6 w-6 rounded-full border-2 border-gray-600 bg-[#1f2937] shadow-md hover:bg-gray-700 text-gray-400 hover:text-white"
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>

      {/* OFIVIO Logo */}
      <div className={cn("p-6 border-b border-gray-700", isCollapsed && "px-2")}>
        <Link href="/dashboard">
          <a className="flex items-center gap-3 cursor-pointer group">
            {!isCollapsed ? (
              <>
                <img
                  src="/assets/ofivio-logo-white.png"
                  alt="Ofivio Logo"
                  className="h-10 w-auto transition-transform group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = document.getElementById('logo-fallback');
                    if (fallback) fallback.style.display = 'block';
                  }}
                />
                <div id="logo-fallback" className="flex flex-col" style={{ display: 'none' }}>
                  <span className="text-2xl font-bold text-white">OFIVIO</span>
                  <span className="text-xs text-gray-400">Studio Management</span>
                </div>
              </>
            ) : (
              <div className="text-2xl font-bold text-white text-center w-full">O</div>
            )}
          </a>
        </Link>
      </div>

      {/* Action Buttons */}
      <div className={cn("px-3 py-4", isCollapsed ? "space-y-2" : "space-y-2")}>
        {actionButtons.map((item) => {
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}>
              <a
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 border-2 border-gray-600 text-gray-300 hover:border-purple-500 hover:text-white",
                  isCollapsed && "justify-center px-2"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span className="font-medium text-sm">{item.label}</span>}
              </a>
            </Link>
          );
        })}
      </div>

      {/* Spacer */}
      <div className="flex-1"></div>

      {/* Bottom Items (Admin & Settings) */}
      <div className="px-3 py-4 border-t border-gray-700 space-y-1">
        {filteredBottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;

          return (
            <Link key={item.href} href={item.href}>
              <a
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 border-2",
                  isCollapsed && "justify-center px-2",
                  isActive
                    ? "border-purple-500 text-white bg-purple-500/10"
                    : "border-transparent text-gray-400 hover:border-gray-600 hover:text-white"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span className="font-medium">{item.label}</span>}
              </a>
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-700">
          <div className="text-xs text-gray-500 text-center">
            Powered by ARKA Technologies
          </div>
        </div>
      )}
    </aside>
  );
}
