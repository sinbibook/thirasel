(function (global) {
  'use strict';

  var YBS_BASE_URL = 'https://www.yapen.co.kr/external?ypIdx=';

  // 상담하기 — 뒤에 property.tripPropertyId 가 붙는다
  var CONSULT_BASE_URL = 'https://www.bookingplay.co.kr/api/cti_eicn/kakao_happy_talk?tid=';

  // 파트너 타입 — 원천은 백오피스 DB `public.contract_info.partner_type` 이고
  // BFF 가 코드 문자열을 그대로 내려준다. **분기는 템플릿이 한다**(PC/모바일은 템플릿만 안다).
  //
  //   distributor_a  총판A     PC 상담하기 / 모바일 상담하기 + 예약하기
  //   distributor_b  총판B     PC 없음     / 모바일 예약하기
  //   sales_agency   판매대행  PC 없음     / 모바일 예약하기
  //
  // ⚠️ 예약하기는 **파트너 타입과 무관**하다 — 세 타입 모두 모바일에서만 뜬다.
  //    그건 기존 `.ft_btn_reserve.for_m` 의 미디어쿼리가 이미 하고 있어 손대지 않는다.
  //    타입으로 갈리는 것은 상담하기 하나뿐이다.
  var CONSULT_PARTNER_TYPES = ['distributor_a'];

  // ⚠️ base-mapper 에 `cleanText` 가 없는 템플릿이 있어 의존하지 않는다.
  function consultText(v) {
    return v === undefined || v === null ? '' : String(v).trim();
  }

  // 백오피스가 전달한 실시간 달력 링크가 http(s) URL일 때만 푸터에 노출한다.
  function mapFooterCalendar(data) {
    var homepageFields = data && data.homepage && data.homepage.customFields;
    var fields = homepageFields || (data && data.customFields) || {};
    var raw = fields.footer && fields.footer.calendarUrl;
    var value = typeof raw === 'string' ? raw.trim() : '';
    var valid = false;
    if (/^https?:\/\//i.test(value)) {
      try {
        var parsed = new URL(value);
        valid = (parsed.protocol === 'http:' || parsed.protocol === 'https:') && !!parsed.hostname;
      } catch (error) {
        valid = false;
      }
    }
    document.querySelectorAll('[data-calendar-wrap]').forEach(function (el) {
      el.style.display = valid ? '' : 'none';
    });
    document.querySelectorAll('[data-calendar-link]').forEach(function (el) {
      if (valid) el.setAttribute('href', value);
      else el.removeAttribute('href');
    });
  }

  function HeaderFooterMapper() {
    BaseDataMapper.call(this);
  }
  HeaderFooterMapper.prototype = Object.create(BaseDataMapper.prototype);
  HeaderFooterMapper.prototype.constructor = HeaderFooterMapper;

  HeaderFooterMapper.prototype.mapPage = function () {
    this.mapPropertyNames();
    this.mapFavicon();
    this.mapBookingLinks();
    this.mapYbs();
    this.mapConsult();
    this.mapSocialLinks();
    this.mapRoomMenu();
    this.mapSpecialMenu();
    this.mapPageToggles();
    this.mapFooter();
    mapFooterCalendar(this.data);
    // SEO: homepage.seo → title + description/keywords + 네이버/구글 사이트 인증 (전 페이지 공통)
    this.updateMetaTags();
    // 예약하기·YBS·SNS 노출이 정해진 뒤라야 메뉴 오른쪽 여유(--hd-reserve)가 맞다
    this.watchScrollLogo();
  };

  // 페이지 enabled 여부 (sections[0].enabled === false 이면 비활성)
  HeaderFooterMapper.prototype.isPageEnabled = function (pageKey) {
    var page = this.getPages()[pageKey];
    var section = page && page.sections && page.sections[0];
    return !(section && section.enabled === false);
  };

  // 로고 이미지 / 텍스트 폴백.
  // 템플릿에 고정 로고 파일을 두지 않으므로 3단으로 떨어뜨린다.
  //   homepage.images[0].logo[isSelected] → 숙소명 텍스트 → placeholder
  //
  // 원본(udosky/gpcaravan)의 로고는 이미지가 아니라 텍스트 2줄이다.
  //   .logo  = 영문명(Oswald, 브랜드색) + .logo_sub 한글 숙소명
  //   .logo2 = 영문명 한 줄 (헤더 축소 상태에서만 노출)
  // 그래서 이미지가 있을 때는 두 줄을 모두 숨긴다.
  HeaderFooterMapper.prototype.applyLogo = function (host, logoUrl, name, nameEn) {
    if (!host) return;
    var img = host.querySelector('[data-logo-image]');
    var textEl = host.querySelector('.logo_text');
    var subEl = host.querySelector('.logo_sub');
    if (!img) return;

    var showText = function (visible) {
      if (textEl) textEl.style.display = visible ? '' : 'none';
      // 부제(한글 숙소명)는 영문명과 값이 같으면 같은 줄이 두 번 나오므로 숨긴다
      if (subEl) {
        var dup = !name || name === (nameEn || '');
        subEl.style.display = visible && !dup ? '' : 'none';
      }
    };

    if (logoUrl) {
      img.src = logoUrl;
      img.alt = name || nameEn || 'logo';
      img.style.display = '';
      showText(false);
      return;
    }

    if (name || nameEn) {
      img.style.display = 'none';
      img.removeAttribute('src');
      if (textEl) textEl.textContent = nameEn || name;
      if (subEl) subEl.textContent = name;
      showText(true);
      return;
    }

    // 로고도 숙소명도 없으면(데이터 미입력) 영역이 사라지지 않도록
    // 매핑 위치 안내용 placeholder 를 세운다.
    ImageHelpers.applyPlaceholder(img, '로고');
    img.style.display = '';
    showText(false);
  };

  // MAPPER: homepage.images[0].logo / property name → 헤더 로고(.logo / .logo2)
  HeaderFooterMapper.prototype.mapPropertyNames = function () {
    var self = this;
    var nameEn = this.getPropertyNameEn();
    var name = this.getPropertyName();
    var logoUrl = this.getLogo();

    document.querySelectorAll('[data-property-name-en]').forEach(function (el) {
      el.textContent = nameEn;
    });
    document.querySelectorAll('[data-property-name]').forEach(function (el) {
      el.textContent = name;
    });

    // 로고 슬롯(.logo_text / .logo_sub)은 data-property-name* 를 달지 않고
    // applyLogo 가 값·표시 여부를 함께 정한다 (header.html 주석 참고)
    document.querySelectorAll('.logo, .logo2').forEach(function (host) {
      self.applyLogo(host, logoUrl, name, nameEn);
    });
  };

  // 스크롤 상태(.header.on) 숙소명(.logo2) 글자 맞춤.
  // CSS 가 긴 숙소명 뒤로 메뉴를 밀고(style.css "스크롤 상태 긴 숙소명"), 그래도 메뉴가
  // 예약하기·YBS·SNS 자리(.hd_lnb margin-right)를 침범하면 숙소명 글자를 줄여 한 줄에 맞춘다.
  // 넓은 화면·짧은 이름은 넘치지 않으므로 CSS 글자 크기 그대로다.
  // 폭(리사이즈·.on 전환)·로고 표시(fadeIn)·웹폰트 로드가 모두 크기 변화라 ResizeObserver 하나로 받는다.
  HeaderFooterMapper.prototype.SCROLL_LOGO_MIN = 14;

  HeaderFooterMapper.prototype.fitScrollLogo = function () {
    var header = document.querySelector('.header');
    var inner = header && header.querySelector('.hd_inner');
    var link = header && header.querySelector('.logo2 a');
    var text = link && link.querySelector('.logo_text');
    var lnb = header && header.querySelector('.hd_lnb');
    if (!inner || !text || !lnb) return;

    link.style.fontSize = '';
    if (!header.classList.contains('on') || !lnb.offsetWidth || !text.offsetWidth) return;

    var size = parseFloat(getComputedStyle(link).fontSize);
    for (var i = 0; i < 20; i++) {
      var over =
        lnb.getBoundingClientRect().right +
        parseFloat(getComputedStyle(lnb).marginRight) -
        inner.getBoundingClientRect().right;
      if (over <= 0.5) return;
      var width = text.getBoundingClientRect().width;
      var next = Math.min(size - 1, Math.floor((size * (width - over)) / width));
      next = Math.max(this.SCROLL_LOGO_MIN, next);
      if (next >= size) return;
      size = next;
      link.style.fontSize = size + 'px';
    }
  };

  HeaderFooterMapper.prototype.watchScrollLogo = function () {
    var self = this;
    var inner = document.querySelector('.header .hd_inner');
    var logo2 = document.querySelector('.header .logo2');
    if (!inner || !logo2) return;
    // 미리보기는 데이터가 바뀔 때마다 mapPage 를 다시 부르므로 이전 관찰을 끊는다
    if (global.__hdScrollLogoObserver) global.__hdScrollLogoObserver.disconnect();
    if (typeof ResizeObserver === 'undefined') return;
    var observer = new ResizeObserver(function () {
      self.fitScrollLogo();
    });
    observer.observe(inner);
    observer.observe(logo2);
    global.__hdScrollLogoObserver = observer;
    self.fitScrollLogo();
  };

  // MAPPER: favicon ← homepage.images[0].logo[isSelected].url
  HeaderFooterMapper.prototype.mapFavicon = function () {
    var logoUrl = this.getLogo();
    if (!logoUrl) return;
    var link = document.querySelector('link[rel="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = logoUrl;
  };

  // MAPPER: property.realtimeBookingId → [data-booking-link] (href 직접 주입)
  HeaderFooterMapper.prototype.mapBookingLinks = function () {
    var bookingUrl = this.getBookingUrl();
    document.querySelectorAll('[data-booking-link]').forEach(function (el) {
      if (bookingUrl && bookingUrl !== '#!') {
        el.href = bookingUrl;
        el.setAttribute('target', '_blank');
      }
    });
  };

  // MAPPER: property.ybsId → [data-ybs-button] (없으면 감싸는 줄째 숨김)
  // 헤더 스크롤 상태의 YBS 버튼(.btn_hd_ybs). 원본(happynadri)처럼 예약하기 오른쪽에 붙는다.
  // 루트에 data-ybs="on" 을 찍어 예약하기·SNS 버튼을 YBS 폭만큼 왼쪽으로 미는 CSS 의 기준으로 쓴다.
  HeaderFooterMapper.prototype.mapYbs = function () {
    var ybsId = this.getProperty().ybsId;
    document.documentElement.setAttribute('data-ybs', ybsId ? 'on' : 'off');
    document.querySelectorAll('[data-ybs-button]').forEach(function (el) {
      var host = el.closest('[data-ybs-wrap]') || el;
      if (!ybsId) {
        host.style.display = 'none';
        return;
      }
      host.style.display = '';
      var target = el.tagName === 'A' ? el : el.querySelector('a');
      if (target) {
        target.href = YBS_BASE_URL + ybsId;
        target.setAttribute('target', '_blank');
      }
    });
  };

  // 상담 URL 에 쓸 tripPropertyId. 없거나 형식이 아니면 빈 문자열.
  HeaderFooterMapper.prototype.getConsultId = function () {
    var raw = consultText(this.getProperty().tripPropertyId);
    // ⚠️ URL 쿼리에 그대로 붙는 값이라 토큰 형태만 통과시킨다. 플레이스홀더
    //    문자열(`숙소 ID` 같은 한글·공백)이 들어와도 링크가 깨지지 않는다.
    return /^[A-Za-z0-9_-]+$/.test(raw) ? raw : '';
  };

  // 상담하기 노출 대상인가 — 파트너 타입 + tripPropertyId 둘 다 있어야 한다.
  HeaderFooterMapper.prototype.isConsultVisible = function () {
    var partnerType = consultText(this.getProperty().partnerType);
    return Boolean(this.getConsultId()) && CONSULT_PARTNER_TYPES.indexOf(partnerType) !== -1;
  };

  // MAPPER: property.tripPropertyId + partnerType → [data-consult-button] (우측 하단 상담하기)
  //
  // 총판A 만 노출하고, `tripPropertyId` 가 비면 타입과 무관하게 숨긴다.
  // 값이 없으면 `[data-consult-wrap]` 째 숨긴다 — 버튼만 숨기면 빈 박스가 남는다.
  HeaderFooterMapper.prototype.mapConsult = function () {
    var tripPropertyId = this.getConsultId();
    var visible = this.isConsultVisible();

    // 상담하기가 빠지면 예약하기 아래가 비어 버린다.
    // CSS 가 위치를 되돌릴 수 있도록 상태를 루트에 찍는다.
    document.documentElement.setAttribute('data-consult', visible ? 'on' : 'off');

    document.querySelectorAll('[data-consult-button]').forEach(function (el) {
      var host = el.closest('[data-consult-wrap]') || el;
      if (!visible) {
        host.style.display = 'none';
        return;
      }
      host.style.display = '';
      var target = el.tagName === 'A' ? el : el.querySelector('a');
      if (target) {
        target.href = CONSULT_BASE_URL + tripPropertyId;
        target.setAttribute('target', '_blank');
      }
    });
  };

  // 소셜 링크 플랫폼 — [data-homepage-socialLinks-{platform}] 와 1:1.
  // 헤더 네이버 버튼은 blog 칸을 쓴다(어드민에서 네이버 플레이스 주소를 blog 에 입력).
  var SOCIAL_PLATFORMS = ['facebook', 'instagram', 'blog', 'youtube'];

  // MAPPER: homepage.socialLinks.{platform} → [data-homepage-socialLinks-{platform}] (href, 없으면 숨김)
  //
  // 마크업 기본 상태가 숨김이라(깜빡임 방지) 값이 있을 때만 노출한다. 값이 null·빈 문자열·공백·키 없음이면 숨긴다.
  // 링크를 감싼 래퍼([data-social-wrap] — 헤더 .hd_inner 의 .hd_sns, aside 맨 아래 .aside_sns)는
  // 보이는 링크가 하나도 없으면 래퍼째 숨겨 빈 칸·여백이 남지 않게 한다.
  // 마크업이 없는 플랫폼(facebook / youtube)은 매칭 요소가 0개라 아무 일도 하지 않는다.
  // 버튼이 하나라도 보이면 루트에 data-social="on" 을 찍는다 — 상단 상태 메뉴 여백·로고 위치 보정 CSS 의
  // 기준이다(:has 대신 — 일부 브라우저에서 스타일 미반영).
  HeaderFooterMapper.prototype.mapSocialLinks = function () {
    var socialLinks = this.getHomepage().socialLinks || {};
    var anyOn = false;
    SOCIAL_PLATFORMS.forEach(function (platform) {
      var url = consultText(socialLinks[platform]);
      document
        .querySelectorAll('[data-homepage-socialLinks-' + platform + ']')
        .forEach(function (el) {
          if (!url) {
            el.style.display = 'none';
            el.setAttribute('href', '#!');
            el.removeAttribute('target');
            el.removeAttribute('rel');
            return;
          }
          el.setAttribute('href', url);
          el.setAttribute('target', '_blank');
          el.setAttribute('rel', 'noopener');
          el.style.display = '';
          anyOn = true;
        });
    });
    document.querySelectorAll('[data-social-wrap]').forEach(function (wrap) {
      var shown = Array.prototype.some.call(wrap.querySelectorAll('a'), function (a) {
        return a.style.display !== 'none';
      });
      wrap.style.display = shown ? '' : 'none';
    });
    document.documentElement.setAttribute('data-social', anyOn ? 'on' : 'off');
  };

  // MAPPER: roomtypes[].name → [data-rooms-submenu] (미리보기 li 뒤에 동적 생성, PC + 모바일 aside)
  HeaderFooterMapper.prototype.mapRoomMenu = function () {
    var self = this;
    var roomItems = this.getRoomMenuItems();
    document.querySelectorAll('[data-rooms-submenu]').forEach(function (container) {
      // 이전 생성분 제거 (preview 재렌더 대비)
      container.querySelectorAll('[data-generated="room"]').forEach(function (li) {
        li.remove();
      });
      roomItems.forEach(function (item) {
        var name = self.getRoomMenuLabel(item);
        // 이름이 없으면 빈 메뉴 항목(여백)이 되므로 건너뜀
        if (!String(name).trim()) return;
        var li = document.createElement('li');
        li.setAttribute('data-generated', 'room');
        var a = document.createElement('a');
        a.href = self.getRoomMenuLink(item);
        a.textContent = name;
        a.title = name; // 메뉴 폭이 좁으면 줄바꿈되므로 전체 문구를 툴팁으로 남긴다
        li.appendChild(a);
        container.appendChild(li);
      });
    });
  };

  // MAPPER: property.facilities[].name → [data-special-submenu] (컨테이너 비우고 동적 생성)
  HeaderFooterMapper.prototype.mapSpecialMenu = function () {
    // getFacilities() 는 displayOrder 로 정렬한다 — index 카드 / facility 탭과 같은 순서
    var facilities = this.getFacilities();
    document.querySelectorAll('[data-special-submenu]').forEach(function (container) {
      container.innerHTML = '';
      facilities.forEach(function (f) {
        if (!f.name || !f.name.trim()) return;
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.href = './facility.html?id=' + f.id;
        a.textContent = f.name;
        a.title = f.name; // 메뉴 폭이 좁으면 줄바꿈되므로 전체 문구를 툴팁으로 남긴다
        li.appendChild(a);
        container.appendChild(li);
      });
    });
  };

  // MAPPER: pages.layoutMap / nearbyAttractions enabled → 메뉴 표시/숨김
  //
  // 미리보기가 꺼지면 "미리보기" li 를 숨기고, 대메뉴 ROOMS([data-rooms-link])는
  // 첫 번째 객실 상세로 보낸다 — 그대로 두면 layout-map.html 이 404 로 튕긴다.
  // 판정은 layout-map.html 의 404 기준과 같은 isLayoutMapEnabled() 를 쓴다.
  HeaderFooterMapper.prototype.mapPageToggles = function () {
    var layoutMapEnabled = this.isLayoutMapEnabled();
    document.querySelectorAll('[data-menu-id="layout-map"]').forEach(function (el) {
      var li = el.closest('li') || el;
      li.style.display = layoutMapEnabled ? '' : 'none';
    });

    var roomsLink = this.getRoomsEntryLink();
    if (roomsLink) {
      document.querySelectorAll('[data-rooms-link]').forEach(function (el) {
        el.setAttribute('href', roomsLink);
      });
    }

    var nearbyEnabled = this.isPageEnabled('nearbyAttractions');
    document.querySelectorAll('[data-travel-menu]').forEach(function (el) {
      el.style.display = nearbyEnabled ? '' : 'none';
    });
  };

  // 전화번호 링크(<a data-footer-phone-link>)를 번호 개수만큼 복제해 " | " 로 구분 노출.
  HeaderFooterMapper.prototype.renderFooterPhones = function (phones) {
    if (!phones.length) return;
    var tel0 = 'tel:' + String(phones[0]).replace(/[^0-9+]/g, '');

    document.querySelectorAll('[data-footer-phone-link]').forEach(function (link) {
      // 번호 텍스트 슬롯이 없는 링크(아이콘 버튼 등)는 첫 번째 번호로 href 만 연결
      if (!link.querySelector('[data-footer-phone]')) {
        link.setAttribute('href', tel0);
        return;
      }

      var parent = link.parentNode;
      if (!parent) return;

      // 멱등: 이전 렌더로 만든 복제 링크/구분자를 정리하고 원본 링크 하나만 남긴다
      parent.querySelectorAll('[data-footer-phone-link]').forEach(function (el, i) {
        if (i > 0) parent.removeChild(el);
      });
      parent.querySelectorAll('[data-footer-phone-sep]').forEach(function (el) {
        parent.removeChild(el);
      });

      phones.forEach(function (phone, idx) {
        var el = idx === 0 ? link : link.cloneNode(true);
        var span = el.querySelector('[data-footer-phone]');
        if (span) span.textContent = phone;
        el.setAttribute('href', 'tel:' + String(phone).replace(/[^0-9+]/g, ''));

        if (idx > 0) {
          var sep = document.createElement('span');
          sep.setAttribute('data-footer-phone-sep', '');
          sep.textContent = ' | ';
          parent.appendChild(sep);
          parent.appendChild(el);
        }
      });
    });
  };

  // MAPPER: property.address / property.contactPhone / property.businessInfo → 푸터
  // 원본 푸터의 주소는 사업장 주소가 아니라 숙소 주소다(Reservation 블록).
  // 전화번호도 businessInfo.businessPhone 이 아니라 노출용 contactPhone 배열을 쓴다.
  // MAPPER: property.tripProviderName → [data-copyright]
  // 공급사명이 있으면 data-copyright 의 템플릿 문자열에서 {provider} 를 치환한다.
  // 값이 없으면(백오피스 미입력 → "") HTML 의 기존 트립일레븐 문구를 그대로 둔다.
  HeaderFooterMapper.prototype.mapCopyright = function () {
    var provider = String(this.getProperty().tripProviderName || '').trim();
    if (!provider) return;
    document.querySelectorAll('[data-copyright]').forEach(function (el) {
      var tpl = el.getAttribute('data-copyright') || '';
      el.textContent = tpl.replace(/\{provider\}/g, provider);
    });
  };

  // MAPPER: customFields.footer.ruralStayMark → [data-footer-rural-stay-mark] (푸터 맨 위, 전화번호 위)
  // 농어촌민박사업자 이미지가 있을 때만 노출하고, 없으면 숨겨 기존 푸터와 같다.
  // 프리뷰는 같은 페이지에서 다시 매핑하므로 매번 표시 상태를 되돌린다.
  HeaderFooterMapper.prototype.mapRuralStayMark = function () {
    var footer = this.getCustomFields().footer || {};
    var footerMarks = footer;
    var marks = Array.isArray(footerMarks.ruralStayMarks)
      ? footerMarks.ruralStayMarks.slice(0, 2)
      : [footerMarks.ruralStayMark];
    var markUrl = marks.some(function (mark) { return mark && mark.url; });

    document.querySelectorAll('[data-footer-rural-stay-mark-wrap]').forEach(function (wrap) {
      wrap.style.display = markUrl ? '' : 'none';
    });
    document.querySelectorAll('[data-footer-rural-stay-mark-wrap]').forEach(function (wrap) {
      var images = wrap.querySelectorAll('[data-footer-rural-stay-mark]');
      var count = marks.filter(function (mark) { return mark && mark.url; }).length;
      images.forEach(function (img, index) {
        var mark = marks[index];
        var url = mark && mark.url ? String(mark.url) : '';
        img.style.display = url ? 'inline-block' : 'none';
        img.style.maxWidth = count > 1 ? 'calc((100% - 12px) / 2)' : '';
        img.style.marginLeft = index && url && marks[0] && marks[0].url ? '12px' : '';
        if (!url) {
          img.removeAttribute('src');
          return;
        }
        img.src = url;
        img.alt = (mark.description && String(mark.description).trim()) || '농어촌민박사업자';
      });
    });
  };

  HeaderFooterMapper.prototype.mapFooter = function () {
    this.mapCopyright();
    this.mapRuralStayMark();
    var prop = this.getProperty();
    var biz = prop.businessInfo || {};
    var phones = this.toPhoneList(prop.contactPhone);

    var fields = {
      '[data-footer-address]': this.firstText(prop.address, biz.businessAddress),
      '[data-footer-business-name]': biz.businessName,
      '[data-footer-representative]': biz.representativeName,
      '[data-footer-business-number]': biz.businessNumber
    };
    Object.keys(fields).forEach(function (selector) {
      var value = fields[selector];
      document.querySelectorAll(selector).forEach(function (el) {
        if (value === undefined || value === null || value === '') {
          // 값이 없으면 줄째로 숨긴다 ("대표자 :" 만 남는 빈 줄 방지)
          var line = el.closest('p') || el;
          if (line !== el) line.style.display = 'none';
          return;
        }
        var host = el.closest('p');
        if (host) host.style.display = '';
        el.textContent = value;
      });
    });

    this.renderFooterPhones(phones);
  };

  // 백오피스 preview(iframe)에서는 standard-template-data.json 을 읽지 않는다.
  // 템플릿 레포의 샘플 JSON 이라 메뉴를 옮길 때마다 로고 자리에 "Property English Name"
  // 이 먼저 찍혔다가 postMessage 실데이터로 바뀌며 깜박였다 (t-template-G e113404 와 같은 문제).
  // 헤더/푸터 조각은 비동기 주입이라 preview 데이터보다 늦게 붙을 수 있으므로,
  // 이미 도착한 데이터가 있으면 그 데이터로 매핑하고, 아니면 preview-handler 가 매핑한다.
  // 배포 사이트(iframe 아님)는 JSON 이 실데이터라 지금처럼 바로 읽는다.
  document.addEventListener('headerFooterLoaded', function () {
    var mapper = new HeaderFooterMapper();
    global.headerFooterMapperInstance = mapper;

    var preview = global.previewHandler;
    if (preview && mapper.isPreviewMode()) {
      if (preview.currentData) {
        mapper.data = preview.currentData;
        mapper.isDataLoaded = true;
        mapper.mapPage();
      }
      return;
    }

    mapper.initialize();
  });

  global.HeaderFooterMapper = HeaderFooterMapper;
})(window);
