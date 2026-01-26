# ggterm Academic Publication Strategy

## Executive Summary

ggterm represents a novel contribution at the intersection of data visualization, terminal interfaces, and AI agent tooling. This document outlines the strategy for publishing ggterm as a scientific paper.

## Novel Contribution

### Traditional Framing (Weak)
"A plotting library for terminals" - competes with plotext, asciichart, termgraph

### AI-Agent Framing (Strong)
"A visualization layer enabling AI agents to perform exploratory data analysis" - first of its kind

## Key Differentiators

| Feature | ggterm | Competitors |
|---------|--------|-------------|
| Grammar of Graphics | Full implementation | None |
| LLM-friendly API | Declarative, composable | Imperative |
| Framework support | React, Vue, Svelte, Solid | None |
| Multi-renderer | Braille, Block, Sixel | Single |
| Agent Skills | Built-in | None |
| Reproducibility | PlotSpec JSON | None |

## Target Venues

### Primary: Journal of Open Source Software (JOSS)

**Why JOSS**:
- Free (no APC)
- Code-focused peer review on GitHub
- Precedent: "Gramm: grammar of graphics plotting in Matlab" published here
- Establishes citable software

**Requirements**:
- [ ] 6+ months public development history
- [ ] OSI-approved license (MIT - ✅)
- [ ] Good documentation (✅)
- [ ] Comprehensive tests (1,867 tests - ✅)
- [ ] Feature-complete (✅)

**Paper Format**: ~1000 words + software metadata

### Alternative: Bioinformatics Application Notes

**Why Bioinformatics**:
- Higher prestige/impact factor
- Good fit if framed for computational biology workflows
- AI agent angle is novel in this space

**Requirements**:
- Up to 4 pages (~2000 words)
- Software available for 2+ years post-publication
- Comparison with existing tools
- ~$2,800 APC

### Alternative: SoftwareX

**Why SoftwareX**:
- Explicitly welcomes "visualization tools"
- Domain-independent scope
- $1,560 APC

## Paper Structure

### Title Options

1. "ggterm: Grammar of Graphics for Terminal-Based Data Visualization"
2. "ggterm: A Visualization Layer for AI Coding Agents"
3. "Bringing the Grammar of Graphics to Terminal Environments and AI Agents"

### Abstract (Draft)

> We present ggterm, a TypeScript implementation of Wilkinson's Grammar of Graphics designed for terminal environments and AI coding agents. Unlike existing terminal plotting libraries that offer limited, imperative APIs, ggterm provides a declarative, composable interface with 18 geometry types, 50+ scales, faceting, and theming. The declarative API maps naturally to large language model code generation, enabling deterministic data visualization in AI-assisted workflows. We demonstrate integration through Claude Code Agent Skills for data loading, plotting, and report generation. ggterm supports multiple rendering backends (Braille, Unicode blocks, Sixel) with automatic capability detection, and exports plot specifications as JSON for reproducibility. The library is available as @ggterm/core on npm with framework integrations for React, Vue, Svelte, and Solid.js.

### Sections

1. **Introduction**
   - Gap: No Grammar of Graphics for terminals
   - Gap: AI agents lack visualization capabilities
   - Contribution: ggterm addresses both

2. **Background**
   - Grammar of Graphics (Wilkinson, ggplot2)
   - Terminal visualization landscape
   - AI coding agents and tool use

3. **Design & Implementation**
   - Layered grammar architecture
   - Renderer abstraction
   - PlotSpec JSON format
   - Agent Skills integration

4. **Usage Examples**
   - Basic plotting
   - AI agent workflow
   - Report generation

5. **Comparison**
   - Feature matrix vs plotext, asciichart, termgraph
   - Performance benchmarks

6. **Availability & Future Work**
   - npm packages
   - GitHub repository
   - Roadmap

## Figures

1. **Architecture diagram**: Data → Grammar Layers → Renderer → Output
2. **Comparison table**: Feature matrix vs competitors
3. **Example outputs**: Side-by-side terminal plots
4. **Agent workflow**: Skill invocation diagram

## Supplementary Materials

- Full API documentation
- Agent Skills source code
- Benchmark data
- Gallery of plot types

## Timeline

| Milestone | Target |
|-----------|--------|
| npm publication | Immediate |
| Skills implementation | Week 1 |
| JOSS paper draft | Week 2-3 |
| JOSS submission | Week 4 |
| Review process | 4-8 weeks |

## Author Information

- **Author**: Scott Handley
- **Affiliation**: [To be added]
- **ORCID**: [To be added]

## References (Key Citations)

1. Wilkinson, L. (2005). The Grammar of Graphics. Springer.
2. Wickham, H. (2010). A Layered Grammar of Graphics. Journal of Computational and Graphical Statistics.
3. Morel, P. (2018). Gramm: grammar of graphics plotting in Matlab. JOSS.
4. [AI agent visualization papers - to be added]

## Checklist Before Submission

### JOSS Specific
- [ ] paper.md in repository root
- [ ] paper.bib with references
- [ ] CITATION.cff file
- [ ] codemeta.json
- [ ] Statement of need in paper
- [ ] Installation instructions
- [ ] Example usage
- [ ] Community guidelines (CONTRIBUTING.md)
- [ ] Suggest 5+ reviewers

### General
- [ ] All links working
- [ ] Version tagged in git
- [ ] Zenodo DOI (optional but recommended)
- [ ] License file present
- [ ] README complete
