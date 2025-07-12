# AIO Scanner Results Page - Design Spec

## Overview
- **Product:** AIO Scanner Results Dashboard
- **Goal:** Create an intuitive, action-oriented results page that transforms raw scan data into clear insights and actionable steps
- **Key Users:**
  - Business owners (non-technical)
  - SEO specialists
  - Developers

## Design System

### Typography
- Font: Inter
- Base: 16px, line-height 1.5
- Headings: H1=28px, H2=24px, H3=20px
- Spacing: 4/8/12/16/24/32px grid

### Colors
```
Impact:     HIGH=#E53935  MED=#FB8C00  LOW=#9E9E9E
Effort:     QUICK=#43A047 MED=#1E88E5  HIGH=#6A1B9A
Surface:    WHITE=#FFFFFF SECTION=#F8F9FA
Primary:    CTA=#1E88E5
```

### Components

#### 1. Header (64px)
- Logo (left)
- "New Scan" & "My Reports" CTAs (right)
- Help icon
- 1px bottom border (#E0E0E0)

#### 2. Hero Section
- Two-column grid (32px gap)
- Left: Large gauge (140-280px) + AI summary
- Right: Scan overview checklist
- Background: Light blue gradient (#EEF7FF → #FFFFFF)

#### 3. Category Tiles
- Size: 160x160px
- Radius: 16px
- Content: 48px icon, title, issue counter badge
- Progress ring (56px) overlay bottom-left
- Hover: translateY(-2px) + shadow

#### 4. Action Cards
- Full width, 8px radius
- Top: Impact/Effort badges + H3 title
- Expandable sections: "Why?" and "How?"
- Before/After code blocks
- Buttons: "✔️ Mark solved", "📋 Copy", "🔗 Read more"

### Interactions
- Gauge animation: 1s ease-out sweep
- Tile hover: translateY(-2px) + shadow
- Drawer: 240ms cubic-bezier(.22,.61,.36,1)
- Card completion: 270ms fade to #E8F5E9

### Responsive
```
≥1024px: 12-col grid, 4-col tiles
768-1023px: 8-col grid, 3-col tiles
≤767px: 4-col grid, 2-col tiles
```

### A11Y Requirements
- Text contrast ≥4.5:1
- Keyboard navigation
- ARIA labels for interactive elements

## Deliverables
1. Figma file with components + flows
2. Interactive prototype links
3. SVG icon set (24px grid)
4. Edge case documentation
