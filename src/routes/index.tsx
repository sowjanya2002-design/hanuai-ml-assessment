import { createFileRoute } from "@tanstack/react-router";
import data from "@/data/analysis.json";
import { Panel, Section, Shell } from "@/components/Shell";
import { HBar, Trend } from "@/components/Charts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Warranty Failure Insights — HanuAi ML Assessment" },
      { name: "description", content: "EDA, text mining and topic modelling of 1,000 infotainment warranty events." },
      { property: "og:title", content: "Warranty Failure Insights — HanuAi ML Assessment" },
      { property: "og:description", content: "EDA, text mining and topic modelling of 1,000 infotainment warranty events." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

const topicNames = ["Internal module fault / no sound", "XM / software update cases", "Rear camera inoperative", "Black / blank screen", "SD card & navigation errors", "Power / ground / communication"];

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="font-mono text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function Dashboard() {
  return (
    <Shell>
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Infotainment warranty failures, decoded.</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Task 2 output: {data.rawRows} repair events, 2020 model year, mined from technician and customer free text.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Events analysed" value={data.rows} />
        <Stat label="Duplicates found" value={data.duplicates} />
        <Stat label="Radio mentioned" value={`${Math.round(((data.components[0]?.value ?? 0) / data.rows) * 100)}%`} />
        <Stat label="Median days in use before failure" value={data.daysInUse.median} />
      </div>

      <div className="mt-10" />
      <Section title="01 · Data quality" sub="Six example-tag columns are 99.5% empty and were used only as references for tagging.">
        <div className="overflow-x-auto rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
              <tr><th className="p-2">Column</th><th className="p-2">Type</th><th className="p-2">Missing</th><th className="p-2">Unique</th></tr>
            </thead>
            <tbody>
              {data.profile.map((p) => (
                <tr key={p.column} className="border-t">
                  <td className="p-2 font-mono text-xs">{p.column}</td>
                  <td className="p-2">{p.dtype}</td>
                  <td className={`p-2 ${p.missing > 0 ? "font-semibold text-destructive" : ""}`}>{p.missing}</td>
                  <td className="p-2">{p.unique}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="02 · Critical columns">
        <div className="grid gap-4 md:grid-cols-2">
          <Panel title="Complaint code"><HBar data={data.complaint} /></Panel>
          <Panel title="Causal code (top 10)"><HBar data={data.causal} color="var(--chart-4)" /></Panel>
          <Panel title="Build plant"><HBar data={data.plants} color="var(--chart-5)" /></Panel>
          <Panel title="Model (top 10)"><HBar data={data.model} color="var(--chart-3)" /></Panel>
        </div>
        <div className="mt-4"><Panel title="Events opened per month"><Trend data={data.monthly} /></Panel></div>
      </Section>

      <Section title="03 · Text mining — extracted tags">
        <div className="grid gap-4 md:grid-cols-3">
          <Panel title="Failure component"><HBar data={data.components} /></Panel>
          <Panel title="Failure condition"><HBar data={data.conditions} color="var(--chart-2)" /></Panel>
          <Panel title="Fix action"><HBar data={data.fixes} color="var(--chart-3)" /></Panel>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Panel title="Type of issue"><HBar data={data.issueType} color="var(--chart-4)" /></Panel>
          <Panel title="Topic model clusters (TF-IDF + NMF)">
            <ul className="space-y-2 text-sm">
              {data.topics.map((t) => (
                <li key={t.id} className="border-b pb-2 last:border-0">
                  <div className="flex justify-between font-semibold"><span>{topicNames[t.id]}</span><span className="font-mono">{t.count}</span></div>
                  <div className="font-mono text-xs text-muted-foreground">{t.keywords.join(" · ")}</div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
        <div className="mt-4 overflow-x-auto rounded-lg border bg-card">
          <table className="w-full min-w-[720px] text-xs">
            <thead className="bg-muted text-left uppercase text-muted-foreground">
              <tr><th className="p-2">Event</th><th className="p-2">Customer says</th><th className="p-2">Component</th><th className="p-2">Condition</th><th className="p-2">Fix</th><th className="p-2">Issue</th></tr>
            </thead>
            <tbody>
              {data.sample.map((s) => (
                <tr key={s["Event id"]} className="border-t align-top">
                  <td className="p-2 font-mono">{s["Event id"]}</td>
                  <td className="max-w-xs p-2">{s.CUSTOMER_VERBATIM.slice(0, 110)}</td>
                  <td className="p-2">{s.failure_component}</td>
                  <td className="p-2">{s.failure_condition}</td>
                  <td className="p-2">{s.fix_action}</td>
                  <td className="p-2 font-semibold">{s.issue_type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="04 · Recommendations for stakeholders">
        <div className="grid gap-3 md:grid-cols-2">
          {[
            ["Radio module is the #1 failure point", "Present in 93% of events and replaced in most repairs. Run supplier root-cause analysis on the radio unit and its internal fault modes."],
            ["Communication faults dominate causes", "“No/Incorrect Communication” and “Shorted” codes lead. Validate network/ethernet lines and module grounds at end-of-line testing."],
            ["Software fixes most failures", "Reprogramming appears in ~75% of repairs. Push over-the-air updates to cut dealer visits and warranty cost."],
            ["Failures cluster in early life", "Median failure ~200 days after in-service. Strengthen burn-in testing at Fort Wayne and Flint, the two highest-volume plants."],
            ["Black screen & rear camera issues", "Distinct clusters of display and camera complaints — a safety-relevant risk (backup camera). Prioritise them."],
            ["Reduce ‘no fault found’ visits", "Intermittent issues lead to repeat visits. Add logging for DTC history to help technicians reproduce faults."],
          ].map(([h, b]) => (
            <div key={h} className="rounded-lg border-l-4 border-accent bg-card p-4">
              <div className="font-semibold">{h}</div>
              <p className="mt-1 text-sm text-muted-foreground">{b}</p>
            </div>
          ))}
        </div>
      </Section>
    </Shell>
  );
}
