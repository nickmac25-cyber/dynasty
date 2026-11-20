(function() {
  const navItems = [
    // Internal index.html tabs
    { type: "tab", tab: "tab-trade", label: "Trade & Targets", desc: "Trade calculator & positional targets" },
    { type: "tab", tab: "tab-roster", label: "Roster & Waivers", desc: "Full roster breakdown & waiver adds" },
    { type: "tab", tab: "tab-startsit", label: "Start/Sit", desc: "Weekly lineup optimizer" },
    { type: "tab", tab: "tab-draftroom", label: "Draft Room", desc: "Live draft war room & tracker" },
    { type: "tab", tab: "tab-managers", label: "Managers", desc: "League manager profiles & tendencies" },
    { type: "tab", tab: "tab-audit", label: "Team Audit", desc: "Contender vs. rebuilder roster audit" },
    { type: "tab", tab: "tab-finder", label: "Trade Finder", desc: "Automated 1-for-1 & 2-for-1 trade proposals" },
    { type: "tab", tab: "tab-live", label: "Alerts & News", desc: "Live player news & injury alerts" },
    { type: "tab", tab: "tab-draft", label: "2027 Rookies", desc: "2027 incoming rookie prospect rankings" },
    { type: "tab", tab: "tab-ai", label: "AI Advisor", desc: "Custom AI front-office strategy advice" },
    { type: "tab", tab: "tab-weights", label: "⚙ Weights", desc: "Custom scoring & age curve weight settings" },
    // Standalone tool pages
    { type: "page", href: "draft-capital.html", label: "Draft Capital", desc: "Future rookie pick inventory across all teams" },
    { type: "page", href: "league-matrix.html", label: "Power Matrix", desc: "Starter vs. bench dynasty value rankings" },
    { type: "page", href: "waiver-stashes.html", label: "Waiver Stashes", desc: "Top unrostered dynasty stashes on waivers" },
    { type: "page", href: "trade-block.html", label: "Trade Matchmaker", desc: "Surplus-to-need trade partner matcher" },
    { type: "page", href: "age-curves.html", label: "Age Heatmap", desc: "Positional age & prime-window heatmap" },
    { type: "page", href: "schedule-luck.html", label: "Schedule Luck", desc: "All-Play record vs. actual standings luck" },
    { type: "page", href: "taxi-optimizer.html", label: "Taxi & Stashes", desc: "Taxi squad audit & opponent poach targets" },
    { type: "page", href: "mock-draft.html", label: "Mock Draft", desc: "League-aware 2027 rookie mock draft simulator" },
    { type: "page", href: "history.html", label: "Franchise History", desc: "All-time trophies, H2H rivalries & records" },
    { type: "page", href: "trade-grades.html", label: "Trade Ledger", desc: "Historical trades: value then vs. value now" }
  ];

  const currentFile = window.location.pathname.split("/").pop() || "index.html";
  const isIndex = currentFile === "index.html" || currentFile === "";

  // 1. Build the unified top nav bar
  const nav = document.createElement("nav");
  nav.id = "dynasty-master-nav";
  nav.style.cssText = "background:#090d16; border-bottom:1px solid #1e293b; padding:10px 16px; display:flex; flex-wrap:wrap; align-items:center; gap:6px; font-family:system-ui,-apple-system,sans-serif; font-size:12px; position:relative; z-index:50;";

  const brand = document.createElement("span");
  brand.textContent = "Dynasty Suite:";
  brand.style.cssText = "color:#64748b; font-weight:700; letter-spacing:0.05em; text-transform:uppercase; margin-right:4px; white-space:nowrap;";
  nav.appendChild(brand);

  const cmdBtn = document.createElement("button");
  cmdBtn.type = "button";
  cmdBtn.innerHTML = `🔍 Quick Jump <span style="opacity:0.65; font-size:10px; margin-left:4px; background:#0f172a; padding:1px 5px; border-radius:4px; border:1px solid #334155;">⌘K</span>`;
  cmdBtn.style.cssText = "background:#0f172a; color:#34d399; border:1px solid rgba(16,185,129,0.4); padding:5px 10px; border-radius:6px; font-weight:700; white-space:nowrap; cursor:pointer; margin-right:4px;";
  cmdBtn.onclick = () => openPalette();
  nav.appendChild(cmdBtn);

  const btnElements = [];

  function styleButton(el, active) {
    el.style.cssText = active
      ? "background:rgba(16,185,129,0.18); color:#34d399; border:1px solid rgba(16,185,129,0.5); padding:5px 10px; border-radius:6px; text-decoration:none; font-weight:700; white-space:nowrap; cursor:pointer; display:inline-block;"
      : "background:#151e2e; color:#cbd5e1; border:1px solid #334155; padding:5px 10px; border-radius:6px; text-decoration:none; font-weight:600; white-space:nowrap; cursor:pointer; display:inline-block;";
  }

  function activateIndexTab(tabId) {
    const nativeBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
    if (nativeBtn) nativeBtn.click();
    btnElements.forEach(({ el, item }) => {
      styleButton(el, item.type === "tab" && item.tab === tabId);
    });
  }

  function navigateToItem(item) {
    if (item.type === "tab") {
      if (isIndex) {
        history.replaceState(null, "", `#${item.tab}`);
        activateIndexTab(item.tab);
      } else {
        window.location.href = `index.html#${item.tab}`;
      }
    } else {
      window.location.href = item.href;
    }
  }

  navItems.forEach((item, idx) => {
    const el = document.createElement("a");
    el.textContent = item.label;

    if (item.type === "tab") {
      el.href = isIndex ? `#${item.tab}` : `index.html#${item.tab}`;
      if (isIndex) {
        el.onclick = (e) => {
          e.preventDefault();
          navigateToItem(item);
        };
      }
    } else {
      el.href = item.href;
    }

    if (idx === 11) {
      const sep = document.createElement("span");
      sep.style.cssText = "width:1px; height:18px; background:#334155; margin:0 4px; display:inline-block;";
      nav.appendChild(sep);
    }

    let isActive = false;
    if (isIndex && item.type === "tab") {
      const hashTab = window.location.hash.replace("#", "") || "tab-trade";
      isActive = item.tab === hashTab;
    } else if (!isIndex && item.type === "page") {
      isActive = currentFile === item.href;
    }

    styleButton(el, isActive);
    btnElements.push({ el, item });
    nav.appendChild(el);
  });

  document.body.insertBefore(nav, document.body.firstChild);

  if (isIndex && window.location.hash) {
    const targetTab = window.location.hash.replace("#", "");
    setTimeout(() => activateIndexTab(targetTab), 50);
  }

  // 2. Command Palette Modal (Cmd+K / Ctrl+K)
  const overlay = document.createElement("div");
  overlay.id = "dd-cmd-overlay";
  overlay.style.cssText = "display:none; position:fixed; inset:0; background:rgba(2,6,23,0.8); backdrop-filter:blur(4px); z-index:9999; align-items:flex-start; justify-content:center; padding:60px 16px 16px; font-family:system-ui,-apple-system,sans-serif;";
  overlay.innerHTML = `
    <div style="background:#0f172a; border:1px solid #334155; border-radius:14px; width:100%; max-width:520px; box-shadow:0 25px 50px -12px rgba(0,0,0,0.75); overflow:hidden;">
      <div style="padding:12px 16px; border-bottom:1px solid #1e293b; display:flex; align-items:center; gap:10px;">
        <span style="color:#34d399; font-weight:700;">🔍</span>
        <input id="dd-cmd-input" placeholder="Jump to any tool or tab (e.g., Trade Ledger, Mock Draft, Audit)..." style="background:transparent; border:none; outline:none; color:#f8fafc; font-size:14px; width:100%;">
        <button id="dd-cmd-close" style="background:#1e293b; color:#94a3b8; border:none; border-radius:6px; padding:3px 8px; font-size:11px; cursor:pointer;">ESC</button>
      </div>
      <div id="dd-cmd-list" style="max-height:360px; overflow-y:auto; padding:8px;"></div>
    </div>
  `;
  document.body.appendChild(overlay);

  const cmdInput = document.getElementById("dd-cmd-input");
  const cmdList = document.getElementById("dd-cmd-list");
  let filteredItems = [...navItems];
  let selectedIdx = 0;

  function renderPalette() {
    cmdList.innerHTML = filteredItems.map((it, i) => `
      <div data-idx="${i}" style="padding:10px 12px; border-radius:8px; cursor:pointer; display:flex; justify-content:space-between; align-items:center; background:${i === selectedIdx ? "rgba(16,185,129,0.16)" : "transparent"}; border:1px solid ${i === selectedIdx ? "rgba(16,185,129,0.4)" : "transparent"};">
        <div>
          <div style="color:${i === selectedIdx ? "#34d399" : "#f1f5f9"}; font-weight:700; font-size:13px;">${it.label}</div>
          <div style="color:#64748b; font-size:11px;">${it.desc}</div>
        </div>
        <span style="font-size:10px; color:#64748b; text-transform:uppercase;">${it.type === "tab" ? "Tab" : "Page"}</span>
      </div>
    `).join("") || `<div style="padding:16px; text-align:center; color:#64748b; font-size:12px;">No matching tools found.</div>`;

    [...cmdList.children].forEach(row => {
      row.onclick = () => {
        const idx = Number(row.dataset.idx);
        if (filteredItems[idx]) {
          closePalette();
          navigateToItem(filteredItems[idx]);
        }
      };
    });
  }

  function openPalette() {
    overlay.style.display = "flex";
    cmdInput.value = "";
    filteredItems = [...navItems];
    selectedIdx = 0;
    renderPalette();
    setTimeout(() => cmdInput.focus(), 10);
  }

  function closePalette() {
    overlay.style.display = "none";
  }

  document.getElementById("dd-cmd-close").onclick = closePalette;
  overlay.onclick = (e) => { if (e.target === overlay) closePalette(); };

  cmdInput.oninput = () => {
    const q = cmdInput.value.trim().toLowerCase();
    filteredItems = navItems.filter(it =>
      it.label.toLowerCase().includes(q) || it.desc.toLowerCase().includes(q)
    );
    selectedIdx = 0;
    renderPalette();
  };

  cmdInput.onkeydown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      selectedIdx = (selectedIdx + 1) % Math.max(1, filteredItems.length);
      renderPalette();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      selectedIdx = (selectedIdx - 1 + filteredItems.length) % Math.max(1, filteredItems.length);
      renderPalette();
    } else if (e.key === "Enter" && filteredItems[selectedIdx]) {
      e.preventDefault();
      const chosen = filteredItems[selectedIdx];
      closePalette();
      navigateToItem(chosen);
    } else if (e.key === "Escape") {
      closePalette();
    }
  };

  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      overlay.style.display === "flex" ? closePalette() : openPalette();
    }
  });

  // 3. Cross-Page Sync Bridge (index.html <-> all standalone pages)
  let fetchedLeagues = [];
  let isApplyingSavedLeague = false;

  const cleanName = str => (str || "").replace(/\s*\(\d+T\)\s*$/i, "").trim().toLowerCase();

  function saveSelectedLeague(leagueSel) {
    if (!leagueSel || isApplyingSavedLeague || !leagueSel.options.length) return;
    const idx = leagueSel.selectedIndex;
    const opt = leagueSel.options[idx];
    if (!opt || !opt.textContent.trim()) return;

    const cleaned = cleanName(opt.textContent);
    localStorage.setItem("dd_league_name", cleaned);
    if (fetchedLeagues[idx]?.league_id) {
      localStorage.setItem("dd_league_id", String(fetchedLeagues[idx].league_id));
    }
  }

  function applySavedLeague(leagueSel) {
    if (!leagueSel || !leagueSel.options.length) return;
    const savedId = localStorage.getItem("dd_league_id");
    const savedName = localStorage.getItem("dd_league_name");
    if (!savedId && !savedName) return;

    const opts = [...leagueSel.options];
    let matchIdx = -1;

    if (savedId && fetchedLeagues.length) {
      matchIdx = fetchedLeagues.findIndex(l => String(l.league_id) === savedId);
    }
    if (matchIdx === -1 && savedName) {
      matchIdx = opts.findIndex(o => cleanName(o.textContent) === savedName);
    }

    if (matchIdx > -1 && leagueSel.selectedIndex !== matchIdx) {
      isApplyingSavedLeague = true;
      leagueSel.selectedIndex = matchIdx;
      leagueSel.dispatchEvent(new Event("change", { bubbles: true }));
      if (typeof leagueSel.onchange === "function") {
        leagueSel.onchange({ target: leagueSel });
      }
      isApplyingSavedLeague = false;
    }
  }

  // Intercept Sleeper /leagues/nfl/ fetch so we capture the exact league list
  const origFetch = window.fetch;
  window.fetch = async function(...args) {
    const res = await origFetch.apply(this, args);
    try {
      const url = typeof args[0] === "string" ? args[0] : args[0]?.url || "";
      if (url.includes("api.sleeper.app/v1/user/") && url.includes("/leagues/nfl/")) {
        res.clone().json().then(data => {
          if (Array.isArray(data)) {
            fetchedLeagues = data;
            // Wait a tick for the page's own script to populate #league, then switch to saved league
            setTimeout(() => applySavedLeague(document.getElementById("league")), 60);
            setTimeout(() => applySavedLeague(document.getElementById("league")), 250);
          }
        }).catch(() => {});
      }
    } catch (e) {}
    return res;
  };

  window.addEventListener("DOMContentLoaded", () => {
    const userInp = document.getElementById("user");
    const seasonSel = document.getElementById("season");
    const leagueSel = document.getElementById("league");
    const goBtn = document.getElementById("go");

    // 1. Sync Username
    if (userInp) {
      const savedUser = localStorage.getItem("dd_user");
      if (savedUser && !userInp.value.trim()) userInp.value = savedUser;
      userInp.addEventListener("change", () => {
        if (userInp.value.trim()) localStorage.setItem("dd_user", userInp.value.trim());
      });
    }

    // 2. Sync Season
    if (seasonSel) {
      const savedSeason = localStorage.getItem("dd_season");
      if (savedSeason && [...seasonSel.options].some(o => o.value === savedSeason)) {
        seasonSel.value = savedSeason;
      }
      seasonSel.addEventListener("change", () => {
        localStorage.setItem("dd_season", seasonSel.value);
      });
    }

    // 3. Watch #league for manual user switches AND initial population
    if (leagueSel) {
      leagueSel.addEventListener("change", () => saveSelectedLeague(leagueSel));
      const obs = new MutationObserver(() => applySavedLeague(leagueSel));
      obs.observe(leagueSel, { childList: true });
    }

    // 4. Auto-click Sync on index.html if username is saved (standalone pages already auto-click)
    if (isIndex && userInp && userInp.value.trim() && goBtn) {
      setTimeout(() => {
        if (leagueSel && leagueSel.hidden) goBtn.click();
      }, 150);
    }
  });
})();
