(function (global) {
  'use strict';

  function ReservationMapper() {
    BaseDataMapper.call(this);
  }
  ReservationMapper.prototype = Object.create(BaseDataMapper.prototype);
  ReservationMapper.prototype.constructor = ReservationMapper;

  // 섹션 배정 — pages.reservation.sections[0]
  //   hero.images[0] → .sub_visual_wide 배경
  //   hero.title     → 히어로 p
  //   about.images / hero.images[1..] → 두 dd 의 사진
  //
  // 본문(펜션정보 / 환불정보)은 pages 가 아니라 property 에서 온다.
  //   property.address + usageGuide          → INFORMATION
  //   property.refundPolicies + refundSettings → REFUND INFO
  ReservationMapper.prototype.getSection = function () {
    var page = this.getPages().reservation;
    return (page && page.sections && page.sections[0]) || {};
  };

  ReservationMapper.prototype.mapPage = function () {
    this.mapHero();
    this.mapBlockImages();
    this.mapInfo();
    this.mapRefund();
  };

  // MAPPER: hero → .sub_visual_wide (390px 고정 배경 + 흰 글자)
  //
  // 대제목(strong)은 `RESERVE` 로 HTML 에 박아 둔다.
  // 설명은 hero 문구를 받는다 — layout-map 처럼 .sub_title_box 로 내리지 않는 건
  // 이 페이지의 제목 자리가 `INFORMATION` / `REFUND INFO` 라는 고정 라벨이라
  // 업주 문구를 내려놓을 곳이 없기 때문이다. 한 줄짜리 짧은 자리라 그대로 받는다.
  //
  // reservation.hero 에는 title 과 images 만 있다 — description 필드가 없다
  // (index / main / nearbyAttractions / layoutMap 의 hero 에는 있다).
  ReservationMapper.prototype.mapHero = function () {
    var self = this;
    var hero = this.getSection().hero || {};

    var desc = this.firstText(hero.title, '펜션 이용안내');
    document.querySelectorAll('[data-reservation-hero-description]').forEach(function (el) {
      el.textContent = desc;
    });

    var url =
      this.getFirstSelectedImage(hero.images || []) ||
      (this.pickPropertyImage(['exterior', 'thumbnail']) || {}).url ||
      '';
    document.querySelectorAll('[data-reservation-hero]').forEach(function (el) {
      self.setBackground(el, url, '이용안내 이미지');
    });
  };

  // 두 dd 에 넣을 사진. 히어로 배경이 hero.images 의 첫 장을 쓰므로 그 다음부터 모은다.
  // 같은 사진이 히어로와 본문에 겹쳐 나오지 않게 하기 위해서다.
  ReservationMapper.prototype.getBlockImages = function () {
    var section = this.getSection();
    var about = this.getSelectedImages((section.about && section.about.images) || []);
    var hero = this.getSelectedImages((section.hero && section.hero.images) || []);

    var pool = about.concat(hero.slice(1));
    if (pool.length < 2) pool = pool.concat(this.getPropertyImagesByCategory('exterior'));
    return pool;
  };

  ReservationMapper.prototype.mapBlockImages = function () {
    var self = this;
    var pool = this.getBlockImages();
    var slots = ['[data-reservation-info-image]', '[data-reservation-refund-image]'];

    slots.forEach(function (selector, i) {
      var image = pool[i];
      document.querySelectorAll(selector).forEach(function (el) {
        // 사진이 모자라면 placeholder 를 세운다. 380~400px 짜리 영역이라
        // 숨기면 두 블록의 리듬이 무너진다.
        self.setBackground(el, image && image.url, '이용안내 이미지');
      });
    });
  };

  // MAPPER: property.address + usageGuide → INFORMATION 본문
  //
  // 원본은 "주소 : …" 한 줄 뒤에 [입퇴실안내] [인원추가정보] [개별바베큐] … 를
  // 이어 붙인 긴 글이다. 그 덩어리가 통째로 property.usageGuide 다.
  //
  // ⚠️ checkInOutInfo 를 함께 붙이면 안 된다. usageGuide 안에 이미 [입퇴실안내]
  //    절이 들어 있어 같은 내용이 두 번 나온다. usageGuide 가 비었을 때만
  //    checkInOutInfo + reservationGuide 로 대신한다.
  ReservationMapper.prototype.mapInfo = function () {
    var self = this;
    var prop = this.getProperty();
    var address = this.cleanText(prop.address);

    var guide = this.cleanText(prop.usageGuide);
    if (!guide) {
      guide = [this.cleanText(prop.checkInOutInfo), this.cleanText(prop.reservationGuide)]
        .filter(Boolean)
        .join('\n\n');
    }

    var parts = [];
    if (address) parts.push('주소 : ' + address);
    if (guide) parts.push(guide);

    var html = parts.join('\n\n');
    document.querySelectorAll('[data-reservation-info-body]').forEach(function (el) {
      el.innerHTML = html ? self.nl2br(html) : '';
    });
  };

  // 환불 규정 한 줄 만들기.
  //   가장 이른 날짜   → "이용일 N일 이전 취소 시"  (그보다 전은 모두 같은 조건)
  //   당일(0일)        → "이용일 당일 취소 시"
  //   그 사이          → "이용일 N일 전 취소 시"
  //   비율 100 / 0     → "전액 환불" / "환불 불가"
  ReservationMapper.prototype.formatRefundPolicies = function () {
    var list = (this.getProperty().refundPolicies || [])
      .filter(function (p) {
        return p && p.refundProcessingDays !== undefined && p.refundProcessingDays !== null;
      })
      .slice()
      .sort(function (a, b) {
        return Number(b.refundProcessingDays) - Number(a.refundProcessingDays);
      });

    if (!list.length) return '';

    var maxDays = Number(list[0].refundProcessingDays);

    return list
      .map(function (policy) {
        var days = Number(policy.refundProcessingDays);
        var rate = Number(policy.refundRate);

        var when;
        if (days === 0) when = '이용일 당일';
        else if (days === maxDays) when = '이용일 ' + days + '일 이전';
        else when = '이용일 ' + days + '일 전';

        var what;
        if (isNaN(rate)) what = '문의';
        else if (rate >= 100) what = '전액 환불';
        else if (rate <= 0) what = '환불 불가';
        else what = rate + '% 환불';

        return '* ' + when + ' 취소 시 ' + what;
      })
      .join('\n');
  };

  // MAPPER: property.refundPolicies / refundSettings → REFUND INFO 본문
  //
  // 이 자리는 CSS 가 사진 위에 반투명 박스로 얹는다(.info_wrap dd + dt + dd p).
  // 짧은 글만 들어갈 수 있으므로 규정 목록과 안내 문구만 넣는다.
  ReservationMapper.prototype.mapRefund = function () {
    var self = this;
    var settings = this.getProperty().refundSettings || {};

    var parts = [];
    var policies = this.formatRefundPolicies();
    if (policies) parts.push(policies);

    var notice = this.cleanText(settings.customerRefundNotice);
    if (notice) parts.push(notice);

    var html = parts.join('\n\n');
    document.querySelectorAll('[data-reservation-refund-body]').forEach(function (el) {
      el.innerHTML = html ? self.nl2br(html) : '';
      // 규정이 하나도 없으면 "환불정보" 라벨만 남으므로 문단째 숨긴다
      var host = el.closest('p');
      if (host) host.style.display = html ? '' : 'none';
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    // 초기화 주체는 preview-handler 다. 중복 실행을 막는다.
    if (window.previewHandler) return;
    new ReservationMapper().initialize();
  });

  global.ReservationMapper = ReservationMapper;
})(window);
