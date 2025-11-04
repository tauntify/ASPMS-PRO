# Asana-Inspired Design System

## Overview

This document describes the new Asana-inspired design system implemented in ASPMS. The design features a clean, modern interface with purple accent colors, card-based layouts, and seamless light/dark mode switching.

## Core Design Principles

### 1. **Color Palette**
- **Primary Purple**: `#8b5cf6` - Main brand color used for buttons, active states, charts
- **Secondary Blue**: `#6366f1` - Secondary accent for variety in visualizations
- **Accent Cyan**: `#06b6d4` - Highlighting and special elements

### 2. **Light Mode Colors**
```
Sidebar Background: #1f2937 (Dark navy - always dark)
Main Background: #ffffff (Clean white)
Card Background: #ffffff (White with shadows)
Text Primary: #111827
Text Secondary: #4b5563
Text Muted: #9ca3af
Border: #e5e7eb
```

### 3. **Dark Mode Colors**
```
Sidebar Background: #111827 (Darker navy)
Main Background: #1f2937 (Dark gray)
Card Background: #374151 (Lighter gray)
Text Primary: #f9fafb
Text Secondary: #d1d5db
Text Muted: #9ca3af
Border: #4b5563
```

## New Components

### AsanaSidebar (`client/src/components/AsanaSidebar.tsx`)

**Purpose**: Reusable dark navy sidebar for all dashboards

**Features**:
- Dark navy background (consistent in both light and dark modes)
- Active item highlighting with purple accent
- Support for badges (notification counts)
- Icon + label layout
- Smooth hover effects

**Usage**:
```typescript
import AsanaSidebar from "@/components/AsanaSidebar";

const sidebarSections = [
  {
    title: "Navigation",
    items: [
      { icon: Home, label: "Overview", href: "/dashboard" },
      { icon: Folder, label: "Projects", badge: 5 },
    ]
  }
];

<AsanaSidebar
  brandName="My App"
  sections={sidebarSections}
  logo="/logo.png"
/>
```

### AsanaDashboardLayout (`client/src/components/AsanaDashboardLayout.tsx`)

**Purpose**: Standard layout wrapper with sidebar + content area

**Features**:
- Fixed-width sidebar (256px)
- Scrollable main content area
- Full-height layout
- Automatic theme variable application

**Usage**:
```typescript
<AsanaDashboardLayout
  brandName="Client Dashboard"
  sidebarSections={sections}
  sidebarFooter={<UserInfo />}
>
  {/* Your dashboard content */}
</AsanaDashboardLayout>
```

### AsanaCard (`client/src/components/AsanaCard.tsx`)

**Purpose**: Reusable card component for charts and content

**Features**:
- Optional title and subtitle
- Header actions support
- Automatic theme-aware styling
- Subtle shadows

**Usage**:
```typescript
<AsanaCard
  title="Task Breakdown"
  subtitle="Current status distribution"
  headerAction={<Button>View All</Button>}
>
  {/* Chart or content */}
</AsanaCard>
```

### AsanaStatCard (exported from AsanaCard.tsx)

**Purpose**: Metric display cards with trend indicators

**Features**:
- Large value display
- Optional trend percentage (↑/↓)
- Icon support
- Responsive layout

**Usage**:
```typescript
<AsanaStatCard
  label="Total Projects"
  value={42}
  trend={{ value: 12, isPositive: true }}
  icon={<Folder className="w-6 h-6" />}
/>
```

## Theme System

### New Theme Files

**`client/src/lib/themes.ts`**
- Defines `ThemeMode` type: `'light' | 'dark'`
- Exports `lightTheme` and `darkTheme` color objects
- CSS variable application via `applyTheme(mode)`
- localStorage persistence

**`client/src/hooks/useTheme.ts`**
- React hook for theme management
- Returns: `{ theme, setTheme, toggleTheme, isDark }`
- Auto-applies theme on mount

### Theme Switching

**Header Toggle** (`client/src/components/HeaderSleek.tsx`):
- Sun icon for light mode
- Moon icon for dark mode
- One-click toggle
- Located in top-right header area

**Settings Page** (`client/src/pages/settings/themes.tsx`):
- Visual preview of light/dark modes
- Detailed descriptions
- Apply button for each theme

## Dashboard Redesigns

### Client Dashboard (`client/src/pages/client-dashboard-new.tsx`)

**Features**:
- Asana-style sidebar with project navigation
- 4 stat cards showing key metrics
- Donut chart for task breakdown
- Bar chart for project progress
- Line chart for task completion over time
- Recent projects list with click-to-view

**Charts Used**:
- `recharts` library
- PieChart with inner radius (donut)
- BarChart with rounded corners
- LineChart with gradient fill

**Color Scheme**:
- All charts use purple gradient palette
- `chartPrimary`, `chartSecondary`, `chartTertiary`, `chartQuaternary`

### Principal Dashboard (To be implemented)

**Planned Features**:
- Overview mode with comprehensive stats
- Multi-tab navigation (Projects, Employees, HR, Accounts, etc.)
- Same Asana-style sidebar
- Advanced charts and analytics

### Employee/HR/Accountant Dashboards (To be implemented)

**Planned Features**:
- Role-specific sidebars
- Relevant metrics and charts
- Consistent design language

## Chart Configuration

### Standard Chart Settings

**Colors**:
```typescript
const chartColors = {
  primary: 'var(--chart-primary)',    // #8b5cf6
  secondary: 'var(--chart-secondary)', // #6366f1
  tertiary: 'var(--chart-tertiary)',   // #a78bfa
  quaternary: 'var(--chart-quaternary)' // #c4b5fd
};
```

**Tooltip Styling**:
```typescript
<Tooltip
  contentStyle={{
    backgroundColor: 'var(--card-bg)',
    border: '1px solid var(--card-border)',
    borderRadius: '8px',
  }}
/>
```

**Axis Styling**:
```typescript
<XAxis
  tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
/>
```

## CSS Variables

All theme colors are exposed as CSS variables:

```css
/* Theme Colors */
--sidebar-bg
--sidebar-text
--sidebar-text-hover
--sidebar-active

--background
--foreground

--card-bg
--card-border
--card-shadow

--primary
--primary-hover
--secondary
--accent

--text-primary
--text-secondary
--text-muted

--border
--divider

--success
--warning
--error
--info

--chart-primary
--chart-secondary
--chart-tertiary
--chart-quaternary
```

## Migration Guide

### For Existing Dashboards

1. **Replace Layout**:
```typescript
// Old
<div className="dashboard">
  <Sidebar />
  <Content />
</div>

// New
<AsanaDashboardLayout
  brandName="Dashboard"
  sidebarSections={sections}
>
  <Content />
</AsanaDashboardLayout>
```

2. **Replace Cards**:
```typescript
// Old
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>

// New
<AsanaCard title="Title">
  Content
</AsanaCard>
```

3. **Update Charts**:
```typescript
// Use CSS variables for colors
<Bar
  dataKey="value"
  fill="var(--chart-primary)"
  radius={[8, 8, 0, 0]}
/>
```

4. **Remove Theme Selector**:
```typescript
// Remove old palette selector
// Use new light/dark toggle from useTheme hook
const { toggleTheme, isDark } = useTheme();
```

## Best Practices

### 1. **Use Theme Variables**
Always use CSS variables instead of hardcoded colors:
```typescript
// Good
style={{ backgroundColor: 'var(--card-bg)' }}

// Bad
style={{ backgroundColor: '#ffffff' }}
```

### 2. **Consistent Spacing**
- Card padding: `p-6`
- Section gaps: `space-y-6`
- Grid gaps: `gap-6`

### 3. **Typography Hierarchy**
```typescript
// Page title
<h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>

// Section title
<h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>

// Card title
<h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>

// Description text
<p className="text-sm" style={{ color: 'var(--text-secondary)' }}>

// Muted text
<span className="text-xs" style={{ color: 'var(--text-muted)' }}>
```

### 4. **Chart Responsiveness**
Always wrap charts in ResponsiveContainer:
```typescript
<ResponsiveContainer width="100%" height={300}>
  <BarChart data={data}>
    {/* ... */}
  </BarChart>
</ResponsiveContainer>
```

## Removed Features

### Old Color Schemes
The following color schemes have been removed:
- Default
- Interior
- Architect
- Workload
- Corporate

**Reason**: Simplified to just light/dark modes for consistency and modern UX

### Layout Switching
Multiple layout options removed in favor of single Asana-style layout

**Reason**: Consistent experience across all dashboards

## Future Enhancements

1. **Custom Accent Colors**: Allow users to choose accent color while keeping light/dark mode
2. **Compact Mode**: Reduced sidebar width option
3. **Color Blind Mode**: High-contrast color schemes
4. **Animation Preferences**: Reduced motion support
5. **Chart Themes**: Pre-configured chart color palettes

## Technical Notes

### Dependencies
- `recharts` - Charting library
- `@tanstack/react-table` - Data tables
- `framer-motion` - Animations
- `zustand` - State management
- `react-query` - Data fetching

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Performance
- CSS variables for instant theme switching
- Lazy loading for chart libraries
- Optimized renders with React.memo where appropriate

## Support

For questions or issues with the new design system:
1. Check this documentation
2. Review reference images in `/dashboard refrence images/`
3. Examine example implementation in `client-dashboard-new.tsx`
4. Contact development team

---

**Last Updated**: November 2025
**Version**: 2.0
**Design Reference**: Asana Dashboard UI
