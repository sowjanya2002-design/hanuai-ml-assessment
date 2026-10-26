"""
HanuAi ML Assessment - Task 2: Advanced EDA & Text Mining
Run:  pip install pandas scikit-learn openpyxl
      python analysis/task2_analysis.py data/Hanuai_task2_assignment.csv
Outputs: analysis/output/tagged_events.csv  and  src/data/analysis.json (used by the web dashboard)
"""
import json, re, sys, os
from collections import Counter
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import NMF

SRC = sys.argv[1] if len(sys.argv) > 1 else "data/Hanuai_task2_assignment.csv"
df = pd.read_csv(SRC)

# ---------- 1. EDA: types, missing, duplicates, cleaning ----------
profile = [{"column": c, "dtype": str(df[c].dtype), "missing": int(df[c].isna().sum()),
            "unique": int(df[c].nunique())} for c in df.columns]
dupes = int(df.duplicated().sum())
# Example tag columns (Trigger..Fix Condition) are ~99.5% empty: reference only, dropped from analysis
example_cols = ["Trigger", "Failure Component", "Failure Condition", "Additional Context", "Fix Component", "Fix Condition"]
df = df.drop(columns=example_cols).drop_duplicates()
for c in ["Opened date", "BUILD_DATE", "IN_USE_DATE"]:
    df[c] = pd.to_datetime(df[c], errors="coerce", utc=True).dt.tz_localize(None)
df["CAUSAL_CD_DESC"] = df["CAUSAL_CD_DESC"].fillna("Unknown")
for c in ["CAUSAL_VERBATIM", "CORRECTION_VERBATIM", "CUSTOMER_VERBATIM"]:
    df[c] = df[c].fillna("").str.lower().str.replace(r"[^a-z0-9 ]", " ", regex=True).str.replace(r"\s+", " ", regex=True)
df["days_in_use"] = (df["Opened date"] - df["IN_USE_DATE"]).dt.days

# ---------- 2. Text mining: dictionary-based entity tagging ----------
COMPONENTS = {"Radio": r"radio", "Display/Screen": r"display|screen", "Amplifier": r"\bamp\b|amplifier",
              "Speaker": r"speaker", "Bluetooth": r"bluetooth|\bbt\b", "OnStar/Telematics": r"onstar|telematic|tcicm|\btcp\b",
              "Camera": r"camera", "USB/CarPlay": r"usb|carplay|android auto", "Navigation/GPS": r"navigation|\bnav\b|gps",
              "Wiring/Connector": r"wir|harness|connector|ground", "Antenna": r"antenna", "Microphone": r"\bmic"}
CONDITIONS = {"Inoperative": r"inop|not work|doesnt work|dead|no power", "Black/Blank Screen": r"black|blank",
              "No Sound": r"no sound|no audio|no volume", "Intermittent": r"intermit|cut(s|ting)? out|on and off",
              "Freezing/Rebooting": r"freez|reboot|restart|reset|lock(s|ed)? up", "Static/Noise": r"static|noise|buzz|pop",
              "Unresponsive Controls": r"unrespons|not respond|touch", "Connection Loss": r"disconnect|connect|pair"}
FIXES = {"Replaced": r"replac|install", "Reprogrammed/Software": r"program|software|update|reflash|sps",
         "Repaired Wiring": r"repair|splice", "No Fault Found": r"unable to duplicate|no problem found|operating as designed"}
ISSUE_TYPE = {"Component Failure": ["Radio", "Display/Screen", "Amplifier", "Speaker", "Camera", "Antenna", "Microphone"],
              "Connectivity Issue": ["Bluetooth", "OnStar/Telematics", "USB/CarPlay", "Navigation/GPS"],
              "Electrical Issue": ["Wiring/Connector"]}

def tags(text, d): return [k for k, p in d.items() if re.search(p, text)]
df["failure_component"] = (df.CUSTOMER_VERBATIM + " " + df.CAUSAL_VERBATIM).apply(lambda t: tags(t, COMPONENTS))
df["failure_condition"] = (df.CUSTOMER_VERBATIM + " " + df.CAUSAL_VERBATIM).apply(lambda t: tags(t, CONDITIONS))
df["fix_action"] = df.CORRECTION_VERBATIM.apply(lambda t: tags(t, FIXES))
def issue(row):
    if "Freezing/Rebooting" in row.failure_condition: return "Software Issue"
    for k, comps in ISSUE_TYPE.items():
        if any(c in comps for c in row.failure_component): return k
    return "Other"
df["issue_type"] = df.apply(issue, axis=1)

# ---------- 3. Topic modelling (TF-IDF + NMF) for root-cause clusters ----------
text = df.CUSTOMER_VERBATIM + " " + df.CAUSAL_VERBATIM
vec = TfidfVectorizer(stop_words="english", max_df=0.6, min_df=5, max_features=2000)
X = vec.fit_transform(text)
nmf = NMF(n_components=6, random_state=42).fit(X)
words = vec.get_feature_names_out()
topics = [{"id": i, "keywords": [words[j] for j in comp.argsort()[-8:][::-1]]} for i, comp in enumerate(nmf.components_)]
df["topic"] = nmf.transform(X).argmax(axis=1)
for t in topics: t["count"] = int((df.topic == t["id"]).sum())

# ---------- Export ----------
os.makedirs("analysis/output", exist_ok=True)
df.to_csv("analysis/output/tagged_events.csv", index=False)
cnt = lambda s: [{"name": str(k), "value": int(v)} for k, v in s.value_counts().head(10).items()]
explode = lambda col: [{"name": k, "value": v} for k, v in Counter(x for l in df[col] for x in l).most_common(12)]
monthly = df.groupby(df["Opened date"].dt.to_period("M")).size()
out = {
    "rows": int(len(df)), "rawRows": 1000, "columns": 20, "duplicates": dupes, "profile": profile,
    "plants": cnt(df.BUILD_PLANT_DESC), "causal": cnt(df.CAUSAL_CD_DESC), "complaint": cnt(df.COMPLAINT_CD_DESC),
    "make": cnt(df.MAKE), "model": cnt(df.MODEL), "issueType": cnt(df.issue_type),
    "components": explode("failure_component"), "conditions": explode("failure_condition"), "fixes": explode("fix_action"),
    "monthly": [{"name": str(k), "value": int(v)} for k, v in monthly.items()],
    "daysInUse": {"median": float(df.days_in_use.median()), "mean": round(float(df.days_in_use.mean()), 1)},
    "topics": topics,
    "sample": df[["Event id", "CUSTOMER_VERBATIM", "failure_component", "failure_condition", "fix_action", "issue_type"]]
              .head(15).assign(failure_component=lambda x: x.failure_component.map(", ".join),
                               failure_condition=lambda x: x.failure_condition.map(", ".join),
                               fix_action=lambda x: x.fix_action.map(", ".join)).to_dict("records"),
}
os.makedirs("src/data", exist_ok=True)
json.dump(out, open("src/data/analysis.json", "w"), indent=1)
print("Done:", len(df), "rows tagged")
