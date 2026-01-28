# Exploratory Data Analysis

This vignette demonstrates exploring the **mtcars** dataset through natural language conversation.

## Dataset: mtcars

The mtcars dataset contains performance data for 16 cars from Motor Trend magazine:

| Column | Description |
|--------|-------------|
| name | Car model name |
| mpg | Miles per gallon |
| cyl | Number of cylinders (4, 6, or 8) |
| hp | Horsepower |
| wt | Weight (1000 lbs) |

---

## Conversation

### Understanding the Data

**You:** Load the mtcars dataset. What's in it?

**AI:** *Loads and inspects the data:*
```
mtcars: 16 rows × 5 columns

Column   Type       Range           Sample Values
──────────────────────────────────────────────────────────
name     string     16 unique       Mazda RX4, Datsun 710
mpg      numeric    10.4 – 24.4     21, 22.8, 18.7
cyl      numeric    4, 6, 8         6, 4, 8
hp       numeric    62 – 245        110, 93, 175
wt       numeric    2.32 – 5.42     2.62, 2.32, 3.44
```

---

### Initial Visualization

**You:** Show me the relationship between weight and fuel efficiency.

**AI:** *Creates scatter plot:*
```
                    Weight vs Fuel Efficiency
  mpg
   25 ┤●                ●
      │  ●           ●
   22 ┤     ●     ●
      │        ●
   19 ┤           ●  ●
      │              ●  ●
   16 ┤                 ●  ●
      │                    ●
   13 ┤                       ●
      │                          ●  ●
   10 ┤
      └────────────────────────────────────────
       2.5     3.0     3.5     4.0     4.5     5.0
                      Weight (1000 lbs)

Clear negative correlation - heavier cars get worse mileage.
```

---

### Adding Context

**You:** Color by number of cylinders.

**AI:** *Adds color encoding:*
```
                Weight vs MPG by Cylinders
  mpg
   25 ┤▲                ▲              ▲ 4-cyl
      │  ▲           ▲                 ● 6-cyl
   22 ┤     ▲     ▲                    ■ 8-cyl
      │        ●
   19 ┤           ●  ●
      │              ●  ●
   16 ┤                 ■  ■
      │                    ■
   13 ┤                       ■
      │                          ■  ■
   10 ┤
      └────────────────────────────────────────
       2.5     3.0     3.5     4.0     4.5     5.0
                      Weight (1000 lbs)

4-cylinder cars (▲) cluster at low weight/high MPG.
8-cylinder cars (■) cluster at high weight/low MPG.
```

---

### Distribution Analysis

**You:** What's the distribution of horsepower?

**AI:** *Creates histogram:*
```
                    Horsepower Distribution
  count
    5 ┤    ████
      │    ████
    4 ┤    ████  ████
      │    ████  ████
    3 ┤    ████  ████  ████
      │    ████  ████  ████
    2 ┤    ████  ████  ████  ████
      │    ████  ████  ████  ████        ████
    1 ┤    ████  ████  ████  ████  ████  ████
      │    ████  ████  ████  ████  ████  ████
    0 ┤────████──████──████──████──████──████────
           60    100   140   180   220   260
                     Horsepower

Range: 62 - 245 HP
Median: 123 HP
Most cars in the 90-180 HP range.
```

---

### Grouped Comparison

**You:** Compare horsepower across cylinder counts.

**AI:** *Creates box plots:*
```
              Horsepower by Cylinder Count

  HP
  250 ┤                              ──┬──
      │                             ┌──┼──┐
  200 ┤                             │  │  │
      │              ──┬──          │  │  │
  150 ┤             ┌──┼──┐         └──┼──┘
      │             │  │  │            │
  100 ┤  ──┬──      └──┼──┘         ──┴──
      │ ┌──┼──┐        │
   75 ┤ │  │  │     ──┴──
      │ └──┼──┘
   50 ┤  ──┴──
      └────────────────────────────────────
          4-cyl       6-cyl       8-cyl

8-cylinder engines have highest HP (median ~180).
4-cylinder engines most efficient (median ~90 HP).
```

---

### Efficiency Analysis

**You:** Which cars have the best efficiency for their weight class?

**AI:** *Adds reference line and labels:*
```
                Weight vs MPG (with trend)
  mpg
   25 ┤Datsun 710●     ●Merc 230
      │  ●Merc 240D ●
   22 ┤     ●     ●
      │ ───────────────────────────────── trend
   19 ┤           ●  ●
      │              ●  ●
   16 ┤                 ●  ●
      │                    ●Merc 450SL
   13 ┤                       ●
      │                          ●  ●
   10 ┤                          Cadillac●
      └────────────────────────────────────────
       2.5     3.0     3.5     4.0     4.5     5.0

Above trend line = better than average efficiency.
Datsun 710 and Merc 240D are efficiency leaders.
```

---

### Export

**You:** Export for my report.

**AI:** *Creates interactive HTML:*
```
Created mtcars-analysis.html

Open in browser to:
- Pan and zoom the visualization
- Download as PNG or SVG
- Hover for car details
```

---

## Key Insights

This exploratory session revealed:
1. Strong weight-MPG inverse correlation
2. Clear clustering by cylinder count
3. 4-cylinder cars dominate efficiency
4. Datsun 710 and Merc 240D are efficiency outliers

All discovered through conversation, not code.
