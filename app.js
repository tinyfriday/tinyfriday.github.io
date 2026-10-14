// 배포해봄 허브: tools.json 을 읽어 목록을 그리고, 이번 주 칸에 오늘을 표시한다. 한국어·영어를 지원한다.
// 외부 입력은 textContent 로만 넣는다(innerHTML 금지).
(function () {
  "use strict";

  var I18N = {
    ko: {
      skip: "도구 목록으로 건너뛰기", by: "by 계산해봄",
      h1a: "매주 금요일,", h1b: "작은 도구 하나.",
      lede: "토요일에 정하고, 금요일에 냅니다. 덜 된 부분은 숨기지 않고 적어서 냅니다.",
      d6: "토", t6: "정하기", d0: "일", t0: "만들기", d1: "월", t1: "시험", d2: "화", t2: "시험",
      d3: "수", t3: "시험", d4: "목", t4: "써 보기", d5: "금", t5: "공개",
      cap_pre: "이번 주엔 ", cap_post: "를 만들어요.",
      dalhee_alt: "노트북을 든 수달 계달희", days_label: "이번 주",
      stat_friday: "{n}번째 금요일", stat_shipped: "도구 {k}개 출시",
      tools_title: "지금까지 낸 도구", loading: "도구 목록을 불러오는 중입니다.",
      how_title: "이렇게 만듭니다",
      how1: "한 주에 하나씩, 서버 없이 브라우저에서 돌아가는 도구를 만듭니다. 대부분의 구현은 AI가 맡고, 무엇을 만들지와 출시 판단은 사람이 합니다.",
      how2a: "완벽해질 때까지 기다리지 않습니다. 대신 도구마다 ", how2em: "무엇이 안 되는지", how2b: "를 먼저 적어 둡니다.",
      log_link: "Build Log", feedback: "의견 남기기",
      brand: "배포해봄",
      soon: "공개 예정 ", left: "공개까지 {n}일 남았어요.", tomorrow: "내일 저녁에 공개해요.",
      today: "오늘 저녁에 공개해요.", shipped: "{d}에 공개했어요.",
      empty: "아직 낸 도구가 없어요. 첫 도구는 금요일에 나와요.",
      fail: "달희가 도구 목록을 못 찾았어요. 새로고침하거나 ", fail_link: "목록 원본", fail_end: "을 열어 보세요.",
      switch_to: "Switch to English", switch_label: "EN"
    },
    en: {
      skip: "Skip to the tool list", by: "by 계산해봄",
      h1a: "Every Friday,", h1b: "one small tool.",
      lede: "Picked on Saturday, shipped on Friday. What doesn't work yet is written down, not hidden.",
      d6: "Sat", t6: "Pick", d0: "Sun", t0: "Build", d1: "Mon", t1: "Test", d2: "Tue", t2: "Test",
      d3: "Wed", t3: "Test", d4: "Thu", t4: "Try", d5: "Fri", t5: "Ship",
      cap_pre: "This week I'm building ", cap_post: ".",
      dalhee_alt: "Dalhee the otter, holding a laptop", days_label: "This week",
      stat_friday: "Friday #{n}", stat_shipped: "{k} tools shipped", stat_shipped1: "1 tool shipped",
      tools_title: "Shipped so far", loading: "Loading the tool list…",
      how_title: "How it's made",
      how1: "One tool a week, running in your browser with no server. AI writes most of the code; a human decides what to build and when it ships.",
      how2a: "Nothing waits to be perfect. Instead, every tool starts by listing ", how2em: "what doesn't work yet", how2b: ".",
      log_link: "Build Log", feedback: "Send feedback",
      brand: "TinyFriday",
      soon: "Coming ", left: "Ships in {n} days.", tomorrow: "Ships tomorrow evening.",
      today: "Ships this evening.", shipped: "Shipped on {d}.",
      empty: "Nothing shipped yet. The first tool lands on Friday.",
      fail: "Dalhee couldn't find the tool list. Refresh, or open the ", fail_link: "raw list", fail_end: ".",
      switch_to: "한국어로 보기", switch_label: "KO"
    }
  };
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  function store(key, val) {
    try { if (val === undefined) return localStorage.getItem(key); localStorage.setItem(key, val); } catch (e) { return null; }
  }

  function pickLang() {
    var q = new URLSearchParams(location.search).get("lang");
    if (q === "ko" || q === "en") return q;
    var saved = store("tf-lang");
    if (saved === "ko" || saved === "en") return saved;
    return /^ko\b/i.test(navigator.language || "") ? "ko" : "en";
  }

  var lang = pickLang();
  var data = null;
  function T(k) { return I18N[lang][k]; }

  // 오늘 요일과 날짜를 한국 시간으로
  function kstNow() {
    var now = new Date();
    return new Date(now.getTime() + (now.getTimezoneOffset() + 540) * 60000);
  }
  function todayIso() {
    var t = kstNow();
    return t.getFullYear() + "-" + String(t.getMonth() + 1).padStart(2, "0") + "-" + String(t.getDate()).padStart(2, "0");
  }

  function markToday() {
    var cell = document.querySelector('.days li[data-dow="' + kstNow().getDay() + '"]');
    if (cell) { cell.classList.add("today"); cell.setAttribute("aria-current", "date"); }
  }

  function daysUntil(isoDate) {
    var t = kstNow();
    var today = Date.UTC(t.getFullYear(), t.getMonth(), t.getDate());
    var p = isoDate.split("-").map(Number);
    return Math.round((Date.UTC(p[0], p[1] - 1, p[2]) - today) / 86400000);
  }

  function formatDate(iso) {
    var p = iso.split("-").map(Number);
    return lang === "ko" ? p[1] + "월 " + p[2] + "일" : MONTHS[p[1] - 1] + " " + p[2];
  }

  // 도구 문구: 영어 칸(name_en 등)이 있으면 영어에서 쓴다
  function L(obj, key) {
    return (lang === "en" && obj[key + "_en"]) || obj[key];
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function safeHref(href) {
    try {
      var u = new URL(href, location.href);
      return u.protocol === "https:" || u.origin === location.origin ? u.href : null;
    } catch (e) { return null; }
  }

  function applyStatic() {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach(function (n) {
      var v = T(n.getAttribute("data-i18n"));
      if (v != null) n.textContent = v;
    });
    document.querySelectorAll("[data-i18n-alt]").forEach(function (n) { n.alt = T(n.getAttribute("data-i18n-alt")); });
    document.getElementById("days").setAttribute("aria-label", T("days_label"));
    var b = document.getElementById("lang-toggle");
    b.textContent = T("switch_label");
    b.setAttribute("aria-label", T("switch_to"));
    b.setAttribute("lang", lang === "ko" ? "en" : "ko");
  }

  function renderSprint(s) {
    if (!s) return;
    document.getElementById("now-making").textContent = L(s, "name");
    var left = daysUntil(s.release);
    var msg = left > 1 ? T("left").replace("{n}", left)
      : left === 1 ? T("tomorrow")
      : left === 0 ? T("today")
      : T("shipped").replace("{d}", formatDate(s.release));
    document.getElementById("countdown").textContent = msg;
  }

  function renderStats(d) {
    var p = document.getElementById("stats");
    p.textContent = "";
    if (!d || !d.series_start || !d.sprint) return;
    var s = d.series_start.split("-").map(Number), r = d.sprint.release.split("-").map(Number);
    var n = Math.floor((Date.UTC(r[0], r[1] - 1, r[2]) - Date.UTC(s[0], s[1] - 1, s[2])) / 604800000) + 1;
    var now = todayIso();
    var k = (d.tools || []).filter(function (t) { return t.released <= now; }).length;
    p.appendChild(el("span", "stat", T("stat_friday").replace("{n}", n)));
    p.appendChild(el("span", "stat", (k === 1 && I18N[lang].stat_shipped1) ? I18N[lang].stat_shipped1 : T("stat_shipped").replace("{k}", k)));
  }

  function renderTools(tools) {
    var log = document.getElementById("log");
    log.textContent = "";
    var now = todayIso();
    tools.slice()
      .sort(function (a, b) { return b.released.localeCompare(a.released); })
      .forEach(function (t) {
        var li = el("li");
        li.id = "tool-" + t.id;
        li.appendChild(el("p", "when", (t.released > now ? T("soon") : "") + formatDate(t.released)));
        var body = el("div");
        var h = el("h3", null, L(t, "name"));
        h.appendChild(el("span", "ver", t.version));
        h.appendChild(el("span", "status", L(t, "status")));
        body.appendChild(h);
        body.appendChild(el("p", null, L(t, "summary")));
        var acts = el("ul", "acts");
        (t.links || []).forEach(function (l) {
          var href = safeHref(l.href);
          if (!href) return;
          var item = el("li");
          var a = el("a", null, L(l, "label"));
          a.href = href;
          item.appendChild(a);
          if (l.note) item.appendChild(el("span", "note", "(" + L(l, "note") + ")"));
          acts.appendChild(item);
        });
        if (acts.childNodes.length) body.appendChild(acts);
        li.appendChild(body);
        log.appendChild(li);
      });
    if (!tools.length) log.appendChild(el("li", "empty", T("empty")));
  }

  function fail() {
    var log = document.getElementById("log");
    log.textContent = "";
    var li = el("li", "empty", T("fail"));
    var a = el("a", null, T("fail_link"));
    a.href = "tools.json";
    li.appendChild(a);
    li.appendChild(document.createTextNode(T("fail_end")));
    log.appendChild(li);
  }

  function render() {
    applyStatic();
    if (data) { renderSprint(data.sprint); renderStats(data); renderTools(data.tools || []); }
  }

  document.getElementById("lang-toggle").addEventListener("click", function () {
    lang = lang === "ko" ? "en" : "ko";
    store("tf-lang", lang);
    render();
  });

  markToday();
  render();
  fetch("tools.json", { cache: "no-cache" })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (d) { data = d; render(); })
    .catch(fail);
})();
