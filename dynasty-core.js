// Dynasty Desk Pro — 6-Source Valuation, Volatility, Historical Grading & Caching Engine
window.DD = (function () {
  const SL = "https://api.sleeper.app/v1";
  const FC = "https://api.fantasycalc.com/values/current";
  const SGF = "https://api.statsguyfantasy.com/api/v1";
  const SC = "https://api.statchasers.com/api/v1/dynasty";
  const DD_API = "https://www.dynastydealer.com/api/player-values";
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
  const safeJson = async (u, fallback = null) => {
    try { const r = await fetch(u); return r.ok ? await r.json() : fallback; } catch (e) { return fallback; }
  };

  function csv(t) {
    const rows = t.trim().split(/\r?\n/).map(l => {
      const o = []; let c = "", q = false;
      for (const ch of l) { if (ch === '"') q = !q; else if (ch === "," && !q) { o.push(c); c = ""; } else c += ch; }
      o.push(c); return o;
    });
    const h = rows.shift();
    return rows.map(r => Object.fromEntries(h.map((k, i) => [k, r[i]])));
  }

  // 6-Source Weights: [FantasyCalc, StatsGuy, StatChasers, DynastyDealer, DynastyProcess, ECR]
  function getWeights() {
    try {
      const w = JSON.parse(localStorage.getItem("dd_weights_v2") || "null");
      if (Array.isArray(w) && w.length === 6) return w.map(Number);
    } catch (e) {}
    return [25, 25, 15, 15, 10, 10];
  }

  function setWeights(arr) {
    try { localStorage.setItem("dd_weights_v2", JSON.stringify(arr.map(Number))); } catch (e) {}
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
          if (parsed && parsed.d && Date.now() - parsed.t < TTL) { memPlayers = parsed; return parsed; }
        }
      } catch (e) {}
    }
    if (onStatus) onStatus("Downloading Sleeper NFL player database (cached 24h)...");
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
        depth_chart_order: p.depth_chart_order || null,
        years_exp: p.years_exp ?? null
      };
    }
    memPlayers = { t: Date.now(), d: slim };
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(memPlayers)); } catch (e) {}
    return memPlayers;
  }

  function detectFormat(lg) {
    const rosterPos = lg.roster_positions || [];
    const sf = rosterPos.filter(p => p === "SUPER_FLEX").length;
    const qb = rosterPos.filter(p => p === "QB").length;
    const starters = rosterPos.filter(p => !["BN", "IR", "TAXI"].includes(p)).length;
    const bench = Math.max(4, rosterPos.length - starters);
    const tep = lg.scoring_settings?.bonus_rec_te || 0;
    return {
      numQbs: sf > 0 || qb > 1 ? 2 : 1,
      ppr: lg.scoring_settings?.rec ?? 1,
      teams: lg.total_rosters || 12,
      tep,
      bench
    };
  }

  function blend(item, weights = getWeights()) {
    if (item.pick) return item.fc ?? item.v ?? 0;
    const V = [item.fc, item.sgf, item.sc, item.dd, item.dp, item.ecr];
    let sum = 0, tot = 0;
    V.forEach((v, i) => {
      if (v != null && v > 0 && weights[i] > 0) { sum += v * weights[i]; tot += weights[i]; }
    });
    return Math.round(tot ? sum / tot : (item.fc ?? item.sgf ?? item.sc ?? item.dd ?? item.dp ?? item.ecr ?? 0));
  }

  // Unified 6-Source Market Valuation Engine
  async function loadMarket(lg, onStatus = null) {
    const fmt = detectFormat(lg);
    const isSF = fmt.numQbs === 2;
    const sgfFormat = isSF ? "sf_dynasty" : "1qb_dynasty";
    const sgfTep = fmt.tep >= 0.75 ? "bigtep" : fmt.tep > 0 ? "tep" : "std";
    const scScoring = fmt.ppr >= 1 ? "ppr" : fmt.ppr >= 0.5 ? "half" : "std";
    const scTep = [0, 0.25, 0.5, 0.75, 1].reduce((prev, curr) => Math.abs(curr - fmt.tep) < Math.abs(prev - fmt.tep) ? curr : prev);

    if (onStatus) onStatus("Syncing 6 live & daily market feeds (FC, StatsGuy, StatChasers, DynastyDealer, DP, Volatility)...");

    const [fc, sgfRaw, scRaw, ddRaw, ghMarket, playersObj] = await Promise.all([
      j(`${FC}?isDynasty=true&numQbs=${fmt.numQbs}&numTeams=${fmt.teams}&ppr=${fmt.ppr}`),
      safeJson(`${SGF}/players?tep=${sgfTep}`, []),
      safeJson(`${SC}/values?teams=${Math.min(32, Math.max(8, fmt.teams))}&qb=${isSF ? "sf" : "1qb"}&scoring=${scScoring}&tep=${scTep}&bench=${Math.min(40, fmt.bench)}`, null),
      safeJson(`${DD_API}`, null),
      safeJson(`./market-data.json?t=${Math.floor(Date.now() / 3600000)}`, null),
      getPlayers(false, onStatus)
    ]);

    // Fallback to raw DynastyProcess CSV if market-data.json isn't present yet
    let dpConsensus = ghMarket?.consensus || null;
    if (!dpConsensus) {
      const txt = await fetch(DP).then(r => r.ok ? r.text() : "").catch(() => "");
      const rows = txt ? csv(txt) : [];
      dpConsensus = {};
      rows.forEach(r => {
        const k = `${norm(r.player)}|${r.pos}`;
        dpConsensus[k] = { v1qb: +r.value_1qb || 0, vsf: +r.value_2qb || 0, ecr_1qb: +r.ecr_1qb || null, ecr_sf: +r.ecr_2qb || null };
      });
    }
    const volatilityMap = ghMarket?.volatility || {};
    const trendingMap = ghMarket?.trending || { adds: {}, drops: {} };

    // Map Stats Guy Fantasy by Sleeper ID
    const sgfList = Array.isArray(sgfRaw) ? sgfRaw : (sgfRaw?.players || sgfRaw?.data || []);
    const sgfBySid = new Map();
    sgfList.forEach(p => {
      const id = String(p.id || p.sleeper_id || "");
      const val = p.values?.[sgfFormat]?.value ?? p.values?.[sgfFormat] ?? p[sgfFormat] ?? p.value ?? 0;
      if (id && val > 0) sgfBySid.set(id, Math.round(Number(val)));
    });

    // Map StatChasers by Sleeper ID
    const scList = Array.isArray(scRaw) ? scRaw : (scRaw?.values || scRaw?.players || scRaw?.data || []);
    const scBySid = new Map();
    scList.forEach(p => {
      const id = String(p.sleeper_id || p.player_id || p.id || "");
      const val = p.value ?? p.dynasty_value ?? 0;
      if (id && val > 0) scBySid.set(id, Math.round(Number(val)));
    });

    // Map Dynasty Dealer by normalized name|pos (1QB base scale; adjust QBs slightly in SF)
    const ddList = Array.isArray(ddRaw) ? ddRaw : (ddRaw?.players || ddRaw?.data || []);
    const ddByKey = new Map();
    ddList.forEach(p => {
      const pos = String(p.position || p.pos || "").toUpperCase();
      const name = p.name || p.player_name || "";
      let val = Number(p.value || p.dynasty_value || 0);
      if (isSF && pos === "QB" && val > 0) val = Math.round(Math.min(10000, val * 1.45));
      if (name && pos && val > 0) ddByKey.set(`${norm(name)}|${pos}`, Math.round(val));
    });

    const curve = fc.map(e => e.value).sort((a, b) => b - a);
    const weights = getWeights();

    const all = fc.map(e => {
      const p = e.player;
      const isPick = p.position === "PICK";
      const sid = String(p.sleeperId || "");
      const key = `${norm(p.name)}|${p.position}`;

      const dpEntry = isPick ? null : dpConsensus[key];
      const dpVal = dpEntry ? (isSF ? dpEntry.vsf : dpEntry.v1qb) : null;
      const er = dpEntry ? (isSF ? dpEntry.ecr_sf : dpEntry.ecr_1qb) : null;
      const ecrVal = er ? (curve[Math.round(er) - 1] ?? 0) : null;

      const sgfVal = (!isPick && sid) ? (sgfBySid.get(sid) || null) : null;
      const scVal = (!isPick && sid) ? (scBySid.get(sid) || null) : null;
      const ddVal = !isPick ? (ddByKey.get(key) || null) : null;
      const vol = !isPick ? (volatilityMap[key] || null) : null;

      const obj = {
        sid,
        name: p.name,
        pos: p.position,
        age: p.maybeAge || null,
        team: p.maybeTeam || "",
        fc: e.value,
        sgf: sgfVal,
        sc: scVal,
        dd: ddVal,
        dp: dpVal || null,
        ecr: ecrVal || null,
        ecrSd: vol?.ecr_sd ?? null,
        ecrRange: (vol?.ecr_best && vol?.ecr_worst) ? `${vol.ecr_best}-${vol.ecr_worst}` : null,
        adds48h: sid ? (trendingMap.adds?.[sid] || 0) : 0,
        drops48h: sid ? (trendingMap.drops?.[sid] || 0) : 0,
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
      const baseYear = Number(lg.season || new Date().getFullYear());
      const yrDiff = Math.max(0, Number(year) - baseYear);
      const baseByRound = { 1: 4200, 2: 2100, 3: 1050, 4: 450 };
      const tierMult = tier === "Early" ? 1.32 : tier === "Late" ? 0.78 : 1.0;
      return Math.round((baseByRound[round] || 250) * tierMult * Math.pow(0.88, yrDiff));
    }

    // Historical trade batch grader via Stats Guy Fantasy API (values as of the exact trade date!)
    async function gradeTradesHistorically(trades) {
      if (!trades.length) return null;
      try {
        const payload = {
          format: sgfFormat,
          tep: sgfTep,
          trades: trades.slice(0, 25).map(tr => ({
            id: tr.id,
            date: tr.isoDate,
            sides: tr.sides.map(s => ({
              players: s.playerIds,
              picks: s.picks.map(pk => ({ year: Number(pk.season), round: Number(pk.round) }))
            }))
          }))
        };
        const res = await fetch(`${SGF}/trades/evaluate/batch`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!res.ok) return null;
        return await res.json();
      } catch (e) {
        return null;
      }
    }

    return {
      fmt, fc, pmap: playersObj.d, cacheTs: playersObj.t,
      ghUpdatedAt: ghMarket?.updated_at || null,
      all, bySid, pickValue, gradeTradesHistorically
    };
  }

  function projV(p, yearsOut) {
    let v = p.v || 0;
    let a = Math.floor(p.age || 26);
    for (let i = 0; i < yearsOut; i++) v *= (AGE_F[p.pos] || (() => 1))(a + i);
    return Math.round(v);
  }

  function ageFlag(p) {
    if (p.pick || !p.age) return ["hold", "—"];
    const c = CLIFF[p.pos] || 30;
    if (p.age >= c && p.v > 2500) return ["sell", "Sell: Past age cliff"];
    if (p.age >= c - 2 && p.v > 4000) return ["sell", "Sell window opening"];
    if (p.age <= 23 && p.trend > 150) return ["buy", "Rising young asset"];
    if (p.trend < -400 && p.age < c - 2) return ["buy", "Buy low dip"];
    if (p.ecrSd && p.ecrSd >= 16) return ["vol", `Polarizing (SD ${p.ecrSd})`];
    return ["hold", "Hold"];
  }

  const studAdj = list => list.reduce((s, p) => s + Math.pow((p.v || 0) / 100, 1.8), 0);

  function openInTradeCalculator(giveSids, getSids) {
    try {
      localStorage.setItem("dd_pending_trade", JSON.stringify({ a: giveSids.map(String), b: getSids.map(String), ts: Date.now() }));
    } catch (e) {}
    window.location.href = "index.html#tab-trade";
  }

  async function resolveUserAndLeagues(username, season) {
    const u = await j(`${SL}/user/${encodeURIComponent(username.trim())}`);
    if (!u || !u.user_id) throw new Error("Sleeper username not found.");
    const leagues = await j(`${SL}/user/${u.user_id}/leagues/nfl/${season}`);
    if (!leagues || !leagues.length) throw new Error(`No ${season} NFL leagues found for ${username}.`);
    return { user: u, leagues };
  }

  return {
    SL, FC, SGF, SC, DD_API, DP, POS, CLIFF, AGE_F, ROOKIES_2027,
    norm, esc, j, csv,
    getWeights, setWeights, getSavedState, saveState,
    getPlayers, detectFormat, blend, loadMarket,
    projV, ageFlag, studAdj, openInTradeCalculator, resolveUserAndLeagues
  };
})();
