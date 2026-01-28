# Exploratory Data Analysis

This vignette demonstrates how to explore an unfamiliar dataset through natural language conversation with an AI assistant.

## Scenario

You have a CSV file with housing data and want to understand its structure and patterns.

---

## Conversation

### Understanding the Data

**You:** I have a file called `housing.csv`. What's in it?

**AI:** *Inspects the file and reports:*
```
housing.csv: 500 rows × 8 columns

Column        Type          Unique  Range/Stats         Sample Values
──────────────────────────────────────────────────────────────────────
price         numeric          487  150000 – 850000     245000, 312000
sqft          numeric          312  800 – 4500          1200, 2100, 1850
bedrooms      numeric            5  1 – 5               3, 2, 4
bathrooms     numeric            4  1 – 4               2, 1, 3
year_built    numeric           85  1920 – 2023         1985, 2001, 1962
neighborhood  categorical       12  12 categories       Downtown, Suburbs
condition     categorical        4  4 categories        Good, Fair, Excellent
sold_date     date            365  date range          2023-01-15, 2023-03-22
```

---

### Initial Visualization

**You:** Show me the relationship between price and square footage.

**AI:** *Creates scatter plot:*
```
                         Price vs Square Footage
  850K ┤                                              ●
       │                                    ●    ●  ●
  700K ┤                              ●  ●    ●●
       │                        ●  ●●  ●● ●●
  550K ┤                    ●●●●●●●●●●
       │              ●●●●●●●●●●●
  400K ┤        ●●●●●●●●●●●
       │    ●●●●●●●●
  250K ┤●●●●●●
       │●●
  150K ┤●
       └────────────────────────────────────────────────
        800    1500    2200    2900    3600    4300
                        Square Feet
```

There's a clear positive correlation - larger homes tend to cost more.

---

### Drilling Down

**You:** Does this vary by neighborhood?

**AI:** *Adds color mapping:*
```
                    Price vs Sqft by Neighborhood
  850K ┤                                           ●  ● Downtown
       │                                    ▲  ●  ●    ▲ Suburbs
  700K ┤                              ●  ▲    ●▲       ■ Midtown
       │                        ▲  ●●  ▲● ●●
  550K ┤                    ●▲●●■●●●●●
       │              ▲●■●●●■●●●●
  400K ┤        ●▲■●●●●●●●●
       │    ■▲●●●●■●
  250K ┤▲■●●●●
       │■▲
       └────────────────────────────────────────────────
        800    1500    2200    2900    3600    4300
```

Downtown properties (●) cluster at higher prices for the same square footage. Suburbs (▲) offer more space for less money.

---

### Distribution Analysis

**You:** What about the price distribution? Any outliers?

**AI:** *Creates histogram:*
```
                        Price Distribution
  count
    80 ┤    ████
       │   ██████
    60 ┤  ████████
       │ ██████████
    40 ┤████████████
       │██████████████
    20 ┤████████████████                          █
       │██████████████████                    █  ███
     0 ┤████████████████████████████████████████████
       └────────────────────────────────────────────
        150K   300K   450K   600K   750K   850K
                          Price

Right-skewed distribution with a few high-end properties above $750K.
```

---

### Comparisons

**You:** Compare price distributions across condition ratings.

**AI:** *Creates grouped visualization:*
```
                    Price by Condition
         Poor      Fair      Good    Excellent
  800K ┤                              ──┬──
       │                       ──┬──   │
  600K ┤              ──┬──    ┌─┼─┐  ┌┼┐
       │   ──┬──     ┌─┼─┐    │ │ │  │││
  400K ┤  ┌─┼─┐     │ │ │    └─┼─┘  └┼┘
       │  │ │ │     └─┼─┘      │     │
  200K ┤  └─┼─┘       │      ──┴──  ──┴──
       │    │       ──┴──
       └────────────────────────────────────────

Excellent condition homes have higher median prices and less variance.
```

---

### Adding Context

**You:** Add a reference line at the median price.

**AI:** *Adds horizontal reference line:*
```
                         Price vs Square Footage
  850K ┤                                              ●
       │                                    ●    ●  ●
  700K ┤                              ●  ●    ●●
       │                        ●  ●●  ●● ●●
  550K ┤                    ●●●●●●●●●●
       │              ●●●●●●●●●●●
  400K ┤────────●●●●●●●●●●────────────────── median: $385K
       │    ●●●●●●●●
  250K ┤●●●●●●
       │●●
  150K ┤●
       └────────────────────────────────────────────────
        800    1500    2200    2900    3600    4300
```

---

### Export for Sharing

**You:** Export that last plot so I can share it.

**AI:** *Creates interactive HTML:*
```
Created housing-analysis.html

Open in browser to:
- Pan and zoom
- Download as PNG or SVG
- View underlying data on hover
```

---

## Key Patterns

This exploratory session revealed:
1. Strong price-sqft correlation
2. Neighborhood premium (Downtown +15%)
3. Right-skewed price distribution
4. Condition significantly impacts value

All discovered through conversation, not memorizing commands.
