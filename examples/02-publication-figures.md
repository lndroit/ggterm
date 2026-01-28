# Publication Figures

This vignette demonstrates iterative refinement of visualizations for publication through natural language.

## Scenario

You're preparing figures for a paper on gene expression differences between treatment groups.

---

## Conversation

### Initial Plot

**You:** I have expression data in `results.json`. Create a volcano plot showing fold change vs significance.

**AI:** *Creates initial plot:*
```
                           Volcano Plot
   -log10(p)
    12 ┤●                                              ●
       │
    10 ┤  ●                                          ●
       │    ●●                                    ●●
     8 ┤      ●●●                              ●●●
       │         ●●●●                      ●●●●
     6 ┤            ●●●●●●            ●●●●●●
       │                 ●●●●●●●●●●●●●
     4 ┤                      ●●●●●●
       │                  ●●●●●●●●●●●●
     2 ┤              ●●●●●●●●●●●●●●●●●●
       │          ●●●●●●●●●●●●●●●●●●●●●●●
     0 ┤●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●
       └────────────────────────────────────────────
        -4      -2       0       2       4
                    log2 Fold Change
```

---

### Adding Thresholds

**You:** Add reference lines at the significance cutoffs: p=0.05 and fold change of ±1.5.

**AI:** *Adds reference lines:*
```
                           Volcano Plot
   -log10(p)
    12 ┤●            │                    │          ●
       │             │                    │
    10 ┤  ●          │                    │        ●
       │    ●●       │                    │     ●●
     8 ┤      ●●●    │                    │  ●●●
       │         ●●●●│                    │●●●
     6 ┤            ●│●●●            ●●●●●│
       │             │   ●●●●●●●●●●●●     │
     4 ┤             │        ●●●●●●      │
       │             │    ●●●●●●●●●●●●    │
     2 ┤─────────────│●●●●●●●●●●●●●●●●●●──│──── p=0.05
       │         ●●●●│●●●●●●●●●●●●●●●●●●●●│●
     0 ┤●●●●●●●●●●●●●│●●●●●●●●●●●●●●●●●●●●│●●●●●●●●●●
       └────────────────────────────────────────────
        -4      -2  -1.5  0   1.5  2       4
                    log2 Fold Change

Significant & upregulated: 47 genes (upper right)
Significant & downregulated: 32 genes (upper left)
```

---

### Highlighting Genes of Interest

**You:** Highlight the top 5 most significant genes with labels.

**AI:** *Adds labels to key points:*
```
                           Volcano Plot
   -log10(p)
    12 ┤●BRCA1        │                    │        TP53●
       │             │                    │
    10 ┤  ●MYC        │                    │      EGFR●
       │    ●●       │                    │     ●●
     8 ┤      ●●●    │                    │  ●●●KRAS
       │         ●●●●│                    │●●●
     6 ┤            ●│●●●            ●●●●●│
       │             │   ●●●●●●●●●●●●     │
     4 ┤             │        ●●●●●●      │
       │             │    ●●●●●●●●●●●●    │
     2 ┤─────────────│●●●●●●●●●●●●●●●●●●──│────
       │         ●●●●│●●●●●●●●●●●●●●●●●●●●│●
     0 ┤●●●●●●●●●●●●●│●●●●●●●●●●●●●●●●●●●●│●●●●●●●●●●
       └────────────────────────────────────────────
        -4      -2  -1.5  0   1.5  2       4
                    log2 Fold Change
```

---

### Color by Category

**You:** Color points by pathway: DNA repair, cell cycle, or other.

**AI:** *Applies categorical coloring:*
```
                      Volcano Plot by Pathway

   -log10(p)                                    ● DNA Repair
    12 ┤●             │                    │        ●  ■ Cell Cycle
       │             │                    │            ▲ Other
    10 ┤  ■          │                    │      ●
       │    ●■       │                    │     ■●
     8 ┤      ▲●■    │                    │  ●■▲
       │         ▲▲▲▲│                    │▲▲▲
     6 ┤            ▲│▲▲▲            ▲▲▲▲▲│
       │             │   ▲▲▲▲▲▲▲▲▲▲▲▲     │
     4 ┤             │        ▲▲▲▲▲▲      │
       │             │    ▲▲▲▲▲▲▲▲▲▲▲▲    │
     2 ┤─────────────│▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲──│────
       │         ▲▲▲▲│▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲│▲
     0 ┤▲▲▲▲▲▲▲▲▲▲▲▲▲│▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲│▲▲▲▲▲▲▲▲▲▲
       └────────────────────────────────────────────
        -4      -2       0       2       4

DNA repair genes show strongest upregulation (right side).
```

---

### Adjusting for Publication

**You:** This looks good. Make it publication-ready - add a proper title and axis labels.

**AI:** *Refines labels:*
```
    Differential Gene Expression: Treatment vs Control

   Significance
   (-log₁₀ p-value)                             ● DNA Repair
    12 ┤●             │                    │        ●  ■ Cell Cycle
       │             │                    │            ▲ Other
    10 ┤  ■          │                    │      ●
       │    ●■       │                    │     ■●
     8 ┤      ▲●■    │                    │  ●■▲
       │         ▲▲▲▲│                    │▲▲▲
     6 ┤            ▲│▲▲▲            ▲▲▲▲▲│
       │             │   ▲▲▲▲▲▲▲▲▲▲▲▲     │
     4 ┤             │        ▲▲▲▲▲▲      │
       │             │    ▲▲▲▲▲▲▲▲▲▲▲▲    │
     2 ┤─────────────│▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲──│────
       │         ▲▲▲▲│▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲│▲
     0 ┤▲▲▲▲▲▲▲▲▲▲▲▲▲│▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲│▲▲▲▲▲▲▲▲▲▲
       └────────────────────────────────────────────
        -4      -2       0       2       4
              Effect Size (log₂ Fold Change)

       Dashed lines: |FC| > 1.5, p < 0.05
```

---

### Export

**You:** Export as SVG for the journal submission.

**AI:** *Exports to HTML with download options:*
```
Created volcano-plot.html

Open in browser and click "Download SVG" for vector graphics.
The SVG can be edited in Illustrator/Inkscape if needed.

Figure dimensions: 600x400px (adjustable in Vega-Lite spec)
```

---

## Iteration Summary

The figure evolved through conversation:
1. Basic scatter → Volcano layout
2. Added statistical thresholds
3. Labeled key genes
4. Colored by biological pathway
5. Polished labels for publication
6. Exported as vector graphics

Total prompts: 6
Time to publication-ready figure: ~2 minutes
