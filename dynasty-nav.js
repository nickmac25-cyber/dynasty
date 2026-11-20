(function() {
  // All internal tabs inside index.html + all standalone tool pages in one unified bar
  const navItems = [
    // Internal index.html tabs
    { type: "tab", tab: "tab-trade", label: "Trade & Targets" },
    { type: "tab", tab: "tab-roster", label: "Roster & Waivers" },
    { type: "tab", tab: "tab-startsit", label: "Start/Sit" },
    { type: "tab", tab: "tab-draftroom", label: "Draft Room" },
    { type: "tab", tab: "tab-managers", label: "Managers" },
    { type: "tab", tab: "tab-audit", label: "Team Audit" },
    { type: "tab", tab: "tab-finder", label: "Trade Finder" },
    { type: "tab", tab: "tab-live", label: "Alerts & News" },
    { type: "tab", tab: "tab-draft", label: "2027 Rookies" },
    { type: "tab", tab: "tab-ai", label: "AI Advisor" },
    { type: "tab", tab: "tab-weights", label: "⚙ Weights" },
    // Standalone tool pages
    { type: "page", href: "draft-capital.html", label: "Draft Capital" },
    { type: "page", href: "league-matrix.html", label: "Power Matrix" },
    { type: "page", href: "waiver-stashes.html", label: "Waiver Stashes" },
    { type: "page", href: "trade-block.html", label: "Trade Matchmaker" },
    { type: "page", href: "age-curves.html", label: "Age Heatmap" },
    { type: "page", href: "schedule-luck.html", label: "Schedule Luck" },
    { type: "page", href: "taxi-optimizer.html", label: "Taxi & Stashes" },
    { type: "page", href: "mock-draft.html", label: "Mock Draft" }
  ];

  const currentFile = window.location.pathname.split("/").pop() || "index.html";
  const isIndex = currentFile === "index.html" || currentFile === "";

  // Build the unified top nav bar
  const nav = document.createElement("nav");
  nav.id = "dynasty-master-nav";
  nav.style.cssText = "background:#090d16; border-bottom:1px solid #1e293b; padding:10px 16px; display:flex; flex-wrap:wrap; align-items:center; gap:6px; font-family:system-ui,-apple-system,sans-serif; font-size:12px; position:relative; z-index:50;";

  const brand = document.createElement("span");
  brand.textContent = "Dynasty Suite:";
  brand.style.cssText = "color:#64748b; font-weight:700; letter-spacing:0.05em; text-transform:uppercase; margin-right:4px; white-space:nowrap;";
  nav.appendChild(brand);

  const btnElements = [];

  function styleButton(el, active) {
    el.style.cssText = active
      ? "background:rgba(16,185,129,0.18); color:#34d399; border:1px solid rgba(16,185,129,0.5); padding:5px 10px; border-radius:6px; text-decoration:none; font-weight:700; white-space:nowrap; cursor:pointer; display:inline-block;"
      : "background:#151e2e; color:#cbd5e1; border:1px solid #334155; padding:5px 10px; border-radius:6px; text-decoration:none; font-weight:600; white-space:nowrap; cursor:pointer; display:inline-block;";
  }

  function activateIndexTab(tabId) {
    // Trigger index.html's existing tab button if present
    const nativeBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
    if (nativeBtn) nativeBtn.click();

    // Update highlight on the master nav bar
    btnElements.forEach(({ el, item }) => {
      styleButton(el, item.type === "tab" && item.tab === tabId);
    });
  }

  navItems.forEach((item, idx) => {
    const el = document.createElement("a");
    el.textContent = item.label;

    if (item.type === "tab") {
      el.href = isIndex ? `#${item.tab}` : `index.html#${item.tab}`;
      if (isIndex) {
        el.onclick = (e) => {
          e.preventDefault();
          history.replaceState(null, "", `#${item.tab}`);
          activateIndexTab(item.tab);
        };
      }
    } else {
      el.href = item.href;
    }

    // Add a subtle visual divider right before the standalone pages
    if (idx === 11) {
      const sep = document.createElement("span");
      sep.style.cssText = "width:1px; height:18px; background:#334155; margin:0 4px; display:inline-block;";
      nav.appendChild(sep);
    }

    // Determine initial active highlight
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

  // If landing on index.html with a #hash (e.g. index.html#tab-finder), auto-open that tab
  if (isIndex && window.location.hash) {
    const targetTab = window.location.hash.replace("#", "");
    setTimeout(() => activateIndexTab(targetTab), 50);
  }
})();
