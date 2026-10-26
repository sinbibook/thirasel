(function (global) {
  'use strict';

  // 출처 / 거리 판정 (G · E2 · C2 · D2 · L 과 같은 규칙)
  var SOURCE_RE = /^(자료출처|출처)/;
  var DISTANCE_RE = /^(펜션에서|숙소에서)|거리$/;

  function setAllText(selector, value) {
    document.querySelectorAll(selector).forEach(function (el) {
      el.textContent = value;
    });
  }

  function NearbyAttractionsMapper() {
    BaseDataMapper.call(this);
  }
  NearbyAttractionsMapper.prototype = Object.create(BaseDataMapper.prototype);
  NearbyAttractionsMapper.prototype.constructor = NearbyAttractionsMapper;

  // 섹션 배정 — pages.nearbyAttractions.sections[0]
  //   hero.images[0]            → .sub_visual_wide 배경
  //   hero.title / description  → .sub_title_box
  //   about[]                   → .travel_list 항목
  //
  // ⚠️ 이 섹션의 `about` 은 **여행지 항목 배열**이다.
  //    layout-map / reservation 의 `about` 은 단일 객체라 헷갈리기 쉽다.
  //    (main 의 about 만 여기와 같은 배열이다)
  NearbyAttractionsMapper.prototype.getSection = function () {
    var page = this.getPages().nearbyAttractions;
    return (page && page.sections && page.sections[0]) || null;
  };

  NearbyAttractionsMapper.prototype.mapPage = function () {
    var section = this.getSection();

    // enabled=false (또는 섹션 자체가 없음) → 404 리다이렉트.
    // 헤더 TRAVEL 메뉴도 header-footer-mapper 가 같은 기준으로 숨긴다.
    // 백오피스 preview 에서는 리다이렉트하지 않는다 (layout-map 과 같은 규칙).
    if (!section || section.enabled === false) {
      window.location.href = '404.html';
      return;
    }

    this.mapHero();
    this.mapTitleBox();
    this.mapList();
  };

  // MAPPER: hero.images → .sub_visual_wide (390px 고정 배경 + 흰 글자)
  //
  // 대제목(strong)은 `TRAVEL` 로 HTML 에 박아 둔다. 사진 위 38px 대제목 자리라
  // 업주 문구가 들어가면 배경을 가린다 — layout-map 과 같은 판단이다.
  // hero 의 문구는 아래 .sub_title_box 가 받는다.
  //
  // 배경은 hero.images → 여행지 사진 첫 장 → surrounding → exterior → thumbnail 순.
  NearbyAttractionsMapper.prototype.mapHero = function () {
    var self = this;
    var section = this.getSection() || {};
    var hero = section.hero || {};
    var name = this.getPropertyName();

    setAllText('[data-nearby-hero-description]', name ? name + ' 주변 여행지' : '주변 여행지');

    var url =
      this.getFirstSelectedImage(hero.images || []) ||
      this.firstItemImageUrl() ||
      (this.pickPropertyImage(['surrounding', 'exterior', 'thumbnail']) || {}).url ||
      '';

    document.querySelectorAll('[data-nearby-hero]').forEach(function (el) {
      self.setBackground(el, url, '여행지 이미지');
    });
  };

  // 여행지 항목 중 첫 번째로 찾은 사진 (히어로 배경 폴백용)
  NearbyAttractionsMapper.prototype.firstItemImageUrl = function () {
    var items = this.getItems();
    for (var i = 0; i < items.length; i++) {
      var url = this.getFirstSelectedImage((items[i] && items[i].images) || []);
      if (url) return url;
    }
    return '';
  };

  // MAPPER: hero.title / hero.description → .sub_title_box
  //
  // 흰 지면 위 제목이라 업주 문구가 길어져도 레이아웃이 버틴다.
  NearbyAttractionsMapper.prototype.mapTitleBox = function () {
    var self = this;
    var hero = (this.getSection() || {}).hero || {};

    setAllText('[data-nearby-title]', this.firstText(hero.title, 'TOURIST SPOT'));

    var lead = this.firstText(hero.description, '펜션 근처의 주요 관광지 정보를 확인해 보세요.');
    document.querySelectorAll('[data-nearby-lead]').forEach(function (el) {
      el.innerHTML = self.nl2br(lead);
    });
  };

  // 여행지 항목 소스 (앞에서부터 우선)
  //   1) nearbyAttractions.about[]      { title, description, images } — 사진·설명까지
  //   2) property.nearbyAttractions[]   문자열 배열(이름만) — 사진/설명 없음
  NearbyAttractionsMapper.prototype.getItems = function () {
    var section = this.getSection() || {};
    var about = section.about;
    if (Array.isArray(about) && about.length) return about;

    var fallback = this.getProperty().nearbyAttractions || [];
    return fallback
      .map(function (v) {
        return typeof v === 'string' ? { title: v } : v;
      })
      .filter(Boolean);
  };

  // MAPPER: 여행지 목록 → .travel_list ul
  //
  // 원본 li 는 `img + strong + p(본문 + span 출처 + em 거리)` 구조다.
  // `01.` `02.` 번호는 매퍼가 넣지 않는다 — 원본 CSS 의
  // `.travel_list ul li strong:before { counter-increment }` 가 붙인다.
  //
  // 항목이 하나도 없으면 목록을 비운 채 둔다. 2열 float 그리드라
  // 빈 li 를 넣으면 다음 항목의 clear 규칙이 어긋난다.
  NearbyAttractionsMapper.prototype.mapList = function () {
    var self = this;
    var ul = document.querySelector('[data-nearby-list]');
    if (!ul) return;
    ul.innerHTML = '';

    this.getItems().forEach(function (item) {
      var title = self.cleanText(item && item.title);
      if (!title) return;
      ul.appendChild(self.buildItem(item, title));
    });
  };

  NearbyAttractionsMapper.prototype.buildItem = function (item, title) {
    var li = document.createElement('li');
    var images = this.getSelectedImages(item.images || []);
    var first = images[0] || null;

    var img = document.createElement('img');
    if (first && first.url) {
      img.src = first.url;
      img.alt = title;
    } else {
      ImageHelpers.applyPlaceholder(img, '여행지 이미지');
    }
    li.appendChild(img);

    var strong = document.createElement('strong');
    strong.textContent = title;
    li.appendChild(strong);

    var parsed = this.splitDescription(item.description, first);
    // 본문·출처·거리가 모두 없으면 <p> 를 만들지 않는다
    // (property.nearbyAttractions[] 문자열 폴백은 이름만 있다)
    if (!parsed.body && !parsed.source && !parsed.distance) return li;

    var p = document.createElement('p');
    if (parsed.body) p.innerHTML = this.nl2br(parsed.body);

    if (parsed.source) {
      var span = document.createElement('span');
      span.textContent = parsed.source;
      p.appendChild(span);
    }
    if (parsed.distance) {
      var em = document.createElement('em');
      em.textContent = parsed.distance;
      p.appendChild(em);
    }
    li.appendChild(p);
    return li;
  };

  // 본문 / 자료출처 / 거리 세 덩어리로 나눈다.
  //
  //   거리는 images[0].description 이 정본이다.
  //   출처는 전용 필드가 없어 description 안에서 가려낸다.
  //
  // 출처·거리는 **각각 첫 번째로 매칭된 줄 하나만** 쓰고 나머지는 본문으로 남는다.
  // 줄 순서는 상관없다.
  NearbyAttractionsMapper.prototype.splitDescription = function (description, firstImage) {
    var distance = this.cleanText(firstImage && firstImage.description);
    var source = '';
    var body = [];

    this.cleanText(description)
      .split('\n')
      .forEach(function (raw) {
        var line = raw.trim();
        if (!line) return;
        if (!source && SOURCE_RE.test(line)) {
          source = line;
          return;
        }
        if (!distance && DISTANCE_RE.test(line)) {
          distance = line;
          return;
        }
        body.push(line);
      });

    return { body: body.join('\n'), source: source, distance: distance };
  };

  document.addEventListener('DOMContentLoaded', function () {
    // 초기화 주체는 preview-handler 다. 중복 실행을 막는다.
    if (window.previewHandler) return;
    new NearbyAttractionsMapper().initialize();
  });

  global.NearbyAttractionsMapper = NearbyAttractionsMapper;
})(window);
