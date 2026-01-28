# Comparative Analysis

This vignette demonstrates comparing distributions and groups through natural language conversation.

## Scenario

You're analyzing A/B test results for a new checkout flow and need to compare conversion rates, time-on-page, and revenue across test variants.

---

## Conversation

### Initial Comparison

**You:** I have `ab_test_results.csv` with columns: variant (A or B), converted (boolean), time_seconds, and revenue. Compare the conversion rates.

**AI:** *Creates grouped bar chart:*
```
                    Conversion Rate by Variant

  Conversion
  Rate (%)
     25 ┤                              ████
        │                              ████
     20 ┤      ████                    ████
        │      ████                    ████
     15 ┤      ████                    ████
        │      ████                    ████
     10 ┤      ████                    ████
        │      ████                    ████
      5 ┤      ████                    ████
        │      ████                    ████
      0 ┤──────████────────────────────████──────
               A                        B
             (n=1,247)               (n=1,253)

Variant A: 18.2% conversion
Variant B: 24.1% conversion
Difference: +5.9 percentage points
```

---

### Distribution Comparison

**You:** Show me the distribution of time on page for each variant.

**AI:** *Creates side-by-side histograms:*
```
              Time on Page Distribution by Variant

     Variant A                      Variant B
  count                          count
   120 ┤ ████                      120 ┤    ████
       │██████                         │  ████████
    80 ┤████████                    80 ┤████████████
       │██████████                     │██████████████
    40 ┤████████████                40 ┤████████████████
       │██████████████                 │██████████████████
     0 ┤████████████████████        0 ┤████████████████████████
       └──────────────────────        └──────────────────────────
        0   30   60   90  120          0   30   60   90  120
              seconds                        seconds

A: median 45s, mean 52s        B: median 62s, mean 68s
Variant B users spend more time (+16s median)
```

---

### Overlaid Comparison

**You:** Overlay those distributions on a single chart so I can compare directly.

**AI:** *Creates overlaid density plot:*
```
                   Time on Page: A vs B (Overlaid)

  density
    0.03 ┤           ▲▲▲
         │         ▲▲  ▲▲▲          ●●●●
    0.02 ┤       ▲▲      ▲▲▲     ●●●    ●●●
         │     ▲▲          ▲▲  ●●         ●●●
    0.01 ┤   ▲▲             ▲▲●             ●●●
         │ ▲▲               ●●▲▲              ●●●
    0.00 ┤▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲●●●●●●▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲●●●●●●
         └────────────────────────────────────────────
          0       30       60       90      120
                        seconds

         ▲ Variant A (n=1,247)    ● Variant B (n=1,253)

Clear shift rightward - Variant B keeps users engaged longer.
```

---

### Box Plot Comparison

**You:** Show me box plots of revenue by variant, but only for users who converted.

**AI:** *Creates comparative box plots:*
```
              Revenue Distribution (Converted Users Only)

  Revenue
  ($)
    200 ┤                    ──┬──
        │       ──┬──       ┌──┼──┐
    150 ┤      ┌─┼─┐       │  │  │
        │      │ │ │       │  │  │
    100 ┤      │ │ │       └──┼──┘
        │      └─┼─┘          │
     50 ┤        │          ──┴──
        │      ──┴──
      0 ┤──────────────────────────────────
               A                B
            (n=227)          (n=302)

           A           B          Diff
Median:   $78        $112        +$34
Mean:     $85        $118        +$33
IQR:      $45-$110   $72-$148

Variant B converters spend 43% more on average.
```

---

### Statistical Significance

**You:** Is that revenue difference statistically significant?

**AI:** *Adds statistical annotation:*
```
              Revenue Distribution (Converted Users Only)

  Revenue
  ($)
    200 ┤                    ──┬──
        │       ──┬──       ┌──┼──┐
    150 ┤      ┌─┼─┐       │  │  │     *** p < 0.001
        │      │ │ │       │  │  │
    100 ┤      │ │ │       └──┼──┘     95% CI for diff:
        │      └─┼─┘          │        [$26, $42]
     50 ┤        │          ──┴──
        │      ──┴──
      0 ┤──────────────────────────────────
               A                B

t-test: t(527) = 6.82, p < 0.001
Effect size: Cohen's d = 0.59 (medium)
The difference is statistically significant and meaningful.
```

---

### Multi-Metric Summary

**You:** Create a summary comparing all three metrics: conversion, time, and revenue.

**AI:** *Creates multi-panel comparison:*
```
                    A/B Test Summary: Variant A vs B

┌──────────── Conversion Rate ────────────┐
│     A: ████████████████████ 18.2%       │
│     B: ██████████████████████████ 24.1% │  +32% ✓
└─────────────────────────────────────────┘

┌──────────── Time on Page ───────────────┐
│     A: ████████████████████ 45s median  │
│     B: ██████████████████████████ 62s   │  +38% ✓
└─────────────────────────────────────────┘

┌──────────── Revenue (converters) ───────┐
│     A: ████████████████████ $78 median  │
│     B: ██████████████████████████ $112  │  +44% ✓
└─────────────────────────────────────────┘

RECOMMENDATION: Variant B outperforms A on all metrics.
Statistical significance: All comparisons p < 0.01
```

---

### Export for Stakeholders

**You:** Export this summary for the product review meeting.

**AI:** *Creates presentation-ready export:*
```
Created ab-test-summary.html

Includes:
- Executive summary chart (shown above)
- Detailed breakdowns for each metric
- Statistical test results
- Sample sizes and confidence intervals

Click "Download PNG" for slides or "Download SVG" for editing.
```

---

## Comparison Patterns

This analysis demonstrated:
1. Grouped bar charts for rate comparison
2. Side-by-side histograms for distributions
3. Overlaid density plots for direct comparison
4. Box plots for spread and outliers
5. Statistical significance annotations
6. Multi-panel executive summaries

All insights discovered through conversation, not code.
