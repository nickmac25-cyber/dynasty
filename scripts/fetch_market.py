import json
import re
from datetime import datetime, timezone
import pandas as pd
import requests

HEADERS = {"User-Agent": "DynastyDeskPro/2.0 (GitHub Actions Market Sync)"}

def norm(name: str) -> str:
    name = (name or "").lower()
    name = re.sub(r"[.'’]", "", name)
    name = re.sub(r"\b(jr|sr|ii|iii|iv)\b", "", name)
    name = re.sub(r"[^a-z ]", " ", name)
    return re.sub(r"\s+", " ", name).strip()

def fetch_dynastyprocess():
    val_url = "https://raw.githubusercontent.com/dynastyprocess/data/master/files/values.csv"
    picks_url = "https://raw.githubusercontent.com/dynastyprocess/data/master/files/values-picks.csv"

    df = pd.read_csv(val_url)
    picks_df = pd.read_csv(picks_url)

    consensus = {}
    rookies = []
    cur_yr = datetime.now(timezone.utc).year

    for _, row in df.iterrows():
        pos = str(row.get("pos", "")).upper()
        if pos not in ("QB", "RB", "WR", "TE", "PICK"):
            continue
        name = str(row.get("player", ""))
        key = f"{norm(name)}|{pos}"
        v1qb = int(row["value_1qb"]) if pd.notna(row.get("value_1qb")) else 0
        vsf = int(row["value_2qb"]) if pd.notna(row.get("value_2qb")) else 0
        draft_yr = int(row["draft_year"]) if pd.notna(row.get("draft_year")) else None

        consensus[key] = {
            "name": name,
            "pos": pos,
            "team": str(row.get("team", "")) if pd.notna(row.get("team")) else "",
            "age": float(row["age"]) if pd.notna(row.get("age")) else None,
            "draft_year": draft_yr,
            "v1qb": v1qb,
            "vsf": vsf,
            "ecr_1qb": float(row["ecr_1qb"]) if pd.notna(row.get("ecr_1qb")) else None,
            "ecr_sf": float(row["ecr_2qb"]) if pd.notna(row.get("ecr_2qb")) else None,
        }

        if pos in ("QB", "RB", "WR", "TE") and draft_yr and draft_yr >= cur_yr:
            rookies.append({
                "name": name,
                "pos": pos,
                "team": str(row.get("team", "FA")) if pd.notna(row.get("team")) else "FA",
                "draft_year": draft_yr,
                "v1qb": v1qb,
                "vsf": vsf,
            })

    picks = []
    for _, row in picks_df.iterrows():
        label = str(row.get("player", "")).strip()
        if not label:
            continue
        picks.append({
            "label": label,
            "v1qb": int(row["value_1qb"]) if pd.notna(row.get("value_1qb")) else 0,
            "vsf": int(row["value_2qb"]) if pd.notna(row.get("value_2qb")) else 0,
        })

    rookies.sort(key=lambda x: max(x["v1qb"], x["vsf"]), reverse=True)
    return consensus, picks, rookies[:75]

def fetch_expert_volatility():
    url = "https://github.com/dynastyprocess/data/raw/master/files/db_fpecr.csv.gz"
    df = pd.read_csv(url, compression="gzip")
    dyn = df[df["ecr_type"].str.contains("d", case=False, na=False)].copy()
    vol = {}
    for _, row in dyn.iterrows():
        pos = str(row.get("pos", "")).upper()
        if pos not in ("QB", "RB", "WR", "TE"):
            continue
        key = f"{norm(str(row.get('player', '')))}|{pos}"
        sd = row.get("sd")
        if pd.notna(sd):
            vol[key] = {
                "ecr_sd": round(float(sd), 2),
                "ecr_best": int(row["best"]) if pd.notna(row.get("best")) else None,
                "ecr_worst": int(row["worst"]) if pd.notna(row.get("worst")) else None,
            }
    return vol

def fetch_sleeper_trending():
    adds = requests.get("https://api.sleeper.app/v1/players/nfl/trending/add?lookback_hours=48&limit=100", headers=HEADERS, timeout=20).json()
    drops = requests.get("https://api.sleeper.app/v1/players/nfl/trending/drop?lookback_hours=48&limit=100", headers=HEADERS, timeout=20).json()
    return {
        "adds": {str(x["player_id"]): x["count"] for x in adds},
        "drops": {str(x["player_id"]): x["count"] for x in drops},
    }

def main():
    consensus, picks, rookies = fetch_dynastyprocess()
    vol = fetch_expert_volatility()
    trending = fetch_sleeper_trending()

    out = {
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "count": len(consensus),
        "consensus": consensus,
        "picks": picks,
        "rookies": rookies,
        "volatility": vol,
        "trending": trending,
    }

    with open("market-data.json", "w", encoding="utf-8") as f:
        json.dump(out, f, separators=(",", ":"))

    print(f"Saved {len(consensus)} assets, {len(picks)} pick curves, {len(rookies)} rookies, and {len(vol)} volatility profiles.")

if __name__ == "__main__":
    main()
