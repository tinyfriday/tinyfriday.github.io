const { test, expect } = require("@playwright/test");

// 외부 요청(GoatCounter)은 막고 페이지 자체만 본다
test.beforeEach(async ({ page }) => {
  await page.route(/goatcounter|zgo\.at/, (r) => r.abort());
});

test("첫 화면이 무엇을 하는 곳인지 보여 준다", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("매주 금요일");
  await expect(page.locator(".days li")).toHaveCount(7);
  await expect(page.locator(".days li.today")).toHaveCount(1);
});

test("도구 목록을 tools.json 에서 그린다", async ({ page }) => {
  await page.goto("/");
  const data = await (await page.request.get("/tools.json")).json();
  await expect(page.locator("#log > li[id^='tool-']")).toHaveCount(data.tools.length);
});

test("MML 은 지인용 알파이고 서비스 링크가 없다", async ({ page }) => {
  await page.goto("/");
  const mml = page.locator("#tool-mid2mml");
  await expect(mml).toContainText("지인용 알파");
  const hrefs = await mml.locator("a").evaluateAll((as) => as.map((a) => a.href));
  expect(hrefs.length).toBeGreaterThan(0);
  for (const h of hrefs) expect(h).toMatch(/^https:\/\/github\.com\/tinyfriday\//);
});

test("가로 스크롤이 생기지 않는다", async ({ page }) => {
  await page.goto("/");
  await page.locator("#tool-hub").waitFor();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test("목록을 못 불러오면 안내한다", async ({ page }) => {
  await page.route("**/tools.json", (r) => r.fulfill({ status: 500, body: "" }));
  await page.goto("/");
  await expect(page.locator("#log")).toContainText("불러오지 못했습니다");
});
