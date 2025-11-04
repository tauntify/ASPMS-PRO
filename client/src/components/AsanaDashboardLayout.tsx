import { ReactNode } from "react";
import AsanaSidebar, { SidebarSection } from "./AsanaSidebar";

interface AsanaDashboardLayoutProps {
  logo?: string;
  brandName: string;
  sidebarSections: SidebarSection[];
  sidebarFooter?: ReactNode;
  children: ReactNode;
}

export default function AsanaDashboardLayout({
  logo,
  brandName,
  sidebarSections,
  sidebarFooter,
  children,
}: AsanaDashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden" style={{
      backgroundColor: 'var(--background)',
      color: 'var(--text-primary)',
    }}>
      {/* Sidebar - Fixed width */}
      <aside className="w-64 flex-shrink-0 border-r" style={{
        borderColor: 'var(--sidebar-bg)',
      }}>
        <AsanaSidebar
          logo={logo}
          brandName={brandName}
          sections={sidebarSections}
          footer={sidebarFooter}
        />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto" style={{
        backgroundColor: 'var(--foreground)',
      }}>
        {children}
      </main>
    </div>
  );
}
