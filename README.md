# Dynasty Desk

A free, single-page dynasty fantasy football tool that syncs to your Sleeper league.

- **index.html** is the tool. GitHub Pages serves it.
- **scripts/** and **.github/workflows/** are two free scheduled jobs that keep a small `data` branch fresh:
  - `update-data` (every 15 minutes): news headlines, daily value snapshots, optional Discord alerts.
  - `update-matchups` (Tuesdays): man/zone coverage tendencies, receiver splits, and points allowed by role.
- **config.json** holds your Sleeper username, league ID, league format, and news feeds.
- **SETUP-STEP-BY-STEP.md** walks through everything.

The `data` branch is rewritten as one commit each run, so the repo never grows. See the size table in SETUP-STEP-BY-STEP.md.

Coverage data comes from FTN Data via nflverse (CC-BY-SA 4.0). Credit them if you share anything built on it.
