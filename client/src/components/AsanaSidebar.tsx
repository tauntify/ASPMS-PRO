import { Link, useLocation } from "wouter";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SidebarItem {
  icon: LucideIcon;
  label: string;
  href?: string;
  onClick?: () => void;
  active?: boolean;
  badge?: number;
}

export interface SidebarSection {
  title?: string;
  items: SidebarItem[];
}

interface AsanaSidebarProps {
  logo?: string;
  brandName: string;
  sections: SidebarSection[];
  footer?: React.ReactNode;
}

export default function AsanaSidebar({
  logo,
  brandName,
  sections,
  footer,
}: AsanaSidebarProps) {
  const [location] = useLocation();

  const isItemActive = (item: SidebarItem) => {
    if (item.active !== undefined) return item.active;
    if (item.href) return location === item.href;
    return false;
  };

  return (
    <div className="h-full flex flex-col" style={{
      backgroundColor: 'var(--sidebar-bg)',
      color: 'var(--sidebar-text)',
    }}>
      {/* Logo and Brand */}
      <div className="p-6 border-b border-gray-700/50">
        <div className="flex items-center gap-3">
          {logo && (
            <img
              src={logo}
              alt={brandName}
              className="h-8 w-8 rounded object-cover"
            />
          )}
          <span className="text-xl font-semibold" style={{ color: 'var(--sidebar-text-hover)' }}>
            {brandName}
          </span>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto py-4">
        {sections.map((section, sectionIdx) => (
          <div key={sectionIdx} className="mb-6">
            {section.title && (
              <div className="px-6 py-2 text-xs font-semibold uppercase tracking-wider opacity-60">
                {section.title}
              </div>
            )}
            <nav className="space-y-1 px-3">
              {section.items.map((item, itemIdx) => {
                const isActive = isItemActive(item);
                const ItemIcon = item.icon;

                const itemContent = (
                  <div
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer group",
                      isActive
                        ? "text-white font-medium"
                        : "hover:bg-gray-700/50"
                    )}
                    style={
                      isActive
                        ? { backgroundColor: 'var(--sidebar-active)', color: '#ffffff' }
                        : {}
                    }
                  >
                    <ItemIcon
                      className={cn(
                        "h-5 w-5 transition-colors",
                        isActive ? "text-white" : "text-gray-400 group-hover:text-gray-200"
                      )}
                    />
                    <span className={cn(
                      "flex-1 transition-colors",
                      !isActive && "group-hover:text-gray-200"
                    )}>
                      {item.label}
                    </span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="bg-purple-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </div>
                );

                if (item.href) {
                  return (
                    <Link key={itemIdx} href={item.href}>
                      {itemContent}
                    </Link>
                  );
                }

                if (item.onClick) {
                  return (
                    <div key={itemIdx} onClick={item.onClick}>
                      {itemContent}
                    </div>
                  );
                }

                return <div key={itemIdx}>{itemContent}</div>;
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer */}
      {footer && (
        <div className="p-4 border-t border-gray-700/50">
          {footer}
        </div>
      )}
    </div>
  );
}
