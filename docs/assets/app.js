(function () {
  var root = document.documentElement;
  try { var t = localStorage.getItem("ottm-theme"); if (t) root.setAttribute("data-theme", t); } catch (e) {}

  document.addEventListener("DOMContentLoaded", function () {
    // theme toggle
    var tb = document.getElementById("theme");
    if (tb) tb.addEventListener("click", function () {
      var dark = root.getAttribute("data-theme") === "dark" ||
        (!root.getAttribute("data-theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
      var next = dark ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("ottm-theme", next); } catch (e) {}
    });
    // mobile menu
    var mb = document.getElementById("menu");
    if (mb) mb.addEventListener("click", function () { document.body.classList.toggle("nav-open"); });
    document.querySelectorAll(".sidebar a").forEach(function (a) {
      a.addEventListener("click", function () { document.body.classList.remove("nav-open"); });
    });
    // wrap tables for horizontal scroll
    document.querySelectorAll(".doc table").forEach(function (t) {
      if (t.parentNode.classList.contains("tablewrap")) return;
      var w = document.createElement("div"); w.className = "tablewrap";
      t.parentNode.insertBefore(w, t); w.appendChild(t);
    });
    // on-this-page highlight
    var links = Array.prototype.slice.call(document.querySelectorAll(".toc a"));
    if (links.length && "IntersectionObserver" in window) {
      var map = {};
      links.forEach(function (a) { map[decodeURIComponent(a.getAttribute("href").slice(1))] = a; });
      var obs = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting && map[e.target.id]) {
            links.forEach(function (l) { l.classList.remove("on"); });
            map[e.target.id].classList.add("on");
          }
        });
      }, { rootMargin: "-70px 0px -70% 0px" });
      document.querySelectorAll(".doc h2[id], .doc h3[id]").forEach(function (h) { obs.observe(h); });
    }
    initSearch();
    initCatalogue();
  });

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function initSearch() {
    var inp = document.getElementById("q"), box = document.getElementById("results");
    if (!inp || !window.SEARCH) return;
    var base = document.body.getAttribute("data-base") || "";
    var sel = -1;
    function run() {
      var q = inp.value.trim().toLowerCase();
      if (q.length < 2) { box.classList.remove("open"); return; }
      var words = q.split(/\s+/), hits = [];
      window.SEARCH.forEach(function (d) {
        var hay = (d.t + " " + d.x).toLowerCase(), score = 0;
        for (var i = 0; i < words.length; i++) {
          if (hay.indexOf(words[i]) < 0) return;
          score += d.t.toLowerCase().indexOf(words[i]) >= 0 ? 5 : 1;
        }
        hits.push({ d: d, s: score });
      });
      hits.sort(function (a, b) { return b.s - a.s; });
      sel = -1;
      if (!hits.length) { box.innerHTML = '<div class="empty">' + esc(box.getAttribute("data-empty")) + "</div>"; }
      else box.innerHTML = hits.slice(0, 12).map(function (h) {
        var x = h.d.x, i = x.toLowerCase().indexOf(words[0]);
        var snip = i < 0 ? x.slice(0, 110) : (i > 40 ? "…" : "") + x.slice(Math.max(0, i - 40), i + 90) + "…";
        return '<a href="' + base + h.d.u + '"><b>' + esc(h.d.t) + "</b><span>" + esc(h.d.p) + " · " + esc(snip) + "</span></a>";
      }).join("");
      box.classList.add("open");
    }
    inp.addEventListener("input", run);
    inp.addEventListener("focus", run);
    inp.addEventListener("keydown", function (e) {
      var items = box.querySelectorAll("a");
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault(); if (!items.length) return;
        sel = (sel + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
        items.forEach(function (a, i) { a.classList.toggle("sel", i === sel); });
      } else if (e.key === "Enter" && items.length) { (items[sel >= 0 ? sel : 0]).click(); }
      else if (e.key === "Escape") { box.classList.remove("open"); inp.blur(); }
    });
    document.addEventListener("click", function (e) { if (!e.target.closest(".search")) box.classList.remove("open"); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "/" && document.activeElement !== inp && !/input|select|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); inp.focus(); }
    });
  }

  function initCatalogue() {
    var el = document.getElementById("catalogue");
    if (!el || !window.THREATS) return;
    var L = window.CAT_LABELS, state = { tpl: "product", q: "", stride: "", fam: "", pri: "" };
    var head = '<div class="filters">' +
      '<span class="seg"><button data-tpl="product" class="on">' + esc(L.product) + '</button><button data-tpl="plant">' + esc(L.plant) + "</button></span>" +
      '<input type="search" id="cq" placeholder="' + esc(L.search) + '">' +
      '<select id="cs"><option value="">' + esc(L.allStride) + "</option>" + "STRIDE".split("").map(function (c) { return '<option value="' + c + '">' + c + " · " + esc(L.stride[c]) + "</option>"; }).join("") + "</select>" +
      '<select id="cf"><option value="">' + esc(L.allFam) + "</option>" + Object.keys(L.fam).map(function (k) { return '<option value="' + k + '">' + esc(L.fam[k]) + "</option>"; }).join("") + "</select>" +
      '<select id="cp"><option value="">' + esc(L.allPri) + '</option><option>High</option><option>Medium</option><option>Low</option></select>' +
      "</div><p class=\"count\" id=\"cc\"></p>";
    el.innerHTML = head + '<div class="tablewrap"><table class="cat"><thead><tr><th>ID</th><th>' + esc(L.cols.stride) + "</th><th>" + esc(L.cols.threat) + "</th><th>" + esc(L.cols.fam) +
      "</th><th>" + esc(L.cols.pri) + "</th><th>SL</th></tr></thead><tbody id=\"cb\"></tbody></table></div>";
    var tb = document.getElementById("cb");
    function render() {
      var rows = window.THREATS[state.tpl].filter(function (t) {
        if (state.stride && t.c !== state.stride) return false;
        if (state.fam && String(t.f).charAt(0) !== state.fam) return false;
        if (state.pri && t.p !== state.pri) return false;
        if (state.q) {
          var hay = (t.id + " " + t.t + " " + t.d + " " + t.m + " " + t.a + " " + t.r).toLowerCase();
          if (hay.indexOf(state.q) < 0) return false;
        }
        return true;
      });
      document.getElementById("cc").textContent = L.shown.replace("{n}", rows.length).replace("{t}", window.THREATS[state.tpl].length);
      tb.innerHTML = rows.map(function (t) {
        return '<tr class="row" data-id="' + t.id + '"><td>' + t.id + '</td><td><span class="pill ' + t.c + '">' + t.c + "</span></td><td>" + esc(t.t) +
          "</td><td>" + esc(L.fam[String(t.f).charAt(0)]) + (String(t.f) === "8s" ? " (R)" : "") + '</td><td class="prio-' + t.p + '">' + t.p + "</td><td>" + esc(t.s.replace("SL ", "")) + "</td></tr>" +
          '<tr class="detail" hidden><td colspan="6"><dl>' +
          "<dt>" + esc(L.cols.desc) + "</dt><dd>" + esc(t.d) + "</dd>" +
          "<dt>" + esc(L.cols.mit) + "</dt><dd>" + esc(t.m) + "</dd>" +
          "<dt>IEC 62443</dt><dd>" + esc(t.r) + "</dd>" +
          "<dt>ATT&amp;CK for ICS</dt><dd>" + esc(t.a) + "</dd>" +
          "<dt>" + esc(L.cols.fr) + "</dt><dd>" + esc(t.fr) + "</dd>" +
          "<dt>" + esc(L.cols.impact) + "</dt><dd>" + esc(t.i) + "</dd></dl></td></tr>";
      }).join("");
    }
    el.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-tpl]");
      if (b) { state.tpl = b.getAttribute("data-tpl"); el.querySelectorAll("button[data-tpl]").forEach(function (x) { x.classList.toggle("on", x === b); }); render(); return; }
      var r = e.target.closest("tr.row");
      if (r) { var d = r.nextElementSibling; d.hidden = !d.hidden; }
    });
    document.getElementById("cq").addEventListener("input", function () { state.q = this.value.trim().toLowerCase(); render(); });
    document.getElementById("cs").addEventListener("change", function () { state.stride = this.value; render(); });
    document.getElementById("cf").addEventListener("change", function () { state.fam = this.value; render(); });
    document.getElementById("cp").addEventListener("change", function () { state.pri = this.value; render(); });
    var h = (location.hash || "").slice(1);
    if (/^PL-/.test(h)) { el.querySelector('button[data-tpl="plant"]').click(); }
    render();
    if (/^(OT|PL)-/.test(h)) {
      var row = tb.querySelector('tr.row[data-id="' + h + '"]');
      if (row) { row.nextElementSibling.hidden = false; row.scrollIntoView({ block: "center" }); }
    }
  }
})();
