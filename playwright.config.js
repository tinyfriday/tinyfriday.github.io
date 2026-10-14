// 스모크 테스트: 휴대폰 크기 Chromium·WebKit(iOS 사파리 대신)에서 허브가 뜨는지 본다.
const { defineConfig, devices } = require("@playwright/test");

const projects = [{ name: "chromium-mobile", use: { ...devices["Pixel 7"] } }];
if (!process.env.ONLY_CHROMIUM) projects.push({ name: "webkit-iphone", use: { ...devices["iPhone 14"] } });

module.exports = defineConfig({
  testDir: "tests",
  reporter: "list",
  use: { baseURL: "http://127.0.0.1:4173", timezoneId: "Asia/Seoul", locale: "ko-KR" },
  projects,
  webServer: { command: "python3 -m http.server 4173 --bind 127.0.0.1", url: "http://127.0.0.1:4173", reuseExistingServer: true },
});
