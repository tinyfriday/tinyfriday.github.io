// 배포해봄 허브: tools.json 을 읽어 목록을 그리고, 이번 주 칸에 오늘을 표시한다.
// 외부 입력은 textContent 로만 넣는다(innerHTML 금지).
(function () {
  "use strict";

  // 오늘 요일과 날짜를 한국 시간으로
  function kstNow() {
    var now = new Date();
    return new Date(now.getTime() + (now.getTimezoneOffset() + 540) * 60000);
  }

  function markToday() {
    var dow = kstNow().getDay();
    var cell = document.querySelector('.days li[data-dow="' + dow + '"]');
    if (cell) {
      cell.classList.add("today");
      cell.setAttribute("aria-current", "date");
    }
  }

  function daysUntil(isoDate) {
    var t = kstNow();
    var today = Date.UTC(t.getFullYear(), t.getMonth(), t.getDate());
    var p = isoDate.split("-").map(Number);
    var target = Date.UTC(p[0], p[1] - 1, p[2]);
    return Math.round((target - today) / 86400000);
  }

  function formatDate(iso) {
    var p = iso.split("-").map(Number);
    return p[1] + "월 " + p[2] + "일";
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

  function renderSprint(s) {
    if (!s) return;
    document.getElementById("now-making").textContent = s.name;
    var left = daysUntil(s.release);
    var msg = left > 1 ? "공개까지 " + left + "일 남았습니다."
      : left === 1 ? "내일 저녁에 공개합니다."
      : left === 0 ? "오늘 저녁에 공개합니다."
      : formatDate(s.release) + "에 공개했습니다.";
    document.getElementById("countdown").textContent = msg;
  }

  function renderTools(tools) {
    var log = document.getElementById("log");
    log.textContent = "";
    var today = kstNow();
    var todayIso = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");
    tools
      .slice()
      .sort(function (a, b) { return b.released.localeCompare(a.released); })
      .forEach(function (t) {
        var li = el("li");
        li.id = "tool-" + t.id;
        var upcoming = t.released > todayIso;
        li.appendChild(el("p", "when", (upcoming ? "공개 예정 " : "") + formatDate(t.released)));

        var body = el("div");
        var h = el("h3", null, t.name);
        h.appendChild(el("span", "ver", t.version));
        h.appendChild(el("span", "status", t.status));
        body.appendChild(h);
        body.appendChild(el("p", null, t.summary));

        var acts = el("ul", "acts");
        (t.links || []).forEach(function (l) {
          var href = safeHref(l.href);
          if (!href) return;
          var item = el("li");
          var a = el("a", null, l.label);
          a.href = href;
          item.appendChild(a);
          if (l.note) item.appendChild(el("span", "note", "(" + l.note + ")"));
          acts.appendChild(item);
        });
        body.appendChild(acts);
        li.appendChild(body);
        log.appendChild(li);
      });
    if (!tools.length) log.appendChild(el("li", "empty", "아직 낸 도구가 없습니다. 첫 도구는 금요일에 나옵니다."));
  }

  function fail() {
    var log = document.getElementById("log");
    log.textContent = "";
    var li = el("li", "empty", "도구 목록을 불러오지 못했습니다. 새로고침하거나 ");
    var a = el("a", null, "목록 원본");
    a.href = "tools.json";
    li.appendChild(a);
    li.appendChild(document.createTextNode("을 열어 보세요."));
    log.appendChild(li);
  }

  markToday();
  fetch("tools.json", { cache: "no-cache" })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (data) { renderSprint(data.sprint); renderTools(data.tools || []); })
    .catch(fail);
})();
