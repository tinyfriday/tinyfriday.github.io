// tools.json 형식 검사: 도구마다 필수 칸이 있는지, 링크가 https 인지
const d = require("../tools.json");
if (!Array.isArray(d.tools)) throw new Error("tools 배열이 없습니다");
for (const t of d.tools) {
  for (const k of ["id", "name", "summary", "released", "version", "status"]) {
    if (!t[k]) throw new Error(`${t.id || "?"}: ${k} 칸이 없습니다`);
  }
  for (const l of t.links || []) {
    if (!/^https:\/\//.test(l.href)) throw new Error(`${t.id}: https 가 아닌 링크 ${l.href}`);
  }
}
console.log("tools.json ok:", d.tools.length);
