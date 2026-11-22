import json
import re
from datetime import datetime, timezone
import pandas as pd
import requests

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
}

def norm(name: str) -> str:
    name = (name or "").lower()
    name = re.sub(r"[.'’]", "", name)
    name = re.sub(r"\b(jr|sr|ii|iii|iv)\b", "", name)
    name = re.sub(r"[^a-z ]", " ", name)
    return re.sub(r"\s+", " ", name).strip()

def fetch_ktc():
    url = "https://keeptradecut.com/dynasty-rankings"
    resp = requests.get(url, headers=HEADERS, timeout=30)
    resp.raise_for_status()

    match = re.search(r"var\s+playersArray\s*=\s*(\[.*?\]);", resp.text, re.DOTALL)
    if not match:
        raise RuntimeError("Could not locate playersArray on KTC page.")

    raw_players = json.loads(match.group(1))
    parsed = {}

    for p in raw_players:
        pos = p.get("position", "")
        if pos not in ("QB", "RB", "WR", "TE", "RDP"):
            continue

        name = p.get("playerName", "")
        one_qb = p.get("oneQBValues", {}) or {}
        sf = p.get("superflexValues", {}) or {}

        key = f"{norm(name)}|{'PICK' if pos == 'RDP' else pos}"
        parsed[key] = {
            "name": name,
            "pos": "PICK" if pos == "RDP" else pos,
            "team": p.get("team", ""),
            "age": p.get("age"),
            "v1qb": one_qb.get("value", 0),
            "v1qb_tep": one_qb.get("tep", {}).get("value", one_qb.get("value", 0)),
            "vsf": sf.get("value", 0),
            "vsf_tep": sf.get("tep", {}).get("value", sf.get("value", 0)),
            "trend_1qb": one_qb.get("overallTrend", 0),
            "trend_sf": sf.get("overallTrend", 0),
            "kept": p.get("kept", 0),
            "traded": p.get("traded", 0),
            "cut": p.get("cut", 0),
        }
    return parsed

def fetch_expert_volatility():
    url = "https://github.com/dynastyprocess/data/raw/master/files/db_fpecr.csv.gz"
    df = pd.read_csv(url, compression="gzip")
    # Filter to dynasty rankings
    dyn = df[df["ecr_type"].str.contains("d", case=False, na=False)].copy()
    vol = {}
    for _, row in dyn.iterrows():
        pos = str(row.get("pos", "")).upper()
        if pos not in ("QB", "RB", "WR", "TE"):
            continue
        key = f"{norm(str(row.get('player', '')))}|{pos}"
        sd = row.get("sd")
        best = row.get("best")
        worst = row.get("worst")
        if pd.notna(sd):
            vol[key] = {
                "ecr_sd": round(float(sd), 2),
                "ecr_best": int(best) if pd.notna(best) else None,
                "ecr_worst": int(worst) if pd.notna(worst) else None,
            }
    return vol

def main():
    ktc = fetch_ktc()
    vol = fetch_expert_volatility()

    out = {
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "count": len(ktc),
        "ktc": ktc,
        "volatility": vol,
    }

    with open("market-data.json", "w", encoding="utf-8") as f:
        json.dump(out, f, separators=(",", ":"))

    print(f"Saved {len(ktc)} KTC assets and {len(vol)} volatility profiles.")

if __name__ == "__main__":
    main()
