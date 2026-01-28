# Publication Figures

This vignette demonstrates creating publication-ready figures using the **iris** dataset through iterative refinement.

## Dataset: iris

Fisher's classic iris dataset with measurements for 150 flowers across 3 species:

| Column | Description |
|--------|-------------|
| sepal_length | Sepal length in cm |
| sepal_width | Sepal width in cm |
| petal_length | Petal length in cm |
| petal_width | Petal width in cm |
| species | setosa, versicolor, or virginica |

---

## Conversation

### Initial Plot

**You:** Load the iris dataset. Show me petal length vs petal width.

**AI:** *Creates initial scatter plot:*
```
                    Petal Dimensions
  petal_width
    2.5 ┤                              ●●●●●
        │                           ●●●●●●●●
    2.0 ┤                        ●●●●●●●●●
        │                     ●●●●●●●●●
    1.5 ┤                  ●●●●●●●●
        │               ●●●●●●●
    1.0 ┤            ●●●●●●
        │
    0.5 ┤
        │●●●●●●●●●●●●
    0.0 ┤
        └──────────────────────────────────────
         1      2      3      4      5      6
                    Petal Length (cm)

Two clear clusters visible.
```

---

### Adding Species

**You:** Color by species to see the groupings.

**AI:** *Adds species color encoding:*
```
                 Petal Dimensions by Species
  petal_width
    2.5 ┤                              ■■■■■
        │                           ■■■■■■■■
    2.0 ┤                        ■■■■■■■■■
        │                     ■■■■●●●●●
    1.5 ┤                  ●●●●●●●●
        │               ●●●●●●●
    1.0 ┤            ●●●●●●
        │
    0.5 ┤
        │▲▲▲▲▲▲▲▲▲▲▲▲
    0.0 ┤
        └──────────────────────────────────────
         1      2      3      4      5      6

        ▲ setosa    ● versicolor    ■ virginica

Setosa (▲) clearly separable. Versicolor/virginica overlap.
```

---

### Adding Decision Boundaries

**You:** Add reference lines at petal length 2.5 and petal width 0.75 to show the species boundaries.

**AI:** *Adds reference lines:*
```
                 Petal Dimensions by Species
  petal_width
    2.5 ┤             │                ■■■■■
        │             │             ■■■■■■■■
    2.0 ┤             │          ■■■■■■■■■
        │             │       ■■■■●●●●●
    1.5 ┤             │    ●●●●●●●●
        │             │ ●●●●●●●
    1.0 ┤             │●●●●●
        │             │
   0.75 ┤─────────────┼────────────────────────
        │▲▲▲▲▲▲▲▲▲▲▲▲ │
    0.0 ┤             │
        └──────────────────────────────────────
         1     2    2.5    4      5      6

Setosa: petal_length < 2.5 AND petal_width < 0.75
```

---

### Faceted View

**You:** Show each species in its own panel for clearer comparison.

**AI:** *Creates faceted plot:*
```
┌─────────── setosa ────────────┐  ┌────────── versicolor ─────────┐
│ petal_width                   │  │ petal_width                   │
│  0.6 ┤    ●●●●●               │  │  1.8 ┤              ●●●       │
│      │   ●●●●●●●              │  │      │           ●●●●●●       │
│  0.4 ┤  ●●●●●●●●●             │  │  1.4 ┤        ●●●●●●●●        │
│      │ ●●●●●●●●●●             │  │      │     ●●●●●●●●           │
│  0.2 ┤●●●●●●●●                │  │  1.0 ┤  ●●●●●●●               │
│      └───────────────────     │  │      └───────────────────     │
│       1.0   1.2   1.4   1.6   │  │       3.0   3.5   4.0   4.5   │
│          petal_length         │  │          petal_length         │
└───────────────────────────────┘  └───────────────────────────────┘

┌─────────── virginica ─────────┐
│ petal_width                   │
│  2.5 ┤           ●●●●●        │
│      │        ●●●●●●●●        │
│  2.0 ┤     ●●●●●●●●●●         │
│      │  ●●●●●●●●●             │
│  1.5 ┤●●●●●●                  │
│      └───────────────────     │
│       4.5   5.0   5.5   6.0   │
│          petal_length         │
└───────────────────────────────┘
```

---

### Publication Polish

**You:** This looks good. Make it publication-ready with proper title and axis labels.

**AI:** *Applies publication styling:*
```
    Figure 1: Petal Morphology Across Iris Species

  Petal Width (cm)                        ● I. setosa
    2.5 ┤             │                ■■  ▲ I. versicolor
        │             │             ■■■■■  ■ I. virginica
    2.0 ┤             │          ■■■■■■■
        │             │       ■■■▲▲▲▲▲
    1.5 ┤             │    ▲▲▲▲▲▲▲▲
        │             │ ▲▲▲▲▲▲▲
    1.0 ┤             │▲▲▲▲▲
        │             │
   0.75 ┤─────────────┼──────────────────────── threshold
        │●●●●●●●●●●●● │
    0.0 ┤             │
        └──────────────────────────────────────────────
         1      2    2.5    4      5      6

              Petal Length (cm)

    Dashed lines indicate species classification boundaries.
    n = 150 (50 per species)
```

---

### Export

**You:** Export as SVG for journal submission.

**AI:** *Creates publication export:*
```
Created iris-petal-morphology.html

Open in browser and click "Download SVG" for vector graphics.
The SVG is suitable for Nature/Science figure requirements.

Figure dimensions: 600x400px (adjustable in Vega-Lite spec)
Resolution: Vector (infinite)
```

---

## Figure Evolution

The figure evolved through conversation:
1. Basic scatter plot
2. Added species color encoding
3. Added classification boundaries
4. Faceted by species
5. Publication styling and labels
6. Exported as vector graphics

Total prompts: 6
