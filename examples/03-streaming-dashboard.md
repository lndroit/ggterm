# Streaming Dashboard

This vignette demonstrates building a monitoring dashboard using the **sample** dataset generator.

## Dataset: sample

The sample generator creates random data for testing and prototyping:

| Column | Description |
|--------|-------------|
| x | Random numeric values |
| y | Random numeric values (correlated with x) |
| group | Categorical group labels (A, B, C) |
| size | Random numeric size values |

Generate with: `.data sample <n>` where n is the number of rows.

---

## Conversation

### Initial Data Stream

**You:** Generate 50 sample points and show me x vs y.

**AI:** *Creates streaming scatter plot:*
```
                         Sample Data (Live)
  y
   45 ┤                                    ●
      │                              ●  ●
   40 ┤                         ●  ●    ●●
      │                    ●  ●●  ●● ●●
   35 ┤               ●●●●●●●●●●
      │          ●●●●●●●●●●●
   30 ┤     ●●●●●●●●●●●
      │ ●●●●●●●●
   25 ┤●●●●●●
      │●●
   20 ┤●
      └────────────────────────────────────────────────
        0     10     20     30     40     50
                           x

50 points loaded. Positive correlation visible.
```

---

### Adding Group Segmentation

**You:** Color by group to see if there are different patterns.

**AI:** *Adds group coloring:*
```
                      Sample Data by Group
  y
   45 ┤                                    ■        ● Group A
      │                              ●  ■           ▲ Group B
   40 ┤                         ▲  ●    ■●          ■ Group C
      │                    ●  ▲■  ●■ ▲●
   35 ┤               ●▲■●●▲■●●●
      │          ●▲■●●▲■●●●●
   30 ┤     ●▲■●●▲■●●●●
      │ ●▲■●●▲■●
   25 ┤●▲■●●●
      │▲●
   20 ┤●
      └────────────────────────────────────────────────
        0     10     20     30     40     50

Groups appear uniformly distributed along the trend.
```

---

### Adding Alert Thresholds

**You:** Add warning line at y=40 and critical line at y=45.

**AI:** *Adds reference lines:*
```
                      Sample Data by Group
  y
   45 ┤────────────────────────────────────■──── CRITICAL
      │                              ●  ■
   40 ┤──────────────────────────▲──●────■●──── WARNING
      │                    ●  ▲■  ●■ ▲●
   35 ┤               ●▲■●●▲■●●●
      │          ●▲■●●▲■●●●●
   30 ┤     ●▲■●●▲■●●●●
      │ ●▲■●●▲■●
   25 ┤●▲■●●●
      │▲●
   20 ┤●
      └────────────────────────────────────────────────
        0     10     20     30     40     50

⚠ 3 points above warning threshold
🔴 1 point at critical level
```

---

### Multi-Panel Dashboard

**You:** Split into three panels: scatter plot, x histogram, and y histogram.

**AI:** *Creates faceted dashboard:*
```
┌─────────────── X vs Y Scatter ───────────────┐
│  y                                           │
│  45 ┤                                 ●  ●   │
│  35 ┤               ●●●●●●●●●●●●●●           │
│  25 ┤     ●●●●●●●●●●●●●●                     │
│  15 ┤●●●●●                                   │
│     └──────────────────────────────────      │
│       0      10      20      30      40      │
└──────────────────────────────────────────────┘

┌────────── X Distribution ──────────┐  ┌────────── Y Distribution ──────────┐
│ count                              │  │ count                              │
│  12 ┤    ████                      │  │  10 ┤       ████                   │
│   8 ┤  ████████                    │  │   8 ┤    ████████                  │
│   4 ┤████████████                  │  │   4 ┤  ████████████                │
│   0 ┤████████████████████          │  │   0 ┤████████████████████          │
│     └────────────────────          │  │     └────────────────────          │
│       0   10   20   30   40        │  │      15   25   35   45             │
└────────────────────────────────────┘  └────────────────────────────────────┘

Summary: n=50, x̄=22.4, ȳ=31.2, r=0.87
```

---

### Highlighting Outliers

**You:** Mark any points where y > 40 with labels.

**AI:** *Adds outlier annotations:*
```
┌─────────────── X vs Y Scatter ───────────────┐
│  y                                           │
│  45 ┤─────────────────────────────────●[47]──│ CRIT
│  40 ┤─────────────────────────────●[42]──────│ WARN
│  35 ┤               ●●●●●●●●●●  ●[41]        │
│  30 ┤        ●●●●●●●●●●●●●●●                 │
│  25 ┤  ●●●●●●●●●●●●●                         │
│  20 ┤●●●●●●                                  │
│     └──────────────────────────────────      │
│       0      10      20      30      40      │
└──────────────────────────────────────────────┘

3 alerts detected:
  [41] at x=35 - Warning
  [42] at x=38 - Warning
  [47] at x=42 - Critical
```

---

### Size Encoding

**You:** Make point size reflect the 'size' column.

**AI:** *Adds size aesthetic:*
```
                    Multi-Dimensional View
  y
   45 ┤                                    ⬤
      │                              ●  ●
   40 ┤                         ⬤  ●    ●●
      │                    ●  ●⬤  ●● ⬤●
   35 ┤               ●⬤●●●⬤●●●●
      │          ●●⬤●●●●⬤●●●
   30 ┤     ●●⬤●●●●●●●●
      │ ●●●●●⬤●●
   25 ┤●⬤●●●
      │●●
   20 ┤●
      └────────────────────────────────────────────────

Legend: Point size ∝ 'size' column
Large points (⬤) indicate high-value observations.
```

---

### Export Snapshot

**You:** Export this dashboard for the status report.

**AI:** *Creates timestamped export:*
```
Created sample-dashboard-2024-01-28.html

Includes:
- All three panels with current data
- Threshold annotations
- Interactive controls (pan/zoom)
- PNG/SVG download buttons

Open in browser for full interactivity.
```

---

## Dashboard Patterns

This session demonstrated:
1. Real-time data visualization with sample generator
2. Group segmentation with color encoding
3. Operational thresholds (warning/critical)
4. Multi-panel dashboard layouts
5. Outlier detection and labeling
6. Multi-dimensional encoding (position + color + size)

All built incrementally through conversation.
