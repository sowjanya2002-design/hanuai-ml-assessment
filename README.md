# HanuAi ML Assessment — Infotainment Warranty Repair Analysis

An end-to-end Machine Learning and Text Mining assessment analyzing 1,000 infotainment warranty repair records, paired with a full interactive web dashboard deployed publicly on Render.

- 🌐 **Live Application:** [https://hanuai-ml-assessment-gpcn.onrender.com/](https://hanuai-ml-assessment-gpcn.onrender.com/)
- 💻 **GitHub Repository:** [https://github.com/sowjanya2002-design/hanuai-ml-assessment](https://github.com/sowjanya2002-design/hanuai-ml-assessment)

---

## Overview

### Task 1 — Product Review Scraper & Sentiment Analysis (`analysis/task1_scraper_sentiment.py`)
- Automated scraper using Selenium WebDriver for review pages.
- De-duplicates reviews across sort filters using SHA-256 text hashing.
- VADER sentiment scoring with aspect-level categorization (Display/Screen, Audio/Sound, Connectivity/Bluetooth, Usability, Performance).
- Generates detailed sentiment summary and aspect sentiment breakdowns.

### Task 2 — Warranty Event EDA, Text Mining & Topic Modeling (`analysis/task2_analysis.py`)
- **Data Profiling & Hygiene:** Evaluates completeness, missingness, and duplicate entries across 1,000 warranty records (`data/Hanuai_task2_assignment.csv`).
- **Domain Dictionary Tagging:** Tags warranty narratives across four dimensions:
  - Failure Component (Radio/Head Unit, Touchscreen, Camera, Bluetooth, Audio, etc.)
  - Failure Condition (Black/Blank Screen, Frozen/Unresponsive, Audio Cutout, etc.)
  - Fix Action (Reprogrammed/Software Flash, Replaced Unit, Wiring Check, etc.)
  - Issue Type (Software Bug, Hardware Defect, Intermittent Glitch)
- **Topic Modeling:** TF-IDF vectorization with Non-Negative Matrix Factorization (NMF) discovering 6 recurring failure themes.
- **Output:** Produces `analysis/output/tagged_events.csv` and `src/data/analysis.json`.

### Web Dashboard
Interactive web analytics dashboard built with React, TanStack Start, and Recharts, featuring:
- Executive KPIs & Data Quality Audit
- Failure Trend Timelines & Days-in-Use Histograms
- Component, Condition, and Action Distribution Visualizations
- Extracted Topic Clusters and Tagged Event Inspector
- Actionable Engineering & Quality Assurance Recommendations

---

## Project Structure

```text
├── data/
│   └── Hanuai_task2_assignment.csv     # Raw 1,000-record warranty dataset
├── analysis/
│   ├── task1_scraper_sentiment.py      # Task 1: Selenium scraper & VADER sentiment
│   ├── task2_analysis.py               # Task 2: EDA, text mining & NMF topic modeling
│   ├── requirements.txt                # Python dependencies
│   └── output/
│       └── tagged_events.csv           # Tagged warranty events deliverable
├── src/
│   ├── data/
│   │   └── analysis.json               # Analysis metrics consumed by dashboard
│   ├── routes/
│   │   ├── index.tsx                   # Main analytics dashboard route
│   │   ├── code.tsx                    # In-browser Python script viewer
│   │   └── guide.tsx                   # Methodology & setup guide
│   └── components/                     # Reusable charts and UI shell
├── render.yaml                         # Render deployment blueprint
├── .node-version                       # Node.js 22 runtime specification
└── vite.config.ts                      # Build configuration targeting Node server
