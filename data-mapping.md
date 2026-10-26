# Data Mapping 정의서 — t-template-H

`standard-template-data.json` 기준 HTML의 `data-*` 속성 매핑 정의.

원본 디자인: [udosky.kr](https://udosky.kr/) (정본) / 동일 계열 대조: [gpcaravan.co.kr](https://gpcaravan.co.kr/)

두 사이트는 같은 트립일레븐/makehome 원본의 동일 디자인이다. `index.html` 기준 클래스
어휘가 59개 중 59개 일치하고(gpcaravan 에만 레이어 팝업 마크업이 더 있다), `style.css`
차이는 58줄뿐이다. 그중 의미 있는 축은 **브랜드 포인트 색 하나**(udosky `#0187cc` /
gpcaravan `#8eb049`)라 그것만 `styles/theme.css` 토큰으로 뽑았다.

정본은 **udosky** 로 삼는다. 나머지 차이(`hd_lnb_bg` 높이 400/300px,
`ft_btn_reserve` bottom 20/80px, `sub_visual` 여백)는 사이트별 미세 조정이다.

베이스 인프라는 **t-template-G** 에서 가져왔다. 같은 트립일레븐 계열이라
`base-mapper` / `preview-handler` / `image-helpers` / `popup` / `kakao-maps-sdk` /
`header-footer-loader` 를 그대로 쓴다. **G(playbeach)의 디자인은 한 줄도 가져오지 않았다** —
CSS·마크업·UI 스크립트는 전부 udosky 원본이다.

헤더 골격은 **t-template-D2** 가 가장 가깝다(`hd_cont > hd_inner > logo/logo2 > hd_lnb >
hd_lnb01·02 > btn_hd_res > btn_menu > hd_lnb_bg > aside > aisde_inner`). D2 와 다른 점은
`logo2` 가 있다는 것뿐이다.

## 진행 현황

| 구분   | 파일                                                                                                                     | 상태                 |
| ------ | ------------------------------------------------------------------------------------------------------------------------ | -------------------- |
| 공통   | `styles/theme.css` (토큰 5개)                                                                                            | 완료                 |
| 공통   | `styles/reset.css` (udosky 원본 이식)                                                                                    | 완료                 |
| 공통   | `styles/style.css` (udosky 원본 전체 이식 + 템플릿 확장)                                                                 | 완료                 |
| 공통   | `styles/popup.css` (A/B/C2/D2/E2/G 공통본)                                                                               | 완료                 |
| 공통   | `js/` 인프라 (`base-mapper` / `preview-handler` / `image-helpers` / `popup` / `kakao-maps-sdk` / `header-footer-loader`) | G 복사본 그대로 사용 |
| 공통   | `js/common.js` (원본 `custom.js` UI 동작 + `TplSwiper`)                                                                  | 완료                 |
| 공통   | `common/header.html` + `header-footer-mapper.js`                                                                         | 완료                 |
| 공통   | `common/footer.html`                                                                                                     | 완료                 |
| 페이지 | `index.html` + `index-mapper.js` + `pages/index.js`                                                                      | 완료                 |
| 페이지 | `main.html` + `main-mapper.js` + `pages/main.js`                                                                         | 완료                 |
| 페이지 | `layout-map.html` + `layout-map-mapper.js`                                                                               | 완료                 |
| 페이지 | `room.html` + `room-mapper.js`                                                                                           | 완료                 |
| 페이지 | `facility.html` + `facility-mapper.js`                                                                                   | 완료                 |
| 페이지 | `reservation.html` + `reservation-mapper.js`                                                                             | 완료                 |
| 페이지 | `nearby-attractions.html` + `nearby-attractions-mapper.js`                                                               | 완료                 |
| 페이지 | `directions.html` + `directions-mapper.js`                                                                               | 완료                 |
| 페이지 | `404.html`                                                                                                               | 공통본 그대로 사용   |

---

## 작업 순서

1. ~~공통 (`styles/` + `common/header.html` / `common/footer.html` / `js/common.js`)~~ — 완료
2. ~~`index.html`~~ — 완료
3. ~~`main.html` — 원본 `about.html` + `view.html` 병합~~ — 완료
4. ~~`layout-map.html` — 원본 `room.html` 목록~~ — 완료
5. ~~`room.html` — 원본 `room.html?room_id=`~~ — 완료
6. ~~`facility.html` — 원본 `special1~5.html`~~ — 완료
7. ~~`reservation.html` — 원본 `reservation.html`~~ — 완료
8. ~~`nearby-attractions.html` — 원본 `travel.html`~~ — 완료
9. ~~`directions.html` — 원본 `traffic.html`~~ — 완료

각 페이지 작업 단위는 아래 4개를 한 세트로 처리한다.

- HTML: udosky 원본 마크업 + `data-*` 속성
- mapper: `js/data-mapper/pages/{page}-mapper.js`
- 스크립트: `js/pages/{page}.js` (Swiper 초기화, 원본 selector 기준)
- 이 문서의 해당 섹션

---

## 구현 원칙

A/B/C2/D2/E2/G 와 동일하다.

- 파일명과 JS 구조는 우리 템플릿 구조를 따른다. 원본 `about.html`, `view.html`, `special1~5.html`, `travel.html`, `traffic.html` 파일명은 쓰지 않는다.
- 페이지 링크는 GitHub Pages 하위 경로 배포를 위해 상대경로(`./xxx.html`)만 쓴다.
- 이미지·아이콘 등 템플릿 고정 에셋은 `images/` 에 둔다. 원본 도메인(`/assets/...`) 직접 참조 금지.
- **로고는 고정 저장하지 않는다.** `homepage.images[0].logo[isSelected]` → 숙소명 텍스트 → placeholder 3단 폴백.
- **객실 목록의 단일 소스는 `homepage.customFields.roomtypes`** 다. `BaseDataMapper.getRoomtypes()` 가 localhost/preview 두 경로를 모두 처리하므로 페이지 매퍼는 이 메서드만 쓴다.
  최상위 `rooms[]` 는 `roomtypes[i].id === rooms[j].id` 매칭으로 인원/평형/집기 등 **상세값을 조회할 때만** 사용한다.
- 각 페이지 mapper 는 `js/preview-handler.js` 의 `mapperConfig` 에 등록한다. 초기화 주체는 `preview-handler` 이고, 페이지 매퍼의 `DOMContentLoaded` 핸들러는 `if (window.previewHandler) return;` 로 빠진다.
- **렌더 게이트**: 각 HTML `<head>` 에 `html.tpl-loading body{opacity:0}` + `window.__tplReveal`(3초 타임아웃)을 둔다. 매핑 완료 시 해제해 placeholder 깜빡임(FOUC)을 막는다.
- **원본의 장식용 하드코딩 텍스트는 그대로 둔다.** 모든 영역을 매핑하지 않는다.
- 값이 비어 있으면(`''` 또는 공백 한 칸) `firstText()` 가 `trim()` 후 판단해 다음 폴백으로 넘어간다.
- Swiper 초기화는 `TplSwiper.init()` / `TplSwiper.initRoomList()` 를 거친다. 슬라이드가 `slidesPerView` 보다 적으면 `loop` 를 자동으로 끄고, `new Swiper()` 가 실패해도 같은 페이지의 다른 슬라이더 초기화를 막지 않는다.
- 넘길 슬라이드가 없으면 화살표 영역을 숨긴다 (`lockHide` 옵션).

### 원본에서 가져오지 않은 것

| 원본                                | 이유                                                                          |
| ----------------------------------- | ----------------------------------------------------------------------------- |
| `board.js` / `board_black.css`      | 예약 게시판. 템플릿은 실시간 예약 링크만 쓴다                                 |
| `#talk_custom_button` (카카오 상담) | bookingplay `tid` 하드코딩이라 데이터로 만들 수 없다. 원본도 주석 처리 상태다 |
| `.ft_kakao` (udosky 전용 플로팅)    | 위와 같은 이유. gpcaravan 에는 아예 없다                                      |
| `jquery.cookie`                     | 팝업 "오늘 하루 보지 않기" 전용. `js/popup.js` 가 자체 처리한다               |

### 원본을 고친 곳

원본 그대로 옮기면 동작이나 레이아웃이 어긋나는 자리만 손댔다. 해당 파일에 근거를 주석으로 남겼다.

| 위치                                                    | 원본                                                     | 바꾼 이유                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `common/header.html` 닫기 버튼                          | `.btn_close` 가 `.aside` 직속                            | `position:absolute` 기준 조상이 없어 스크롤 시 문서 좌상단에 남는다. `.aisde_inner`(fixed) 안으로 옮기고, 원본 CSS 에만 있고 마크업엔 없던 `.aside_box` 래퍼를 함께 살렸다                                                                                                                                                                                                                                               |
| `js/common.js` LNB hover                                | `mouseover` / `mouseout`                                 | 버블링 때문에 자식으로 옮길 때마다 껐다 켜져 깜빡인다. `mouseenter` / `mouseleave` 로 교체                                                                                                                                                                                                                                                                                                                               |
| `js/common.js` 스크롤 헤더                              | 매 스크롤마다 `fadeIn` / `fadeOut` 재호출                | 애니메이션 큐가 쌓인다. 상태가 실제로 바뀔 때만 전환                                                                                                                                                                                                                                                                                                                                                                     |
| `js/common.js` `scroll_down`                            | 로드 시점의 `.visual` 높이를 캐시                        | 반응형으로 폭이 바뀌면 엉뚱한 위치로 내려간다. 클릭 시점에 다시 잰다                                                                                                                                                                                                                                                                                                                                                     |
| `styles/style.css` `.sub1_2 .sub_img_wrap.type2 .inner` | `border-bottom` + `margin-bottom:50px`                   | 원본 view.html 은 블록이 **3개 고정**이라 가운데(`type2`) 하나에만 구분선을 둘 수 있었다. 우리는 블록 수도 장수도 가변이고 `type2` 는 "2장짜리 중 짝수 번째"라 구분선이 불규칙하게 나타난다. 규칙째 제거해 `padding-bottom:50px` 로 간격을 균일하게 맞춘다                                                                                                                                                               |
| `styles/style.css` `.wide_img img`                      | 규칙 없음 (배치도 1장 전제)                              | 배치도를 동·층별로 여러 장 올릴 수 있다. `inline` 인 채로 두면 두 장이 나란히 붙거나 줄바꿈 공백이 틈으로 남는다. `display:block` + `margin-top:20px` 으로 세로로 쌓는다                                                                                                                                                                                                                                                 |
| `styles/style.css` `.sub_location_wrap .cate_box`       | `display:table` + `table-layout:fixed` (칸 폭 균등 분할) | 객실 10개 + `미리보기` = 11칸을 1200px 에 나누면 칸당 ~109px. 긴 객실명이 오면 3줄로 줄바꿈되어 탭 바 높이가 세 배가 된다. `flex` + `flex:1 0 auto` 로 바꿔 **여유 있으면 100% 를 채우고, 모자라면 내용 폭을 지키며 가로 스크롤**한다. 원본도 640px 이하에서는 균등 분할을 포기하고 `nowrap` 으로 가므로 그 판단을 데스크톱까지 끌어올린 것이다. `overflow-x` 만 원본에 없는데, 없으면 넘친 탭에 접근할 방법이 아예 없다 |
| `styles/style.css` `.special_bnr .txt_box.no_title p`   | 소제목(`strong`)이 위쪽 간격을 만듦                      | 배너 소제목에 대응하는 데이터 필드가 없어 비워 둔다. 원본에서는 그 `strong` 의 `margin:2.3em 0 0.47em` 이 180px 사진 띠와 소개문 사이 간격을 만들고 있었으므로, 숨길 때는 `p` 가 그 간격을 대신 갖는다. `.no_title` 은 `facility-mapper` 의 `mapBanner` 가 붙인다                                                                                                                                                        |
| `styles/style.css` `.map_box .map_inner #kakao-map`     | daum roughmap 퍼가기 스크립트가 비율 상자를 채움         | 퍼가기 `key` 가 업체 고유값이라 데이터로 만들 수 없다. Kakao Maps SDK 로 대체하고, `.map_inner`(padding-bottom 비율 상자)를 채우도록 `position:absolute; inset:0` 을 준다                                                                                                                                                                                                                                                |
| `styles/style.css` `.travel_list ul li img`             | `width:100%` 만 (높이 미지정)                            | 원본은 업주가 비슷한 크기 사진을 올린다는 전제였다. 백오피스 사진은 비율이 제각각이라 2열 행 높이가 들쭉날쭉해지고, 사진이 없을 때 세우는 placeholder(800×600)는 576px 폭에서 432px 로 유독 높게 뜬다. `aspect-ratio:3/2` + `object-fit:cover` 로 카드 이미지 높이를 384px 로 맞춘다                                                                                                                                     |
| `styles/style.css` `.header .logo a`                    | `display` 없음(인라인)                                   | 원본은 `<a>` 안에 텍스트가 바로 있어 인라인이 맞았다. 우리 마크업은 자식이 전부 block(`img` / `.logo_text` / `.logo_sub`)이라, 인라인인 채로 두면 줄바꿈 공백이 `line-height` 만큼 줄 상자를 만들어 로고 높이가 두 배가 되고 헤더가 부푼다. `display:block` 으로 바꿨다                                                                                                                                                  |
| `styles/style.css` `.header .logo span` (≤860px)        | `.logo span { display:none }`                            | 원본 로고는 `이름<span>부제</span>` 라 그 선택자가 부제만 가렸다. 우리는 이름도 `.logo_text` span 이라 로고가 통째로 사라졌다. `.logo .logo_sub` 로 좁혔다                                                                                                                                                                                                                                                               |
| `styles/style.css` `.header .hd_inner` (≤860px)         | `padding:19px 0` 으로 높이를 만듦                        | 로고가 텍스트(22px)일 때는 60px 가 맞지만, 백오피스 로고 이미지가 오면 그 안에 갇혀 글자가 안 읽힌다. `height:60px` + `align-items:center` 로 고정하고 로고 이미지 상한을 45px 로 둬, 로고 종류·크기와 무관하게 헤더가 60px 로 일정하다                                                                                                                                                                                  |
| `styles/style.css` `.depth_box` 닫힘 상태               | `top:-370%` 만으로 감춤                                  | 절대 위치 요소의 `top` 백분율은 자기 높이가 아니라 부모(`.depth1`, 약 111px) 기준이라 사실상 −410px 고정이다. 객실이 많아 목록이 그보다 길면 아래쪽이 헤더 밖으로 삐져나오고, 흰 글자가 페이지 위에 그대로 보인다. `visibility` + `opacity` 를 함께 써 높이와 무관하게 닫는다                                                                                                                                            |
| `styles/style.css` `.hd_lnb_bg` / `js/common.js`        | 배경판 `height:400px` 고정, 서브메뉴 높이 제한 없음      | 객실이 많으면 메뉴가 색판 밖으로 흘러 흰 글자가 안 보인다. 배경판이 서브메뉴를 덮도록 늘리고, **15개 / 뷰포트 여유 중 작은 쪽**으로 잘라 스크롤시킨다. 15개 높이는 값을 박지 않고 15번째 항목의 실제 위치를 잰다                                                                                                                                                                                                         |
| `styles/style.css` `.btn_wrap .btn_reserve`             | 기본 `#444`, hover 브랜드색                              | 예약 버튼은 페이지의 주 CTA 라 처음부터 브랜드색이어야 한다. 기본과 hover 를 뒤집었다                                                                                                                                                                                                                                                                                                                                    |
| `styles/style.css` VIEW · 예약안내 버튼 hover           | 글자색만 바뀜                                            | 테두리는 회색 그대로라 따로 놀았다. hover 에 `border-color` 를 더해 글자와 테두리가 함께 바뀐다. 부대시설 카드는 hover 대상이 카드 전체라 그쪽에도 같은 선언을 넣어 결과를 맞췄다                                                                                                                                                                                                                                        |
| `styles/style.css` 영문 서체 14곳                       | `Arial, Helvetica, sans-serif` 하드코딩                  | 원본은 로고·히어로만 Oswald 였고 제목·라벨 14곳은 Arial 이었다. 영문 서체를 `--font-en-main` 하나로 통일하고 원본 스택을 폴백으로 남겼다. Oswald 는 한글 글리프가 없어 `var(--font-ko-main)` 을 폴백에 끼워 한글이 Noto Sans KR 로 떨어지게 했다. Oswald 가 좁아 자간 `1px` 을 함께 넣었다(음수 자간 8곳을 덮어씀)                                                                                                       |

---

## 원본 페이지 → 템플릿 파일명

| 원본 (udosky.kr)           | 템플릿                    | 데이터 소스                                  |
| -------------------------- | ------------------------- | -------------------------------------------- |
| `index.html`               | `index.html`              | `pages.index.sections[0]`                    |
| `about.html` + `view.html` | `main.html` (병합)        | `pages.main.sections[0]`                     |
| `room.html` 목록           | `layout-map.html`         | `pages.layoutMap.sections[0]`                |
| `room.html?room_id=`       | `room.html?room_id=`      | `pages.room[]` + `rooms[]`                   |
| `special1~5.html`          | `facility.html?id=`       | `pages.facility[]` + `property.facilities[]` |
| `reservation.html`         | `reservation.html`        | `pages.reservation.sections[0]`              |
| `travel.html`              | `nearby-attractions.html` | `pages.nearbyAttractions.sections[0]`        |
| `traffic.html`             | `directions.html`         | `pages.directions.sections[0]`               |

---

## 공통 — `common/header.html` + `common/footer.html`

`js/header-footer-loader.js` 가 `#header-wrap` / `#footer-wrap` 에 fetch 로 주입하고,
주입이 끝나면 `headerFooterLoaded` 이벤트로 `HeaderFooterMapper` 를 돌린다.

### 로고 (`.logo` / `.logo2`)

**로고 이미지 파일을 템플릿에 넣지 않는다.** 원본 로고는 이미지가 아니라 텍스트 2줄이다.

- `.logo` — 헤더 기본 상태. 가운데 정렬. 영문명(Oswald·브랜드색) + `.logo_sub` 한글 숙소명
- `.logo2` — 스크롤로 헤더가 축소된 상태(`.header.on`). 왼쪽 정렬. 영문명 한 줄

두 자리 모두 아래 3단으로 떨어진다 (`HeaderFooterMapper.applyLogo`).

| 순위 | 소스                                      | 결과                                                       |
| ---- | ----------------------------------------- | ---------------------------------------------------------- |
| 1    | `homepage.images[0].logo[isSelected].url` | `<img data-logo-image>` 노출, 텍스트 2줄 숨김              |
| 2    | `property.nameEn` / `property.name`       | `<img>` 숨김, `.logo_text` = 영문명 / `.logo_sub` = 한글명 |
| 3    | 둘 다 없음                                | `ImageHelpers.applyPlaceholder(img, '로고')`               |

- 영문명과 한글명이 같으면 `.logo_sub` 를 숨긴다(같은 줄 반복 방지).
- `<img>` · `.logo_text` · `.logo_sub` 는 마크업에서 기본 숨김이고 `data-property-name*` 를 달지 않는다.
  페이지 매퍼가 그 속성으로 영문명을 먼저 채우면 메뉴 이동 때마다 영문명이 잠깐 떴다가 로고 이미지로 바뀐다(깜박임).
- `.header .logo span` 이던 원본 CSS 셀렉터를 `.header .logo .logo_sub` 로 좁혔다.
  그대로 두면 새로 넣은 `.logo_text` 도 13px 회색으로 줄어든다.
- `.logo a img` / `.logo2 a img` 에 `max-height:52px` 을 걸었다 (템플릿 확장).

### 헤더 나머지

| 위치                           | `data-*`                                | 소스                                          | 비고                                                                                      |
| ------------------------------ | --------------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------- |
| favicon                        | —                                       | `homepage.images[0].logo[isSelected].url`     | `<link rel="icon">` 없으면 생성                                                           |
| `.btn_hd_res` / RESERVE 메뉴   | `[data-booking-link]`                   | `property.realtimeBookingId`                  | URL 로 보일 때만 링크. 아니면 `#!`                                                        |
| ROOMS 서브메뉴                 | `[data-rooms-submenu]`                  | `customFields.roomtypes[]`                    | "미리보기" li 뒤에 동적 생성. PC `depth_box` + 모바일 `depth_list` 양쪽                   |
| SPECIAL 서브메뉴               | `[data-special-submenu]`                | `property.facilities[]`                       | 컨테이너를 비우고 생성. `./facility.html?id=`                                             |
| ROOMS "미리보기"               | `[data-menu-id="layout-map"]`           | `pages.layoutMap.sections[0].enabled`         | 섹션 없음 / `false` 면 `<li>` 숨김 (`isLayoutMapEnabled()`)                               |
| 대메뉴 ROOMS                   | `[data-rooms-link]`                     | `pages.layoutMap.sections[0].enabled`         | 켜짐 → `layout-map.html` / 꺼짐 → 첫 객실 상세 (`getRoomsEntryLink()`)                    |
| TRAVEL 메뉴                    | `[data-travel-menu]`                    | `pages.nearbyAttractions.sections[0].enabled` | `false` 면 메뉴째 숨김                                                                    |
| `<title>` + meta               | `[data-page-title]`                     | `homepage.seo`                                | `updateMetaTags()` — 전 페이지 공통                                                       |
| 네이버 버튼 (헤더 + aside)     | `[data-homepage-socialLinks-blog]`      | `homepage.socialLinks.blog`                   | 값 없으면(null·빈 문자열·공백·키 없음) 숨김. 둘 다 없으면 래퍼(`data-social-wrap`)째 숨김 |
| 인스타그램 버튼 (헤더 + aside) | `[data-homepage-socialLinks-instagram]` | `homepage.socialLinks.instagram`              | 〃                                                                                        |

### 네이버·인스타그램 버튼 (`socialLinks`)

기준 사이트(gpcaravan · udosky) 헤더·aside 에는 없는 버튼이라 기존 오른쪽 버튼 자리에 붙였다.
네이버는 어드민 **blog** 칸(네이버 플레이스 주소)을, 인스타그램은 **instagram** 칸을 쓴다.
마크업은 `.hd_inner` 마지막 `.hd_sns` 하나이고 상태별로 CSS 위치만 바꾼다.

| 상태                        | 위치                                             | 크기 | 함께 바꾼 것                                                                                        |
| --------------------------- | ------------------------------------------------ | ---- | --------------------------------------------------------------------------------------------------- |
| 상단(스크롤 0, 1024px 이상) | LOCATION 오른쪽(`.hd_inner` 오른쪽 끝)           | 26px | `.hd_lnb02` 를 78px 왼쪽으로, 메뉴 좌우 여백 1.25em → 0.75em (로고와 RESERVE 간격 확보)             |
| 상단(861~1023px)            | 〃                                               | 22px | 밀기 64px, 메뉴 여백 0.5em, **가운데 로고를 32px 왼쪽으로** (862px 에서 로고와 RESERVE 맞닿음 방지) |
| 스크롤(`.header.on`)        | 예약하기 바로 앞 (예약하기 폭 + 14px)            | 26px | 없음                                                                                                |
| 480~860px                   | ☰ 바로 앞 (right 37px = ☰ 23 + 14)             | 24px | 없음                                                                                                |
| 479px 이하                  | 헤더에서 숨기고 **aside 맨 아래**(LOCATION 아래) | 30px | 없음 — 왼쪽 로고가 자유 폭이라 헤더에 두면 긴 로고와 겹친다. 로고 폭은 건드리지 않는다              |

- 상단 상태 보정(메뉴 여백·밀기·로고 위치)은 매퍼가 루트에 찍는 `data-social="on"` 일 때만 적용한다
  (`:has` 대신 — 일부 브라우저에서 스타일 미반영). 소셜 값이 없는 사이트는 원본 그대로다.
- `.header *{transition:all .3s}` 때문에 로드 직후·스크롤 경계에서 메뉴 줄이 밀려 보이지 않도록
  `.hd_lnb02` 의 `transition-property` 를 색 관련으로 한정했다.
- 인스타 로고(122×126)는 높이만 고정하고 폭은 비율대로(`width:auto`).
- 마크업은 링크·래퍼 모두 `style="display: none"` 으로 시작하고 `mapSocialLinks()` 가 값이 있을 때만 `href`
  (`target=_blank rel=noopener`)를 넣고 노출한다. 매퍼는 `facebook / instagram / blog / youtube` 4종을 처리하고
  H형 마크업은 blog·instagram 두 개다.
- 어드민 프리뷰 `section_update` 의 `section === 'socialLinks'` 는 `pages[page].sections[0]` 이 아니라
  `homepage.socialLinks` 에 반영하고 헤더 버튼만 다시 매핑한다.
- 기존 문제(소셜과 무관): 스크롤 상태에서 `.logo2` 영문명 텍스트가 길면 ABOUT 와 겹친다. 이번 작업에서 손대지 않았다.

### 푸터

| 위치        | `data-*`                                           | 소스                                                | 비고                                                                                                                           |
| ----------- | -------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 전화        | `[data-footer-phone-link]` / `[data-footer-phone]` | `property.contactPhone`                             | 번호 개수만큼 링크를 복제해 `\|` 로 구분. `businessInfo.businessPhone` 이 아니다                                               |
| 주소        | `[data-footer-address]`                            | `property.address` → `businessInfo.businessAddress` | 숙소 주소가 먼저다 (사업장 주소가 아니다)                                                                                      |
| 업체명      | `[data-footer-business-name]`                      | `businessInfo.businessName`                         | 값 없으면 `<p>` 째 숨김                                                                                                        |
| 대표자      | `[data-footer-representative]`                     | `businessInfo.representativeName`                   | 〃                                                                                                                             |
| 사업자번호  | `[data-footer-business-number]`                    | `businessInfo.businessNumber`                       | 〃                                                                                                                             |
| 야놀자 YBS  | `[data-ybs-wrap]` / `[data-ybs-button]`            | `property.ybsId`                                    | `https://www.yapen.co.kr/external?ypIdx=` + id. 없으면 줄째 숨김. **원본은 이 링크가 헤더가 아니라 푸터 사업자정보 줄에 있다** |
| 모바일 예약 | `[data-booking-link]`                              | `property.realtimeBookingId`                        | `.ft_btn_reserve` 플로팅 버튼                                                                                                  |

개인정보처리방침은 원본 고정 링크 그대로 둔다. COPYRIGHT 는 링크를 유지한 채 `property.tripProviderName` 으로 문구만 치환한다(아래 「카피라이트」).

---

## `index.html`

### 섹션 배정 — `pages.index.sections[0]`

블록은 `hero` / `essence` / `gallery` / `signature` / `closing` 5개, 원본 index 섹션은
`main_visual` / `main_special` / `main_room` / `main_landscape` / `main_reserve` 5개다.
다만 **1:1 로 맞지 않는다.** 부대시설·객실 두 섹션은 소스가 `pages` 가 아니라
`property.facilities[]` / `customFields.roomtypes[]` 이기 때문이다.

| 원본 섹션         | 블록      | 문구 소스                                            | 이미지 소스                                 |
| ----------------- | --------- | ---------------------------------------------------- | ------------------------------------------- |
| `.main_visual`    | `hero`    | `hero.title` → `property.nameEn`, `hero.description` | `hero.images[isSelected]`                   |
| `.main_special`   | —         | **원본 문구 + 숙소명** (배정할 블록 없음)            | `property.facilities[].images`              |
| `.main_room`      | —         | **원본 문구 + 숙소명** (배정할 블록 없음)            | `roomtypes[].images` (thumbnail → interior) |
| `.main_landscape` | `essence` | `essence.title` / `essence.description`              | `getLandscapeImages()`                      |
| `.main_reserve`   | `closing` | `closing` → 비면 `signature` 폴백                    | `closing` → `signature` → `hero` 순         |

**`gallery` 블록은 어디에서도 쓰지 않는다.** 원본 index 에 갤러리 슬라이더가 없고,
`main.html` 도 `pages.main` 을 쓰기 때문에 이 블록이 갈 자리가 없다.
`signature` 는 `.main_reserve` 의 폴백으로만 등장한다.

### 눈썹/본문 두 슬롯 배분 (`pickCopy`)

`.landscape_box` / `.reserve_box` 의 `strong` 은 영문 한 줄짜리 디스플레이 슬롯이고
(원본 "Outside View" / "Healing & Rest"), `p` 는 15px 회색 여러 줄이다.

어느 쪽에 무엇이 들어올지 `title` / `description` **이름만으로는 정해지지 않는다.**
실제 백오피스 데이터가 블록마다 엇갈린다.

- `essence` : `title` = 150자 한글 문단 / `description` = "Stay Close To Every Season"
- `gallery` : `title` = "Preview" / `description` = 빈 값

그래서 이름 대신 **길이**로 가른다. 긴 문단이 한 줄짜리 디스플레이 자리에 들어가
레이아웃을 무너뜨리는 사고가 훨씬 크게 티가 나기 때문이다.

- 둘 다 있으면 **짧은 쪽이 눈썹(`strong`), 긴 쪽이 본문(`p`)**
- 하나만 있으면 길이로 판단 (30자 이하면 눈썹, 넘으면 본문)
- 값이 없는 슬롯은 요소째 숨긴다 (빈 `strong` / `p` 를 남기면 원본 margin 때문에 빈 줄이 생긴다)

### 섹션별 상세

#### `.main_visual` ← `hero`

| 위치                 | `data-*`                        | 소스                      | 폴백 / 비고                                   |
| -------------------- | ------------------------------- | ------------------------- | --------------------------------------------- |
| `.visual_txt span`   | —                               | —                         | **"WELCOME TO PENSION" 고정.** 대응 필드 없음 |
| `.visual_txt strong` | `[data-index-hero-title]`       | `hero.title`              | → `property.nameEn`                           |
| `.visual_txt p`      | `[data-index-hero-description]` | `hero.description`        | 폴백 없음. 비면 `<p>` 째 숨김 (`nl2br` 적용)  |
| 슬라이드             | `[data-index-hero-slides]`      | `hero.images[isSelected]` | `<div class="swiper-slide">` 배경 이미지      |

이미지가 하나도 없으면 100vh 빈 화면이 되므로 placeholder 슬라이드 한 장을 세운다.
`.visual .arw_box` 는 넘길 게 없으면 `lockHide` 로 숨긴다.

#### `.main_special` ← `property.facilities[]`

`title_box p` = `"{숙소명}의 부대시설과 특장점을 확인해 보세요."` (원본 문장 + 숙소명)

카드 1장 = `.swiper-slide.box > a.link + .img(배경) + .txt_box`

| 위치                        | 소스                      | 비고                                                   |
| --------------------------- | ------------------------- | ------------------------------------------------------ |
| `.img`                      | `facilities[i].images[0]` | 배경 이미지. 없으면 placeholder                        |
| `strong > span.special_txt` | —                         | `SPECIAL 01`… **카드 순번이지 데이터가 아니다**        |
| `strong` 본문               | `facilities[i].nameEn`    | 없으면 `name` 을 올린다 (빈 줄 방지)                   |
| `p`                         | `facilities[i].name`      | `nameEn` 이 없거나 `name` 과 같으면 비운다 (반복 방지) |
| `a.link` / `a.btn_more`     | `facilities[i].id`        | `./facility.html?id={id}`                              |

#### `.main_room` ← `customFields.roomtypes[]`

`title_box p` = `"안락하게 준비된 {숙소명}의 객실입니다."` (원본 문장 + 숙소명)

카드 1장 = `.swiper-slide.box > .img(배경) + .room_inner_wrap > .room_inner_box`

| 위치         | 소스                                          | 비고                                                                        |
| ------------ | --------------------------------------------- | --------------------------------------------------------------------------- |
| `.img`       | `getRoomThumbUrl()` — thumbnail → interior[0] | 배경 이미지. 없으면 placeholder                                             |
| `strong`     | `getRoomMenuLabel(item)`                      | 그룹이면 그룹명. 넘치면 `...` 이므로 `title` 속성에 전체 문구               |
| `p`          | `formatRoomStructure(findRoomById(rt.id))`    | 예) `"원룸형/ 침대룸 화장실 주방"`. 없어도 요소는 남긴다 (카드 높이 일관성) |
| `a.btn_more` | `getRoomMenuLink(item)`                       | `./room.html?room_id={id}`                                                  |

base 의 공용 `renderRoomSlides()` 는 G 마크업(`a.link + .img > img + strong + p + em`)을
만들어 H 구조와 맞지 않는다. `IndexMapper.mapRoomSlides()` 가 직접 만든다.

#### `.main_landscape` ← `essence` + 외경 이미지

원본은 외경 페이지(`view.html`)로 보내는 섹션이라 **사진 소스도 외경**이다.
문구만 `essence` 에서 가져오고 이미지는 `getLandscapeImages()`
(`pages.main.about[]` → `main.hero` → `property.images[0].exterior` 순)를 쓴다.

| 위치            | `data-*`                             | 소스                         | 폴백 / 비고                            |
| --------------- | ------------------------------------ | ---------------------------- | -------------------------------------- |
| `title_box p`   | `[data-index-landscape-lead]`        | —                            | `"여유를 만끽하는 힐링 플레이스"` 고정 |
| `.img_box`      | `[data-index-landscape-image]`       | `getLandscapeImages()[0]`    | 배경 이미지                            |
| `strong`        | `[data-index-landscape-title]`       | `pickCopy(essence).eyebrow`  | → `"Outside View"`                     |
| `p`             | `[data-index-landscape-description]` | `pickCopy(essence).body`     | 비면 숨김 (`nl2br`)                    |
| `ul > li > img` | `[data-index-landscape-thumbs]`      | `getLandscapeImages()[1..3]` | 최대 3장. 큰 사진과 겹쳐 쓰지 않는다   |
| `a.btn_more`    | —                                    | —                            | `./main.html` 고정                     |

이미지가 한 장도 없어도 **섹션을 숨기지 않고 큰 자리에 placeholder 를 세운다.**
영역이 통째로 사라지면 편집자가 이 자리가 있다는 것 자체를 모른다.
썸네일은 큰 사진 다음 장부터라 사진이 0~1장이면 목록이 빈다 — 큰 자리 하나로
영역을 알리기에 충분해 썸네일까지 placeholder 로 채우지는 않는다.

#### `.main_reserve` ← `closing`

| 위치              | `data-*`                           | 소스                         | 폴백 / 비고                                                     |
| ----------------- | ---------------------------------- | ---------------------------- | --------------------------------------------------------------- |
| `title_box p`     | `[data-index-reserve-lead]`        | `property.name`              | `"편안한 여행을 위한 공간, {숙소명}과 함께하세요."`             |
| `.img_box`        | `[data-index-reserve-image]`       | `closing.images[0]`          | → `signature.images[0]` → `hero.images[0]`                      |
| `strong`          | `[data-index-reserve-title]`       | `pickCopy(closing).eyebrow`  | `closing` 이 비면 `signature`. 그래도 없으면 `"Healing & Rest"` |
| `p`               | `[data-index-reserve-description]` | `pickCopy(closing).body`     | 비면 숨김 (`nl2br`)                                             |
| `.btn_wrap a` (1) | —                                  | —                            | `./reservation.html` 고정                                       |
| `.btn_wrap a` (2) | `[data-booking-link]`              | `property.realtimeBookingId` | 실시간예약                                                      |

이 섹션은 문구가 본체라 사진이 없어도 섹션을 숨기지 않고 placeholder 로 남긴다.

`"{숙소명}과/와"` 는 `withJosa(name, '과/와')` 로 받침에 따라 갈린다.
`"{숙소명}의"` 는 받침과 무관하므로 `withJosa` 를 쓰지 않는다.

### 슬라이더 (`js/pages/index.js`)

매퍼가 슬라이드를 만든 뒤 `IndexMapper.mapPage()` 끝에서 `window.initIndexSwipers()` 를 부른다.
옵션은 원본 `custom.js` 를 그대로 따른다. **세 슬라이더 모두 한 장씩 넘긴다.**
부대시설·객실 카드가 여러 열로 깔리는 건 서브페이지(`sub_room_detail` / `sub_special_detail`) 옵션이다.

| 대상            | 원본 옵션  | 값                                                           | `lockHide` 대상          |
| --------------- | ---------- | ------------------------------------------------------------ | ------------------------ |
| `.main_visual`  | `swiper`   | `effect: fade` / `loop` / `autoplay 4000` / `spaceBetween 0` | `.main_visual .arw_box`  |
| `.main_special` | `sld_opt3` | `spaceBetween 30` / `loop`                                   | `.main_special .arw_box` |
| `.main_room`    | `sld_opt1` | `spaceBetween 30` / `loop` / `effect: fade`                  | `.main_room .arw_box`    |

`.main_room .arw_box` 는 흰 배경 + 위쪽 테두리를 가진 카드 안 요소라
넘길 게 없을 때 남겨 두면 빈 흰 띠가 보인다. 그래서 `lockHide` 대상이다.

---

## `main.html` — 원본 `about.html` + `view.html` 병합

원본은 ABOUT 메뉴 아래 두 페이지였다.

- `about.html` (`#content.sub1_1.sub_about`) — 펜션소개
- `view.html` (`#content.sub1_2.sub_view`) — 외경보기

템플릿은 이 둘을 `main.html` 하나로 합친다. **골격은 `view.html` 을 쓰고**,
`about.html` 에서는 두 블록만 가져온다.

### 원본 블록별 처리

| 원본         | 블록                             | 처리                       | 근거                                                                |
| ------------ | -------------------------------- | -------------------------- | ------------------------------------------------------------------- |
| `view.html`  | `.sub_visual.visual` (히어로)    | **가져옴** (대제목만 교체) | 슬라이더형 히어로. `LANDSCAPE` → `ABOUT`                            |
| `view.html`  | `.sub_location_wrap` (탭)        | **가져옴** (항목 1개로)    | '펜션소개' 하나만. 아래 「탭」 참고                                 |
| `about.html` | `.sub_title_box` (환영 제목)     | **가져옴**                 | 원본에서 소개 배너와 붙어 있던 한 쌍이다                            |
| `about.html` | `.sub_wide_bnr` (소개 배너)      | **가져옴**                 | `hero` 블록이 들어가는 자리                                         |
| `view.html`  | `.sub_title_box` (`LANDSCAPE`)   | **가져옴**                 | 외경 블록의 제목                                                    |
| `view.html`  | `.sub_img_wrap` × 3              | **가져옴** (개수 가변)     | `about[]` 블록이 들어가는 자리                                      |
| `view.html`  | `.view_wide_bnr` (마무리 배너)   | **가져옴**                 | 문구는 숙소명 + 고정                                                |
| `about.html` | `.sub_visual_wide` (히어로)      | 버림                       | view 의 슬라이더형 히어로를 쓴다. 한 페이지에 히어로가 둘일 수 없다 |
| `about.html` | `.location_box` (빵부스러기)     | 버림                       | 서브페이지가 한 단계뿐이라 보여 줄 경로가 없다                      |
| `about.html` | `SOMETHING SPECIAL` 특장점 3블록 | 버림                       | `facility.html` 이 담당한다. 두면 두 페이지가 겹친다                |
| 양쪽         | '외경보기' 탭                    | 버림                       | 한 페이지가 되어 같은 곳을 가리키게 된다                            |

`#content` 클래스는 `sub1_2 sub_view`(view.html 것)를 유지한다. 원본 CSS 에
`.sub1_2` 스코프 규칙이 여럿 있어 골격을 따라간다 (아래 `.sub_img_wrap` 참고).
`about.html` 의 `.sub1_1` 스코프 규칙(`.sub_img_wrap:nth-of-type(odd)` 배경색)은
따라오지 않는다.

### 데이터가 들어오는 자리는 두 곳뿐이다

`pages.main.sections[0]` 의 블록이 `hero` / `about[]` 둘뿐이라
(index 의 5블록과 다르다) 나머지 영역은 전부 **숙소명 + 고정 문구**다.

| 화면 영역                                                   | 데이터                                    |
| ----------------------------------------------------------- | ----------------------------------------- |
| 소개 배너 (반투명 상자)                                     | `hero.title` / `hero.description`         |
| 그 아래 이미지 블록 × N                                     | `about[i].title` / `about[i].description` |
| 히어로 `ABOUT` / 환영 제목 / `LANDSCAPE` 제목 / 마무리 배너 | 없음 — 숙소명 + 고정 문구                 |

### 탭 (`.sub_location_wrap`)

탭(`.sub_location_wrap .cate_box`)은 **'펜션소개' 하나만** 남긴다. 두 페이지가
한 페이지가 되었으므로 '외경보기' 탭은 두지 않는다 — 남기면 같은 페이지를 가리킨다.
헤더 ABOUT 서브메뉴도 '펜션소개' 하나뿐이다.

**탭을 남기는 이유는 메뉴 표시 때문만이 아니다.** `.sub_visual + .sub_location_wrap`
의 `margin-top:-48px` 이 히어로 위로 올라타면서 히어로와 아래 소개 배너 사이를
끊어 준다. 빼면 100vh 히어로 바로 밑에 520px 배너가 붙어 경계가 사라진다.

`.cate_box` 는 `display:table; table-layout:fixed; width:100%` 라 항목이 하나면
그 하나가 전체 폭을 차지한다. `.on` 이 붙어 흰 띠가 되고, 그게 구분선 역할을 한다.

원본 `about.html` 에는 빵부스러기(`.location_box` — 홈 > ABOUT > 펜션소개)도 있었지만
가져오지 않았다. 서브페이지가 한 단계뿐이라 경로를 보여 줄 것이 없다.

`#content` 클래스는 `sub1_2 sub_view` (view.html 것)를 유지한다. `js/common.js` 가
`#content` 클래스로 슬라이더 옵션을 가르지는 않지만, 원본 CSS 가 이 클래스를 기준으로
잡는 규칙이 있어 골격을 따라간다.

### 섹션 배정 — `pages.main.sections[0]`

| 섹션                    | 블록      | 문구 소스                         | 이미지 소스                   |
| ----------------------- | --------- | --------------------------------- | ----------------------------- |
| `.sub_visual`           | —         | **원본 문구 + 숙소명**            | `property.images[0].exterior` |
| `.sub_title_box` (환영) | —         | **원본 문구 + 숙소명**            | —                             |
| `.sub_wide_bnr`         | `hero`    | `hero.title` / `hero.description` | `hero.images[0]`              |
| `.sub_img_wrap` × N     | `about[]` | `about[i].title` / `.description` | `about[i].images`             |
| `.view_wide_bnr`        | —         | **원본 문구 + 숙소명**            | `exterior` 마지막 장          |

**이미지 소스가 서로 겹치지 않는다.** `hero.images` 는 소개 배너 배경 전용,
`about[].images` 는 외경 블록 전용, 히어로 슬라이더는 `exterior` 를 쓴다.
한 장을 두 자리에 겹쳐 쓰지 않는다 (배경으로만 재사용하는 `.view_wide_bnr` 는 예외).

### `.sub_visual` — 히어로 슬라이더

배정할 블록이 없다. 원본 `view.html` 히어로가 외경 사진 슬라이더였으므로
`property.images[0].exterior` 를 그대로 쓴다.

| 위치                 | `data-*`                         | 소스              | 폴백 / 비고                               |
| -------------------- | -------------------------------- | ----------------- | ----------------------------------------- |
| `.visual_txt span`   | `[data-property-name-en]`        | `property.nameEn` |                                           |
| `.visual_txt strong` | —                                | —                 | **`ABOUT` 고정.** 원본은 `LANDSCAPE` 였다 |
| `.visual_txt p`      | `[data-main-visual-description]` | `property.name`   | `"{숙소명}을(를) 소개합니다."`            |
| 슬라이드             | `[data-main-visual-slides]`      | `exterior`        | → `about[]` 전체 이미지 → `hero.images`   |

대제목을 `ABOUT` 으로 바꾼 건 about 과 합친 페이지이기 때문이다. 헤더 메뉴에서
이 페이지로 오는 경로가 'ABOUT > 펜션소개' 하나뿐이라 `LANDSCAPE` 는 맞지 않는다.

`"{숙소명}을/를"` 은 `withJosa(name, '을/를')` 로 받침에 따라 갈린다.
사진이 하나도 없으면 100vh 빈 화면이 되므로 placeholder 슬라이드 한 장을 세운다.

### `.sub_title_box` (환영 제목) — 배정할 블록 없음

원본 `about.html` 에서 소개 배너 바로 위에 있던 제목이다.

| 위치 | `data-*`                   | 소스              | 비고                                 |
| ---- | -------------------------- | ----------------- | ------------------------------------ |
| `h3` | `[data-property-name-en]`  | `property.nameEn` |                                      |
| `p`  | `[data-main-welcome-lead]` | `property.name`   | `"{숙소명}에 오신 것을 환영합니다."` |

**이 블록이 히어로와 소개 배너 사이 여백도 만든다.** `.sub_title_box` 의
`padding:100px 0 30px` 이 그 역할이라, 이걸 빼면 탭 흰 띠에 520px 배너가 그대로
붙는다. 별도의 `margin` 확장 규칙을 두지 않는 이유다.

숙소명이 한글·영문 모두 없으면 빈 여백만 170px 남으므로 `[data-main-welcome]`
블록째 숨긴다.

### `.sub_wide_bnr` ← `hero` — 숙소 소개 배너

배경사진 위 **우측에 반투명 흰 상자**(`rgba(255,255,255,0.8)`, 340px)가 얹히고
그 안에 인사말 + 소개문이 들어간다.

| 위치     | `data-*`                        | 소스               | 폴백 / 비고                           |
| -------- | ------------------------------- | ------------------ | ------------------------------------- |
| 배경     | `[data-main-intro]`             | `hero.images[0]`   | → `property` `exterior` → `thumbnail` |
| `strong` | `[data-main-intro-title]`       | `hero.title`       | → `"Welcome to {영문 숙소명}"`        |
| `p`      | `[data-main-intro-description]` | `hero.description` | 폴백 없음. 비면 숨김 (`nl2br`)        |

**여기서는 `pickCopy`(길이 기준 눈썹/본문 배분)를 쓰지 않는다.** 원본에서 두 슬롯의
역할이 명확하기 때문이다 — `strong` 은 25px 인사말, `p` 는 14px 소개 문단이다.

#### `"Welcome to ~"` 는 데이터가 아니라 폴백이다

`hero.title` 이 비어 있을 때만 `"Welcome to " + 영문 숙소명` 이 들어간다.

```js
this.firstText(hero.title, nameEn ? 'Welcome to ' + nameEn : '');
```

백오피스에서 `title` 에 값을 넣으면 **그 문구가 통째로 대체한다.** 예를 들어
`"자연 속의 하루"` 를 넣으면 `"Welcome to ~"` 는 사라지고 그 문구가 25px 로 올라온다.
화면에 `"Welcome to ~"` 가 보인다고 그게 저장된 값인 것은 아니다.

영문 숙소명까지 없으면 `"Welcome to "` 만 남지 않도록 폴백 자체를 `''` 로 떨어뜨린다.
`strong` 은 빈 값이면 요소째 숨는다.

`description` 은 **폴백이 없다.** 비우면 `<p>` 째 숨긴다 — 백오피스에서 의도적으로
비운 값을 다른 데이터로 되살리지 않는다.

사진도 문구도 하나도 없으면 배너째 숨긴다. 520px 짜리 빈 상자가 남는 것보다 낫다.

### `.sub_img_wrap` × N ← `about[]`

**블록 개수도 블록당 사진 수도 백오피스에서 정해진다.** 원본 마크업의 4블록
(2장 + 2장 + 2장 + 1장)에 맞추지 않고 데이터 개수만큼 생성한다.

#### 전폭 한 줄과 2열 한 줄을 번갈아 쓴다

| 클래스   | `li` 폭   | 쓰임                         |
| -------- | --------- | ---------------------------- |
| `.type3` | 100%      | 전폭 한 줄 (1장)             |
| (기본)   | 67% + 32% | 2열 한 줄 — 큰 것 왼쪽       |
| `.type2` | 32% + 67% | 2열 한 줄 — 기본의 좌우 반전 |

⚠️ **`.type1`(33.3% 3열)은 쓰지 않는다.** 그건 우리가 가져오지 않은 `about.html` 의
`SOMETHING SPECIAL` 섹션 것이고, 골격을 가져온 `view.html` 에는 없다.

한 블록의 사진을 **전폭 → 2열 → 전폭 → 2열** 순으로 나눠 담는다.

| 장수 | 배치                    |
| ---- | ----------------------- |
| 1장  | 전폭                    |
| 2장  | 2열                     |
| 3장  | 전폭 · 2열              |
| 4장  | 전폭 · 2열 · 전폭       |
| 5장  | 전폭 · 2열 · 2열        |
| 6장  | 전폭 · 2열 · 전폭 · 2열 |

**남은 사진이 딱 2장인데 전폭 차례면 2열로 바꾼다.** 그러지 않으면 2장짜리 블록이
전폭 두 줄로 쪼개져 리듬이 깨진다(5장이 `전폭 · 2열 · 2열` 로 끝나는 이유다).

2열 줄은 기본 / `type2` 를 번갈아 써 좌우 리듬을 만든다. 그 순번은 **블록을 넘어서도
이어진다** — 블록마다 초기화하면 같은 방향이 연달아 나온다.

블록의 문구는 그 블록의 **첫 줄에만** 붙는다.

#### 문구

| 위치     | 소스                         | 비고                          |
| -------- | ---------------------------- | ----------------------------- |
| `strong` | `pickCopy(about[i]).eyebrow` | 23px 한 줄. 짧은 쪽           |
| `p`      | `pickCopy(about[i]).body`    | 15px 여러 줄. 긴 쪽 (`nl2br`) |

#### 원본에서 `.txt` 는 장식이었다

원본 `view.html` 의 블록 구성은 이랬다.

| 블록                 | 이미지 | `.txt`             |
| -------------------- | ------ | ------------------ |
| `sub_img_wrap`       | 2장    | 있음 (좌측 정렬)   |
| `sub_img_wrap type2` | 2장    | **없음**           |
| `sub_img_wrap type3` | 1장    | 있음 (가운데 정렬) |

세 블록 중 두 곳에만 붙는 **장식용 영문 캡션**이었고, 내용도 "Clean & Cozy, …" 같은
문구였다. 그래서 원본은 이 자리를 흐리게 깔았다 — `.sub1_2` 스코프가 본문을
`12px` `#ccc`(명암비 1.6:1), 눈썹을 `19px` `#aaa` 로 덮는다.

**이 값을 원본 그대로 둔다.** 우리는 같은 자리에 백오피스에서 입력한
`about[].description` 을 넣으므로 본문으로 읽히지는 않는다. 그 점을 알고도
디자인 톤을 우선한 결정이다. (한 번 `15px` `#666` 으로 올렸다가 원본과 인상이
너무 달라져 되돌렸다.)

⚠️ 업주가 이 자리에 긴 소개문을 넣으면 사실상 보이지 않는다. 읽히는 본문이
필요해지면 `.sub1_2 .sub_img_wrap .txt p` 의 `font-size` / `color` 오버라이드를
걷어내면 기본값(`15px` `#666`)이 적용된다.

`.type3` 의 가운데 정렬(`.sub1_2 .sub_img_wrap.type3 .txt`)은 **원본 그대로 둔다.**
1장짜리는 이미지가 100% 폭이라 문구를 좌측에 붙이면 허전해진다 — 의도가 분명하다.

`.sub_img_wrap .txt` 는 index 의 `.landscape_box` 와 같은 구조라 **`pickCopy` 를 쓴다.**
`title` / `description` 중 어느 쪽이 짧은 인사말이고 어느 쪽이 본문인지 이름만으로는
정해지지 않기 때문이다(index 「눈썹/본문 두 슬롯 배분」 참고).

#### 빈 값 처리

- 문구가 둘 다 비면 `.txt` 를 만들지 않는다 (`margin-top:15px` 짜리 빈 칸 방지).
- **사진이 없어도 블록을 세운다.** 문구만 있으면 placeholder 한 칸 + 그 문구,
  `about[]` 이 아예 비었으면 placeholder 블록 하나를 만든다.
  제목(`.sub_title_box`)도 항상 남는다 — 영역이 사라지면 편집자가 이 자리가
  있다는 것 자체를 모른다.

이 블록의 제목 `.sub_title_box` 는 `h3` = **`LANDSCAPE` 고정**, `p` =
`"{숙소명}의 외부 전경입니다."` 다 (원본 `view.html` 문장 + 숙소명).
`h3` 에 영문 숙소명을 쓰지 않는 건 **위 환영 제목이 이미 영문 숙소명**이기 때문이다 —
한 페이지에 같은 이름이 두 번 크게 나오지 않게 한다.

### `.view_wide_bnr` — 마무리 배너

배정할 블록이 없어 숙소명 + 원본 고정 문구다.

| 위치     | `data-*`                    | 소스                       | 비고                                  |
| -------- | --------------------------- | -------------------------- | ------------------------------------- |
| 배경     | `[data-main-closing]`       | `exterior` **마지막 장**   | → `about[]` 마지막 → `hero.images[0]` |
| `strong` | `[data-main-closing-title]` | `property.nameEn` → `name` | `"Welcome To {영문 숙소명}"`          |
| `p`      | —                           | —                          | 원본 문구 고정                        |

배경에 **마지막 장**을 쓰는 이유는, 첫 장을 쓰면 같은 페이지 위쪽 히어로 슬라이더의
첫 화면과 같은 사진이 두 번 보이기 때문이다.

### 슬라이더 (`js/pages/main.js`)

원본 `custom.js` 는 히어로를 `.visual .swiper-container` 로 잡는다. index 의
`.main_visual.visual` 과 이 페이지의 `.sub_visual.visual` 이 같은 선택자에 걸리므로
옵션도 동일하다.

| 대상          | 값                                                           | `lockHide` 대상        |
| ------------- | ------------------------------------------------------------ | ---------------------- |
| `.sub_visual` | `effect: fade` / `loop` / `autoplay 4000` / `spaceBetween 0` | `.sub_visual .arw_box` |

---

## `layout-map.html` (원본 `room.html` 목록)

원본 `room.html` 은 목록(`?room_id=` 없음)과 상세(`?room_id=…`)를 한 파일이 겸했다.
템플릿은 목록을 `layout-map.html`, 상세를 `room.html` 로 나눈다.

```
.sub_visual_wide (sub2_1)  고정 배경 ← hero.images[0]   (원본도 슬라이더가 아니다)
                           strong `ROOMS` / p `{숙소명}, 객실 미리보기`  ← 고정
.sub_location_wrap         빵부스러기 + 객실 탭 ← renderRoomNav()
.sub_cont.inner
  ├ .sub_title_box         배치도 제목 ← hero.title / hero.description
  ├ .wide_img              배치도 이미지 ← about.images[]  (여러 장 세로 적층)
  └ .main_room             객실 카드 ← roomtypes (index 와 같은 렌더러)
```

### 섹션 배정 — `pages.layoutMap.sections[0]`

| 섹션               | 블록    | 문구 소스                         | 이미지 소스      |
| ------------------ | ------- | --------------------------------- | ---------------- |
| `.sub_visual_wide` | `hero`  | **고정 문구 + 숙소명**            | `hero.images[0]` |
| `.sub_title_box`   | `hero`  | `hero.title` / `hero.description` | —                |
| `.wide_img`        | `about` | —                                 | `about.images[]` |
| `.main_room`       | —       | **원본 문구 + 숙소명**            | `roomtypes[]`    |

⚠️ `main` 의 `about` 은 **배열**(블록 여러 개)이지만 여기 `about` 은 **단일 객체**다.
같은 이름이라 헷갈리기 쉽다.

#### `hero` 블록은 사진과 문구가 서로 다른 자리로 간다

| `hero` 의 필드                | 들어가는 자리                     |
| ----------------------------- | --------------------------------- |
| `hero.images[0]`              | `.sub_visual_wide` 배경           |
| `hero.title` / `.description` | `.sub_title_box` (배치도 위 제목) |

**히어로 사진 위 문구(`strong` / `p`)는 고정이다** — `ROOMS` /
`"{숙소명}, 객실 미리보기"`. index / main 히어로와 같은 처리다.

사진 위에 얹히는 38px 흰 대제목 자리라, 업주가 넣은 긴 문장이 들어가면 배경을 가리고
줄바꿈이 무너진다. 그래서 `hero` 블록의 문구는 **흰 지면 위 45px 제목**인
`.sub_title_box` 에서 받는다. 여기는 길이가 늘어도 레이아웃이 버틴다.

`about.title` / `about.description` 은 **쓰지 않는다.** 배정할 자리가 없다 —
`about` 은 배치도 이미지 공급원이다.

### `data-*` 매핑

| `data-*`                            | 요소                         | JSON 경로            | 폴백                                                |
| ----------------------------------- | ---------------------------- | -------------------- | --------------------------------------------------- |
| `[data-layoutmap-hero]`             | `.sub_visual_wide` 배경      | `hero.images[0]`     | 객실 썸네일 첫 장 → `exterior` → `thumbnail`        |
| `[data-layoutmap-hero-title]`       | 히어로 `strong`              | —                    | `ROOMS`                                             |
| `[data-layoutmap-hero-description]` | 히어로 `p`                   | —                    | `"{숙소명}, 객실 미리보기"`                         |
| `[data-layoutmap-room-nav]`         | `.cate_box`                  | `getRoomMenuItems()` | `미리보기` li 는 정적, 뒤에 생성                    |
| `[data-layoutmap-title]`            | `.sub_title_box h3`          | `hero.title`         | `PREVIEW`                                           |
| `[data-layoutmap-description]`      | `.sub_title_box p`           | `hero.description`   | `"{숙소명}의 객실을 미리 만나보세요."`              |
| `[data-layoutmap-images]`           | `.wide_img`                  | `about.images[]`     | placeholder (**영역 유지**)                         |
| `[data-layoutmap-room-lead]`        | `.main_room .title_box p`    | —                    | `"안락하게 준비된 {숙소명}의 객실입니다."` **고정** |
| `[data-layoutmap-room-slides]`      | `.room_list .swiper-wrapper` | `roomtypes[]`        | `renderRoomSlides()` 공용 렌더러                    |

### 이 페이지에는 Swiper 를 만들지 않는다

`.sub2_1` 스코프가 `.room_list` 를 **2열 float 그리드**로 바꾼다.

```css
.sub2_1 .main_room .swiper-wrapper {
  transform: none;
  display: block;
}
.sub2_1 .room_list .box {
  float: left;
  width: 48%;
  margin-bottom: 50px;
}
.sub2_1 .room_list .arw_box {
  display: none;
}
```

원본 `custom.js` 도 `#content.sub2_1` 이면 Swiper 를 만들지 않고 인라인 스타일만
지운다. 우리는 슬라이드를 직접 만들면서 인라인 스타일을 넣지 않으므로 지울 것도 없다.
그래서 `js/pages/layout-map.js` 자체가 없다.

`.arw_box` 마크업은 원본 그대로 남긴다 — CSS 가 숨기고, 다른 페이지와 구조를 맞춘다.

### 배치도는 여러 장을 받는다

원본은 배치도가 `<img src="layout.webp">` 한 장이라 `.wide_img` 에 CSS 규칙이
아예 없었다. 숙소에 따라 동·층별로 여러 장을 올리므로 `isSelected` 순서대로
**전부** 세로로 쌓는다. 그 적층을 위해 규칙을 더했다 (「원본을 고친 곳」 참고).

**이미지가 없어도 영역을 유지하고 placeholder 를 세운다.** 배치도는 이 페이지의
본 목적이라, 비었다고 숨기면 객실 목록만 남는 페이지가 된다.
(`room.html` 의 평면도는 부가 정보라 반대로 숨긴다)

### `enabled: false` → 404 리다이렉트

```js
if (!section || section.enabled === false) {
  if (!this.isPreviewMode()) {
    window.location.href = '404.html';
    return;
  }
}
```

헤더의 `미리보기` li 도 `header-footer-mapper` 가 같은 기준
(`pages.layoutMap.sections[0].enabled`)으로 숨긴다.

**대메뉴 `ROOMS`(`[data-rooms-link]`)는 이 값에 따라 이동처가 갈린다.** — `getRoomsEntryLink()`

| `layoutMap` | ROOMS 클릭 시                                     |
| ----------- | ------------------------------------------------- |
| 켜짐        | `layout-map.html` (객실 배치도)                   |
| 꺼짐        | 첫 번째 객실 상세 (헤더 객실 메뉴 첫 항목과 같음) |

꺼진 상태에서 그대로 두면 `layout-map.html` 이 404 로 튕긴다. 판정은 이 페이지의 404 기준과 같은
`isLayoutMapEnabled()`(섹션 없음 / `enabled:false` → 꺼짐)를 쓴다. 객실이 하나도 없으면 원래 href 를 둔다.
`room.html` 의 객실 탭 첫 칸 `미리보기` 도 꺼져 있으면 숨긴다.

**백오피스 preview 에서는 리다이렉트하지 않는다.** 편집자가 이 페이지를 끈 상태에서도
내용을 보고 다시 켤 수 있어야 하는데, 404 로 튕기면 그게 불가능하다.

⚠️ `window.previewHandler` 로 판별하면 안 된다 — 항상 존재한다. `isPreviewMode()` 를 쓴다.

### 객실 그룹 규칙

객실 탭(`.cate_box`)과 객실 카드가 **헤더 ROOMS 메뉴와 같은 규칙**을 쓴다.

| `roomtypes[].groupName` | 탭 / 카드 제목 | 링크                    |
| ----------------------- | -------------- | ----------------------- |
| 하나도 없음             | 객실명         | 그 객실 상세            |
| 있음                    | **그룹명**     | **그룹의 첫 객실 상세** |

`getRoomMenuItems()` 가 같은 그룹명끼리 한 항목으로 접고, `getRoomMenuLabel()` /
`getRoomMenuLink()` 가 표시명과 링크를 준다. 그룹이 없는 객실은 객실명 그대로 남는다.

객실명은 `roomtypes[].name` 이 비어 있는 응답이 흔해 같은 `id` 의 `rooms[].name`
으로 폴백한다 (`getRoomtypeName()`).

---

## `room.html` (원본 `room.html?room_id=`)

원본은 목록과 상세를 한 파일이 겸했다. 목록은 `layout-map.html` 로 분리하고
이 파일은 상세(`#content.sub2_2.sub_room.sub_room_detail`)만 맡는다.

```
.sub_visual.visual        객실 사진 슬라이더 + 객실명 / 구조
.sub_location_wrap        객실 탭 ← renderRoomNav(sel, currentId)
.sub_cont
  ├ .sub_title_box        객실명 / 구조 (히어로와 같은 값)
  ├ .table_box.inner      객실 정보 표(PC 5열 / 모바일 4열) + 집기품목 + 예약 버튼
  ├ [평면도]              ← 데이터가 있을 때만. 없으면 영역째 숨김
  ├ .sub_img_wrap × N     객실 상세 이미지 (2장씩 끊어 생성)
  └ .sub_room_detail_box  다른 객실 목록 슬라이더 (3열)
```

### 데이터 소스 — `pages.room[]` 은 쓰지 않는다

**`pages.room[]` 은 빈 배열로 내려오는 응답이 흔하다** (현재 샘플도 `[]`).
상세 내용은 전부 아래 둘에서 온다.

| 소스                               | 담당                                   |
| ---------------------------------- | -------------------------------------- |
| `customFields.roomtypes[i].images` | 히어로 슬라이더 / 상세 이미지 / 평면도 |
| 최상위 `rooms[j]`                  | 객실명 · 인원 · 평형 · 구조 · 집기품목 |

둘은 같은 `id` 로 잇는다 (`findRoomById`). `roomtypes[i]` 에는 `id` 와 `images`
밖에 없는 응답이 흔해, 이름조차 `rooms[j].name` 폴백이다 (`getRoomtypeName`).

### 현재 객실 판별

```js
new URLSearchParams(window.location.search).get('room_id');
```

`?room_id=` 없이 들어오면 **첫 객실**을 보여준다. 헤더·미리보기 링크는 항상 id 를
붙이므로 직접 URL 을 친 경우다. `room_id` 가 목록에 없으면 `404.html` 로 보낸다
(백오피스 preview 에서는 리다이렉트하지 않는다 — `layout-map` 과 같은 규칙).

### `data-*` 매핑

| `data-*`                       | 요소                                  | 소스                                      | 비고                                       |
| ------------------------------ | ------------------------------------- | ----------------------------------------- | ------------------------------------------ |
| `[data-room-name]`             | 히어로 `strong` + `.sub_title_box h3` | `getRoomtypeName()`                       | **개별 객실명** (그룹명 아님)              |
| `[data-room-structure]`        | 히어로 `p` + `.sub_title_box p`       | `formatRoomStructure(rooms[j])`           | 없으면 줄째 숨김                           |
| `[data-room-hero-slides]`      | `.sub_visual .swiper-wrapper`         | `roomtype_interior` + `roomtype_exterior` | 없으면 썸네일 → placeholder                |
| `[data-room-nav]`              | `.cate_box`                           | `renderRoomNav(sel, currentId)`           | `미리보기` li 는 정적, 뒤에 생성           |
| `[data-room-table-pc]`         | PC 표 `tbody`                         | `rooms[j]`                                | 객실명 / 기준 / 최대 / 유형 / 평형         |
| `[data-room-table-m]`          | 모바일 표 `tbody`                     | `rooms[j]`                                | 머리글 `tr` + 값 `tr`, **평형 제외**       |
| `[data-room-amenities]`        | `.table_text` (PC·모바일 2벌)         | `rooms[j].amenities`                      | `집기품목 : a, b, c`. 없으면 목록째 숨김   |
| `[data-booking-link]`          | `.btn_reserve`                        | `property.realtimeBookingId`              | 헤더·푸터와 같은 처리                      |
| `[data-room-floorplan]`        | 평면도 영역 전체                      | `getRoomFloorplanImages()`                | **없으면 영역째 숨김**                     |
| `[data-room-floorplan-images]` | 평면도 `.wide_img`                    | 〃                                        | 여러 장 세로 적층                          |
| `[data-room-detail-blocks]`    | `.sub_img_wrap` 컨테이너              | 객실 사진                                 | 2장씩 끊어 블록 생성                       |
| `[data-room-detail-heading]`   | `ROOM DETAIL` 제목                    | —                                         | 사진이 없어도 4블록 뼈대를 세운다          |
| `[data-room-list-lead]`        | 하단 `.title_box p`                   | —                                         | `"안락하게 준비된 {숙소명}의 객실입니다."` |
| `[data-room-list-slides]`      | 하단 객실 카드                        | `roomtypes[]`                             | `renderRoomSlides()` 공용 렌더러           |

평형은 `rooms[j].size`(㎡)를 `toPyeong()` 으로 환산한다. 표의 빈 칸은 `-` 로 채운다 —
비워 두면 표가 무너져 보인다.

### 객실 그룹 규칙 — 상세 탭은 그룹을 펼친다

헤더 메뉴와 `layout-map` **탭**은 그룹을 **하나로 접지만**, 상세 탭은 반대로 **펼친다.**
접은 채로 두면 그룹의 첫 객실 말고는 갈 방법이 없다.

**그룹으로 접히는 곳은 헤더 ROOMS 메뉴와 객실 상세 탭뿐이다.**
Room Preview(미리보기) 카드는 그룹과 무관하게 **항상 전체 객실**을 깔고,
카드마다 자기 객실 상세로 연결한다 — 원본이 그렇다.

| 보는 위치               | 탭에 나오는 것                          |
| ----------------------- | --------------------------------------- |
| 그룹 A동(3실) 안의 객실 | `미리보기 \| 객실1 \| 객실2 \| 객실3`   |
| 그룹 밖(미그룹 객실)    | `미리보기 \| A동 \| B동 \| 미그룹객실…` |

- **다른 그룹은 이 줄에 섞지 않는다.** 그룹명과 객실명이 나란히 놓이면 부모/자식이
  형제처럼 보인다. 다른 그룹으로는 헤더 `ROOMS` 메뉴나 `미리보기`(layout-map)를 거친다.
- **멤버가 1실인 그룹은 펼치지 않는다.** 항목이 하나뿐이라 탭이 비다시피 하고
  그룹명과 객실명이 1:1 이라 의미도 없다.
- 탭의 `미리보기` 는 `./layout-map.html` 로 돌아간다(미리보기가 꺼져 있으면 탭에서 숨긴다). 거기서 **탭**은 다시 그룹명으로 접히지만
  **카드는 전체 객실**이라 어느 객실이든 바로 갈 수 있다.

#### 객실명이 길 때

`.cate_box` 는 `flex` + `flex:1 0 auto` 다. 칸이 많거나 이름이 길면 균등 분할을
포기하고 **내용 폭을 지키며 가로 스크롤**한다 (「원본을 고친 곳」 참고).
한 칸이 화면을 통째로 밀어내지 않도록 `max-width:22em` + `text-overflow:ellipsis`
안전장치를 뒀고, 잘린 이름은 `a.title` 툴팁으로 확인할 수 있다.

⚠️ ellipsis 가 걸린 곳은 **`.cate_box li a` 하나뿐**이다. 헤더 서브메뉴
(`.depth_box` / `.depth_list`)와 객실 카드 제목(`.room_inner_wrap strong`)에는
줄임 처리가 없어 길면 줄바꿈된다. 그 자리들의 `title` 속성은 줄임표용이 아니라
줄바꿈된 전체 문구를 툴팁으로 확인하기 위한 것이다.

탭 개수 자체를 줄이려면 **객실 그룹**을 쓰는 게 근본적인 해법이다.

⚠️ **제목(`[data-room-name]`)에는 그룹명을 쓰지 않는다.** 그룹명을 쓰면 형제 객실이
모두 같은 제목이 되어 어느 객실을 보고 있는지 알 수 없다. 그룹명은 헤더 메뉴와
`layout-map` 카드에서만 쓴다.

### 상세 이미지 블록 — 고정 4블록 사이클

`main.html` 처럼 장수로 클래스를 고르지 않는다. **원본이 정해진 리듬을 쓴다.**
udosky / gpcaravan 두 판본이 완전히 같다.

| #   | 클래스               | 장수 | `.inner` | 보이는 모습               |
| --- | -------------------- | ---- | -------- | ------------------------- |
| 1   | `sub_img_wrap`       | 2장  | 있음     | 1200px 안 2열 (67% + 32%) |
| 2   | `sub_img_wrap type3` | 1장  | **없음** | **화면 전폭 배너**        |
| 3   | `sub_img_wrap type2` | 2장  | 있음     | 1200px 안 2열 (32% + 67%) |
| 4   | `sub_img_wrap type3` | 1장  | 있음     | 1200px 안 1장             |

**2번 블록만 `.inner`(`width:1200px`)를 두르지 않아** 화면 폭을 꽉 채운다.
원본의 "배너" 자리다. 이 한 줄이 빠지면 리듬이 밋밋해진다.

#### 사이클은 한 번만 돈다 — 상세는 6장에서 자른다

**원본 두 판본 모두 사진 수와 무관하게 상세에는 6장만 쓴다.**

| 원본      | 히어로 슬라이더 | 상세 블록 | 미사용 |
| --------- | --------------- | --------- | ------ |
| udosky    | 8장             | **6장**   | 2장    |
| gpcaravan | **19장**        | **6장**   | 13장   |

gpcaravan 이 결정적이다 — 사진이 19장인데도 상세는 6장이고, 고른 순서도
`4, 2, 1, 10, 11, 7` 로 순차가 아니다. 원본 CMS 에서 업주가 상세에 넣을
6장을 직접 골라 순서까지 정하는 구조다.

우리 `roomtypes[].images` 에는 "상세용" 구분 필드가 없다. 대신 **`sortOrder`
(백오피스의 사진 순서)가 그 역할을 한다** — 앞 6장이 상세에 쓰인다.
업주가 순서를 바꾸면 상세에 나오는 사진이 바뀐다.

반복하지 않는 이유는 리듬 때문이다. 19장짜리 숙소에서 사이클을 돌리면
배너가 세 번 나오는 13블록짜리 페이지가 된다. 남는 사진은 히어로 슬라이더에
전부 나오므로 잃는 정보도 없다.

사진이 6장에 못 미치면 있는 만큼만 채운다. 2장짜리 자리에 1장만 남으면
그 블록은 `type3`(전폭)으로 낮춘다 — 기본 / `type2` 는 67%+32% 2열이라
한 장만 넣으면 옆이 빈다.

상한은 `detailImageLimit()` 이 `DETAIL_PATTERN` 의 장수 합에서 계산한다.
패턴을 고치면 상한도 따라온다.

**사진이 하나도 없으면 4블록 뼈대를 그대로 세운다.** placeholder 6칸이
`2 · 1(전폭) · 2 · 1` 배치를 보여 주어, 편집자가 몇 장이 들어가는지 알 수 있다.
이때는 클래스를 낮추지 않는다 — 낮추면 원래 몇 장짜리 자리인지 알 수 없어진다.

**문구(`.txt`)는 만들지 않는다.** 원본은 1·2번 블록에만 장식용 영문 캡션을 달았고
(`.sub_room_detail` 스코프가 `19px #aaa` / `12px #ccc` 로 흐리게 깔린다)
`roomtypes` 에는 블록 단위 문구가 없다.

### 평면도는 없으면 숨긴다

`getRoomFloorplanImages()` 는 크롤러가 객실 상세의 평면도 영역에서 찾았을 때만
채워지는 필드를 본다. **일반 객실 사진으로 폴백하지 않는다.**

| 페이지       | 도면   | 비었을 때                             |
| ------------ | ------ | ------------------------------------- |
| `layout-map` | 배치도 | placeholder (**영역 유지**) — 본 목적 |
| `room`       | 평면도 | **영역째 숨김** — 부가 정보           |

### 슬라이더 (`js/pages/room.js`)

| 대상                   | 원본 옵션  | 값                                              | `lockHide` 대상                            |
| ---------------------- | ---------- | ----------------------------------------------- | ------------------------------------------ |
| `.sub_visual`          | `swiper`   | `effect: fade` / `loop` / `autoplay 4000`       | `.sub_visual .arw_box`                     |
| `.sub_room_detail_box` | `sld_opt2` | `initRoomList()` — 200/480/981/1024 → 1/2/3/3열 | `.sub_room_detail_box .main_room .arw_box` |

하단 객실 목록만 여러 열로 깔린다. index 의 `.main_room`(한 장씩)과 다른 옵션이다.

---

## `facility.html` (원본 `special1~5.html`)

원본은 시설마다 파일이 하나씩(`special1.html` … `special5.html`)이었다.
템플릿은 `facility.html?id=` 하나로 받는다.

```
.sub_visual.visual        시설 사진 슬라이더 + 시설명
.sub_location_wrap        시설 탭 ← getFacilities()
.sub_cont
  ├ .sub_title_box        시설명
  ├ .special_bnr.inner    180px 사진 띠 + 소개문 + 이용안내
  ├ .sub_img_wrap × 2     상세 이미지 (2장 + 1장)
  └ .sub_special_detail_box  다른 부대시설 카드 슬라이더 (3열)
```

### 데이터 소스 — `pages.facility[]` 는 쓰지 않는다

`pages.room[]` 과 마찬가지로 **빈 배열로 내려온다**(현재 샘플도 `[]`).
내용은 전부 `property.facilities[]` 에서 온다.

| 필드           | 쓰이는 곳                                  |
| -------------- | ------------------------------------------ |
| `name`         | 히어로 `strong` · `.sub_title_box h3` · 탭 |
| `description`  | `.special_bnr` 소개문                      |
| `usageGuide`   | `.special_bnr` 소개문 아래 이용안내        |
| `images[]`     | 히어로 슬라이더 · 배너 · 상세 블록         |
| `displayOrder` | 정렬 (아래)                                |

#### 정렬은 `getFacilities()` 한 곳에서

`displayOrder` 는 **문자열**(`'0','1','2','4'…`)로 내려오고 결번도 있다.
`getFacilities()` 가 숫자로 변환해 정렬하고 값이 없는 항목은 뒤로 보낸다.

**헤더 SPECIAL 서브메뉴 · index 하단 카드 · 이 페이지의 탭과 하단 카드**가
모두 이 메서드를 쓴다. 한 곳만 순서가 달라지는 일이 없다.

### `data-*` 매핑

| `data-*`                        | 요소                            | 소스                         | 비고                                              |
| ------------------------------- | ------------------------------- | ---------------------------- | ------------------------------------------------- |
| `[data-facility-name]`          | 히어로 `strong` + `h3`          | `nameEn` → `name`            | 두 자리에 같은 값                                 |
| `[data-facility-caption]`       | 히어로 `p` + `.sub_title_box p` | `name`                       | `nameEn` 이 있을 때만. 없으면 줄째 숨김           |
| `[data-facility-hero-slides]`   | `.sub_visual .swiper-wrapper`   | `images[]` 전부              | 없으면 placeholder 한 장                          |
| `[data-facility-nav]`           | `.cate_box`                     | `getFacilities()`            | 현재 시설에 `.on`                                 |
| `[data-facility-banner-image]`  | `.special_bnr .img`             | `images[0]`                  | 없으면 placeholder (배너는 본문이라 유지)         |
| `[data-facility-banner-title]`  | `.special_bnr strong`           | —                            | **항상 비움.** 아래 참고                          |
| `[data-facility-description]`   | `.special_bnr p`                | `description` + `usageGuide` | 사이에 한 줄 띄움                                 |
| `[data-facility-detail-blocks]` | `.sub_img_wrap` 컨테이너        | `images[1..3]`               | 2장 + 1장                                         |
| `[data-facility-list-lead]`     | 하단 `.title_box p`             | —                            | `"{숙소명}의 부대시설과 특장점을 확인해 보세요."` |
| `[data-facility-list-slides]`   | 하단 시설 카드                  | `getFacilities()`            | `renderSpecialCards()` 공용 렌더러                |

### 시설명이 한 줄로 떨어진다

원본은 제목을 두 줄로 썼다 — `strong`/`h3` 에 영문 시설명(`Private terrace BBQ`),
`p` 에 한글명(`개별 테라스 바베큐`).

`facilities[]` 에 **`nameEn` 이 없는 응답이 일반적**이라 제목이 한글명으로 떨어진다.
그때 `p` 까지 한글명을 넣으면 같은 문구가 두 번 나오므로 `p` 를 숨긴다.
`renderSpecialCards()` 의 카드 제목과 같은 규칙이다.

### `.special_bnr` 문구 — 소제목은 비운다

원본 문구는 세 덩이였다.

| 원본                                    | 성격        | 우리 데이터               |
| --------------------------------------- | ----------- | ------------------------- |
| `strong` "여행에 빠질 수 없는 …"        | 배너 소제목 | **대응 필드 없음 → 비움** |
| `p` "아늑한 공간에서 …"                 | 소개문      | `description`             |
| `p` 끝 "※ 자세한 사항은 이용안내 참고…" | 이용안내    | `usageGuide`              |

**시설명을 소제목에 넣지 않는다.** 이 배너 위에서 시설명이 이미 두 번 나온다
(히어로 문구 + `.sub_title_box h3`). 세 번째로 반복할 값이 없다.

⚠️ **`description` 의 첫 줄을 소제목으로 올리지도 않는다.** `description` 은

```
잔잔하게 흐르는 강을 바라보며
편안한 쉼의 순간을 느껴보세요.
```

처럼 **한 문장을 줄바꿈한 것**이라, 첫 줄만 21px 볼드로 키우면 한 문장이 서로 다른
서체로 쪼개진다. 개행은 줄바꿈일 뿐 제목 경계가 아니다.

(`main.html` 의 `pickCopy` 는 `title` 과 `description` **두 필드**를 두 슬롯에
배분하는 규칙이다. 여기는 한 필드뿐이라 나눌 근거가 없다.)

소제목을 비우면 원본에서 그 `strong` 이 갖던 위쪽 간격(`margin:2.3em 0 0.47em`)이
사라져 사진 띠에 소개문이 바로 붙는다. 매퍼가 `.txt_box` 에 `.no_title` 을 붙이고
CSS 가 그 간격을 `p` 로 옮긴다 (「원본을 고친 곳」 참고).

`usageGuide` 는 소개문 아래 한 줄 띄고 붙인다 (원본의 `<br><br>` 자리).

### 상세 이미지 블록 — 고정 2블록

| #   | 클래스               | 장수 | `.inner` |
| --- | -------------------- | ---- | -------- |
| 1   | `sub_img_wrap`       | 2장  | 있음     |
| 2   | `sub_img_wrap type3` | 1장  | 있음     |

udosky `special1·2·3·5` 와 gpcaravan `special1` 이 모두 같다.
**`room.html` 과 달리 전폭 배너가 없다**(둘 다 `.inner`). 그 역할은 `.special_bnr` 가 한다.

**배너가 첫 장을 쓰므로 상세는 두 번째 장부터 3장을 가져간다.** 같은 사진이
위아래로 겹치지 않게 하기 위해서다. 나머지 사진은 히어로 슬라이더에만 나온다.

사진이 모자라면 뒤 블록을 만들지 않는다. 원본 `special4` 가 그 증거다 —
사진이 3장뿐이라 배너(1장) + 2장 블록에서 끝나고 `type3` 블록이 아예 없다.

### 탭에 '미리보기'를 두지 않는다

원본 `.cate_box` 맨 앞에는 `special.html`(시설 목록)로 가는 '미리보기' li 가 있다.
**우리 템플릿에는 시설 목록 페이지가 없다** — 헤더 SPECIAL 서브메뉴도 시설로 바로 간다.
그래서 시설만 나열한다.

`room.html` 의 탭에 '미리보기'가 있는 것과 다르다. 그쪽은 `layout-map.html` 이라는
목록 페이지가 실제로 있기 때문이다.

### 슬라이더 (`js/pages/facility.js`)

| 대상                      | 원본 옵션  | 값                                              | `lockHide` 대상                                  |
| ------------------------- | ---------- | ----------------------------------------------- | ------------------------------------------------ |
| `.sub_visual`             | `swiper`   | `effect: fade` / `loop` / `autoplay 4000`       | `.sub_visual .arw_box`                           |
| `.sub_special_detail_box` | `sld_opt4` | `initRoomList()` — 200/480/981/1024 → 1/2/3/3열 | `.sub_special_detail_box .main_special .arw_box` |

객실 카드와 시설 카드가 같은 3열 규격이라 `initRoomList()` 헬퍼를 함께 쓴다.

---

## `reservation.html` (원본 `reservation.html`)

슬라이더가 하나도 없는 정적 페이지다. `js/pages/reservation.js` 가 없다.

```
.sub_visual_wide          고정 배경 ← hero.images[0]
.sub_location_wrap        빵부스러기 + 탭(예약하기 / 이용안내)
.sub_cont.inner
  └ dl.info_wrap
      ├ dt  INFORMATION
      ├ dd  사진(380px) + 펜션정보 본문
      ├ dt  REFUND INFO
      └ dd  사진(400px) + 환불정보 (사진 위에 얹힘)
```

`INFORMATION` / `REFUND INFO` **고정 2블록**이고 두 원본 판본이 완전히 같다.

### 본문은 `pages` 가 아니라 `property` 에서 온다

`pages.reservation.sections[0]` 에는 `hero.images`(2장)뿐이고
`about` 은 `title` · `description` · `images` 가 모두 비어 있다.

#### ⚠️ `hero` 스키마가 페이지마다 다르다

| 페이지                                               | `hero` 키                                   |
| ---------------------------------------------------- | ------------------------------------------- |
| `index` / `main` / `nearbyAttractions` / `layoutMap` | `title` · `images` · `description`          |
| **`reservation`** / `directions`                     | `title` · `images` (**`description` 없음**) |

`reservation.hero` 에는 `description` 이 없으므로 히어로 문구는
`hero.title` → 고정 문구 순으로만 떨어뜨린다.

**`about.title` / `about.description` 은 쓰지 않는다.** 배정할 자리가 없다 —
두 블록의 제목은 `INFORMATION` / `REFUND INFO` 고정 라벨이고 본문은 `property` 에서 온다.

| 블록          | 소스                                         |
| ------------- | -------------------------------------------- |
| `INFORMATION` | `property.address` + `property.usageGuide`   |
| `REFUND INFO` | `property.refundPolicies` + `refundSettings` |

### `data-*` 매핑

| `data-*`                              | 요소                    | 소스                                      | 폴백 / 비고                |
| ------------------------------------- | ----------------------- | ----------------------------------------- | -------------------------- |
| `[data-reservation-hero]`             | `.sub_visual_wide` 배경 | `hero.images[0]`                          | → `exterior` → `thumbnail` |
| 히어로 `strong`                       | —                       | —                                         | `RESERVE` 고정             |
| `[data-reservation-hero-description]` | 히어로 `p`              | `hero.title` → `hero.description`         | → `"펜션 이용안내"`        |
| `[data-booking-link]`                 | 탭 '예약하기'           | `property.realtimeBookingId`              | 헤더·푸터와 같은 처리      |
| `[data-reservation-info-image]`       | 첫 `dd .img`            | 아래 「사진 배분」                        | 없으면 placeholder         |
| `[data-reservation-info-body]`        | 첫 `dd p`               | `address` + `usageGuide`                  | 사이에 한 줄 띄움          |
| `[data-reservation-refund-image]`     | 둘째 `dd .img`          | 아래 「사진 배분」                        | 없으면 placeholder         |
| `[data-reservation-refund-body]`      | 둘째 `dd p`             | `refundPolicies` + `customerRefundNotice` | 없으면 문단째 숨김         |

`펜션정보` / `환불정보` 라벨(`p > strong`)은 원본 고정 문구다.

### ⚠️ `checkInOutInfo` 를 함께 붙이면 안 된다

`property.usageGuide` 는 `[공지사항] [입퇴실안내] [인원추가정보] [추가요금] …`
절을 모두 담은 한 덩어리다(현재 샘플 1988자). `checkInOutInfo` 는 그중
`[입퇴실안내]` 절과 **같은 내용**이라 둘을 이어 붙이면 두 번 나온다.

`usageGuide` 가 비었을 때만 `checkInOutInfo` + `reservationGuide` 로 대신한다.

### 사진 배분

히어로 배경이 `hero.images` 의 **첫 장**을 쓰므로, 두 `dd` 는 그 다음부터 가져간다.
같은 사진이 히어로와 본문에 겹쳐 나오지 않게 하기 위해서다.

```
pool = about.images  +  hero.images[1..]   (2장에 못 미치면 property.exterior 를 덧붙임)
INFORMATION .img = pool[0]
REFUND INFO .img = pool[1]
```

모자라면 placeholder 를 세운다. 380~400px 짜리 영역이라 숨기면 두 블록의 리듬이 무너진다.

### 환불 규정 문장 만들기

`refundPolicies[]` 는 `{ refundProcessingDays, refundRate }` 목록이다.
날짜 내림차순으로 정렬해 한 줄씩 만든다.

| 조건                | 문구                      |
| ------------------- | ------------------------- |
| 가장 이른 날짜      | `이용일 N일 이전 취소 시` |
| 당일 (`days === 0`) | `이용일 당일 취소 시`     |
| 그 사이             | `이용일 N일 전 취소 시`   |
| `rate >= 100`       | `전액 환불`               |
| `rate <= 0`         | `환불 불가`               |
| 그 외               | `N% 환불`                 |

가장 이른 날짜만 `"이전"` 인 이유는 **그보다 앞선 취소가 모두 같은 조건**이기 때문이다.
원본도 같은 표기를 쓴다.

`refundSettings.customerRefundNotice` 가 있으면 목록 아래 한 줄 띄고 붙인다.

### ⚠️ 둘째 `dd` 의 문단은 사진 위에 얹힌다

```css
.info_wrap dd + dt + dd p {
  position: absolute;
  right: 2%;
  top: 50%;
  background: rgba(255, 255, 255, 0.8);
}
```

원본 CSS 가 **두 번째 `dd` 의 `p` 만** 400px 사진 위에 반투명 흰 박스로 띄운다.
환불 규정처럼 짧은 글이라 성립하는 레이아웃이다. 이 자리에 `usageGuide` 같은
긴 글을 넣으면 사진을 덮고 넘친다.

### 탭

| 항목     | 링크                         |
| -------- | ---------------------------- |
| 예약하기 | `realtimeBookingId` (새 창)  |
| 이용안내 | `./reservation.html` (`.on`) |

원본 `.location_box` 빵부스러기(`홈 > RESERVE > 이용안내`)도 그대로 두었다 —
골격을 가져온 원본 페이지에 있던 것이다.

---

## `directions.html` (원본 `traffic.html`)

슬라이더가 없는 정적 페이지다. `js/pages/directions.js` 가 없다.

```
.sub_visual_wide          고정 배경 ← hero.images[0]
                          strong `LOCATION` / p `{숙소명} 오시는 길`  ← 둘 다 고정
.sub_location_wrap        빵부스러기 + 탭(오시는길)
.sub_cont
  ├ .sub_title_box        h3 ← hero.title / p (숙소명 + 고정 문구)
  ├ .map_box > .map_inner > #kakao-map
  └ .map_info.inner       strong(주소) + dl(교통 안내)
```

⚠️ **히어로는 `LOCATION`, 본문 제목은 `DIRECTIONS`** 로 서로 다르다. 원본이 그렇다.

### 섹션 배정 — `pages.directions.sections[0]`

| 요소                | 소스                                  |
| ------------------- | ------------------------------------- |
| `.sub_visual_wide`  | `hero.images[0]` (문구는 고정)        |
| `.sub_title_box h3` | `hero.title`                          |
| `.map_info dl`      | `notice.title` / `notice.description` |
| `.map_info strong`  | `property.address`                    |
| 지도                | `property.latitude` / `longitude`     |

`hero` 에 **`description` 이 없다** (`reservation` 과 같다). 「`reservation.html`」의
hero 스키마 표 참고.

**히어로 문구는 둘 다 고정이다.** 사진 위 38px 대제목 자리라 업주 문구가 들어가면
배경을 가린다 — `layout-map` / `nearby-attractions` 와 같은 판단이다.
`hero.title` 은 흰 지면 위 `.sub_title_box h3` 가 받는다.
`description` 이 없으므로 그 아래 설명 줄은 고정 문구다.

### `data-*` 매핑

| `data-*`                             | 요소                    | 소스                   | 폴백 / 비고                                        |
| ------------------------------------ | ----------------------- | ---------------------- | -------------------------------------------------- |
| `[data-directions-hero]`             | `.sub_visual_wide` 배경 | `hero.images[0]`       | → `exterior` → `thumbnail`                         |
| 히어로 `strong`                      | —                       | —                      | `LOCATION` 고정                                    |
| `[data-directions-hero-description]` | 히어로 `p`              | —                      | `"{숙소명} 오시는 길"` **고정**                    |
| `[data-directions-title]`            | `.sub_title_box h3`     | `hero.title`           | → `DIRECTIONS`                                     |
| `[data-directions-lead]`             | `.sub_title_box p`      | `property.name`        | `"{숙소명}에 찾아 오시는 길을 안내해 드립니다."`   |
| `[data-directions-address]`          | `.map_info strong`      | `address`              | → `businessInfo.businessAddress`. 없으면 줄째 숨김 |
| `[data-directions-notice]`           | `.map_info dl`          | `notice`               | 본문이 없으면 `dl` 째 숨김                         |
| `#kakao-map`                         | 지도                    | `latitude`/`longitude` | 좌표가 없으면 placeholder (**영역 유지**)          |

### 교통 안내 (`notice`)

원본은 `승용차 이용 시` `dt` 아래에 내비 안내와 지번/도로명 주소를 넣었다
(`대중교통 이용 시` `dt`/`dd` 는 주석 처리된 상태였다).

우리 `notice` 는 `{ title, description }` **하나**다.

```
notice.description = "지번 : 강원특별자치도 홍천군 서면 팔봉리 80
                      도로명 : 강원특별자치도 홍천군 서면 팔봉강변길 229"
```

`dt` ← `notice.title` → `"승용차 이용 시"`, `dd` ← `notice.description`.
본문이 아예 없으면 `dl` 째 숨긴다 — 제목만 남으면 빈 항목이 된다.

### 지도는 Kakao Maps SDK 로 대체했다

원본은 **daum roughmap 퍼가기 스크립트**를 썼다.

```html
new daum.roughmap.Lander({ "timestamp": "1697164674367", "key": "2gfoc", … })
```

`key` 가 업체 고유값이라 데이터로 만들 수 없다. `js/kakao-maps-sdk.js` 를 싣고
`property.latitude` / `longitude` 로 지도를 그린다.

- `.map_inner` 는 `padding-bottom` 비율 상자(35.8% → 50% → 400px)라,
  `#kakao-map` 을 `position:absolute; inset:0` 으로 채운다 (「원본을 고친 곳」 참고).
- **좌표가 없어도 영역을 유지**하고 placeholder 를 세운다. 안을 비우면
  테두리만 남은 빈 띠가 되어 페이지가 무너진 것처럼 보인다.
- preview 는 데이터가 바뀔 때마다 매핑을 다시 돌린다. 그때마다 `new Map()` 을
  만들면 인스턴스가 쌓이므로, 이미 있으면 **중심만 옮긴다**.
- 숨겨진 상태로 생성되면 크기를 0 으로 잡으므로 `resize` 에서 `relayout()` 한다.

---

## `nearby-attractions.html` (원본 `travel.html`)

슬라이더가 없는 정적 페이지다. `js/pages/nearby-attractions.js` 가 없다.

```
.sub_visual_wide     고정 배경 ← hero.images[0]
                     strong `TRAVEL` 고정 / p `{숙소명} 주변 여행지` 고정
.sub_location_wrap   빵부스러기 + 탭(주변 여행지, 1탭)
.sub_cont
  ├ .sub_title_box   h3 ← hero.title / p ← hero.description
  └ .travel_list ul  2열 float 목록 ← about[]
```

원본 `#content` 클래스가 `sub4_1 sub_reservation` 으로 **이용안내 페이지와 같다**
(원본의 복사 흔적). 이 페이지 전용 스코프 규칙이 없어 그대로 두었다.

### ⚠️ 이 섹션의 `about` 은 배열이다

| 페이지                           | `about` 타입                 |
| -------------------------------- | ---------------------------- |
| `main` / **`nearbyAttractions`** | **배열** (블록/항목 여러 개) |
| `layoutMap` / `reservation`      | 단일 객체                    |

같은 이름이라 헷갈리기 쉽다.

### 히어로 문구는 고정, 제목은 백오피스가 채운다

`layout-map` 과 같은 판단이다. 사진 위 38px 대제목 자리에 업주 문구가 들어가면
배경을 가리므로, `hero` 의 문구는 흰 지면 위 `.sub_title_box` 가 받는다.

| 슬롯                | 소스               | 폴백                                              |
| ------------------- | ------------------ | ------------------------------------------------- |
| 히어로 `strong`     | —                  | `TRAVEL` **고정**                                 |
| 히어로 `p`          | —                  | `"{숙소명} 주변 여행지"` **고정**                 |
| `.sub_title_box h3` | `hero.title`       | `TOURIST SPOT`                                    |
| `.sub_title_box p`  | `hero.description` | `"펜션 근처의 주요 관광지 정보를 확인해 보세요."` |

히어로 배경은 `hero.images[0]` → 여행지 사진 첫 장 → `surrounding` → `exterior` → `thumbnail`.

### 항목 소스

| 순위 | 소스                           | 담기는 것                                                         |
| ---- | ------------------------------ | ----------------------------------------------------------------- |
| 1    | `nearbyAttractions.about[]`    | `{ title, description, images }` — 사진·설명까지                  |
| 2    | `property.nearbyAttractions[]` | **문자열 배열**(이름만) — `<p>` 를 만들지 않고 placeholder 이미지 |

현재 샘플은 `about[]` 이 비어 있고 `property.nearbyAttractions` 가 `['계곡인접']`
하나라, 2순위 폴백으로 이름만 있는 항목 하나가 나온다.

`title` 이 없는 항목은 건너뛴다. 항목이 하나도 없으면 목록을 비운 채 둔다 —
2열 float 그리드라 빈 `li` 를 넣으면 다음 항목의 `clear` 규칙이 어긋난다.

### 항목 필드 매핑

원본 `li` 는 본문 / 자료출처 / 거리 세 덩어리다.

```html
<img />
<strong>제목</strong>
<p>
  본문…
  <span>(자료출처 : …)</span>
  <em>위치 : 펜션에서 약 0.4km, 도보 약 2분 거리</em>
</p>
```

| 요소     | 소스                                                                                                      | CSS                  |
| -------- | --------------------------------------------------------------------------------------------------------- | -------------------- |
| `img`    | `images[0]`                                                                                               | 없으면 placeholder   |
| `strong` | `title`                                                                                                   | 19px, 앞에 자동 번호 |
| `p` 본문 | `description` 중 출처·거리를 뺀 나머지                                                                    | 14px `#666`          |
| `span`   | `description` 중 `자료출처`/`출처` 로 시작하는 줄                                                         | 12px `#999`          |
| `em`     | `images[0].description` → 없으면 `description` 중 `펜션에서`/`숙소에서` 로 시작하거나 `거리` 로 끝나는 줄 | 13px `#333`          |

#### 카드 이미지 높이는 비율로 고정한다

원본은 `.travel_list ul li img` 에 `width:100%` 만 두었다. 2열 float 그리드라
사진 비율이 제각각이면 행 높이가 들쭉날쭉해지고, 사진이 없을 때 세우는
placeholder(800×600)는 576px 폭에서 **432px** 로 유독 높게 뜬다.

`aspect-ratio:3/2` + `object-fit:cover` 로 카드 이미지 높이를 **384px** 로 맞췄다
(「원본을 고친 곳」 참고). 비율이 다른 사진은 위아래 또는 좌우가 잘린다.

**`01.` `02.` 번호는 매퍼가 넣지 않는다.** 원본 CSS 의
`.travel_list ul li strong:before { counter-increment: section }` 가 붙인다.
매퍼가 번호를 넣으면 두 번 나온다.

#### 출처·거리 판정

```js
var SOURCE_RE = /^(자료출처|출처)/;
var DISTANCE_RE = /^(펜션에서|숙소에서)|거리$/;
```

거리는 `images[0].description` 이 **정본**이다. 그 필드가 비었을 때만
`description` 안에서 가려낸다.

출처·거리는 **각각 첫 번째로 매칭된 줄 하나만** 쓰고 나머지는 본문으로 남는다.
줄 순서는 상관없다. G · E2 · C2 · D2 · L 과 같은 규칙이다.

본문·출처·거리가 모두 없으면 `<p>` 를 만들지 않는다 — 2순위 폴백(문자열 배열)은
이름만 있어서 빈 문단이 남는다.

### `enabled: false` → 404 리다이렉트

`layout-map.html` 과 같다. 헤더 TRAVEL 메뉴도 `header-footer-mapper` 가
같은 기준(`pages.nearbyAttractions.sections[0].enabled`)으로 숨긴다.
백오피스 preview 에서는 리다이렉트하지 않는다.

---

## 테마 색상/폰트

`styles/theme.css` 토큰 5개. 토큰 값은 **하나씩만** 두고 폴백은 사용처에서 붙인다
(`font-family: var(--font-en-main), sans-serif`).
폴백 체인을 토큰에 넣으면 백오피스가 값을 교체할 때 지저분해진다.

주입 지점은 `js/preview-handler.js` 의 `applyFont` / `applyColor` 다.
standalone 에서는 `theme.css` 값이 그대로 쓰이고, 백오피스 preview 에서만 덮어쓴다.

| 토큰                | 값 (udosky)    | gpcaravan | 역할                   | 사용처                                                                                                    |
| ------------------- | -------------- | --------- | ---------------------- | --------------------------------------------------------------------------------------------------------- |
| `--color-primary`   | `#f5f6f8`      | 동일      | **밝은 바탕 면**       | 5곳 — `.main_reserve` / `.sub1_1` 홀수 이미지행 / 객실 상세 박스 / 부대시설 상세 박스 / `#kakao-map` 바탕 |
| `--color-secondary` | `#0187cc`      | `#8eb049` | **진한 브랜드 포인트** | 11곳 (아래 표)                                                                                            |
| `--font-en-main`    | `Oswald`       | 동일      | **영문 전체**          | 16곳 — 로고 · 메뉴 · aside 대분류 · 모든 섹션 제목과 카드·배너 제목                                       |
| `--font-ko-main`    | `Noto Sans KR` | 동일      | 한글 본문              | `reset.css` 전역(본문·폼) + `.logo_sub`, `.ff_notokr`                                                     |
| `--font-ko-sub`     | `Noto Sans KR` | 동일      | **한글 설명 문단**     | 16곳 — 섹션 리드 · 소개문 · 이용안내 · 여행지 설명 등 (아래 「한글 서체 두 축」)                          |

**`primary` = 밝은 바탕 / `secondary` = 진한 브랜드 포인트** 는 A / B / C2 / D2 / E2 / F / G / L
및 백오피스 실제 값과 같은 관례다.

### 한글 서체 두 축 — `ko-main` / `ko-sub`

원본은 한글 서체가 하나뿐이었다. 백오피스가 `koMain` / `koSub` / `enMain` 세 개를
보내는 구조라(`js/preview-handler.js`), 죽어 있던 `ko-sub` 을 살려 두 축으로 나눴다.

| 토큰             | 담당           | 연결                                                                       |
| ---------------- | -------------- | -------------------------------------------------------------------------- |
| `--font-ko-main` | 기본 본문·제목 | `reset.css` 전역 + `.logo_sub` + `.ff_notokr` + 영문 제목 16곳의 한글 폴백 |
| `--font-ko-sub`  | **설명 문단**  | 15곳 — 아래 목록                                                           |

```
.title_box p        .sub_title_box p      .visual .visual_txt p
.sub_visual_wide .visual_txt p            .sub_wide_bnr .txt_box p
.sub_img_wrap .txt p                      .special_bnr .txt_box p
.main_special .swiper-slide .txt_box p    .room_list .box .room_inner_wrap p
.landscape_box .txt_box p                 .reserve_box .txt_box p
.info_wrap dd p     .map_info dl dd       .travel_list ul li p
.table_text li
```

전역 본문(`ko-main`)을 상속받다가 이 15곳만 `ko-sub` 으로 갈라진다.
`.ff_noto_serif` 유틸도 `ko-sub` 을 쓰지만 그 클래스를 붙인 HTML 은 없다.

**기본값을 `ko-main` 과 같은 `Noto Sans KR` 로 둔다.** 백오피스에서 아무것도
고르지 않으면 화면이 한 서체로 보이고, `koSub` 를 고른 숙소에서만 설명 문단이
갈린다. `Noto Serif KR` 은 쓰는 곳이 없어져 `@import` 에서도 뺐다.

#### 제목의 한글은 `ko-main` 으로 떨어진다

제목 16곳은 `--font-en-main`(Oswald)을 쓰는데 Oswald 에는 한글 글리프가 없다.
폴백 체인에 `ko-main` 을 끼워 브라우저가 **글자 단위로** 고르게 했다.

```css
font-family: var(--font-en-main), var(--font-ko-main), Arial, Helvetica, sans-serif;
```

영문은 Oswald, 한글은 Noto Sans KR 로 자동으로 갈린다. 이 폴백이 없으면
시설명·객실명 같은 한글 제목이 브라우저 기본 한글 서체로 떨어진다.

### `--color-secondary` 사용처 11곳

| 셀렉터                                         | 성격                                           |
| ---------------------------------------------- | ---------------------------------------------- |
| `.header .logo a`, `.logo2 a`                  | 로고 글자색                                    |
| `.header .hd_lnb_bg`                           | LNB 배경판 (80% 투명)                          |
| `.header .btn_hd_res a`                        | 헤더 예약 버튼 배경                            |
| `.aside .btn_aside_res a`                      | 모바일 예약 버튼 배경                          |
| `.btn_more:hover`                              | VIEW 버튼 hover — 글자 + 테두리                |
| `.main_special .swiper-slide:hover .txt_box a` | 부대시설 카드 hover — 글자 + 테두리            |
| `.reserve_box .txt_box .btn_wrap a:hover`      | 예약 안내 버튼 hover — 글자 + 테두리           |
| `.btn_wrap .btn_reserve`                       | 예약 버튼 **배경** (hover 는 `#444` 로 눌린다) |
| `.table_default` 상단선 (기본 + 반응형)        | 표 위 2px 포인트 선                            |
| `.sub_location_wrap .cate_box li.on a`         | 활성 탭 글자색 (현재 위치 표시)                |

⚠️ 밝은 색으로 바꾸면 이 면들 위의 흰 글자가 사라진다.

### 반투명 브랜드색 — `.header .hd_lnb_bg`

원본은 `rgba(1, 135, 204, 0.8)` 이다. 토큰은 hex 한 값이라 알파를 못 싣는다.

```css
background: rgba(1, 135, 204, 0.8);
background: color-mix(in srgb, var(--color-secondary) 80%, transparent);
```

두 줄을 겹쳐 둔다. `color-mix` 를 모르는 브라우저는 앞 줄(원본 값)에 머물고,
아는 브라우저는 뒷줄로 덮어써 토큰을 따른다.

### udosky 에 남아 있던 `#8eb049` 3곳

`btn_more:hover` / `.main_special` 카드 hover / `.reserve_box` 버튼 hover 는
udosky 브랜드가 파랑인데도 **gpcaravan 계열 초록**으로 남아 있다.
원본이 브랜드색을 갈아끼우다 빠뜨린 자리다.

두 판본 모두 "브랜드 포인트 hover" 자리이므로 `--color-secondary` 로 통일했다.
**udosky 실물과 이 3곳의 hover 색이 달라진다.**

### 토큰으로 빼지 않은 값

| 값                                | 곳  | 성격                                                       | 처리     |
| --------------------------------- | --- | ---------------------------------------------------------- | -------- |
| `#fafafa` / `#eff1f5` / `#f8f8f8` | 5   | `--color-primary` 이웃 명도. 원본이 의도적으로 나눈 값이다 | 하드코딩 |
| `#fff`                            | 22  | 어두운 면·사진 위 **흰 글자**                              | 하드코딩 |

`#fff` 는 "밝은 바탕 면"이 아니라 **대비를 만드는 반전색**이다. 토큰으로 묶으면
백오피스에서 값을 바꾸는 순간 브랜드색 판 위 글자가 안 보이게 된다.

---

## 카피라이트 (`data-copyright`)

푸터 카피라이트는 `property.tripProviderName`(Trip11 공급자명)으로 렌더한다.

`common/footer.html` 의 카피라이트 요소에 템플릿 문자열을 두고,
`header-footer-mapper.js` 의 `mapCopyright()` 가 `{provider}` 를 치환한다.

```html
<a href="http://trip11.kr/" data-copyright="COPYRIGHT©{provider}. ALL RIGHTS RESERVED.">
  COPYRIGHT©(주)트립일레븐. ALL RIGHTS RESERVED.
</a>
```

| `property.tripProviderName` | 결과                                  |
| --------------------------- | ------------------------------------- |
| `"신비서"`                  | `COPYRIGHT©신비서. ALL RIGHTS RESERVED.` |
| `""` / 미입력               | HTML 에 적힌 기존 문구 그대로          |

- 문구 형식(대소문자, `ⓒ` 접두, `(주)` 표기)은 템플릿마다 달라서 **형식은 `data-copyright` 속성값이 갖고
  매퍼는 이름만 바꾼다**.
- 값이 없을 때(백오피스 미입력 → `""`) 는 건드리지 않으므로 기존 트립일레븐 문구가 그대로 남는다.
- `trip11.kr` 링크는 변경하지 않는다.

---

## landing.html (선택 기능 — 여러 숙소 게이트)

t-template-A 와 같은 구현이다 (상세 스키마·카드 구조는 `t-template-A/data-mapping.md` 의 landing 절).
헤더/푸터가 없는 별도 페이지이고, 카드(`pages.landing.sections[0].about[]`, 1~3장)를 그리드로 나란히 놓는다.

**루트 가드** — `IndexMapper.mapPage()` → `maybeRedirectToLanding()` → `shouldEnterLanding()`

- 어드민 프리뷰 iframe 안이면 skip
- `pages.landing.sections[0].enabled !== true` 면 skip — **명시적으로 켠 숙소만** 가로챈다.
  섹션이 없거나 `enabled` 가 false/누락이면 기존처럼 `index.html` 을 그대로 보여준다
- `document.referrer` 가 같은 origin 이면 skip (헤더 로고, 랜딩의 자기 자신 카드)
- `document.referrer` 호스트가 `about[].domain` 중 하나면 skip (연결 숙소 랜딩에서 카드로 넘어옴)
- 그 외 (주소 직접 입력·즐겨찾기·검색/외부 링크) → `location.replace('landing.html')`

`landing.html` 을 직접 열었는데 `enabled !== true` 면 `404.html` 로 보낸다.

쿼리 파라미터 없이 **referrer** 로 "랜딩을 이미 거쳤는지" 를 가른다. 그래서 헤더 로고 링크는 원래대로
`./index.html`, 랜딩 카드도 `./index.html` / `{domain}/` 로 보낸다.

- 크로스 도메인 referrer 는 브라우저 기본 정책(`strict-origin-when-cross-origin`)상 origin 만 오므로 호스트로만 비교한다 (`www.` 유무 무시).
- 연결 숙소 B 의 랜딩 `about[]` 에 A 의 도메인이 없으면, A 랜딩 → B 카드 클릭 시 B 의 랜딩이 한 번 더 뜬다.
- https → http 로 넘어가면 브라우저가 referrer 를 보내지 않아 랜딩이 다시 뜬다 (연결 숙소 도메인은 https 전제).

**카드 링크** (`landing-mapper.js` `getCardLink()`) — 전부 새 탭. 도착한 index 는 referrer 로 랜딩을 건너뛴다 (위 루트 가드 참고)

| 조건                                         | 이동                          |
| -------------------------------------------- | ----------------------------- |
| `about[i].propertyId === property.id`        | `./index.html`                |
| 연결 숙소 + `about[i].domain` 있음           | `{domain}/`                   |
| 연결 숙소인데 `domain` 없음                  | `href="#"` (비활성)           |

카드 배경은 `about[i].images` 첫 장, 로고는 `hero.images[]` 중 `blockId === about[i].blockId`,
로고가 없으면 `about[i].propertyName` 텍스트, `about[i].title` 은 입력했을 때만 보인다.
