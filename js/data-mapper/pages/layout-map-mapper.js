(function (global) {
  'use strict';

  function setAllText(selector, value) {
    document.querySelectorAll(selector).forEach(function (el) {
      el.textContent = value;
    });
  }

  function LayoutMapMapper() {
    BaseDataMapper.call(this);
  }
  LayoutMapMapper.prototype = Object.create(BaseDataMapper.prototype);
  LayoutMapMapper.prototype.constructor = LayoutMapMapper;

  // 섹션 배정 — pages.layoutMap.sections[0]
  //   hero.images            → .sub_visual_wide 배경
  //   hero.title/description → .sub_title_box (배치도 위 제목)
  //   about.images           → .wide_img (배치도)
  //
  // ⚠️ 히어로 사진 위 문구(strong/p)는 index / main 과 마찬가지로 **고정**이다.
  //    사진 위에 얹히는 38px 대제목 자리라 업주가 넣은 긴 문장이 들어가면
  //    배경을 가리고 줄바꿈이 무너진다. hero 블록의 문구는 흰 지면 위
  //    .sub_title_box 에서 받는다.
  //
  // 객실 목록(.main_room)은 customFields.roomtypes[] 가 소스라 배정할 블록이 없다.
  // about.title / about.description 은 쓰지 않는다 — 배정할 자리가 없다.
  //
  // main 의 about[] 은 배열이지만 여기 about 은 **단일 객체**다.
  LayoutMapMapper.prototype.getSection = function () {
    var page = this.getPages().layoutMap;
    return (page && page.sections && page.sections[0]) || null;
  };

  LayoutMapMapper.prototype.mapPage = function () {
    // enabled=false (또는 섹션 자체가 없음) → 404 리다이렉트.
    // 헤더의 '미리보기' li 숨김과 대메뉴 ROOMS 이동처(첫 객실 상세)도
    // header-footer-mapper 가 같은 기준(isLayoutMapEnabled)으로 정한다.
    if (!this.isLayoutMapEnabled()) {
      window.location.href = '404.html';
      return;
    }

    this.mapPropertyNames();
    this.mapHero();
    this.renderRoomNav('[data-layoutmap-room-nav]', null);
    this.mapPreviewIntro();
    this.mapLayoutImages();
    this.mapRoomIntro();
    this.renderRoomSlides('[data-layoutmap-room-slides]');
  };

  LayoutMapMapper.prototype.mapPropertyNames = function () {
    setAllText('[data-property-name-en]', this.getPropertyNameEn());
    setAllText('[data-property-name]', this.getPropertyName());
    this.applyPropertyCaptions();
  };

  // MAPPER: hero.images → .sub_visual_wide 배경
  //
  // 원본은 객실 사진 한 장을 배경으로 깐 390px 띠다(슬라이더가 아니다).
  // 배경 위에 검은 20% 오버레이가 깔리고 흰 글자가 올라간다.
  //
  // 문구는 고정이다(위 「섹션 배정」 참고).
  // 배경은 hero.images → 객실 썸네일 첫 장 → exterior → thumbnail 순으로 떨어진다.
  // 이 페이지는 객실 미리보기라 객실 사진이 exterior 보다 앞선다.
  LayoutMapMapper.prototype.mapHero = function () {
    var self = this;
    var section = this.getSection() || {};
    var hero = section.hero || {};
    var name = this.getPropertyName();

    setAllText('[data-layoutmap-hero-title]', 'ROOMS');
    setAllText(
      '[data-layoutmap-hero-description]',
      name ? name + ', 객실 미리보기' : '객실 미리보기'
    );

    var url =
      this.getFirstSelectedImage(hero.images || []) ||
      this.firstRoomThumbUrl() ||
      (this.pickPropertyImage(['exterior', 'thumbnail']) || {}).url ||
      '';

    document.querySelectorAll('[data-layoutmap-hero]').forEach(function (el) {
      self.setBackground(el, url, '객실 이미지');
    });
  };

  // 객실 썸네일 중 첫 번째로 찾은 URL (히어로 배경 폴백용)
  LayoutMapMapper.prototype.firstRoomThumbUrl = function () {
    var roomtypes = this.getRoomtypes();
    for (var i = 0; i < roomtypes.length; i++) {
      var url = this.getRoomThumbUrl(roomtypes[i]);
      if (url) return url;
    }
    return '';
  };

  // MAPPER: hero.title / hero.description → .sub_title_box
  //
  // 배치도 바로 위 제목이다. 사진 위가 아니라 흰 지면 위 45px 제목이라
  // 업주가 넣은 문구를 그대로 받아도 레이아웃이 무너지지 않는다.
  LayoutMapMapper.prototype.mapPreviewIntro = function () {
    var self = this;
    var section = this.getSection() || {};
    var hero = section.hero || {};
    var name = this.getPropertyName();

    setAllText('[data-layoutmap-title]', this.firstText(hero.title, 'PREVIEW'));

    var desc = this.firstText(
      hero.description,
      name ? name + '의 객실을 미리 만나보세요.' : '객실을 미리 만나보세요.'
    );
    document.querySelectorAll('[data-layoutmap-description]').forEach(function (el) {
      el.innerHTML = self.nl2br(desc);
    });
  };

  // MAPPER: about.images → .wide_img 배치도
  //
  // 원본은 배치도 이미지가 한 장이지만(`<img src="layout.webp">`) 숙소에 따라
  // 동/층별로 여러 장을 올린다. isSelected 순서대로 **전부** 세로로 쌓는다.
  //
  // 이미지가 없어도 영역을 유지하고 placeholder 를 세운다.
  // 배치도는 이 페이지의 본 목적이라, 비었다고 숨기면 객실 목록만 남는다.
  // (room.html 의 평면도는 부가 정보라 반대로 숨긴다)
  LayoutMapMapper.prototype.mapLayoutImages = function () {
    var self = this;
    var section = this.getSection() || {};
    var about = section.about || {};
    var name = this.getPropertyName();

    var host = document.querySelector('[data-layoutmap-images]');
    if (!host) return;
    host.innerHTML = '';

    var altText = name ? name + ' 객실 배치도' : '객실 배치도';
    var images = this.getSelectedImages(about.images || []);

    if (!images.length) {
      var ph = document.createElement('img');
      ImageHelpers.applyPlaceholder(ph, '객실 배치도');
      host.appendChild(ph);
      return;
    }

    images.forEach(function (image) {
      var img = document.createElement('img');
      img.src = image.url;
      img.alt = self.cleanText(image.description) || altText;
      host.appendChild(img);
    });
  };

  // MAPPER: .main_room .title_box — 배정할 블록이 없어 원본 문구 + 숙소명이다.
  // index 의 같은 자리와 문구를 맞춘다.
  LayoutMapMapper.prototype.mapRoomIntro = function () {
    var name = this.getPropertyName();
    setAllText(
      '[data-layoutmap-room-lead]',
      '안락하게 준비된 ' + (name ? name + '의 ' : '') + '객실입니다.'
    );
  };

  document.addEventListener('DOMContentLoaded', function () {
    // 초기화 주체는 preview-handler 다. 중복 실행을 막는다.
    if (window.previewHandler) return;
    new LayoutMapMapper().initialize();
  });

  global.LayoutMapMapper = LayoutMapMapper;
})(window);
