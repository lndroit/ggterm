# Streaming Dashboard

This vignette demonstrates building a real-time monitoring dashboard through natural language conversation.

## Scenario

You're monitoring server metrics and want to visualize CPU, memory, and request rates in real-time.

---

## Conversation

### Setting Up the Data Stream

**You:** I have metrics coming from `metrics.jsonl`. Each line has timestamp, cpu_percent, memory_mb, and requests_per_sec. Show me the CPU usage over time.

**AI:** *Creates streaming line chart:*
```
                         CPU Usage (Live)
  100% ┤
       │                              ●●●
   80% ┤                         ●●●●    ●●
       │                    ●●●●●          ●●
   60% ┤               ●●●●●                 ●●
       │          ●●●●●
   40% ┤     ●●●●●
       │●●●●●
   20% ┤
       │
    0% ┤
       └────────────────────────────────────────────────
        10:00   10:05   10:10   10:15   10:20   10:25

Last update: 10:25:32 | Current: 72%
```

---

### Adding More Metrics

**You:** Add memory usage on the same chart with a different color.

**AI:** *Overlays second metric:*
```
                      System Metrics (Live)
  100% ┤                                        ● CPU
       │                              ●●●       ■ Memory
   80% ┤                         ●●●●    ●●
       │    ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
   60% ┤               ●●●●●                 ●●
       │          ●●●●●
   40% ┤     ●●●●●
       │●●●●●
   20% ┤
       │
    0% ┤
       └────────────────────────────────────────────────
        10:00   10:05   10:10   10:15   10:20   10:25

CPU: 72% | Memory: 68% (stable)
```

---

### Adding Alert Thresholds

**You:** Add a warning line at 80% and critical line at 90%.

**AI:** *Adds reference lines:*
```
                      System Metrics (Live)
  100% ┤─────────────────────────────────────── CRITICAL
       │                              ●●●
   80% ┤─────────────────────────●●●●────●●──── WARNING
       │    ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
   60% ┤               ●●●●●                 ●●
       │          ●●●●●
   40% ┤     ●●●●●
       │●●●●●
   20% ┤
       │
    0% ┤
       └────────────────────────────────────────────────
        10:00   10:05   10:10   10:15   10:20   10:25

⚠ CPU approaching warning threshold (72%)
```

---

### Creating a Multi-Panel Dashboard

**You:** Split this into three panels: CPU, Memory, and Request Rate.

**AI:** *Creates faceted dashboard:*
```
┌─────────────── CPU Usage ───────────────┐
│ 100% ┤─────────────────────────── CRIT  │
│  80% ┤─────────────●●●●────────── WARN  │
│  60% ┤        ●●●●●    ●●●●             │
│  40% ┤   ●●●●●                          │
│  20% ┤●●●                               │
└─────────────────────────────────────────┘
┌────────────── Memory (MB) ──────────────┐
│ 8000 ┤────────────────────────── LIMIT  │
│ 6000 ┤■■■■■■■■■■■■■■■■■■■■■■■■■■         │
│ 4000 ┤                                   │
│ 2000 ┤                                   │
│    0 ┤                                   │
└─────────────────────────────────────────┘
┌─────────── Requests/sec ────────────────┐
│  500 ┤            ▲▲▲                    │
│  400 ┤       ▲▲▲▲▲   ▲▲▲▲               │
│  300 ┤   ▲▲▲▲            ▲▲▲▲           │
│  200 ┤▲▲▲                    ▲▲▲        │
│  100 ┤                                   │
└─────────────────────────────────────────┘
         10:00        10:15        10:30

Refresh: 5s | All systems nominal
```

---

### Highlighting Anomalies

**You:** Highlight any points where CPU exceeded the warning threshold.

**AI:** *Marks threshold crossings:*
```
┌─────────────── CPU Usage ───────────────┐
│ 100% ┤─────────────────────────── CRIT  │
│  80% ┤─────────────⚠⚠⚠─────────── WARN  │
│  60% ┤        ●●●●●    ●●●●             │
│  40% ┤   ●●●●●                          │
│  20% ┤●●●                               │
└─────────────────────────────────────────┘

⚠ 3 warning events detected (10:18-10:21)
Peak: 87% at 10:19:45
```

---

### Rolling Window

**You:** Show only the last 5 minutes of data with 10-second resolution.

**AI:** *Adjusts time window:*
```
                    CPU Usage (5-min window)
  100% ┤─────────────────────────────────── CRIT
       │
   80% ┤───────────────────────●●●───────── WARN
       │                   ●●●●   ●●●●
   60% ┤              ●●●●●           ●●●●
       │         ●●●●●
   40% ┤    ●●●●●
       │●●●●
   20% ┤
       └────────────────────────────────────────
        10:25      10:27      10:29      10:30

Window: 5 min | Resolution: 10s | Points: 30
```

---

### Export for Incident Report

**You:** Export a snapshot for the incident report.

**AI:** *Creates timestamped export:*
```
Created dashboard-2024-01-26-1030.html

Includes:
- Static snapshot of all three panels
- Time range: 10:00 - 10:30
- Threshold crossing annotations
- Summary statistics

Open in browser to download as PNG for the report.
```

---

## Dashboard Patterns

This session demonstrated:
1. Single metric → Multi-metric overlay
2. Adding operational thresholds
3. Multi-panel faceted layout
4. Anomaly highlighting
5. Time window configuration
6. Snapshot export for reporting

All built incrementally through conversation.
