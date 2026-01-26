# Analysis Report Template

Use this template structure for data analysis reports with ggterm visualizations.

---

# [Report Title]

**Date**: [Date]
**Author**: [Author]
**Dataset**: [Dataset name/source]

## Executive Summary

[2-3 sentence summary of key findings]

## Data Overview

### Dataset Description

| Property | Value |
|----------|-------|
| Rows | [N] |
| Columns | [N] |
| Time Period | [Start] to [End] |
| Source | [Data source] |

### Variables

| Variable | Type | Description |
|----------|------|-------------|
| var1 | numeric | Description |
| var2 | categorical | Description |
| var3 | datetime | Description |

## Exploratory Analysis

### Distribution Analysis

```
[ggterm histogram output]
```

**Key observations**:
- Observation 1
- Observation 2

### Relationship Analysis

```
[ggterm scatter plot output]
```

**Key observations**:
- Observation 1
- Observation 2

### Group Comparisons

```
[ggterm boxplot output]
```

**Key observations**:
- Observation 1
- Observation 2

## Findings

### Finding 1: [Title]

[Detailed description with supporting evidence]

### Finding 2: [Title]

[Detailed description with supporting evidence]

### Finding 3: [Title]

[Detailed description with supporting evidence]

## Recommendations

1. **Recommendation 1**: [Description]
2. **Recommendation 2**: [Description]
3. **Recommendation 3**: [Description]

## Methodology

### Data Preparation

- [Step 1]
- [Step 2]

### Analysis Approach

[Description of methods used]

## Appendix

### A. Plot Specifications

<details>
<summary>Distribution Plot</summary>

```json
{
  "data": "...",
  "aes": { "x": "variable" },
  "geoms": [{ "type": "histogram", "params": { "bins": 20 } }]
}
```

</details>

<details>
<summary>Scatter Plot</summary>

```json
{
  "data": "...",
  "aes": { "x": "var1", "y": "var2" },
  "geoms": [{ "type": "point" }]
}
```

</details>

### B. Data Quality Notes

- [Any data quality issues encountered]
- [Missing value handling]
- [Outlier treatment]

---

*Report generated with ggterm - Grammar of Graphics for Terminal*
