# 배포해봄 · TinyFriday

매주 금요일, 작은 도구 하나를 내는 프로젝트의 허브입니다. by 계산해봄 / 만든 사람: 계달희

**보기:** https://tinyfriday.github.io · **의견:** [의견 남기기](https://realoil.notion.site/7ed477dffe6746de9c07e983cb66922e) (개발자는 [이슈](https://github.com/tinyfriday/tinyfriday.github.io/issues/new/choose)) · 버전 `v0.1 (실험적)`

## 무엇을 하나

배포해봄에서 낸 도구를 한 페이지에 모읍니다. 이번 주에 무엇을 만들고 있는지, 금요일까지 며칠 남았는지 보여 줍니다.
새 도구는 `tools.json` 에 한 항목을 더하면 목록에 나타납니다.

## 알려진 한계

- 도구를 허브 안에서 실행하지 않습니다. 각 도구의 주소로 연결만 합니다
- 도구 목록은 자바스크립트로 그립니다. 자바스크립트를 끈 브라우저에서는 `tools.json` 링크만 보입니다
- 보안 헤더(CSP)는 `<meta>` 로만 겁니다. GitHub Pages 는 응답 헤더를 바꿀 수 없어서 `frame-ancestors` 같은 일부 항목은 적용되지 않습니다
- iOS 확인은 CI 의 WebKit 자동 테스트로 대신합니다. 실제 아이폰에서는 아직 보지 않았습니다
- 커스텀 도메인은 없습니다 (`tinyfriday.github.io`)

## 개인정보

방문 수는 [GoatCounter](https://www.goatcounter.com)로 셉니다. 쿠키를 쓰지 않고, 개인을 알아볼 수 있는 정보는 모으지 않습니다.

## 개발

```sh
npm install
npx playwright test   # 휴대폰 크기 Chromium·WebKit 스모크 테스트
npm run serve         # http://localhost:4173
```

`main` 에 병합되면 GitHub Pages 로 바로 공개됩니다. 그래서 `main` 병합은 금요일 배포 승인 뒤에만 합니다.

## 라이선스

[MIT](LICENSE)
