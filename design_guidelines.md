# ARKA SERVICES PROJECT MANAGEMENT - Design Guidelines

## Design Approach

**Selected Approach:** Reference-Based with Sci-Fi/Cyberpunk Aesthetic

Drawing inspiration from futuristic interfaces seen in Cyberpunk 2077 UI, Blade Runner aesthetics, and modern data visualization tools like Grafana's dark themes, combined with the data-dense structure of enterprise tools like Tableau.

**Core Design Principles:**
- Futuristic cyberpunk aesthetic with functional clarity
- High-contrast dark interface with neon accent highlights
- Information density balanced with visual breathing room
- Real-time data visualization as primary focus
- Landscape-optimized dashboard layout

---

## Color Palette

**Dark Mode Foundation (Primary):**
- Background Base: 220 25% 8% (deep blue-black)
- Surface Elevated: 220 20% 12% (card backgrounds)
- Border/Divider: 220 30% 20% (subtle borders with cyan tint)

**Neon Accent Colors:**
- Primary Cyan: 180 100% 50% (electric cyan for key actions, graphs)
- Secondary Purple: 270 80% 60% (for secondary elements, hover states)
- Warning Orange: 30 100% 60% (alerts, important metrics)

**Priority Color System:**
- High Priority: 0 85% 60% (neon red with glow)
- Mid Priority: 45 95% 55% (bright amber)
- Low Priority: 140 60% 50% (muted green)

**Data Visualization:**
- Graph Line 1: 180 100% 50% (cyan)
- Graph Line 2: 270 80% 60% (purple)
- Graph Line 3: 160 90% 50% (teal)
- Graph Backgrounds: Semi-transparent with 15% opacity

---

## Typography

**Font Families:**
- Primary: 'Orbitron' (Google Fonts) - futuristic headings and labels
- Secondary: 'Rajdhani' (Google Fonts) - data tables and body text
- Monospace: 'Fira Code' (Google Fonts) - numeric values, PKR amounts

**Type Scale:**
- App Title: text-3xl font-bold (Orbitron)
- Section Headers: text-xl font-semibold (Orbitron)
- Division Names: text-lg font-medium (Rajdhani)
- Data Labels: text-sm font-medium uppercase tracking-wider (Rajdhani)
- Numeric Values: text-base font-mono (Fira Code)
- PKR Currency: text-2xl font-mono with cyan glow effect

---

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, and 8
- Component padding: p-4 to p-6
- Section margins: m-6 to m-8
- Grid gaps: gap-4 to gap-6

**Dashboard Grid Structure:**
- Primary layout: 12-column CSS Grid
- Left sidebar (3 columns): Division navigation, quick stats
- Main content (6 columns): Data entry forms, item lists
- Right panel (3 columns): Live infographics, priority summaries

**Container Strategy:**
- Full viewport utilization (100vh, 100vw) - true desktop app feel
- No max-width constraints - use all available screen space
- Minimum width: 1366px (standard laptop)
- Optimal width: 1920px (Full HD)

---

## Component Library

### Navigation & Structure

**Top Navigation Bar:**
- Fixed header with app branding "ARKA SERVICES PROJECT MANAGEMENT"
- Glowing cyan underline animation
- Icons for Export (Excel/PDF/JPEG), Settings, Save
- Real-time PKR total display in large monospace font with pulsing glow

**Division Sidebar:**
- Vertical list of division cards with neon borders
- Add Division button with plus icon and hover glow
- Each division shows mini summary (item count, total PKR)
- Active division highlighted with cyan glow border
- Collapse/expand functionality with smooth transitions

### Data Entry Components

**Item Entry Form:**
- Floating card design with elevated shadow and cyan border glow
- Form fields with futuristic input styling:
  - Border: thin neon cyan outline
  - Focus state: thicker glow with box-shadow
  - Background: semi-transparent dark
- Custom dropdown for unit of measure with neon hover
- Quantity/Rate inputs: large monospace numbers
- Auto-calculated total displayed immediately with highlight animation

**Division Management:**
- Header with inline edit for division name
- Running total display with progress bar to master total
- Priority filter chips (High/Mid/Low) with glow effect
- Add/Delete item buttons with icon-only design

### Data Visualization Components

**Circular Progress Graphs (Donut Charts):**
- SVG-based with gradient strokes (cyan to purple)
- Center displays PKR amount in large monospace
- Animated on data change with smooth transitions
- Outer glow effect for active segments
- Breakdown by: Total Budget, Priority Allocation, Division Distribution

**Bar Charts:**
- Horizontal bars for division comparisons
- Vertical bars for priority breakdowns
- Neon gradient fills (cyan to purple)
- Hover reveals exact PKR values with tooltip
- Background grid with subtle cyan lines

**Summary Cards:**
- Bordered cards with corner accent lights
- Large numeric displays with PKR formatting
- Small trend indicators (up/down arrows)
- Categories: Total Project Cost, High Priority Cost, Item Count, Division Count

### Tables & Lists

**Item Data Table:**
- Dark background with subtle row hover (purple glow)
- Column headers with uppercase tracking-wider text
- Alternating row opacity for readability
- Editable cells with inline edit mode
- Priority indicator column with colored dots (glowing)
- Actions column: Edit/Delete icons with hover effects

**Master Summary Table:**
- Division-by-division breakdown
- Sortable columns
- Total row at bottom with emphasized styling
- Export preview formatting

### Interactive Elements

**Buttons:**
- Primary: Solid cyan background with white text, hover glow
- Secondary: Outline cyan border, transparent background, hover fill
- Danger: Red neon outline for delete actions
- Icon buttons: Circular with centered icon, hover glow ring

**Modals/Dialogs:**
- Full-screen overlay with backdrop blur
- Centered card with thick neon border
- Close button with X icon in corner
- Confirm/Cancel actions at bottom

---

## Animations & Interactions

**Minimal Animation Strategy** (use sparingly):
- Data update: Brief highlight flash (200ms) on changed values
- Graph transitions: Smooth 300ms ease-in-out for value changes
- Hover states: Subtle glow expansion (150ms)
- Page transitions: 200ms fade
- NO: Continuous animations, pulsing effects (except PKR total), complex scroll effects

**Interaction Feedback:**
- Button clicks: Brief scale down (95%) then return
- Form focus: Border thickness increase with glow
- Successful save: Green checkmark with fade out
- Error states: Red border pulse (single pulse only)

---

## Special Features

### Dynamic Infographics Panel

**Real-time Update Behavior:**
- All graphs re-render on ANY data change
- Smooth transitions between states
- Highlight changed segment briefly
- Update counters animate from old to new value

**Infographic Types:**
1. **Budget Allocation Pie** - Shows division spending distribution
2. **Priority Funnel** - Vertical bar showing High/Mid/Low breakdown
3. **Progress Rings** - Concentric circles for completed vs. planned
4. **Metric Cards** - 4 key numbers in glowing boxes

### Export Preview

**Modal Design:**
- Shows exactly what will be exported
- Format selector tabs (Excel/PDF/JPEG)
- Preview rendering of graphs as they'll appear
- Download button with format icon

---

## Accessibility & Usability

**Contrast Requirements:**
- All text: minimum 7:1 contrast ratio against dark backgrounds
- Neon accents used for emphasis only, never for body text
- Glow effects enhance but don't replace solid borders for critical UI

**Keyboard Navigation:**
- Tab order follows logical flow: Division sidebar → Main form → Infographics
- Enter to submit, Escape to cancel
- Arrow keys for table navigation

**Data Validation:**
- Real-time validation with inline error messages
- Red neon glow on invalid fields
- Tooltip explanations for unit types

---

## Images

**No hero images required.** This is a data-focused application dashboard.

**Icon Usage:**
- Font Awesome 6 (via CDN) for all icons
- Monochromatic icons with cyan color
- Icon sizes: 16px (inline), 24px (buttons), 32px (featured)