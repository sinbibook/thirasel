(function (global) {
  'use strict';

  function setAllText(selector, value) {
    document.querySelectorAll(selector).forEach(function (el) {
      el.textContent = value;
    });
  }

  function MainMapper() {
    BaseDataMapper.call(this);
  }
  MainMapper.prototype = Object.create(BaseDataMapper.prototype);
  MainMapper.prototype.constructor = MainMapper;

  MainMapper.prototype.mapPage = function () {
    this.mapPropertyNames();
    this.mapVisual();
    this.mapWelcome();
    this.mapIntro();
    this.mapAbout();
    this.mapClosing();

    if (typeof window.initMainSwipers === 'function') window.initMainSwipers();
  };

  // 섹션 배정 — pages.main.sections[0]
  //   hero.title/description → .sub_wide_bnr 문구 (숙소 소개 배너 — 원본 about.html)
  //   hero.images[]          → .sub_visual 히어로 슬라이더 전체 **그리고** hero.images[0] 은
  //                            .sub_wide_bnr 배경도 겸한다 (원본이 같은 사진을 재사용하는 구조)
  //   about[]                → .sub_img_wrap (외경 이미지 블록, 개수만큼 생성)
  //
  // 제목 블록 두 개(.sub_title_box)는 배정할 블록이 없어 숙소명 + 원본 문구다.
  //
  // ⚠️ .sub_visual 은 hero.images 를 최우선으로 쓴다(mapVisual). property.images
  // (exterior, 숙소관리 DB)는 PMS 연동 등으로 크롤과 무관하게 이미 채워져 있을 수
  // 있어서, 그걸 먼저 보면 main.html 자체 히어로가 크롤 결과와 다른 사진으로
  // 나오는 문제가 실제로 있었다. exterior 는 hero.images 가 없을 때만 폴백으로 쓴다.
  MainMapper.prototype.getSection = function () {
    var page = this.getPages().main;
    return (page && page.sections && page.sections[0]) || {};
  };

  MainMapper.prototype.getAboutBlocks = function () {
    var about = this.getSection().about;
    return Array.isArray(about) ? about : [];
  };

  // about[] 의 모든 이미지를 블록 순서대로 이어붙인다 (중복 url 제거)
  MainMapper.prototype.getAboutImages = function () {
    var self = this;
    var list = [];
    this.getAboutBlocks().forEach(function (block) {
      self.getSelectedImages((block && block.images) || []).forEach(function (img) {
        var dup = list.some(function (p) {
          return p.url === img.url;
        });
        if (!dup) list.push(img);
      });
    });
    return list;
  };

  MainMapper.prototype.mapPropertyNames = function () {
    setAllText('[data-property-name-en]', this.getPropertyNameEn());
    setAllText('[data-property-name]', this.getPropertyName());
    this.applyPropertyCaptions();
  };

  // 값이 없으면 요소째 숨긴다. 빈 strong/p 를 남기면 원본 margin 때문에 빈 줄이 생긴다.
  MainMapper.prototype.setCopySlot = function (selector, value, asHtml) {
    var self = this;
    document.querySelectorAll(selector).forEach(function (el) {
      if (!value) {
        el.textContent = '';
        el.style.display = 'none';
        return;
      }
      el.style.display = '';
      if (asHtml) el.innerHTML = self.nl2br(value);
      else el.textContent = value;
    });
  };

  // 눈썹/본문 두 슬롯 배분 — index-mapper 의 pickCopy 와 같은 규칙.
  // .sub_img_wrap .txt 의 strong 은 23px 한 줄, p 는 15px 여러 줄이다.
  // title/description 중 어느 쪽에 무엇이 들어올지 이름만으로는 정해지지 않아
  // 길이로 가른다.
  MainMapper.prototype.EYEBROW_MAX = 30;

  MainMapper.prototype.pickCopy = function (block) {
    var a = this.cleanText(block && block.title);
    var b = this.cleanText(block && block.description);

    if (a && b) {
      return a.length <= b.length ? { eyebrow: a, body: b } : { eyebrow: b, body: a };
    }

    var only = a || b;
    if (!only) return { eyebrow: '', body: '' };
    return only.length <= this.EYEBROW_MAX
      ? { eyebrow: only, body: '' }
      : { eyebrow: '', body: only };
  };

  // MAPPER: hero.images(view.html 히어로 전체) → .sub_visual 슬라이더
  //
  // 배정할 섹션 블록이 없어 문구는 원본 문장 + 숙소명이다.
  // 대제목(strong)은 HTML 에 "ABOUT" 으로 박아 둔다 — about 과 합친 페이지라
  // 원본 view.html 의 "LANDSCAPE" 를 쓰지 않는다.
  //
  // ⚠️ hero.images 를 최우선으로 쓴다. property.images(exterior)는 숙소관리 DB
  // 값이라 PMS 연동 등으로 크롤 이전에 이미 채워져 있을 수 있어서, 그쪽을 먼저
  // 보면 main.html 자체 히어로가 실제 크롤 결과(view.html 순서)와 다른 사진으로
  // 나온다 — 실측으로 확인된 문제다. hero.images 가 비어 있을 때만
  // exterior → about[] 순으로 내려간다.
  MainMapper.prototype.mapVisual = function () {
    var self = this;
    var name = this.getPropertyName();

    setAllText(
      '[data-main-visual-description]',
      name ? this.withJosa(name, '을/를') + ' 소개합니다.' : '숙소를 소개합니다.'
    );

    var images = this.getSelectedImages((this.getSection().hero || {}).images || []);
    if (!images.length) images = this.getPropertyImagesByCategory('exterior');
    if (!images.length) images = this.getAboutImages();

    var wrapper = document.querySelector('[data-main-visual-slides]');
    if (!wrapper) return;
    wrapper.innerHTML = '';

    // 사진이 없으면 100vh 빈 화면이 되므로 placeholder 슬라이드 한 장을 세운다
    if (!images.length) {
      var empty = document.createElement('div');
      empty.className = 'swiper-slide';
      ImageHelpers.applyBackgroundPlaceholder(empty, '외경 이미지');
      wrapper.appendChild(empty);
      return;
    }

    images.forEach(function (img) {
      var slide = document.createElement('div');
      slide.className = 'swiper-slide';
      self.setBackground(slide, img.url, '외경 이미지');
      wrapper.appendChild(slide);
    });
  };

  // MAPPER: .sub_title_box (환영 제목) — 배정할 섹션 블록이 없어 숙소명 + 원본 문구다.
  //
  //   h3 = 영문 숙소명 (data-property-name-en, mapPropertyNames 가 채운다)
  //   p  = "{숙소명}에 오신 것을 환영합니다."
  //
  // 원본 about.html 에서 소개 배너 바로 위에 있던 제목이다. padding:100px 0 30px
  // 을 갖고 있어 탭 흰 띠와 520px 배너 사이 여백도 이 블록이 만든다.
  // 숙소명이 한글·영문 모두 없으면 빈 여백만 170px 남으므로 블록째 숨긴다.
  MainMapper.prototype.mapWelcome = function () {
    var name = this.getPropertyName();
    var nameEn = this.getPropertyNameEn();

    setAllText('[data-main-welcome-lead]', name ? name + '에 오신 것을 환영합니다.' : '');

    document.querySelectorAll('[data-main-welcome]').forEach(function (el) {
      el.style.display = name || nameEn ? '' : 'none';
    });
  };

  // MAPPER: hero → .sub_wide_bnr (원본 about.html 의 소개 배너)
  //
  // 배경사진 위 우측에 반투명 흰 상자가 얹히고 그 안에 인사말 + 소개문이 들어간다.
  // 두 슬롯의 역할이 원본에서 명확해 pickCopy(길이 기준 배분)를 쓰지 않는다.
  //   strong = hero.title       → 'Welcome to {영문 숙소명}'
  //   p      = hero.description → 폴백 없음
  //
  // 사진도 문구도 하나도 없으면 배너째 숨긴다 — 520px 빈 상자가 남는 것보다 낫다.
  MainMapper.prototype.mapIntro = function () {
    var self = this;
    var hero = this.getSection().hero || {};
    var nameEn = this.getPropertyNameEn();

    var url =
      this.getFirstSelectedImage(hero.images || []) ||
      (this.pickPropertyImage(['exterior', 'thumbnail']) || {}).url ||
      '';
    var title = this.firstText(hero.title, nameEn ? 'Welcome to ' + nameEn : '');
    var desc = this.cleanText(hero.description);

    var wrap = document.querySelector('[data-main-intro]');
    if (!url && !title && !desc) {
      if (wrap) wrap.style.display = 'none';
      return;
    }
    if (wrap) wrap.style.display = '';

    this.setCopySlot('[data-main-intro-title]', title);
    this.setCopySlot('[data-main-intro-description]', desc, true);

    document.querySelectorAll('[data-main-intro]').forEach(function (el) {
      self.setBackground(el, url, '소개 이미지');
    });
  };

  // 외경 블록의 폭 규칙 — **전폭 한 줄과 2열 한 줄을 번갈아** 쓴다.
  //
  //   1장  sub_img_wrap type3  100%
  //   2장  sub_img_wrap        67% + 32%   (큰 것 왼쪽)
  //   2장  sub_img_wrap type2  32% + 67%   (좌우 반전)
  //
  //   예) 4장 → 100% · 2열 · 100%      6장 → 100% · 2열 · 100% · 2열
  //
  // ⚠️ type1(33.3% 3열)은 쓰지 않는다. 그건 우리가 가져오지 않은 about.html 의
  //    SOMETHING SPECIAL 섹션 것이고, 골격을 가져온 view.html 에는 없다.
  //
  // 2열 줄은 기본 / type2 를 번갈아 써 좌우 리듬을 만든다. 그 순번은 블록을
  // 넘어서도 이어진다.
  MainMapper.prototype.twoUpClass = function (index) {
    return index % 2 === 0 ? 'sub_img_wrap' : 'sub_img_wrap type2';
  };

  // 블록 하나를 만든다. images 가 비면 spec.count 만큼 placeholder 칸을 세운다.
  MainMapper.prototype.buildAboutBlock = function (images, copy, spec) {
    var self = this;

    var wrap = document.createElement('div');
    // 사진이 모자란 블록은 실제 장수에 맞는 클래스로 낮춘다 — 2칸 자리에 한 장만
    // 넣으면 옆이 빈다. 빈 뼈대는 원래 장수 그대로 보여야 자리를 알 수 있다.
    wrap.className = images.length && images.length < spec.count ? 'sub_img_wrap type3' : spec.cls;

    var inner = document.createElement('div');
    inner.className = 'inner';

    var ul = document.createElement('ul');
    var slots = images.length ? images : new Array(spec.count).fill(null);
    slots.forEach(function (img) {
      var li = document.createElement('li');
      if (img) self.setBackground(li, img.url, '외경 이미지');
      else ImageHelpers.applyBackgroundPlaceholder(li, '외경 이미지');
      ul.appendChild(li);
    });
    inner.appendChild(ul);

    // 문구가 둘 다 비면 .txt 를 만들지 않는다 (margin-top 15px 짜리 빈 칸 방지)
    if (copy && (copy.eyebrow || copy.body)) {
      var txt = document.createElement('div');
      txt.className = 'txt';
      if (copy.eyebrow) {
        var strong = document.createElement('strong');
        strong.textContent = copy.eyebrow;
        txt.appendChild(strong);
      }
      if (copy.body) {
        var para = document.createElement('p');
        para.innerHTML = this.nl2br(copy.body);
        txt.appendChild(para);
      }
      inner.appendChild(txt);
    }

    wrap.appendChild(inner);
    return wrap;
  };

  // MAPPER: about[] → .sub_img_wrap 반복 블록
  //
  // 한 블록의 사진을 전폭(1장) / 2열(2장) 을 번갈아 가며 나눠 담는다.
  //   1장 → 전폭            2장 → 2열 한 줄
  //   3장 → 전폭 · 2열      4장 → 전폭 · 2열 · 전폭
  //
  // 남은 사진이 정확히 2장인데 차례가 전폭이면 2열로 바꾼다. 그러지 않으면
  // 2장짜리 블록이 전폭 두 줄로 쪼개져 리듬이 깨진다.
  //
  // 블록의 문구는 그 블록의 **첫 줄에만** 붙인다.
  //
  // 사진이 없어도 블록을 세운다. 백오피스에서 아직 아무것도 넣지 않았을 때
  // 영역이 통째로 사라지면 편집자가 이 자리가 있다는 것 자체를 모른다.
  // 그래서 제목(.sub_title_box)도 항상 남는다.
  MainMapper.prototype.mapAbout = function () {
    var self = this;
    var name = this.getPropertyName();
    var container = document.querySelector('[data-main-about-blocks]');
    var heading = document.querySelector('[data-main-about-heading]');

    setAllText('[data-main-about-lead]', (name ? name + '의 ' : '') + '외부 전경입니다.');

    if (heading) heading.style.display = '';
    if (!container) return;
    container.innerHTML = '';
    container.style.display = '';

    var twoUp = 0; // 2열 줄의 순번 (좌우 교차용)

    function twoUpSpec() {
      var spec = { count: 2, cls: self.twoUpClass(twoUp) };
      twoUp++;
      return spec;
    }
    var fullSpec = { count: 1, cls: 'sub_img_wrap type3' };

    this.getAboutBlocks().forEach(function (block) {
      var images = self.getSelectedImages((block && block.images) || []);
      var copy = self.pickCopy(block);

      if (!images.length) {
        container.appendChild(self.buildAboutBlock([], copy, fullSpec));
        return;
      }

      var cursor = 0;
      var wantFull = true; // 전폭부터 시작해 2열과 번갈아 간다
      var first = true;

      while (cursor < images.length) {
        var left = images.length - cursor;
        // 남은 게 딱 2장이면 전폭 차례라도 2열로 묶는다
        var spec = wantFull && left !== 2 ? fullSpec : twoUpSpec();
        var chunk = images.slice(cursor, cursor + spec.count);
        cursor += chunk.length;

        container.appendChild(self.buildAboutBlock(chunk, first ? copy : null, spec));
        first = false;
        wantFull = !wantFull;
      }
    });

    // about[] 이 아예 비었으면 자리만 알리는 블록 하나를 세운다
    if (!container.children.length) {
      container.appendChild(self.buildAboutBlock([], null, fullSpec));
    }
  };

  // MAPPER: .view_wide_bnr — 배정할 섹션 블록이 없어 숙소명 + 원본 고정 문구다.
  //
  // 배경은 외경 사진의 마지막 장을 쓴다. 히어로 슬라이더가 같은 목록을 쓰지만
  // 배경이라 겹쳐도 문제되지 않고, 첫 장을 쓰면 히어로 첫 화면과 곧바로 붙어
  // 같은 사진이 두 번 보인다.
  //
  // ⚠️ about[] 을 먼저 본다 — 크롤러가 원본 .view_wide_bnr 배경을 이미 about[]
  // 마지막 블록에 이어붙여 두므로(template-h/crawl.js) about[] 쪽이 항상 정확하다.
  // property.images(exterior)는 PMS 연동 등으로 크롤과 무관하게 채워져 있을 수
  // 있어 about[] 이 비었을 때만 폴백으로 쓴다.
  MainMapper.prototype.mapClosing = function () {
    var self = this;
    var nameEn = this.getPropertyNameEn();
    var name = this.getPropertyName();

    setAllText('[data-main-closing-title]', 'Welcome To ' + (nameEn || name || ''));

    var images = this.getAboutImages();
    if (!images.length) images = this.getPropertyImagesByCategory('exterior');
    var url = images.length
      ? images[images.length - 1].url
      : this.getFirstSelectedImage((this.getSection().hero || {}).images || []);

    document.querySelectorAll('[data-main-closing]').forEach(function (el) {
      self.setBackground(el, url, '마무리 배너 이미지');
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    // 초기화 주체는 preview-handler 다. 중복 실행을 막는다.
    if (window.previewHandler) return;
    new MainMapper().initialize();
  });

  global.MainMapper = MainMapper;
})(window);
