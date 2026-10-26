(function (global) {
  'use strict';

  function setAllText(selector, value) {
    document.querySelectorAll(selector).forEach(function (el) {
      el.textContent = value;
    });
  }

  function FacilityMapper() {
    BaseDataMapper.call(this);
  }
  FacilityMapper.prototype = Object.create(BaseDataMapper.prototype);
  FacilityMapper.prototype.constructor = FacilityMapper;

  // 데이터 소스 — pages.facility[] 는 비어 있는 응답이 흔하다(현재 샘플도 []).
  // 상세 내용은 전부 property.facilities[] 에서 온다.
  //   name / description / usageGuide / images[]
  // 정렬(displayOrder)은 base 의 getFacilities() 가 맡는다 —
  // 헤더 서브메뉴 · index 카드 · 이 페이지 탭이 모두 같은 순서를 쓴다.
  FacilityMapper.prototype.getCurrentId = function () {
    var id = new URLSearchParams(window.location.search).get('id');
    if (id) return id;
    // ?id= 없이 들어오면 첫 시설을 보여준다.
    var list = this.getFacilities();
    return list.length ? String(list[0].id) : '';
  };

  FacilityMapper.prototype.mapPage = function () {
    var facility = this.findFacilityById(this.getCurrentId());

    // 시설이 없거나 잘못된 id → 404.
    // 백오피스 preview 에서는 리다이렉트하지 않는다(다른 페이지와 같은 규칙).
    if (!facility) {
      if (!this.isPreviewMode()) {
        window.location.href = '404.html';
        return;
      }
    }

    this.mapPropertyNames();
    this.mapHeading(facility);
    this.mapHeroSlides(facility);
    this.renderFacilityNav(facility);
    this.mapBanner(facility);
    this.mapDetailBlocks(facility);
    this.mapListIntro();
    this.renderSpecialCards('[data-facility-list-slides]');

    if (typeof window.initFacilitySwipers === 'function') window.initFacilitySwipers();
  };

  FacilityMapper.prototype.mapPropertyNames = function () {
    setAllText('[data-property-name-en]', this.getPropertyNameEn());
    setAllText('[data-property-name]', this.getPropertyName());
    this.applyPropertyCaptions();
  };

  // MAPPER: facilities[i].name → 히어로 문구 + .sub_title_box
  //
  // 원본은 strong/h3 에 영문 시설명, p 에 한글명을 넣어 두 줄로 썼다.
  // facilities[] 에 nameEn 이 없는 응답이 일반적이라 제목이 한글명으로 떨어지고,
  // 그때 p 까지 한글명을 넣으면 같은 문구가 두 번 나오므로 p 를 숨긴다.
  // (renderSpecialCards 의 카드 제목과 같은 규칙)
  FacilityMapper.prototype.mapHeading = function (facility) {
    var name = this.cleanText(facility && facility.name);
    var nameEn = this.cleanText(facility && facility.nameEn);

    setAllText('[data-facility-name]', nameEn || name);

    var caption = nameEn && name !== nameEn ? name : '';
    document.querySelectorAll('[data-facility-caption]').forEach(function (el) {
      el.textContent = caption;
      el.style.display = caption ? '' : 'none';
    });
  };

  // MAPPER: facilities[i].images → .sub_visual 슬라이더
  FacilityMapper.prototype.mapHeroSlides = function (facility) {
    var self = this;
    var images = this.getSelectedImages((facility && facility.images) || []);

    var wrapper = document.querySelector('[data-facility-hero-slides]');
    if (!wrapper) return;
    wrapper.innerHTML = '';

    // 사진이 없으면 100vh 빈 화면이 되므로 placeholder 슬라이드 한 장을 세운다
    if (!images.length) {
      var empty = document.createElement('div');
      empty.className = 'swiper-slide';
      ImageHelpers.applyBackgroundPlaceholder(empty, '부대시설 이미지');
      wrapper.appendChild(empty);
      return;
    }

    images.forEach(function (img) {
      var slide = document.createElement('div');
      slide.className = 'swiper-slide';
      self.setBackground(slide, img.url, '부대시설 이미지');
      wrapper.appendChild(slide);
    });
  };

  // MAPPER: getFacilities() → .cate_box 시설 탭
  //
  // 원본에는 맨 앞에 '미리보기'(special.html) li 가 있지만 우리 템플릿에는
  // 시설 목록 페이지가 없어 시설만 나열한다. 현재 시설에 .on 을 준다.
  FacilityMapper.prototype.renderFacilityNav = function (facility) {
    var currentId = facility && facility.id;
    var facilities = this.getFacilities();

    document.querySelectorAll('[data-facility-nav]').forEach(function (ul) {
      ul.innerHTML = '';
      facilities.forEach(function (f) {
        var label = String(f.name || '').trim();
        if (!label) return;
        var li = document.createElement('li');
        if (String(f.id) === String(currentId)) li.className = 'on';
        var a = document.createElement('a');
        a.href = './facility.html?id=' + f.id;
        a.textContent = label;
        // 탭이 화면을 넘치면 가로 스크롤로 밀어서 봐야 한다.
        // 스크롤 없이도 전체 이름을 확인할 수 있게 툴팁으로 남긴다.
        a.title = label;
        li.appendChild(a);
        ul.appendChild(li);
      });
    });
  };

  // MAPPER: facilities[i] → .special_bnr (180px 사진 띠 + 문구)
  //
  // 원본 문구는 세 덩이였다.
  //   strong "여행에 빠질 수 없는 바베큐 파티"   ← 배너 소제목
  //   p      "아늑한 공간에서 …"                 ← 소개문
  //   p 끝   "※ 자세한 사항은 이용안내 참고…"    ← 이용안내
  //
  // 우리 데이터에는 배너 소제목에 대응하는 필드가 없다. **자리를 비워 둔다.**
  //
  // 시설명을 넣지 않는 이유: 이 배너 위에서 시설명이 이미 두 번 나온다
  // (히어로 문구 + .sub_title_box h3). 세 번째로 반복할 값이 없다.
  //
  // ⚠️ description 의 첫 줄을 소제목으로 올리지도 않는다. description 은
  //    "잔잔하게 흐르는 강을 바라보며\n편안한 쉼의 순간을 느껴보세요." 처럼
  //    한 문장을 줄바꿈한 것이라, 첫 줄만 21px 볼드로 키우면 한 문장이 서로 다른
  //    서체로 쪼개진다. 개행은 줄바꿈일 뿐 제목 경계가 아니다.
  //
  // usageGuide 는 원본의 "※ 자세한 사항은 …" 자리다. 소개문 아래 한 줄 띄고 붙인다.
  FacilityMapper.prototype.mapBanner = function (facility) {
    var self = this;
    var description = this.cleanText(facility && facility.description);
    var usageGuide = this.cleanText(facility && facility.usageGuide);

    // 소제목은 항상 비어 있다. 원본에서 이 strong 의 margin:2.3em 0 0.47em 이
    // 사진 띠와 소개문 사이 간격을 만들고 있었으므로, 숨길 때는 그 간격을
    // p 가 대신 갖도록 .txt_box 에 .no_title 을 붙인다.
    document.querySelectorAll('[data-facility-banner-title]').forEach(function (el) {
      el.textContent = '';
      el.style.display = 'none';
      var box = el.closest('.txt_box');
      if (box) box.classList.add('no_title');
    });

    var html = description ? this.nl2br(description) : '';
    if (usageGuide) {
      // 소개문이 있으면 한 줄 띄우고 이어 붙인다 (원본의 <br><br> 자리)
      html += (html ? '<br /><br />' : '') + this.nl2br(usageGuide);
    }

    document.querySelectorAll('[data-facility-description]').forEach(function (el) {
      el.innerHTML = html;
      el.style.display = html ? '' : 'none';
    });

    // 배너 사진은 첫 장. 없으면 placeholder (배너는 이 페이지의 본문이라 유지한다)
    var url = this.getFirstSelectedImage((facility && facility.images) || []);
    document.querySelectorAll('[data-facility-banner-image]').forEach(function (el) {
      self.setBackground(el, url, '부대시설 이미지');
    });
  };

  // 상세 이미지 블록 리듬 — 원본이 고정 2블록이다.
  // udosky special1·2·3·5 / gpcaravan special1 이 모두 같다.
  //
  //   1. sub_img_wrap        2장  .inner 있음
  //   2. sub_img_wrap type3  1장  .inner 있음
  //
  // room.html 과 달리 전폭 배너가 없다(둘 다 .inner). 그 역할은 .special_bnr 가 한다.
  //
  // 배너가 첫 장을 쓰므로 상세는 **두 번째 장부터** 3장을 가져간다.
  // 사진이 모자라면 뒤 블록을 만들지 않는다 — 원본 special4 가 히어로 3장뿐이라
  // 배너(1) + 2장 블록에서 끝나고 type3 블록이 아예 없다.
  FacilityMapper.prototype.DETAIL_PATTERN = [
    { count: 2, cls: 'sub_img_wrap' },
    { count: 1, cls: 'sub_img_wrap type3' }
  ];

  // MAPPER: facilities[i].images[1..] → .sub_img_wrap 상세 이미지 블록
  FacilityMapper.prototype.mapDetailBlocks = function (facility) {
    var self = this;
    var pattern = this.DETAIL_PATTERN;
    var limit = pattern.reduce(function (sum, spec) {
      return sum + spec.count;
    }, 0);

    // 배너가 쓴 첫 장은 건너뛴다 (같은 사진이 위아래로 겹치지 않게)
    var images = this.getSelectedImages((facility && facility.images) || []).slice(1, 1 + limit);

    var container = document.querySelector('[data-facility-detail-blocks]');
    if (!container) return;
    container.innerHTML = '';

    var cursor = 0;
    for (var step = 0; step < pattern.length && cursor < images.length; step++) {
      var spec = pattern[step];
      var chunk = images.slice(cursor, cursor + spec.count);
      cursor += chunk.length;

      var wrap = document.createElement('div');
      // 남은 장수가 모자라면 실제 장수에 맞는 클래스로 낮춘다
      wrap.className = chunk.length < spec.count ? 'sub_img_wrap type3' : spec.cls;

      var inner = document.createElement('div');
      inner.className = 'inner';
      var ul = document.createElement('ul');
      chunk.forEach(function (img) {
        var li = document.createElement('li');
        self.setBackground(li, img.url, '부대시설 이미지');
        ul.appendChild(li);
      });
      inner.appendChild(ul);
      wrap.appendChild(inner);
      container.appendChild(wrap);
    }

    container.style.display = container.children.length ? '' : 'none';
  };

  // MAPPER: .main_special .title_box — 배정할 블록이 없어 원본 문구 + 숙소명이다.
  // index 의 같은 자리와 문구를 맞춘다.
  FacilityMapper.prototype.mapListIntro = function () {
    var name = this.getPropertyName();
    setAllText(
      '[data-facility-list-lead]',
      (name ? name + '의 ' : '') + '부대시설과 특장점을 확인해 보세요.'
    );
  };

  document.addEventListener('DOMContentLoaded', function () {
    // 초기화 주체는 preview-handler 다. 중복 실행을 막는다.
    if (window.previewHandler) return;
    new FacilityMapper().initialize();
  });

  global.FacilityMapper = FacilityMapper;
})(window);
