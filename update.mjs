// Pulls news headlines and daily value snapshots into ./data, with hard size limits.
import fs from "node:fs";
const cfg = JSON.parse(fs.readFileSync("config.json", "utf8")), D = "data";
fs.mkdirSync(D + "/history", { recursive: true });
let changed = false;
const rd = (f, d) => { try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch { return d; } };
const put = (f, o) => { const s = JSON.stringify(o); if (!fs.existsSync(f) || fs.readFileSync(f, "utf8") !== s) { fs.writeFileSync(f, s); changed = true; } };
const get = async (u, ms = 20000) => { const r = await fetch(u, { signal: AbortSignal.timeout(ms), headers: { "user-agent": "dynasty-desk-updater" } }); if (!r.ok) throw new Error(r.status + " " + u); return r; };
const norm = n => (n || "").toLowerCase().replace(/[.'’]/g, "").replace(/\b(jr|sr|ii|iii|iv)\b/g, "").replace(/[^a-z ]/g, " ").replace(/\s+/g, " ").trim();
const strip = h => h.replace(/<!\[CDATA\[|\]\]>/g, "").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&(lt|gt);/g, "").replace(/&#8217;|&#039;|&apos;/g, "'").replace(/&quot;|&#8220;|&#8221;/g, '"').replace(/\s+/g, " ").trim();
const tag = (x, n) => { const m = x.match(new RegExp(`<${n}[^>]*>([\\s\\S]*?)</${n}>`, "i")); return m ? strip(m[1]) : ""; };

export function parseFeed(xml, source, max) {
  return (xml.match(/<(item|entry)[\s>][\s\S]*?<\/\1>/gi) || []).map(x => {
    const l = tag(x, "link") || (x.match(/<link[^>]*href="([^"]+)"/i) || [])[1] || "";
    const dt = Date.parse(tag(x, "pubDate") || tag(x, "published") || tag(x, "updated"));
    return { t: tag(x, "title").slice(0, 160), l, s: source, d: new Date(isNaN(dt) ? Date.now() : dt).toISOString(), x: (tag(x, "description") || tag(x, "summary")).slice(0, max) };
  }).filter(i => i.t && /^https?:/.test(i.l));
}
if (process.argv[2] === "selftest") {
  const r = parseFeed(`<rss><channel><item><title><![CDATA[Test &amp; Player hurt]]></title><link>https://e.com/a</link><pubDate>Tue, 17 Nov 2026 12:00:00 GMT</pubDate><description><![CDATA[<p>Body text</p>]]></description></item></channel></rss>`, "T", 50);
  console.log(JSON.stringify(r)); process.exit(r.length === 1 && r[0].t === "Test & Player hurt" ? 0 : 1);
}

// ---- News: merge, dedupe, drop old, cap ----
const old = rd(D + "/news.json", { items: [] }), seen = new Map(old.items.map(i => [i.l, i]));
for (const f of cfg.feeds) {
  try { for (const i of parseFeed(await (await get(f.url, 15000)).text(), f.name, cfg.news.summaryChars)) if (!seen.has(i.l)) seen.set(i.l, i); }
  catch (e) { console.log("Feed failed:", f.name, e.message); }
}
const cut = Date.now() - cfg.news.maxAgeDays * 864e5;
const items = [...seen.values()].filter(i => Date.parse(i.d) >= cut).sort((a, b) => b.d.localeCompare(a.d)).slice(0, cfg.news.maxItems);

// ---- Daily value snapshots, with retention ----
const today = new Date().toISOString().slice(0, 10), names = rd(D + "/names.json", {});
const csv = t => { const rows = t.trim().split(/\r?\n/).map(l => { const o = []; let c = "", q = false; for (const ch of l) { if (ch === '"') q = !q; else if (ch === "," && !q) { o.push(c); c = ""; } else c += ch; } o.push(c); return o; }); const h = rows.shift(); return rows.map(r => Object.fromEntries(h.map((k, i) => [k, r[i]]))); };
let dp = null;
for (const fm of cfg.formats) {
  try {
    const hf = `${D}/history/${fm.name}.json`, h = rd(hf, { snaps: [] });
    if (h.snaps.at(-1)?.d !== today) {
      const fc = await (await get(`https://api.fantasycalc.com/values/current?isDynasty=true&numQbs=${fm.numQbs}&numTeams=${fm.teams}&ppr=${fm.ppr}`)).json();
      dp ??= csv(await (await get("https://raw.githubusercontent.com/dynastyprocess/data/master/files/values.csv")).text());
      const vk = fm.numQbs === 2 ? "value_2qb" : "value_1qb", ek = fm.numQbs === 2 ? "ecr_2qb" : "ecr_1qb";
      const dpm = new Map(dp.map(r => [norm(r.player) + "|" + r.pos, r]));
      const snap = { d: today, p: {}, k: {} };
      fc.filter(e => e.player.position !== "PICK" && e.player.sleeperId).sort((a, b) => b.value - a.value).slice(0, cfg.history.topPlayers).forEach(e => {
        const r = dpm.get(norm(e.player.name) + "|" + e.player.position) || {};
        snap.p[e.player.sleeperId] = [e.value, Math.round(+r[vk]) || 0, Math.round(+r[ek]) || 0];
        names[e.player.sleeperId] = e.player.name; });
      fc.filter(e => e.player.position === "PICK").forEach(e => snap.k[e.player.name] = e.value);
      h.snaps.push(snap);
    }
    // Retention: daily for dailyDays, then Sundays only up to weeklyWeeks, then dropped. Then a hard size cap.
    const now = Date.parse(today);
    h.snaps = h.snaps.filter(s => { const age = (now - Date.parse(s.d)) / 864e5; return age <= cfg.history.dailyDays || (age <= cfg.history.weeklyWeeks * 7 && new Date(s.d).getUTCDay() === 0); });
    while (JSON.stringify(h).length > cfg.history.maxBytesPerFile && h.snaps.length > 30) h.snaps.shift();
    put(hf, h);
  } catch (e) { console.log("History failed:", fm.name, e.message); }
}
put(D + "/names.json", names);

// ---- Optional Discord alerts for news about your players (needs DISCORD_WEBHOOK secret) ----
try {
  const hook = process.env.DISCORD_WEBHOOK, sl = cfg.sleeper || {};
  if (hook && sl.leagueId && !sl.leagueId.startsWith("YOUR")) {
    const u = await (await get(`https://api.sleeper.app/v1/user/${sl.username}`)).json();
    const ro = (await (await get(`https://api.sleeper.app/v1/league/${sl.leagueId}/rosters`)).json()).find(r => r.owner_id === u.user_id);
    const watch = [...(ro?.players || []).map(id => names[id]).filter(Boolean), ...cfg.watch].map(norm).filter(n => n.length > 4);
    const recent = Date.now() - cfg.news.alertWithinHours * 36e5; let sent = 0;
    for (const i of items) {
      if (i.a || sent >= 5 || Date.parse(i.d) < recent) continue;
      const t = norm(i.t + " " + i.x);
      if (watch.some(n => t.includes(n))) { await fetch(hook, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ content: `**${i.s}:** ${i.t}\n${i.l}`.slice(0, 1900) }) }); i.a = 1; sent++; }
    }
  }
} catch (e) { console.log("Alerts failed:", e.message); }

put(D + "/news.json", { items });
if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `changed=${changed}\n`);
console.log(`news ${items.length} items, changed=${changed}`);
