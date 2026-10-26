import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";

export const Route = createFileRoute("/guide")({
  head: () => ({
    meta: [
      { title: "Setup & Deploy Guide — HanuAi ML Assessment" },
      { name: "description", content: "Step-by-step: run the analysis, preview, push to GitHub and deploy." },
      { property: "og:title", content: "Setup & Deploy Guide — HanuAi ML Assessment" },
      { property: "og:description", content: "Step-by-step: run the analysis, preview, push to GitHub and deploy." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Guide,
});

const steps: { t: string; d: string; cmd?: string }[] = [
  { t: "Preview the project", d: "The dashboard is already live in the Lovable preview. Open Dashboard, Code and Setup Guide tabs to review everything." },
  { t: "Project structure", d: "Know where each part lives.", cmd: "data/Hanuai_task2_assignment.csv   # raw dataset\nanalysis/task1_scraper_sentiment.py # Task 1\nanalysis/task2_analysis.py          # Task 2\nanalysis/requirements.txt\nanalysis/output/tagged_events.csv   # extracted tags (deliverable)\nsrc/                                # web dashboard" },
  { t: "Connect GitHub", d: "In Lovable click the GitHub icon (top right) → Connect to GitHub → authorize → Create Repository. Code syncs automatically both ways." },
  { t: "Clone locally", d: "Copy the repo URL from GitHub.", cmd: "git clone https://github.com/<you>/<repo>.git\ncd <repo>" },
  { t: "Run the Python analysis", d: "Requires Python 3.10+.", cmd: "python -m venv venv && source venv/bin/activate   # Windows: venv\\Scripts\\activate\npip install -r analysis/requirements.txt\npython analysis/task2_analysis.py data/Hanuai_task2_assignment.csv\npython analysis/task1_scraper_sentiment.py \"<bestbuy-review-url>\"" },
  { t: "Make notebooks (.ipynb)", d: "The assignment asks for notebooks. Open Jupyter, create a notebook per task, paste the script into cells.", cmd: "jupyter notebook" },
  { t: "Run the dashboard locally (optional)", d: "Requires Node 18+ or Bun.", cmd: "npm install\nnpm run dev   # http://localhost:8080" },
  { t: "Push changes", d: "Anything you push appears in Lovable too.", cmd: "git add .\ngit commit -m \"Add notebooks and report\"\ngit push" },
  { t: "Deploy", d: "In Lovable click Publish (top right) → Publish. You get a public link to share with HanuAi reviewers." },
  { t: "Write the report", d: "Use the Dashboard sections 01–04 as the report outline: data understanding, tags, insights, recommendations. Add key learnings: rule tags could be upgraded to an open-source LLM / spaCy NER." },
];

function Guide() {
  return (
    <Shell>
      <h1 className="text-3xl font-bold tracking-tight">From preview to production</h1>
      <p className="mt-2 text-muted-foreground">Follow these steps in order.</p>
      <ol className="mt-8 space-y-4">
        {steps.map((s, i) => (
          <li key={s.t} className="flex gap-4 rounded-lg border bg-card p-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent font-mono text-sm font-bold text-accent-foreground">{i + 1}</span>
            <div className="min-w-0 flex-1">
              <div className="font-semibold">{s.t}</div>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
              {s.cmd && <pre className="mt-3 overflow-x-auto rounded-md bg-code p-3 font-mono text-xs text-code-foreground">{s.cmd}</pre>}
            </div>
          </li>
        ))}
      </ol>
    </Shell>
  );
}
