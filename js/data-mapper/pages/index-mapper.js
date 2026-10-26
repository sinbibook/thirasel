(function (global) {
  'use strict';

  function setAllText(selector, value) {
    document.querySelectorAll(selector).forEach(function (el) {
      el.textContent = value;
    });
  }

  // ── 랜딩 진입 판단 ─────────────────────────────────────────
  // index.html 진입을 landing.html 로 돌려야 하면 true. 쿼리 파라미터 없이 "어디서 왔는지(referrer)" 로 가른다.
  //   - 어드민 프리뷰 iframe → false (운영자가 "홈" 탭을 직접 볼 수 있어야 한다)
  //   - pages.landing.sections[0].enabled !== true → false (명시적으로 켠 경우만. 어드민 저장 시
  //     undefined 는 JSON 에서 키째 빠지므로, 누락을 '켜짐' 으로 보면 랜딩을 안 쓰는 숙소가 튕긴다)
  //   - 같은 사이트 안에서 넘어옴 → false (헤더 로고, 랜딩의 자기 자신 카드)
  //   - 랜딩 카드에 등록된 연결 숙소 도메인에서 넘어옴 → false (그 숙소 랜딩의 카드를 눌러 온 경우)
  //   - 그 외(주소 직접 입력·즐겨찾기·검색/외부 링크) → true
  function shouldEnterLanding(landingPage) {
    if (window.top !== window.self) return false;

    var section = landingPage && landingPage.sections && landingPage.sections[0];
    if (!section || section.enabled !== true) return false;

    return !isFromSameSite() && !isFromLinkedProperty(section);
  }

  function getReferrerUrl() {
    try {
      return document.referrer ? new URL(document.referrer) : null;
    } catch (e) {
      return null;
    }
  }

  function isFromSameSite() {
    var ref = getReferrerUrl();
    return !!ref && ref.origin === window.location.origin;
  }

  // 크로스 도메인 referrer 는 브라우저 기본 정책상 origin 만 오므로 호스트로만 비교한다 (www. 유무는 무시).
  function isFromLinkedProperty(section) {
    var ref = getReferrerUrl();
    if (!ref) return false;

    var refHost = normalizeHost(ref.host);
    return ((section && section.about) || []).some(function (card) {
      var domain = card && typeof card.domain === 'string' ? card.domain.trim() : '';
      if (!domain) return false;
      try {
        var url = new URL(/^https?:\/\//i.test(domain) ? domain : 'https://' + domain);
        return normalizeHost(url.host) === refHost;
      } catch (e) {
        return false;
      }
    });
  }

  // 랜딩으로 이동을 시작했으면 true. location.replace 는 즉시 페이지를 떠나지 않으므로,
  // 그 사이 다른 매핑(헤더 등)이 끝나며 부르는 __tplReveal 이 index 를 잠깐 드러내지 않게 막는 데 쓴다.
  var leavingToLanding = false;

  function goToLanding() {
    leavingToLanding = true;
    window.location.replace('landing.html');
  }

  function normalizeHost(host) {
    return String(host || '').toLowerCase().replace(/^www\./, '');
  }

  function IndexMapper() {
    BaseDataMapper.call(this);
  }
  IndexMapper.prototype = Object.create(BaseDataMapper.prototype);
  IndexMapper.prototype.constructor = IndexMapper;

  IndexMapper.prototype.mapPage = function () {
    if (this.maybeRedirectToLanding()) return;

    this.mapPropertyNames();
    this.mapHero();
    this.mapSpecialIntro();
    this.mapSpecialSlides();
    this.mapRoomIntro();
    this.mapRoomSlides();
    this.mapLandscape();
    this.mapReserve();

    if (typeof window.initIndexSwipers === 'function') window.initIndexSwipers();
  };

  // 루트 가드: 랜딩 진입 대상이면 index.html 진입을 landing.html 로 되돌린다 (판단은 shouldEnterLanding).
  IndexMapper.prototype.maybeRedirectToLanding = function () {
    if (!shouldEnterLanding(this.getPages().landing)) return false;

    goToLanding();
    return true;
  };

  // 섹션 배정 — pages.index.sections[0]
  //   hero    → .main_visual    (히어로 슬라이더 + 문구)
  //   essence → .main_landscape (전경 — 큰 사진 + 썸네일 3장 + 문구)
  //   closing → .main_reserve   (예약 안내 문구 + 사진)
  //
  // .main_special 은 property.facilities[], .main_room 은 customFields.roomtypes[]
  // 가 소스라 배정할 블록이 없다. 두 섹션의 title_box 문구는 원본 문장을
  // 기본값으로 두고 숙소명만 끼워 넣는다.
  //
  // gallery / signature 블록은 index 에서 쓰지 않는다. 원본 index 에는 갤러리
  // 슬라이더도 시그니처 배너도 없다 — 두 블록은 main.html 이 가져간다.
  IndexMapper.prototype.getSection = function () {
    var page = this.getPages().index;
    return (page && page.sections && page.sections[0]) || {};
  };

  IndexMapper.prototype.mapPropertyNames = function () {
    setAllText('[data-property-name-en]', this.getPropertyNameEn());
    setAllText('[data-property-name]', this.getPropertyName());
    this.applyPropertyCaptions();
  };

  // ── 눈썹/본문 두 슬롯 배분 ──────────────────────────────
  // .landscape_box / .reserve_box 의 strong 은 영문 한 줄짜리 디스플레이 슬롯
  // (원본 "Outside View" / "Healing & Rest")이고, p 는 15px 회색 여러 줄이다.
  //
  // 어느 쪽에 무엇이 들어올지 title/description 이름만으로는 정해지지 않는다.
  // 실제 백오피스 데이터가 블록마다 엇갈린다.
  //   essence : title = 150자 한글 문단 / description = "Stay Close To Every Season"
  //   gallery : title = "Preview"       / description = 빈 값
  //
  // 이름 대신 길이로 가른다. 긴 문단이 한 줄짜리 디스플레이 자리에 들어가
  // 레이아웃을 무너뜨리는 사고가 훨씬 크게 티가 나기 때문이다.
  IndexMapper.prototype.EYEBROW_MAX = 30;

  IndexMapper.prototype.pickCopy = function (block) {
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

  // 값이 없으면 요소째 숨긴다. 빈 strong/p 를 남기면 원본 margin 때문에
  // 문구 블록에 빈 줄이 생긴다.
  IndexMapper.prototype.setCopySlot = function (selector, value, asHtml) {
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

  // MAPPER: hero → .main_visual
  //
  // .visual_txt 는 span(작은 영문 눈썹) / strong(대제목) / p(설명) 3줄이다.
  // span 은 원본의 장식 문구("WELCOME TO PENSION")를 그대로 둔다 —
  // 대응하는 데이터 필드가 없고, 숙소마다 달라질 문구도 아니다.
  //
  // 대제목은 hero.title → 영문 숙소명 순으로 떨어진다.
  // 설명은 폴백 없이 hero.description 만 쓰고, 비면 <p> 째 숨긴다.
  // (property.subtitle 로 폴백하면 백오피스에서 의도적으로 비운 값을 되살린다)
  IndexMapper.prototype.mapHero = function () {
    var self = this;
    var hero = this.getSection().hero || {};
    var images = this.getSelectedImages(hero.images || []);

    setAllText('[data-index-hero-title]', this.firstText(hero.title, this.getPropertyNameEn()));
    this.setCopySlot('[data-index-hero-description]', this.cleanText(hero.description), true);

    var wrapper = document.querySelector('[data-index-hero-slides]');
    if (!wrapper) return;
    wrapper.innerHTML = '';

    // 원본 슬라이드는 <div> 배경 이미지다(내용 없음). 이미지가 없으면
    // 100vh 짜리 빈 화면이 되므로 placeholder 슬라이드 한 장을 세운다.
    if (!images.length) {
      var empty = document.createElement('div');
      empty.className = 'swiper-slide';
      ImageHelpers.applyBackgroundPlaceholder(empty, 'Hero Image');
      wrapper.appendChild(empty);
      return;
    }

    images.forEach(function (img) {
      var slide = document.createElement('div');
      slide.className = 'swiper-slide';
      self.setBackground(slide, img.url, 'Hero Image');
      wrapper.appendChild(slide);
    });
  };

  // MAPPER: .main_special .title_box — 배정할 섹션 블록이 없어 원본 문구가 기본값이다
  IndexMapper.prototype.mapSpecialIntro = function () {
    var name = this.getPropertyName();
    setAllText(
      '[data-index-special-description]',
      (name ? name + '의 ' : '') + '부대시설과 특장점을 확인해 보세요.'
    );
  };

  // MAPPER: property.facilities[] → .main_special .swiper-wrapper
  // 카드 마크업이 facility.html 하단과 같아 base 공용 renderSpecialCards 를 쓴다.
  IndexMapper.prototype.mapSpecialSlides = function () {
    this.renderSpecialCards('[data-index-special-slides]');
  };

  // MAPPER: .main_room .title_box — 배정할 섹션 블록이 없어 원본 문구가 기본값이다
  IndexMapper.prototype.mapRoomIntro = function () {
    var name = this.getPropertyName();
    setAllText(
      '[data-index-room-description]',
      '안락하게 준비된 ' + (name ? name + '의 ' : '') + '객실입니다.'
    );
  };

  // MAPPER: customFields.roomtypes[] → .main_room .room_list
  // 카드 마크업은 layout-map 과 같아 base 공용 renderRoomSlides 를 쓴다.
  IndexMapper.prototype.mapRoomSlides = function () {
    this.renderRoomSlides('[data-index-room-slides]');
  };

  // MAPPER: essence → .main_landscape
  //
  // 원본 index.html 은 이 섹션 전용으로 큰 사진 1장 + 썸네일 3장을 직접 고정해
  // 둔다(view.html 갤러리 순서와 다른 자체 큐레이션 순서). 그래서 essence.images 가
  // 있으면 그 순서를 그대로 쓴다. essence.images 가 비어 있는(과거 크롤 결과 등)
  // 경우에만 base 의 getLandscapeImages()(pages.main.about[] → main hero →
  // property.exterior 순)로 폴백한다.
  //
  // 큰 사진 1장 + 썸네일 3장 구조다. 사진이 한 장도 없어도 섹션을 숨기지 않고
  // 큰 자리에 placeholder 를 세운다 — 영역이 통째로 사라지면 편집자가
  // **이 자리가 있다는 것 자체를 모른다.** (main.html 의 외경 블록과 같은 판단)
  //
  // 썸네일은 큰 사진 다음 장부터라, 사진이 없거나 한 장뿐이면 목록이 빈다.
  // 큰 자리 하나만으로 영역을 알리기에 충분해 썸네일까지 placeholder 로 채우지는 않는다.
  IndexMapper.prototype.LANDSCAPE_THUMBS = 3;

  IndexMapper.prototype.mapLandscape = function () {
    var self = this;
    var section = this.getSection();
    var essenceImages = this.getSelectedImages((section.essence && section.essence.images) || []);
    var images = essenceImages.length ? essenceImages : this.getLandscapeImages();
    var wrap = document.querySelector('[data-index-landscape]');

    if (wrap) wrap.style.display = '';

    setAllText('[data-index-landscape-lead]', '여유를 만끽하는 힐링 플레이스');

    var copy = this.pickCopy(section.essence);
    this.setCopySlot('[data-index-landscape-title]', copy.eyebrow || 'Outside View');
    this.setCopySlot('[data-index-landscape-description]', copy.body, true);

    document.querySelectorAll('[data-index-landscape-image]').forEach(function (el) {
      self.setBackground(el, images[0] && images[0].url, '전경 이미지');
    });

    // 썸네일은 큰 사진 다음 장부터. 사진이 1장뿐이면 목록째 비운다
    // (같은 사진을 큰 자리와 썸네일에 겹쳐 쓰지 않는다)
    document.querySelectorAll('[data-index-landscape-thumbs]').forEach(function (ul) {
      ul.innerHTML = '';
      images.slice(1, 1 + self.LANDSCAPE_THUMBS).forEach(function (img) {
        var li = document.createElement('li');
        var el = document.createElement('img');
        el.src = img.url;
        el.alt = '';
        li.appendChild(el);
        ul.appendChild(li);
      });
    });
  };

  // MAPPER: closing → .main_reserve
  //
  // 문구가 비면 signature 로 폴백한다. 원본에서 이 자리는 "마무리 인사" 라
  // 두 블록 중 값이 들어온 쪽을 쓰면 된다.
  // 사진도 closing → signature → hero 순으로 떨어진다. 이 섹션은 문구가
  // 본체라 사진이 없다고 섹션을 숨기지는 않는다(placeholder 로 남긴다).
  IndexMapper.prototype.mapReserve = function () {
    var self = this;
    var section = this.getSection();
    var name = this.getPropertyName();

    setAllText(
      '[data-index-reserve-lead]',
      '편안한 여행을 위한 공간, ' + (name ? this.withJosa(name, '과/와') + ' ' : '') + '함께하세요.'
    );

    var copy = this.pickCopy(section.closing);
    if (!copy.eyebrow && !copy.body) copy = this.pickCopy(section.signature);
    this.setCopySlot('[data-index-reserve-title]', copy.eyebrow || 'Healing & Rest');
    this.setCopySlot('[data-index-reserve-description]', copy.body, true);

    var url =
      this.getFirstSelectedImage((section.closing && section.closing.images) || []) ||
      this.getFirstSelectedImage((section.signature && section.signature.images) || []) ||
      this.getFirstSelectedImage((section.hero && section.hero.images) || []);

    document.querySelectorAll('[data-index-reserve-image]').forEach(function (el) {
      self.setBackground(el, url, '예약 안내 이미지');
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    // 초기화 주체는 preview-handler 다. 중복 실행을 막는다.
    if (window.previewHandler) return;
    new IndexMapper().initialize();
  });

  // 조기 랜딩 가드 — 매핑을 기다리지 않고 이 스크립트가 로드되자마자 랜딩 여부부터 판단한다.
  //   standalone 에서는 preview-handler 가 어드민 데이터를 2초 기다린 뒤에야 index 를 매핑하는데,
  //   그 사이 헤더 매핑이 렌더 게이트를 먼저 풀어 매핑 전 index(히어로 < > 화살표 등)가 보였다가
  //   랜딩으로 넘어갔다. 판단이 끝날 때까지 __tplReveal 을 붙잡아 둔다.
  //   - 랜딩 진입 대상(shouldEnterLanding) → 화면을 풀지 않고 곧장 landing.html. 이동 판단 뒤에 헤더 매핑이
  //     끝나며 노출을 요청해도 무시한다 (판단 = 노출 허용으로 보면 페이지를 떠나기 직전 index 가 비친다)
  //   - 그 외 → 붙잡아 둔 노출을 그대로 진행 (기존과 같은 화면. JSON 한 번 더 읽는 시간만큼 늦게 뜰 수 있다)
  //   - 네트워크 실패/지연 대비 3초 뒤에는 무조건 판단을 끝낸다 (head 의 렌더 게이트 타임아웃과 같은 값)
  //   iframe(어드민 프리뷰)·내부 이동은 JSON 을 읽기 전에 바로 건너뛴다 (어차피 랜딩으로 안 보낸다).
  (function earlyLandingGate() {
    if (window.top !== window.self) return;
    if (isFromSameSite()) return;

    var reveal = window.__tplReveal;
    var decided = false;
    var pending = false;

    function finish() {
      if (decided) return;
      decided = true;
      if (pending && reveal) reveal();
    }

    window.__tplReveal = function () {
      if (leavingToLanding) return; // 랜딩으로 떠나는 중 — 노출하지 않는다
      if (decided) {
        if (reveal) reveal();
      } else {
        pending = true;
      }
    };

    setTimeout(function () {
      pending = true;
      finish();
    }, 3000);

    fetch('standard-template-data.json?t=' + Date.now())
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        var customFields = (data && data.homepage && data.homepage.customFields) || (data && data.customFields) || {};
        var landing = customFields.pages && customFields.pages.landing;
        if (!decided && shouldEnterLanding(landing)) {
          decided = true;
          goToLanding(); // 노출하지 않고 이동한다 (이후 들어오는 노출 요청은 무시)
          return;
        }
        finish();
      })
      .catch(finish);
  })();

  global.IndexMapper = IndexMapper;
})(window);
