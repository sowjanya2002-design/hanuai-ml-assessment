"""
HanuAi ML Assessment - Task 1: BestBuy.ca review scraping + sentiment analysis
Run:  pip install selenium webdriver-manager pandas vaderSentiment openpyxl
      python analysis/task1_scraper_sentiment.py "https://www.bestbuy.ca/en-ca/product/<product-id>/review"
Only publicly visible reviews are collected; respect robots.txt and rate limits.
"""
import sys, time, random, hashlib
from datetime import datetime
import pandas as pd
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

URL = sys.argv[1] if len(sys.argv) > 1 else "https://www.bestbuy.ca/en-ca/product/15711013/review"
SORTS = ["Most Relevant", "Most Helpful", "Newest", "Highest Rating", "Lowest Rating"]  # filters

def driver():
    o = Options(); o.add_argument("--headless=new"); o.add_argument("--window-size=1400,1000")
    o.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124 Safari/537.36")
    return webdriver.Chrome(options=o)

def retry(fn, tries=3):
    # Retry with exponential backoff - handles transient blocks / slow loads
    for i in range(tries):
        try: return fn()
        except Exception:
            time.sleep(2 ** i + random.random())
    return None

def load_all(d):
    # Pagination: keep clicking "Show more" until it disappears
    while True:
        try:
            btn = WebDriverWait(d, 5).until(EC.element_to_be_clickable((By.XPATH, "//button[.//span[contains(text(),'Show more')]]")))
            d.execute_script("arguments[0].click();", btn); time.sleep(random.uniform(1.5, 3))
        except Exception:
            break

def parse(d, sort):
    rows = []
    for li in d.find_elements(By.CSS_SELECTOR, "li[class*='review']"):
        g = lambda sel: (li.find_elements(By.CSS_SELECTOR, sel) or [None])[0]
        title, body, name, date, rating = g("h3"), g("p[class*='reviewText'], div[class*='reviewText']"), \
            g("span[class*='author'], div[class*='reviewer'] span"), g("time, span[class*='date']"), g("[aria-label*='out of 5']")
        if not body: continue
        raw_date = date.get_attribute("datetime") or date.text if date else ""
        try: iso = datetime.fromisoformat(raw_date[:10]).strftime("%Y-%m-%d")
        except Exception:
            try: iso = datetime.strptime(raw_date.strip(), "%B %d, %Y").strftime("%Y-%m-%d")
            except Exception: iso = raw_date
        r = rating.get_attribute("aria-label") if rating else ""
        rows.append({"title": title.text if title else "", "review": body.text, "date": iso,
                     "rating": float(r.split()[0]) if r else None, "reviewer": name.text if name else "",
                     "source": "bestbuy.ca", "filter": sort})
    return rows

def scrape():
    d, all_rows = driver(), []
    try:
        for s in SORTS:
            retry(lambda: d.get(URL)); time.sleep(3)
            try: Select(d.find_element(By.CSS_SELECTOR, "select")).select_by_visible_text(s); time.sleep(2)
            except Exception: pass
            load_all(d); all_rows += parse(d, s)
    finally: d.quit()
    df = pd.DataFrame(all_rows)
    # Primary key = hash of reviewer+date+text, also used to de-duplicate across filters
    df["id"] = df.apply(lambda r: hashlib.md5(f"{r.reviewer}{r.date}{r.review}".encode()).hexdigest()[:12].upper(), axis=1)
    return df.drop_duplicates("id")

# ---- Sentiment: VADER score + aspect keywords -> category label like the example ----
ASPECTS = {"Design Quality": ["design", "look", "colour", "color", "build", "pretty"],
           "Performance": ["fast", "slow", "speed", "lag", "performance"],
           "Battery": ["battery", "charge"], "Sound/Display": ["sound", "screen", "display", "picture"],
           "Value for Money": ["price", "value", "worth", "cheap", "expensive"],
           "Delivery/Service": ["delivery", "shipping", "support", "service"]}
def categorise(text, an=SentimentIntensityAnalyzer()):
    s = an.polarity_scores(text)["compound"]
    pol = "Pos" if s >= 0.05 else "Neg" if s <= -0.05 else "Neu"
    t = text.lower(); labels = [f"{a} ({pol})" for a, kw in ASPECTS.items() if any(k in t for k in kw)]
    return s, pol, labels or [("Satisfactory Recommended" if pol == "Pos" else "General Complaint" if pol == "Neg" else "Neutral") + f" ({pol})"]

if __name__ == "__main__":
    df = scrape()
    df[["score", "polarity", "sentiment"]] = df.apply(lambda r: pd.Series(categorise(f"{r.title}. {r.review}")), axis=1)
    df.to_excel("analysis/output/bestbuy_reviews_sentiment.xlsx", index=False)
    print(df.polarity.value_counts()); print(df.explode("sentiment").sentiment.value_counts().head(10))
