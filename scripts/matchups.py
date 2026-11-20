"""Builds data/matchups.json from free nflverse data (stdlib only).
- Defense man/zone and coverage-shell rates, plus each receiver's results against man and zone.
  Source: nflverse participation (FTN Data, CC-BY-SA 4.0). Published only after a season ends, so this uses the latest completed season.
- Fantasy points allowed to WR1/WR2/WR3/TE/RB for the current season (from play-by-play), updated weekly.
"""
import csv, gzip, io, json, os, sys, urllib.request, datetime
from collections import defaultdict

BASE = "https://github.com/nflverse/nflverse-data/releases/download"
OUT = os.path.join("data", "matchups.json")
csv.field_size_limit(10**9)

def get(url):
    req = urllib.request.Request(url, headers={"user-agent": "dynasty-desk-updater"})
    return urllib.request.urlopen(req, timeout=180)

def rows(url, gz=False):
    raw = get(url)
    stream = gzip.GzipFile(fileobj=raw) if gz else raw
    return csv.DictReader(io.TextIOWrapper(stream, encoding="utf-8", newline=""))

def exists(url):
    try:
        urllib.request.urlopen(urllib.request.Request(url, method="HEAD", headers={"user-agent": "dynasty-desk-updater"}), timeout=30); return True
    except Exception:
        return False

def num(x):
    try: return float(x)
    except Exception: return 0.0

year = datetime.date.today().year
# ---- id crosswalk: gsis_id -> sleeper_id, position
ids = {}
for r in rows("https://raw.githubusercontent.com/dynastyprocess/data/master/files/db_playerids.csv"):
    if r.get("gsis_id") and r.get("sleeper_id"):
        ids[r["gsis_id"]] = (r["sleeper_id"], r.get("position", ""), r.get("name", ""))

# ---- coverage season: latest year with participation data
cov_year = next((y for y in range(year, year - 4, -1) if exists(f"{BASE}/pbp_participation/pbp_participation_{y}.csv")), None)
cover = {}
if cov_year:
    for r in rows(f"{BASE}/pbp_participation/pbp_participation_{cov_year}.csv"):
        if r.get("defense_man_zone_type"):
            cover[(r["nflverse_game_id"], r["play_id"])] = (r["defense_man_zone_type"], r.get("defense_coverage_type", ""))

dteam = defaultdict(lambda: {"man": 0, "zone": 0, "shell": defaultdict(int)})
rec = defaultdict(lambda: {"tz": 0, "yz": 0.0, "ez": 0.0, "tm": 0, "ym": 0.0, "em": 0.0})
if cov_year:
    for r in rows(f"{BASE}/pbp/play_by_play_{cov_year}.csv.gz", gz=True):
        if r.get("season_type") != "REG" or r.get("pass_attempt") != "1": continue
        c = cover.get((r["game_id"], r["play_id"]))
        if not c: continue
        d = dteam[r["defteam"]]; z = c[0] == "ZONE_COVERAGE"
        d["zone" if z else "man"] += 1; d["shell"][c[1]] += 1
        g = r.get("receiver_player_id")
        if g and g in ids:
            x = rec[ids[g][0]]; k = "z" if z else "m"
            x["t" + k] += 1; x["y" + k] += num(r.get("receiving_yards")); x["e" + k] += num(r.get("epa"))

# ---- fantasy points allowed by role, current season (falls back to the latest season with data)
dvp_year = next((y for y in (year, year - 1) if exists(f"{BASE}/pbp/play_by_play_{y}.csv.gz")), year - 1)
tg = defaultdict(lambda: defaultdict(float))   # team -> gsis -> targets (+ carries for RBs)
pts = defaultdict(float)                       # (defteam, game, gsis) -> ppr points
posteam = {}; games = defaultdict(set); weeks = set()
for r in rows(f"{BASE}/pbp/play_by_play_{dvp_year}.csv.gz", gz=True):
    if r.get("season_type") != "REG": continue
    pt, dt, game = r.get("posteam"), r.get("defteam"), r["game_id"]
    if not pt or not dt: continue
    games[dt].add(game); weeks.add(r.get("week"))
    if r.get("pass_attempt") == "1" and r.get("receiver_player_id"):
        g = r["receiver_player_id"]; posteam[g] = pt; tg[pt][g] += 1
        pts[(dt, game, g)] += (1 if r.get("complete_pass") == "1" else 0) + .1 * num(r.get("receiving_yards")) + 6 * num(r.get("pass_touchdown"))
    elif r.get("rush_attempt") == "1" and r.get("rusher_player_id"):
        g = r["rusher_player_id"]; posteam[g] = pt; tg[pt][g] += 1
        pts[(dt, game, g)] += .1 * num(r.get("rushing_yards")) + 6 * num(r.get("rush_touchdown"))

role = {}
for team, d in tg.items():
    byPos = defaultdict(list)
    for g, n in d.items():
        if g in ids and ids[g][1] in ("WR", "TE", "RB"): byPos[ids[g][1]].append((n, g))
    for p, lst in byPos.items():
        for i, (_, g) in enumerate(sorted(lst, reverse=True)):
            role[g] = ("WR%d" % min(i + 1, 3)) if p == "WR" else (p if i == 0 else None)
tot = defaultdict(lambda: defaultdict(float))
for (dt, game, g), v in pts.items():
    if role.get(g): tot[dt][role[g]] += v
dvp = {t: {k: round(v / max(1, len(games[t])), 2) for k, v in m.items()} | {"g": len(games[t])} for t, m in tot.items()}

out = {"cov_season": cov_year, "dvp_season": dvp_year, "weeks": len(weeks),
  "def": {t: {"man": round(d["man"] / max(1, d["man"] + d["zone"]), 3), "zone": round(d["zone"] / max(1, d["man"] + d["zone"]), 3), "n": d["man"] + d["zone"],
              "shell": {k: round(v / max(1, d["man"] + d["zone"]), 3) for k, v in sorted(d["shell"].items(), key=lambda kv: -kv[1])[:3] if k}} for t, d in dteam.items()},
  "rec": {s: {k: (round(v, 2) if isinstance(v, float) else v) for k, v in x.items()} | {"role": role.get(next((g for g, i in ids.items() if i[0] == s), ""))}
          for s, x in rec.items() if x["tz"] + x["tm"] >= 15},
  "dvp": dvp}
os.makedirs("data", exist_ok=True)
s = json.dumps(out, separators=(",", ":"))
if not os.path.exists(OUT) or open(OUT).read() != s:
    open(OUT, "w").write(s)
    if os.environ.get("GITHUB_OUTPUT"): open(os.environ["GITHUB_OUTPUT"], "a").write("changed=true\n")
print(f"coverage {cov_year}, dvp {dvp_year}, {len(out['def'])} defenses, {len(out['rec'])} receivers, {len(s)//1024} KB")
