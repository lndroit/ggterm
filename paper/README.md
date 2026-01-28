# ggterm Paper

Academic preprint for bioRxiv submission.

## Files

| File | Description |
|------|-------------|
| `preprint.md` | Main manuscript (~2500 words) |
| `references.bib` | BibTeX bibliography |

## Submission Checklist

### Before bioRxiv Submission

- [ ] Fill in author affiliation
- [ ] Add corresponding author email
- [ ] Add ORCID
- [ ] Create figures (1-4)
- [ ] Add acknowledgments
- [ ] Review and finalize references
- [ ] Convert to PDF (bioRxiv accepts PDF, Word, or LaTeX)

### Figures (Created)

All figures are in `figures/` directory as ASCII art (can be converted to proper graphics):

1. **figure1-architecture.txt** - Data → Grammar Layers → Renderer → Output
2. **figure2-comparison.txt** - Feature matrix vs plotext, termgraph, asciichart
3. **figure3-iris-analysis.txt** - 4-panel showing A) scatter, B) colored, C) faceted, D) export
4. **figure4-workflow.txt** - Conversational analysis with AI agent

To convert to publication graphics, recreate in:
- Lucidchart, draw.io, or Figma (diagrams)
- Actual ggterm screenshots (Figure 3)

### bioRxiv Submission

1. Go to https://www.biorxiv.org/submit-a-manuscript
2. Select "New Manuscript"
3. Choose subject area: **Bioinformatics**
4. Upload PDF
5. Add metadata (title, authors, abstract)
6. Select license (recommend CC-BY)
7. Submit

### After bioRxiv

- [ ] Share DOI on social media
- [ ] Post to Hacker News
- [ ] Condense for JOSS submission

## Converting to PDF

Using pandoc:

```bash
pandoc preprint.md -o preprint.pdf \
  --bibliography=references.bib \
  --citeproc \
  -V geometry:margin=1in
```

Or use a Markdown editor with PDF export (Typora, VS Code with extensions).
