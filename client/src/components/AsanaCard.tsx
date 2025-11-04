import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AsanaCardProps {
  title?: string;
  subtitle?: string;
  headerAction?: ReactNode;
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export default function AsanaCard({
  title,
  subtitle,
  headerAction,
  children,
  className,
  noPadding = false,
}: AsanaCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border",
        className
      )}
      style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--card-border)',
        boxShadow: 'var(--card-shadow)',
      }}
    >
      {(title || subtitle || headerAction) && (
        <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--card-border)' }}>
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  {subtitle}
                </p>
              )}
            </div>
            {headerAction && <div>{headerAction}</div>}
          </div>
        </div>
      )}
      <div className={noPadding ? "" : "p-6"}>
        {children}
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: ReactNode;
}

export function AsanaStatCard({ label, value, trend, icon }: StatCardProps) {
  return (
    <div
      className="rounded-lg border p-6"
      style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--card-border)',
        boxShadow: 'var(--card-shadow)',
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            {label}
          </p>
          <p className="text-3xl font-bold mt-2" style={{ color: 'var(--text-primary)' }}>
            {value}
          </p>
          {trend && (
            <p className={cn(
              "text-sm mt-2 flex items-center gap-1",
              trend.isPositive ? "text-green-600" : "text-red-600"
            )}>
              <span>{trend.isPositive ? "↑" : "↓"}</span>
              <span>{Math.abs(trend.value)}%</span>
              <span className="text-gray-500">vs last month</span>
            </p>
          )}
        </div>
        {icon && (
          <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--foreground)' }}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
