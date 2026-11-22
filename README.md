# Dynasty Desk Pro (Unified Architecture)

## File Structure
- `dynasty-core.js` — Shared valuation blend (FantasyCalc + DynastyProcess + ECR), pick pricing curves, age cliffs, unified 2027 rookie board, and 24h Sleeper player cache.
- `dynasty-nav.js` — Shared navigation bar across all 6 pages.
- `index.html` — **Command Center**: Trade Calculator, Smart Trade Finder, Roster + Taxi + Waiver Stash Radar, Start/Sit Lineup Optimizer, Live Draft Room & 2027 Board, Team Audit & Power Rankings, and AI Advisor.
- `trade-hub.html` — **Trade Hub & Grades**: Positional Surplus/Hole Matchmaker (with 1-click Trade Calculator handoff) + Historical Trade Grades & Manager Savvy Leaderboard.
- `league-matrix.html` — **Power, Age & Luck**: Contender/Rebuilder Archetype Matrix, 3-Year Age Curve Projections, and All-Play Schedule Luck.
- `draft-capital.html` — **Draft Capital**: Future Pick Portfolio & League War Chest Rankings using live FantasyCalc pick curves.
- `mock-draft.html` — **Mock Draft Simulator**: League-aware 3-round 2027 rookie mock draft with exact traded picks.
- `history.html` — **Franchise History**: Multi-season championship trophy case and all-time manager standings.

## Legacy Files Safe to Delete from Your Repo
- `index_2.html` (replaced by `index.html`)
- `trade-block.html` & `trade-grades.html` (merged into `trade-hub.html`)
- `age-curves.html` & `schedule-luck.html` (merged into `league-matrix.html`)
- `taxi-optimizer.html` & `waiver-stashes.html` (merged into `index.html` -> Roster, Taxi & Stashes)
- `update.yml.txt`, `matchups.yml.txt`, and `download`
