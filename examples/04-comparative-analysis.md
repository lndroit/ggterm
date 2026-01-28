# Comparative Analysis

This vignette demonstrates comparing distributions across groups using the **iris** dataset.

## Dataset: iris

Fisher's iris dataset with measurements for 150 flowers across 3 species:

| Column | Description |
|--------|-------------|
| sepal_length | Sepal length in cm |
| sepal_width | Sepal width in cm |
| petal_length | Petal length in cm |
| petal_width | Petal width in cm |
| species | setosa, versicolor, or virginica |

---

## Conversation

### Initial Comparison

**You:** Load the iris dataset. Compare sepal length across the three species.

**AI:** *Creates grouped bar chart of means:*
```
                Mean Sepal Length by Species

  Sepal Length
  (cm)
    7.0 ┤                              ████
        │                              ████
    6.5 ┤              ████            ████
        │              ████            ████
    6.0 ┤              ████            ████
        │              ████            ████
    5.5 ┤              ████            ████
        │    ████      ████            ████
    5.0 ┤    ████      ████            ████
        │    ████      ████            ████
    4.5 ┤────████──────████────────────████──────
           setosa    versicolor    virginica
          (n=50)      (n=50)        (n=50)

Mean sepal length increases: setosa (5.0) → versicolor (5.9) → virginica (6.6)
```

---

### Distribution Comparison

**You:** Show me the full distribution, not just the means.

**AI:** *Creates box plots:*
```
              Sepal Length Distribution by Species

  Sepal
  Length (cm)
    8.0 ┤                              ──┬──
        │                             ┌──┼──┐
    7.5 ┤              ──┬──          │  │  │
        │             ┌──┼──┐         │  │  │
    7.0 ┤             │  │  │         └──┼──┘
        │             │  │  │            │
    6.5 ┤             └──┼──┘         ──┴──
        │   ──┬──        │
    6.0 ┤  ┌──┼──┐     ──┴──
        │  │  │  │
    5.5 ┤  │  │  │
        │  └──┼──┘
    5.0 ┤     │
        │   ──┴──
    4.5 ┤
        └────────────────────────────────────────
            setosa    versicolor    virginica

              median    IQR       range
setosa:        5.0    4.8-5.2    4.3-5.8
versicolor:    5.9    5.6-6.3    4.9-7.0
virginica:     6.5    6.2-6.9    4.9-7.9
```

---

### Overlaid Comparison

**You:** Overlay the distributions so I can compare directly.

**AI:** *Creates overlaid density plot:*
```
             Sepal Length Distributions Overlaid

  density
    0.8 ┤    ▲▲▲
        │   ▲▲ ▲▲
    0.6 ┤  ▲▲   ▲▲           ●●●
        │ ▲▲     ▲▲        ●●  ●●
    0.4 ┤▲▲       ▲▲      ●●    ●●      ■■■
        │          ▲▲   ●●      ●●    ■■  ■■
    0.2 ┤           ▲▲●●●        ●●  ■■    ■■
        │            ●●▲▲         ●●■■      ■■
    0.0 ┤▲▲▲▲▲▲▲▲▲▲●●●●▲▲▲▲▲▲▲▲▲▲▲●●■■■■▲▲▲▲■■■■■■
        └────────────────────────────────────────────
         4.0    5.0    6.0    7.0    8.0

         ▲ setosa    ● versicolor    ■ virginica

Clear separation between species with some overlap.
Setosa is tightly clustered, virginica has widest spread.
```

---

### All Measurements

**You:** Compare all four measurements across species side by side.

**AI:** *Creates multi-panel comparison:*
```
┌────── Sepal Length ───────┐  ┌────── Sepal Width ────────┐
│      set  ver  vir        │  │      set  ver  vir        │
│  8 ┤          ┬           │  │4.5┤  ┬                    │
│  7 ┤      ┬  ┌┼┐          │  │4.0┤ ┌┼┐                   │
│  6 ┤  ┬  ┌┼┐└┼┘           │  │3.5┤ │├┤      ┬    ┬       │
│  5 ┤ ┌┼┐└┼┘  ┴            │  │3.0┤ └┼┘  ┬  ┌┼┐  ┌┼┐      │
│  4 ┤ └┼┘  ┴               │  │2.5┤  ┴  ┌┼┐└┼┘  └┼┘       │
│    └──────────────        │  │2.0┤     └┼┘  ┴    ┴       │
└───────────────────────────┘  └───────────────────────────┘

┌────── Petal Length ───────┐  ┌────── Petal Width ────────┐
│      set  ver  vir        │  │      set  ver  vir        │
│  7 ┤              ┬       │  │2.5┤              ┬        │
│  6 ┤          ┬  ┌┼┐      │  │2.0┤          ┬  ┌┼┐       │
│  5 ┤      ┬  ┌┼┐└┼┘       │  │1.5┤      ┬  ┌┼┐└┼┘        │
│  4 ┤     ┌┼┐└┼┘  ┴        │  │1.0┤     ┌┼┐└┼┘  ┴         │
│  3 ┤     └┼┘  ┴           │  │0.5┤ ┬   └┼┘  ┴            │
│  2 ┤  ┬   ┴               │  │   ┤┌┼┐   ┴                │
│  1 ┤ ┌┼┐                  │  │0.0┤└┼┘                    │
│    └──────────────        │  │   └──────────────         │
└───────────────────────────┘  └───────────────────────────┘

Petal measurements show strongest species separation.
Sepal width is the least discriminating feature.
```

---

### Statistical Summary

**You:** Add statistical significance - which differences are meaningful?

**AI:** *Adds statistical annotations:*
```
              Petal Length by Species (Most Discriminating)

  Petal
  Length (cm)
    7.0 ┤                              ──┬──
        │                             ┌──┼──┐   ***
    6.0 ┤                             │  │  │  p < 0.001
        │              ──┬──          └──┼──┘
    5.0 ┤             ┌──┼──┐            │      ***
        │             │  │  │         ──┴──   p < 0.001
    4.0 ┤             └──┼──┘
        │   ──┬──        │
    3.0 ┤  ┌──┼──┐     ──┴──
        │  │  │  │
    2.0 ┤  └──┼──┘                     ***
        │     │                       p < 0.001
    1.0 ┤   ──┴──
        └────────────────────────────────────────
            setosa    versicolor    virginica

All pairwise comparisons significant (ANOVA F=1180, p<0.001)
Effect size: η² = 0.94 (very large)
```

---

### Classification Insight

**You:** Which measurement best separates the species?

**AI:** *Creates discriminability summary:*
```
            Feature Discriminability for Species Classification

  Feature              Separation Score    Best Threshold
  ─────────────────────────────────────────────────────────
  petal_length         ████████████████████  0.94    2.5 cm
  petal_width          ███████████████████   0.92    0.75 cm
  sepal_length         ████████████          0.62    5.5 cm
  sepal_width          ██████                0.36    3.0 cm

                 Confusion Matrix (petal_length < 2.5)
               ┌─────────────────────────────────────┐
               │  Predicted setosa  │ Predicted other │
  ─────────────┼───────────────────┼─────────────────┤
  True setosa  │        50         │        0        │
  True other   │         0         │       100       │
               └───────────────────┴─────────────────┘

  Petal length alone achieves 100% accuracy for setosa detection.
```

---

### Export

**You:** Export the full comparison for the methods section of my paper.

**AI:** *Creates publication export:*
```
Created iris-species-comparison.html

Includes:
- Multi-panel box plot comparison
- Statistical test results
- Feature importance ranking
- Interactive exploration

Suitable for supplementary materials.
```

---

## Analysis Patterns

This session demonstrated:
1. Mean comparison with bar charts
2. Distribution comparison with box plots
3. Overlaid density plots for direct comparison
4. Multi-panel layouts for multiple variables
5. Statistical significance annotations
6. Feature importance for classification

All insights discovered through conversation with real data.
