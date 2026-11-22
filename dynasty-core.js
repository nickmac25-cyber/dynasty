// Dynasty Desk Pro — Unified Valuation, Caching, Pick Pricing & State Engine
window.DD = (function () {
  const SL = "https://api.sleeper.app/v1";
  const FC = "https://api.fantasycalc.com/values/current";
  const DP = "https://raw.githubusercontent.com/dynastyprocess/data/master/files/values.csv";
  const POS = ["QB", "RB", "WR", "TE"];
  const CLIFF = { QB: 34, RB: 26, WR: 29, TE: 30 };
  const AGE_F = {
    QB: a => a <= 33 ? 1.00 : a <= 36 ? 0.88 : 0.72,
    RB: a => a <= 23 ? 1.04 : a <= 25 ? 1.00 : a === 26 ? 0.90 : a === 27 ? 0.80 : 0.68,
    WR: a => a <= 24 ? 1.03 : a <= 28 ? 1.00 : a === 29 ? 0.90 : a === 30 ? 0.82 : 0.70,
    TE: a => a <= 25 ? 1.03 : a <= 30 ? 1.00 : a === 31 ? 0.90 : 0.75
  };

  // Unified 2027 Incoming Rookie Prospect Pool (50 prospects, 1QB + SF values)
  const ROOKIES_2027 = [
    { name: "Jeremiah Smith", pos: "WR", college: "Ohio State", v1qb: 8200, vsf: 7800 },
    { name: "Arch Manning", pos: "QB", college: "Texas", v1qb: 4800, vsf: 8100 },
    { name: "Dante Moore", pos: "QB", college: "Oregon", v1qb: 4500, vsf: 7600 },
    { name: "Cam Coleman", pos: "WR", college: "Texas", v1qb: 7100, vsf: 6700 },
    { name: "Ryan Williams", pos: "WR", college: "Alabama", v1qb: 6900, vsf: 6500 },
    { name: "Nico Iamaleava", pos: "QB", college: "Tennessee", v1qb: 4100, vsf: 6900 },
    { name: "DJ Lagway", pos: "QB", college: "Florida", v1qb: 3900, vsf: 6600 },
    { name: "Drew Mestemaker", pos: "QB", college: "Oklahoma State", v1qb: 3750, vsf: 6400 },
    { name: "Nate Frazier", pos: "RB", college: "Georgia", v1qb: 6100, vsf: 5800 },
    { name: "Jadan Baugh", pos: "RB", college: "Florida", v1qb: 5850, vsf: 5550 },
    { name: "Kewan Lacy", pos: "RB", college: "Ole Miss", v1qb: 5700, vsf: 5400 },
    { name: "Charlie Becker", pos: "WR", college: "Indiana", v1qb: 5600, vsf: 5300 },
    { name: "Isaac Brown", pos: "RB", college: "Louisville", v1qb: 5450, vsf: 5150 },
    { name: "Julian Sayin", pos: "QB", college: "Ohio State", v1qb: 3400, vsf: 5900 },
    { name: "LaNorris Sellers", pos: "QB", college: "South Carolina", v1qb: 3350, vsf: 5800 },
    { name: "Nick Marsh", pos: "WR", college: "Indiana", v1qb: 5250, vsf: 4950 },
    { name: "Jamari Johnson", pos: "TE", college: "Oregon", v1qb: 5100, vsf: 4900 },
    { name: "Ahmad Hardy", pos: "RB", college: "Missouri", v1qb: 4950, vsf: 4700 },
    { name: "Trey'Dez Green", pos: "TE", college: "LSU", v1qb: 4850, vsf: 4650 },
    { name: "Justice Haynes", pos: "RB", college: "Georgia Tech", v1qb: 4700, vsf: 4450 },
    { name: "Darian Mensah", pos: "QB", college: "Miami", v1qb: 2950, vsf: 5200 },
    { name: "CJ Carr", pos: "QB", college: "Notre Dame", v1qb: 2850, vsf: 5050 },
    { name: "Trinidad Chambliss", pos: "QB", college: "Ole Miss", v1qb: 2750, vsf: 4900 },
    { name: "TJ Moore", pos: "WR", college: "Clemson", v1qb: 4550, vsf: 4300 },
    { name: "Bryant Wesco Jr.", pos: "WR", college: "Clemson", v1qb: 4450, vsf: 4200 },
    { name: "Ryan Wingo", pos: "WR", college: "Texas", v1qb: 4350, vsf: 4100 },
    { name: "KJ Duff", pos: "WR", college: "Rutgers", v1qb: 4200, vsf: 3950 },
    { name: "Duce Robinson", pos: "WR", college: "Florida State", v1qb: 4100, vsf: 3850 },
    { name: "Mark Fletcher", pos: "RB", college: "Miami", v1qb: 3950, vsf: 3750 },
    { name: "Jayden Maiava", pos: "QB", college: "USC", v1qb: 2450, vsf: 4350 },
    { name: "Deuce Alexander", pos: "WR", college: "Ole Miss", v1qb: 3800, vsf: 3600 },
    { name: "Reed Harris", pos: "WR", college: "Arizona State", v1qb: 3700, vsf: 3500 },
    { name: "Jackson Harris", pos: "WR", college: "LSU", v1qb: 3600, vsf: 3400 },
    { name: "Jamal Roberts", pos: "RB", college: "Missouri", v1qb: 3500, vsf: 3300 },
    { name: "Isaiah Sategna III", pos: "WR", college: "Oklahoma", v1qb: 3400, vsf: 3200 },
    { name: "Antwan Raymond", pos: "RB", college: "Rutgers", v1qb: 3300, vsf: 3100 },
    { name: "LJ Martin", pos: "RB", college: "BYU", v1qb: 3200, vsf: 3050 },
    { name: "Raleek Brown", pos: "RB", college: "Texas", v1qb: 3100, vsf: 2950 },
    { name: "DJ Vonnahme", pos: "TE", college: "Iowa", v1qb: 3050, vsf: 2900 },
    { name: "Luke Reynolds", pos: "TE", college: "Virginia Tech", v1qb: 2950, vsf: 2800 },
    { name: "Austin Simmons", pos: "QB", college: "Missouri", v1qb: 2100, vsf: 3750 },
    { name: "Terrance Carter", pos: "TE", college: "Texas Tech", v1qb: 2850, vsf: 2700 },
    { name: "Dylan Riley", pos: "RB", college: "Boise State", v1qb: 2750, vsf: 2600 },
    { name: "Wyatt Young", pos: "WR", college: "Oklahoma State", v1qb: 2650, vsf: 2500 },
    { name: "Connor Weigman", pos: "QB", college: "Houston", v1qb: 1950, vsf: 3450 },
    { name: "Amare Thomas", pos: "WR", college: "Houston", v1qb: 2550, vsf: 2400 },
    { name: "DeSean Bishop", pos: "RB", college: "Tennessee", v1qb: 2450, vsf: 2300 },
    { name: "Wayne Knight", pos: "RB", college: "UCLA", v1qb: 2350, vsf: 2200 },
    { name: "Braylon Staley", pos: "WR", college: "Tennessee", v1qb: 2250, vsf: 2100 },
    { name: "Lawson Luckie", pos: "TE", college: "Georgia", v1qb: 2150, vsf: 2050 }
  ];

  const norm = n => (n || "").toLowerCase().replace(/[.'’]/g, "").replace(/\b(jr|sr|ii|iii|iv)\b/g, "").replace(/[^a-z ]/g, " ").replace(/\s+/g, " ").trim();
  const esc = t => String(t ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  const j = async u => { const r = await fetch(u); if (!r.ok) throw new Error(`${r.status} from ${u}`); return r.json(); };

  function csv(t) {
    const rows = t.trim().split(/\r?\n/).map(l => {
      const o = []; let c = "", q = false;
      for (const ch of l) { if (ch === '"') q = !q; else if (ch === "," && !q) { o.push(c); c = ""; } else c += ch; }
      o.push(c); return o;
    });
    const h = rows.shift();
    return rows.map(r => Object.fromEntries(h.map((k, i) => [k, r[i]])));
  }

  function getWeights() {
    try {
      const w = JSON.parse(localStorage.getItem("dd_weights") || "null");
      if (Array.isArray(w) && w.length === 3) return w.map(Number);
    } catch (e) {}
    return [40, 30, 30];
  }

  function setWeights(arr) {
    try { localStorage.setItem("dd_weights", JSON.stringify(arr.map(Number))); } catch (e) {}
  }

  function getSavedState() {
    try {
      return {
        user: localStorage.getItem("dd_user") || "",
        season: localStorage.getItem("dd_season") || String(new Date().getFullYear()),
        leagueId: localStorage.getItem("dd_league_id") || localStorage.getItem("sleeper_league_id") || "",
        repo: localStorage.getItem("dd_repo") || ""
      };
    } catch (e) {
      return { user: "", season: String(new Date().getFullYear()), leagueId: "", repo: "" };
    }
  }

  function saveState(patch) {
    try {
      if (patch.user !== undefined) localStorage.setItem("dd_user", patch.user);
      if (patch.season !== undefined) localStorage.setItem("dd_season", String(patch.season));
      if (patch.leagueId !== undefined) {
        localStorage.setItem("dd_league_id", String(patch.leagueId));
        localStorage.setItem("sleeper_league_id", String(patch.leagueId));
      }
      if (patch.repo !== undefined) localStorage.setItem("dd_repo", patch.repo);
    } catch (e) {}
  }

  // Single 24h Sleeper NFL Player Database Cache shared across ALL pages
  let memPlayers = null;
  async function getPlayers(force = false, onStatus = null) {
    const CACHE_KEY = "dd_sleeper_players_v3";
    const TTL = 24 * 60 * 60 * 1000;
    if (!force && memPlayers && Date.now() - memPlayers.t < TTL) return memPlayers;
    if (!force) {
      try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.d && Date.now() - parsed.t < TTL) {
            memPlayers = parsed;
            return parsed;
          }
        }
      } catch (e) {}
    }
    if (onStatus) onStatus("Downloading Sleeper NFL player database (cached 24h across all tools)...");
    const full = await j(`${SL}/players/nfl`);
    const slim = {};
    for (const [id, p] of Object.entries(full)) {
      if (!p || !p.position) continue;
      slim[id] = {
        first_name: p.first_name || "",
        last_name: p.last_name || "",
        full_name: p.full_name || `${p.first_name || ""} ${p.last_name || ""}`.trim(),
        position: p.position,
        team: p.team || "",
        age: p.age || null,
        injury_status: p.injury_status || null,
        injury_body_part: p.injury_body_part || null,
        injury_notes: p.injury_notes || null,
        depth_chart_order: p.depth_chart_order || null,
        depth_chart_position: p.depth_chart_position || null,
        years_exp: p.years_exp ?? null
      };
    }
    memPlayers = { t: Date.now(), d: slim };
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(memPlayers)); } catch (e) {}
    return memPlayers;
  }

  let memDP = null;
  async function getDP() {
    if (memDP && Date.now() - memDP.t < 6 * 3600 * 1000) return memDP.d;
    const txt = await fetch(DP).then(r => r.ok ? r.text() : "").catch(() => "");
    memDP = { t: Date.now(), d: txt ? csv(txt) : [] };
    return memDP.d;
  }

  function detectFormat(lg) {
    const sf = (lg.roster_positions || []).filter(p => p === "SUPER_FLEX").length;
    const qb = (lg.roster_positions || []).filter(p => p === "QB").length;
    return {
      numQbs: sf > 0 || qb > 1 ? 2 : 1,
      ppr: lg.scoring_settings?.rec ?? 1,
      teams: lg.total_rosters || 12,
      tep: lg.scoring_settings?.bonus_rec_te || 0
    };
  }

  function blend(item, weights = getWeights()) {
    if (item.pick) return item.fc ?? item.v ?? 0;
    const V = [item.fc, item.dp, item.ecr];
    let sum = 0, tot = 0;
    V.forEach((v, i) => {
      if (v != null && weights[i] > 0) { sum += v * weights[i]; tot += weights[i]; }
    });
    return Math.round(tot ? sum / tot : (item.fc ?? item.dp ?? item.ecr ?? 0));
  }

  // Unified Market Valuation Engine (FantasyCalc + DynastyProcess + ECR)
  async function loadMarket(lg, onStatus = null) {
    const fmt = detectFormat(lg);
    const [fc, dpRows, playersObj] = await Promise.all([
      j(`${FC}?isDynasty=true&numQbs=${fmt.numQbs}&numTeams=${fmt.teams}&ppr=${fmt.ppr}`),
      getDP(),
      getPlayers(false, onStatus)
    ]);

    const dpKey = fmt.numQbs === 2 ? "value_2qb" : "value_1qb";
    const ek = fmt.numQbs === 2 ? "ecr_2qb" : "ecr_1qb";
    const dpMap = new Map(dpRows.map(r => [norm(r.player) + "|" + r.pos, +r[dpKey]]).filter(x => x[1] > 0));
    const ecrMap = new Map(dpRows.map(r => [norm(r.player) + "|" + r.pos, +r[ek]]).filter(x => x[1] > 0));
    const curve = fc.map(e => e.value).sort((a, b) => b - a);
    const weights = getWeights();

    const all = fc.map(e => {
      const p = e.player;
      const isPick = p.position === "PICK";
      const d = isPick ? null : dpMap.get(norm(p.name) + "|" + p.position);
      const er = isPick ? null : ecrMap.get(norm(p.name) + "|" + p.position);
      const ecr = er ? (curve[Math.round(er) - 1] ?? 0) : null;
      const obj = {
        sid: String(p.sleeperId || ""),
        name: p.name,
        pos: p.position,
        age: p.maybeAge || null,
        team: p.maybeTeam || "",
        fc: e.value,
        dp: d || null,
        ecr: ecr || null,
        pick: isPick,
        trend: e.trend30Day || 0,
        rank: e.overallRank || 999
      };
      obj.v = blend(obj, weights);
      return obj;
    });

    const bySid = new Map();
    all.forEach(item => { if (item.sid && !item.pick) bySid.set(item.sid, item); });

    const pickRe = k => new RegExp(`\\b${k}(?:st|nd|rd|th)\\b|Pick ${k}\\.|Round ${k}\\b`, "i");
    function pickValue(year, round, tier = null) {
      const yStr = String(year);
      const re = pickRe(round);
      let hits = all.filter(p => p.pick && p.name.includes(yStr) && re.test(p.name));
      if (tier) {
        const tr = new RegExp(tier, "i");
        const tieredHits = hits.filter(p => tr.test(p.name));
        if (tieredHits.length) hits = tieredHits;
      }
      if (hits.length) return Math.round(hits.reduce((s, p) => s + p.v, 0) / hits.length);
      // Fallback for distant years not yet listed on FantasyCalc
      const baseYear = Number(lg.season || new Date().getFullYear());
      const yrDiff = Math.max(0, Number(year) - baseYear);
      const baseByRound = { 1: 4200, 2: 2100, 3: 1050, 4: 450 };
      const tierMult = tier === "Early" ? 1.32 : tier === "Late" ? 0.78 : 1.0;
      return Math.round((baseByRound[round] || 250) * tierMult * Math.pow(0.88, yrDiff));
    }

    return { fmt, fc, dp: dpRows, pmap: playersObj.d, cacheTs: playersObj.t, all, bySid, pickValue };
  }

  function projV(p, yearsOut) {
    let v = p.v || 0;
    let a = Math.floor(p.age || 26);
    for (let i = 0; i < yearsOut; i++) {
      v *= (AGE_F[p.pos] || (() => 1))(a + i);
    }
    return Math.round(v);
  }

  function ageFlag(p) {
    if (p.pick || !p.age) return ["hold", "—"];
    const c = CLIFF[p.pos] || 30;
    if (p.age >= c && p.v > 2500) return ["sell", "Sell: Past age cliff"];
    if (p.age >= c - 2 && p.v > 4000) return ["sell", "Sell window opening"];
    if (p.age <= 23 && p.trend > 150) return ["buy", "Rising young asset"];
    if (p.trend < -400 && p.age < c - 2) return ["buy", "Buy low dip"];
    return ["hold", "Hold"];
  }

  // Stud-premium consolidation curve (shared across Trade Calculator & Trade Finder)
  const studAdj = list => list.reduce((s, p) => s + Math.pow((p.v || 0) / 100, 1.8), 0);

  // Send trade to index.html Trade Calculator from ANY page
  function openInTradeCalculator(giveSids, getSids) {
    try {
      localStorage.setItem("dd_pending_trade", JSON.stringify({ a: giveSids.map(String), b: getSids.map(String), ts: Date.now() }));
    } catch (e) {}
    window.location.href = "index.html#tab-trade";
  }

  // Resolve user + leagues helper for standalone pages
  async function resolveUserAndLeagues(username, season) {
    const u = await j(`${SL}/user/${encodeURIComponent(username.trim())}`);
    if (!u || !u.user_id) throw new Error("Sleeper username not found.");
    const leagues = await j(`${SL}/user/${u.user_id}/leagues/nfl/${season}`);
    if (!leagues || !leagues.length) throw new Error(`No ${season} NFL leagues found for ${username}.`);
    return { user: u, leagues };
  }

  return {
    SL, FC, DP, POS, CLIFF, AGE_F, ROOKIES_2027,
    norm, esc, j, csv,
    getWeights, setWeights, getSavedState, saveState,
    getPlayers, detectFormat, blend, loadMarket,
    projV, ageFlag, studAdj, openInTradeCalculator, resolveUserAndLeagues
  };
})();
