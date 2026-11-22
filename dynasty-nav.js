(function () {
  const PAGES = [
    { href: "index.html", label: "Command Center", icon: "⚡", match: ["", "index.html", "index_2.html"] },
    { href: "trade-hub.html", label: "Trade Hub & Grades", icon: "⚖️", match: ["trade-hub.html", "trade-block.html", "trade-grades.html"] },
    { href: "league-matrix.html", label: "Power, Age & Luck", icon: "📊", match: ["league-matrix.html", "age-curves.html", "schedule-luck.html"] },
    { href: "draft-capital.html", label: "Draft Capital", icon: "💰", match: ["draft-capital.html"] },
    { href: "mock-draft.html", label: "Mock Draft", icon: "🎓", match: ["mock-draft.html"] },
    { href: "history.html", label: "Franchise History", icon: "🏆", match: ["history.html"] }
  ];

  const path = window.location.pathname.split("/").pop() || "index.html";
  const nav = document.createElement("nav");
  nav.className = "bg-slate-950 border-b border-slate-800/90 sticky top-0 z-50";
  nav.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3 overflow-x-auto">
      <a href="index.html" class="flex items-center gap-2 shrink-0 text-white font-bold text-sm tracking-tight">
        <span class="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-extrabold text-xs">DD</span>
        <span>Dynasty Desk <span class="text-[10px] uppercase px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 ml-0.5">Pro</span></span>
      </a>
      <div class="flex items-center gap-1">
        ${PAGES.map(p => {
          const active = p.match.includes(path);
          return `<a href="${p.href}" class="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
            active
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }"><span>${p.icon}</span><span>${p.label}</span></a>`;
        }).join("")}
      </div>
    </div>
  `;
  document.body.prepend(nav);
})();
