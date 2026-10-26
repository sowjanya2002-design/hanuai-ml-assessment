HanuAi ML Assessment — Infotainment Warranty Repair Analysis
Analysis of 1,000 infotainment warranty repair events (raw file: data/Hanuai_task2_assignment.csv), covering the two assignment tasks plus a web dashboard that presents the results.

Task 1 — Review scraping & sentiment: pulls product reviews from a URL, de-duplicates them, scores each review with VADER sentiment, and groups scores by aspect (screen, sound, bluetooth, etc.).
Task 2 — EDA & text mining: profiles the data, cleans it, tags every event with a keyword dictionary (failure component, failure condition, fix action, issue type), then runs TF-IDF + NMF topic modelling to surface recurring problem clusters.
Dashboard: a React app that shows the data-quality summary, charts, mined tags, topic clusters and stakeholder recommendations.
Project structure
data/Hanuai_task2_assignment.csv    raw dataset (1,000 rows, 20 columns)
analysis/task1_scraper_sentiment.py Task 1: scraper + sentiment scoring
analysis/task2_analysis.py          Task 2: EDA, tagging, topic modelling
analysis/requirements.txt           Python dependencies
analysis/output/tagged_events.csv   tagged events (deliverable)
src/data/analysis.json              analysis results consumed by the dashboard
src/routes/index.tsx                dashboard page
src/routes/code.tsx                 source viewer for the Python files
src/routes/guide.tsx                setup & deploy walkthrough
src/components/                     charts and page shell
Prerequisites
Python 3.10+ — python.org(opens in a new tab) (tick "Add Python to PATH" on Windows)
Node.js 18+ (includes npm) — nodejs.org(opens in a new tab)
Run the Python analysis
From the project folder:

python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r analysis/requirements.txt

# Task 2 — writes analysis/output/tagged_events.csv and src/data/analysis.json
python analysis/task2_analysis.py data/Hanuai_task2_assignment.csv

# Task 1 — needs Chrome; pass the review page URL
python analysis/task1_scraper_sentiment.py "https://www.bestbuy.ca/en-ca/product/15711013/review"
Run the dashboard
npm install
npm run dev                     # open http://localhost:8080
Other commands
npm run build                   # production build
npm run preview                 # serve the production build locally
npm run lint                    # eslint
npm run test                    # vitest
npm run format                  # prettier
Publishing notebooks
The assignment asks for notebooks. Open Jupyter, create one notebook per task, and paste the matching script into cells (jupyter notebook starts the server; it is included in analysis/requirements.txt).

Hosting
npm run build produces the deployable output in dist/. Upload that folder to any static host, or connect the repository to a host such as Vercel or Netlify — point the build command at npm run build and the output directory at dist.

Headline findings
Radio-related events dominate the dataset (~93% of records mention the radio).
Roughly three quarters of corrections were reprogramming or software updates rather than part replacements.
Median time in use before a failure was reported: ~200 days.
Topic modelling separated distinct clusters, most clearly a black/blank-screen group and a rear-camera group.