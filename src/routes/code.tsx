import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import task1 from "../../analysis/task1_scraper_sentiment.py?raw";
import task2 from "../../analysis/task2_analysis.py?raw";
import req from "../../analysis/requirements.txt?raw";
import { Shell } from "@/components/Shell";

export const Route = createFileRoute("/code")({
  head: () => ({
    meta: [
      { title: "Source Code — HanuAi ML Assessment" },
      { name: "description", content: "Python scripts for review scraping, sentiment analysis, EDA and text mining." },
      { property: "og:title", content: "Source Code — HanuAi ML Assessment" },
      { property: "og:description", content: "Python scripts for review scraping, sentiment analysis, EDA and text mining." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CodePage,
});

const files = [
  { name: "analysis/task1_scraper_sentiment.py", body: task1 },
  { name: "analysis/task2_analysis.py", body: task2 },
  { name: "analysis/requirements.txt", body: req },
];

function CodePage() {
  const [i, setI] = useState(0);
  const [copied, setCopied] = useState(false);
  const f = files[i] ?? files[0]!;
  return (
    <Shell>
      <h1 className="text-3xl font-bold tracking-tight">Source files</h1>
      <p className="mt-2 text-muted-foreground">Each file separately — copy and paste into a Jupyter notebook (.ipynb) or run as-is.</p>
      <div className="mt-6 flex flex-wrap gap-2">
        {files.map((x, j) => (
          <button key={x.name} onClick={() => setI(j)}
            className={`rounded-md border px-3 py-1.5 font-mono text-xs ${j === i ? "bg-primary text-primary-foreground" : "bg-card"}`}>
            {x.name.split("/")[1]}
          </button>
        ))}
      </div>
      <div className="mt-4 overflow-hidden rounded-lg border">
        <div className="flex items-center justify-between bg-muted px-4 py-2">
          <span className="font-mono text-xs">{f.name}</span>
          <button className="rounded bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground"
            onClick={() => { navigator.clipboard.writeText(f.body); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <pre className="max-h-[70vh] overflow-auto bg-code p-4 font-mono text-xs leading-relaxed text-code-foreground">{f.body}</pre>
      </div>
    </Shell>
  );
}
