(function (global) {
  'use strict';

  function BaseDataMapper() {
    this.data = null;
    this.isDataLoaded = false;
  }

  BaseDataMapper.prototype.initialize = function () {
    var self = this;
    var url = 'standard-template-data.json?t=' + Date.now();
    return fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error('Failed to load standard-template-data.json');
        return res.json();
      })
      .then(function (json) {
        self.data = json;
        self.isDataLoaded = true;
        self.mapPage();
        if (window.__tplReveal) window.__tplReveal(); // 매핑 완료 → 화면 노출(페이드인)
      })
      .catch(function (err) {
        console.error('[BaseDataMapper] initialize error:', err);
        if (window.__tplReveal) window.__tplReveal(); // 실패해도 화면은 노출
      });
  };

  BaseDataMapper.prototype.mapPage = function () {};

  BaseDataMapper.prototype.updateData = function (newData) {
    this.data = newData;
    this.isDataLoaded = true;
    this.mapPage();
    if (window.__tplReveal) window.__tplReveal(); // 매핑 완료 → 화면 노출(페이드인)
  };

  // ── 데이터 접근 헬퍼 ──────────────────────────────────────
  // ── 백오피스 preview 판별 ────────────────────────────────
  // ⚠️ `window.previewHandler` 로 판별하면 안 된다.
  //    preview-handler.js 가 **로드되기만 하면 항상** 인스턴스를 만들기 때문에
  //    standalone 페이지에서도 늘 truthy 다.
  //    실제 preview 는 백오피스가 iframe 으로 띄운 상태다.
  BaseDataMapper.prototype.isPreviewMode = function () {
    try {
      return window.parent !== window;
    } catch (e) {
      // 크로스 오리진 접근이 막히면 iframe 안이라는 뜻이다
      return true;
    }
  };

  BaseDataMapper.prototype.getProperty = function () {
    return (this.data && this.data.property) || {};
  };

  BaseDataMapper.prototype.getHomepage = function () {
    return (this.data && this.data.homepage) || {};
  };

  BaseDataMapper.prototype.getCustomFields = function () {
    return this.getHomepage().customFields || {};
  };

  // customFields.roomtypes (localhost / preview 경로 모두 대응)
  // 객실 목록의 단일 소스. rooms[] 는 roomtypes[i].id === rooms[j].id 매칭으로
  // 인원/평형/집기 등 상세값을 조회할 때만 쓴다.
  BaseDataMapper.prototype.getRoomtypes = function () {
    var cf = this.getCustomFields();
    if (cf.roomtypes && cf.roomtypes.length) return cf.roomtypes;
    if (this.data && this.data.customFields && this.data.customFields.roomtypes) {
      return this.data.customFields.roomtypes;
    }
    return cf.roomtypes || [];
  };

  BaseDataMapper.prototype.getPages = function () {
    // localhost 경로: this.data.homepage.customFields.pages
    var pagesFromHomepage = this.getCustomFields().pages;
    if (pagesFromHomepage && Object.keys(pagesFromHomepage).length > 0) {
      return pagesFromHomepage;
    }

    // preview 경로: this.data.customFields.pages
    if (this.data && this.data.customFields && this.data.customFields.pages) {
      return this.data.customFields.pages;
    }

    return {};
  };

  // customFields.property.name 우선, 없으면 property.name
  BaseDataMapper.prototype.getPropertyName = function () {
    var cf = this.getCustomFields();
    if (cf.property && cf.property.name) return cf.property.name;
    return this.getProperty().name || '';
  };

  // customFields.property 영문명 우선, 없으면 property.nameEn
  BaseDataMapper.prototype.getPropertyNameEn = function () {
    var cf = this.getCustomFields();
    var cfProperty = cf.property || {};
    return this.firstText(
      cfProperty.propertyUnameEn,
      cfProperty.propertyunameen,
      cfProperty.propertyNameEn,
      cfProperty.propertynameen,
      cfProperty.nameEn,
      this.getProperty().nameEn
    );
  };

  // homepage.images[0].logo 중 isSelected인 URL
  BaseDataMapper.prototype.getLogo = function () {
    var hp = this.getHomepage();
    var images = hp.images;
    if (!images || !images[0] || !images[0].logo) return '';
    var logos = images[0].logo;
    var selected = logos.find(function (l) {
      return l.isSelected;
    });
    return selected ? selected.url : logos[0] ? logos[0].url : '';
  };

  // property.realtimeBookingId
  // realtimeBookingId 는 "실시간예약링크" 같은 플레이스홀더/설명 문구가 그대로 들어올 수 있다.
  // 그걸 href 로 쓰면 상대경로로 해석돼 404 페이지가 새 탭으로 열리므로,
  // 실제 URL 로 보일 때만 링크로 취급하고 그 외에는 '#!'(비활성) 로 처리한다.
  BaseDataMapper.prototype.getBookingUrl = function () {
    var raw = this.getProperty().realtimeBookingId;
    if (typeof raw !== 'string') return '#!';

    var v = raw.trim();
    if (!v || v === '#!') return '#!';

    if (/^https?:\/\//i.test(v)) return v; // http(s)://...
    if (/^\/\//.test(v)) return 'https:' + v; // //도메인/...

    // 프로토콜 없이 도메인만 들어온 경우(booking.example.com/abc)는 https 를 붙여준다
    if (/^[a-z0-9-]+(\.[a-z0-9-]+)+(:\d+)?([/?#]|$)/i.test(v)) return 'https://' + v;

    return '#!';
  };

  // ── 숙소 이미지 카테고리 ─────────────────────────────────
  // property.images[0] 은 카테고리 묶음이다 — thumbnail / exterior / surrounding / commonArea.
  // (객실 이미지처럼 images[].category 로 갈리지 않고 배열 키로 갈린다)
  BaseDataMapper.prototype.getPropertyImageSet = function () {
    var propImages = this.getProperty().images || [];
    return propImages[0] || {};
  };

  // isSelected + sortOrder 순. isSelected 가 하나도 없으면 카테고리 전체를 폴백으로 쓴다.
  BaseDataMapper.prototype.getPropertyImagesByCategory = function (category) {
    var list = this.getPropertyImageSet()[category] || [];
    var selected = this.getSelectedImages(list);
    return selected.length ? selected : list.slice();
  };

  // 카테고리 여러 개를 순서대로 훑어 첫 이미지를 고른다.
  // 숙소가 각 카테고리에 몇 장을 올릴지 알 수 없으므로 장수에 기대지 않는다.
  BaseDataMapper.prototype.pickPropertyImage = function (categories) {
    for (var i = 0; i < categories.length; i++) {
      var list = this.getPropertyImagesByCategory(categories[i]);
      if (list.length) return list[0];
    }
    return null;
  };

  // ── 이미지 헬퍼 ──────────────────────────────────────────
  // isSelected=true인 이미지를 sortOrder 순으로 반환
  BaseDataMapper.prototype.getSelectedImages = function (images) {
    if (!images || !images.length) return [];
    return images
      .filter(function (img) {
        return img.isSelected;
      })
      .sort(function (a, b) {
        return a.sortOrder - b.sortOrder;
      });
  };

  // 첫 번째 isSelected 이미지의 URL
  BaseDataMapper.prototype.getFirstSelectedImage = function (images) {
    var list = this.getSelectedImages(images);
    return list.length ? list[0].url : '';
  };

  // 데이터 변환 (스네이크 케이스 → 카멜 케이스)
  BaseDataMapper.prototype.convertToCamelCase = function (obj) {
    if (Array.isArray(obj)) {
      return obj.map((item) => this.convertToCamelCase(item));
    } else if (obj !== null && typeof obj === 'object') {
      return Object.keys(obj).reduce((result, key) => {
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        result[camelKey] = this.convertToCamelCase(obj[key]);
        return result;
      }, {});
    }
    return obj;
  };

  // ── DOM 유틸 ────────────────────────────────────────────
  BaseDataMapper.prototype.setTextIfExist = function (selector, value) {
    var el = document.querySelector(selector);
    if (el && value !== undefined && value !== null) el.textContent = value;
  };

  BaseDataMapper.prototype.setAttrIfExist = function (selector, attr, value) {
    var el = document.querySelector(selector);
    if (el && value) el.setAttribute(attr, value);
  };

  BaseDataMapper.prototype.setAllAttr = function (selector, attr, value) {
    document.querySelectorAll(selector).forEach(function (el) {
      if (value) el.setAttribute(attr, value);
    });
  };

  // ── 교차 배너(.sub_img_bnr) 공용 유틸 ─────────────────────
  // room / facility 두 페이지가 같은 마크업을 쓴다.
  // 설명 문구가 비어 올 때 쓰는 폴백 카피 — 원본 사이트의 공통 영문 카피.
  BaseDataMapper.prototype.BNR_FALLBACK_DESC_HTML =
    'Stay with your beloved companion <br>In a clean, cozy cabin. <br>Enjoy a happy moment with your companion.';

  // 원본 레이아웃이 li 2개 고정(좌 img+txt / 우 txt+img)이라 노출 이미지 수를 제한한다
  BaseDataMapper.prototype.BNR_MAX = 2;

  // 하단 와이드 배너(.main_pic) 설명 폴백 — 원본 사이트의 템플릿 기본 카피.
  // index.closing 을 index.html / main.html 이 공유하므로 여기에 둔다.
  // closing.description 에 값이 있으면 항상 그 값이 우선한다.
  BaseDataMapper.prototype.CLOSING_FALLBACK_DESC_HTML =
    'Stays with sea views in all rooms have crispy duvets and cute props. ' +
    '<br />There is also a panoramic sea view and sunshine every morning.';

  // 텍스트 이스케이프 + 줄바꿈(\n) → <br />
  BaseDataMapper.prototype.nl2br = function (text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br />');
  };

  // ── 숙소명이 들어가는 문장 ───────────────────────────────
  // [data-property-caption="{name}의 객실을 소개합니다."] 처럼 템플릿 문자열을 속성에 두고
  // {name} / {nameEn} 을 치환한다.
  //
  // HTML 에 <span data-property-name></span>의 객실을… 형태로 두면
  // prettier(htmlWhitespaceSensitivity: ignore)가 인라인 텍스트를 줄바꿈하면서
  // 조사 앞에 공백이 끼어 "펜션 의 객실을" 로 렌더된다. 그래서 문장 전체를 매퍼가 조립한다.
  BaseDataMapper.prototype.applyPropertyCaptions = function () {
    var name = this.getPropertyName();
    var nameEn = this.getPropertyNameEn();

    document.querySelectorAll('[data-property-caption]').forEach(function (el) {
      var tpl = el.getAttribute('data-property-caption') || '';
      el.innerHTML = tpl
        .replace(/\{name\}/g, name)
        .replace(/\{nameEn\}/g, nameEn)
        .replace(/\\n/g, '<br />');
    });
  };

  // ── 조사 선택 ───────────────────────────────────────────
  // 숙소명은 백오피스 입력값이라 받침 유무를 미리 알 수 없다.
  // "{name}을 소개합니다" 같은 문장에서 을/를, 이/가, 은/는, 와/과를 골라 준다.
  // 한글이 아닌 문자로 끝나면(영문/숫자) 받침 없는 쪽을 쓴다.
  BaseDataMapper.prototype.hasFinalConsonant = function (word) {
    var s = String(word || '').trim();
    if (!s) return false;
    var code = s.charCodeAt(s.length - 1);
    if (code < 0xac00 || code > 0xd7a3) return false; // 한글 음절이 아님
    return (code - 0xac00) % 28 !== 0;
  };

  // withJosa('스테이', '을/를') → '스테이를'  /  withJosa('펜션', '을/를') → '펜션을'
  BaseDataMapper.prototype.withJosa = function (word, pair) {
    var s = this.cleanText(word);
    if (!s) return '';
    var parts = String(pair).split('/');
    return s + (this.hasFinalConsonant(s) ? parts[0] : parts[1]);
  };

  // ── 텍스트 정규화 ───────────────────────────────────────
  // 백오피스에서 빈 값이 공백 한 칸(' ')으로 내려오는 경우가 흔하다.
  // 그대로 두면 truthy 라서 폴백이 동작하지 않으므로, 공백만 있는 값은 '' 로 본다.
  BaseDataMapper.prototype.cleanText = function (value) {
    if (value === undefined || value === null) return '';
    var s = String(value).trim();
    return s;
  };

  // 앞에서부터 비어있지 않은 첫 값을 고른다 (폴백 체인)
  BaseDataMapper.prototype.firstText = function () {
    for (var i = 0; i < arguments.length; i++) {
      var s = this.cleanText(arguments[i]);
      if (s) return s;
    }
    return '';
  };

  // ── 객실 공용 유틸 ──────────────────────────────────────
  // index / layout-map / room 세 페이지가 같은 구조 문자열을 쓴다.

  // totalRoomCount 키 → 한글 라벨 (값이 1 이상인 항목만 나열)
  BaseDataMapper.prototype.ROOM_COUNT_LABELS = {
    bedroom: '침대룸',
    bathroom: '화장실',
    livingRoom: '거실',
    ondol: '온돌룸',
    kitchen: '주방'
  };

  // roomtypes[i].id === rooms[j].id 매칭으로 상세 객실 정보를 조회
  BaseDataMapper.prototype.findRoomById = function (id) {
    var rooms = (this.data && this.data.rooms) || [];
    for (var i = 0; i < rooms.length; i++) {
      if (rooms[i].id === id) return rooms[i];
    }
    return null;
  };

  // 객실명. roomtypes[i] 에 name 이 없는 응답이 흔하므로
  // 같은 id 의 rooms[j].name 으로 폴백한다 (동일 엔티티).
  BaseDataMapper.prototype.getRoomtypeName = function (roomtype) {
    if (!roomtype) return '';
    var room = this.findRoomById(roomtype.id);
    return this.firstText(roomtype.name, room && room.name);
  };

  // 객실 메뉴/미리보기 그룹 규칙.
  // roomtypes[].groupName 이 하나라도 있으면 groupName 을 메뉴명으로 쓰고,
  // 같은 그룹의 첫 번째 객실 id 로 상세 페이지에 진입한다.
  BaseDataMapper.prototype.getRoomGroupName = function (roomtype) {
    return this.firstText(roomtype && roomtype.groupName);
  };

  BaseDataMapper.prototype.hasRoomGroups = function (roomtypes) {
    var self = this;
    return (roomtypes || []).some(function (rt) {
      return !!self.getRoomGroupName(rt);
    });
  };

  BaseDataMapper.prototype.getRoomMenuItems = function () {
    var self = this;
    var roomtypes = this.getRoomtypes();
    if (!this.hasRoomGroups(roomtypes)) {
      return roomtypes.map(function (rt) {
        return { label: self.getRoomtypeName(rt), roomtype: rt, roomtypes: [rt] };
      });
    }

    var seen = {};
    var items = [];
    roomtypes.forEach(function (rt) {
      var groupName = self.getRoomGroupName(rt);
      // 그룹 숙소에서는 미그룹 객실을 메뉴에 내지 않는다.
      // 원본 헤더가 그룹만 노출하고, 미그룹 객실은 목록 / Room Preview 로만 도달한다.
      // (Room Preview 는 roomtypes[] 전체를 그리므로 영향 없다)
      if (!groupName) return;

      var label = groupName || self.getRoomtypeName(rt);
      if (!String(label).trim()) return;

      var key = groupName ? 'group:' + groupName : 'room:' + rt.id;
      if (!seen[key]) {
        seen[key] = { label: label, groupName: groupName, roomtype: rt, roomtypes: [rt] };
        items.push(seen[key]);
      } else {
        seen[key].roomtypes.push(rt);
      }
    });
    return items;
  };

  BaseDataMapper.prototype.getRoomMenuLabel = function (item) {
    return (item && item.label) || '';
  };

  BaseDataMapper.prototype.getRoomMenuRoomtype = function (item) {
    return (item && item.roomtype) || item;
  };

  BaseDataMapper.prototype.getRoomMenuLink = function (item) {
    var roomtype = this.getRoomMenuRoomtype(item);
    return './room.html?room_id=' + (roomtype && roomtype.id);
  };

  // ── 객실 미리보기(layout-map) 사용 여부 ──────────────────
  // layout-map.html 이 404 로 보내는 기준과 같아야 한다.
  // 섹션이 없거나 enabled=false 면 그 페이지는 열리지 않는다.
  BaseDataMapper.prototype.isLayoutMapEnabled = function () {
    var page = this.getPages().layoutMap;
    var section = page && page.sections && page.sections[0];
    return Boolean(section) && section.enabled !== false;
  };

  // 대메뉴 ROOMS 가 갈 곳.
  //   미리보기 켜짐 → layout-map.html (객실 배치도)
  //   미리보기 꺼짐 → 첫 번째 객실 상세 (헤더 객실 메뉴의 첫 항목과 같은 곳)
  // 객실이 하나도 없으면 갈 곳이 없으므로 null — 호출부가 원래 href 를 둔다.
  BaseDataMapper.prototype.getRoomsEntryLink = function () {
    if (this.isLayoutMapEnabled()) return './layout-map.html';
    var self = this;
    var link = null;
    // mapRoomMenu 처럼 이름 없는 항목은 건너뛴다 — 메뉴에 보이는 첫 항목과 같아야 한다.
    this.getRoomMenuItems().some(function (item) {
      if (!String(self.getRoomMenuLabel(item)).trim()) return false;
      link = self.getRoomMenuLink(item);
      return true;
    });
    return link;
  };

  BaseDataMapper.prototype.isRoomMenuItemActive = function (item, currentId) {
    if (!item || !currentId) return false;
    return (item.roomtypes || []).some(function (rt) {
      return String(rt && rt.id) === String(currentId);
    });
  };

  // "원룸형/ 침대룸 화장실 주방" 형태의 구조 문자열
  BaseDataMapper.prototype.formatRoomStructure = function (room) {
    if (!room) return '';
    var labels = this.ROOM_COUNT_LABELS;
    var counts = room.totalRoomCount || {};
    var parts = Object.keys(labels)
      .filter(function (key) {
        return Number(counts[key]) >= 1;
      })
      .map(function (key) {
        return labels[key];
      });

    var structure = (room.roomStructures && room.roomStructures[0]) || '';
    if (!structure && !parts.length) return '';
    if (!parts.length) return structure;
    if (!structure) return parts.join(' ');
    return structure + '/ ' + parts.join(' ');
  };

  // rooms[].size 는 제곱미터(㎡). 화면에는 평으로 환산해 노출한다.
  // 1평 = 3.305785㎡, 소수 1자리. 예) 62.81㎡ → "19평"
  BaseDataMapper.prototype.toPyeong = function (sqm) {
    var n = Number(sqm);
    if (!n || isNaN(n)) return '';
    return Math.round((n / 3.305785) * 10) / 10 + '평';
  };

  // roomtypes[i].images 중 특정 category 만 isSelected + sortOrder 순으로 반환
  // category 예) 'roomtype_thumbnail' | 'roomtype_interior' | 'roomtype_exterior'
  BaseDataMapper.prototype.getRoomtypeImages = function (roomtype, category) {
    var images = (roomtype && roomtype.images) || [];
    var filtered = images.filter(function (img) {
      return img.category === category;
    });
    var selected = this.getSelectedImages(filtered);
    // isSelected 가 하나도 없으면 카테고리 전체를 sortOrder 순으로 폴백
    if (selected.length) return selected;
    return filtered.slice().sort(function (a, b) {
      return a.sortOrder - b.sortOrder;
    });
  };

  // ── 외부 전경(Landscape) 이미지 ─────────────────────────
  // 원본 사이트의 "외경보기(view.html)" 갤러리 소스.
  // A 는 백오피스 편집 화면이 8개뿐이라 원본의 `펜션소개`+`외경보기` 두 페이지를
  // main.html 하나로 병합했다. 그 안에서 두 페이지를 이렇게 나눠 담는다.
  //   main.hero    = 펜션소개 (히어로 배경 / 소개 문구 / 상단 3분할)
  //   main.about[] = 외경보기 (소개 블록 밴드 / 외경 갤러리 / 하단 3분할)
  // 따라서 외경 갤러리는 about[] 블록의 이미지를 순서대로 평탄화해 쓴다.
  // index.html 의 Healing Place 도 같은 소스를 본다.
  BaseDataMapper.prototype.getLandscapeImages = function () {
    var self = this;
    var mainPage = this.getPages().main;
    var section = (mainPage && mainPage.sections && mainPage.sections[0]) || {};
    var blocks = Array.isArray(section.about) ? section.about : [];

    var list = [];
    blocks.forEach(function (block) {
      self.getSelectedImages((block && block.images) || []).forEach(function (img) {
        var dup = list.some(function (p) {
          return p.url === img.url;
        });
        if (!dup) list.push(img);
      });
    });
    if (list.length) return list;

    // about[] 이 비어 있을 때만 폴백
    var heroImages = this.getSelectedImages((section.hero && section.hero.images) || []);
    if (heroImages.length) return heroImages;

    var propImages = this.getProperty().images || [];
    var exterior = (propImages[0] && propImages[0].exterior) || [];
    var selected = this.getSelectedImages(exterior);
    return selected.length ? selected : exterior.slice();
  };

  // 객실 평면도 소스.
  // 크롤러가 원본 객실 상세의 평면도 영역에서 이미지를 찾았을 때만 이 필드/카테고리를 채운다.
  BaseDataMapper.prototype.getRoomFloorplanImages = function (roomtype) {
    if (!roomtype) return [];

    var direct =
      roomtype.floorplanImages ||
      roomtype.floorplans ||
      (roomtype.floorplan && roomtype.floorplan.images) ||
      [];
    if (direct && !Array.isArray(direct)) direct = [direct];

    var selectedDirect = this.getSelectedImages(direct);
    if (direct.length) return selectedDirect.length ? selectedDirect : direct;

    var images = roomtype.images || [];
    var filtered = images.filter(function (img) {
      return /^(roomtype_)?floorplan$|^room_floorplan$|^floor_plan$/i.test(img.category || '');
    });
    var selected = this.getSelectedImages(filtered);
    return selected.length ? selected : filtered.slice();
  };

  BaseDataMapper.prototype.getRoomFloorplanImage = function (roomtype) {
    var images = this.getRoomFloorplanImages(roomtype);
    return images.length ? images[0] : null;
  };

  // ── 배경 이미지 유틸 ────────────────────────────────────
  // url 이 있으면 cover 배경, 없으면 매핑 위치 안내용 placeholder
  BaseDataMapper.prototype.setBackground = function (el, url, label) {
    if (!el) return;
    if (url) {
      el.style.backgroundImage = 'url(' + url + ')';
      el.style.backgroundRepeat = 'no-repeat';
      el.style.backgroundPosition = 'center';
      el.style.backgroundSize = 'cover';
      el.classList.remove('empty-image-placeholder');
    } else {
      ImageHelpers.applyBackgroundPlaceholder(el, label);
    }
  };

  // ── 객실 썸네일 URL ─────────────────────────────────────
  // thumbnail 우선, 없으면 interior 첫 장으로 폴백
  BaseDataMapper.prototype.getRoomThumbUrl = function (roomtype) {
    var thumbs = this.getRoomtypeImages(roomtype, 'roomtype_thumbnail');
    if (thumbs.length && thumbs[0].url) return thumbs[0].url;
    var interiors = this.getRoomtypeImages(roomtype, 'roomtype_interior');
    return interiors.length ? interiors[0].url : '';
  };

  // ── 객실 슬라이드 공용 렌더러 ────────────────────────────
  // index.html / layout-map.html 이 같은 객실 카드 구조를 쓴다.
  // 원본(udosky) .room_list 마크업:
  //   .swiper-slide.box > .img(배경) + .room_inner_wrap > .room_inner_box
  //     .room_inner_box > strong(객실명) + p(구조) + a.btn_more
  //
  // 카드 제목은 getRoomMenuLabel() 이다 — 그룹이 있으면 그룹명, 없으면 객실명.
  // 링크도 getRoomMenuLink() 라 그룹이면 그 그룹의 첫 객실 상세로 간다.
  // (헤더 메뉴 / 객실 탭과 같은 규칙)
  BaseDataMapper.prototype.renderRoomSlides = function (selector) {
    var self = this;
    var roomtypes = this.getRoomtypes();

    document.querySelectorAll(selector).forEach(function (wrapper) {
      wrapper.innerHTML = '';

      // Room Preview 카드는 groupName 과 무관하게 **항상 전체 객실**을 깐다.
      // 그룹으로 접히는 곳은 헤더 ROOMS 메뉴와 객실 상세 탭뿐이고,
      // 카드는 저마다 자기 객실 상세로 연결한다.
      roomtypes.forEach(function (rt) {
        // 원본이 내려둔 객실은 카드도 내지 않는다 — 그룹도 없고 사진도 없으면 보여줄 게 없다.
        // (kalcamping: 원본 상세가 본문뿐인 껍데기. 백오피스는 숙소관리 DB 객실명을 합쳐
        //  보여주므로 이름만으로는 걸러지지 않는다)
        // 크롤러가 이름·사진을 못 읽은 경우는 groupName 이 남아 있어 여기서 걸리지 않는다.
        if (rt && !self.getRoomGroupName(rt) && !(rt.images || []).length) return;

        var name = self.getRoomtypeName(rt);
        if (!String(name).trim() || !rt) return;

        var slide = document.createElement('div');
        slide.className = 'swiper-slide box';

        var imgBox = document.createElement('div');
        imgBox.className = 'img';
        self.setBackground(imgBox, self.getRoomThumbUrl(rt), '객실 이미지');

        var wrap = document.createElement('div');
        wrap.className = 'room_inner_wrap';
        var box = document.createElement('div');
        box.className = 'room_inner_box';

        var strong = document.createElement('strong');
        strong.textContent = name;
        strong.title = name; // 카드 폭이 좁으면 줄바꿈되므로 전체 문구를 툴팁으로 남긴다

        // 구조 문자열이 없어도 요소는 남긴다 — 빼면 카드마다 높이가 어긋난다
        var p = document.createElement('p');
        p.textContent = self.formatRoomStructure(self.findRoomById(rt.id));

        var more = document.createElement('a');
        more.className = 'btn_more';
        more.href = './room.html?room_id=' + rt.id;
        more.textContent = 'VIEW';
        more.style.background = 'url(images/common/spe_view.png) no-repeat 78% 50%';

        box.appendChild(strong);
        box.appendChild(p);
        box.appendChild(more);
        wrap.appendChild(box);

        slide.appendChild(imgBox);
        slide.appendChild(wrap);
        wrapper.appendChild(slide);
      });
    });
  };

  // ── 부대시설 목록 ───────────────────────────────────────
  // displayOrder 는 문자열('0','1','2','4'…)로 내려오고 결번도 있다.
  // 숫자로 변환해 정렬하고, 값이 없는 항목은 뒤로 보낸다.
  // 헤더 서브메뉴 / index 카드 / facility 탭이 모두 이 순서를 쓴다.
  BaseDataMapper.prototype.getFacilities = function () {
    var list = (this.getProperty().facilities || []).slice();
    return list.sort(function (a, b) {
      var x = Number(a && a.displayOrder);
      var y = Number(b && b.displayOrder);
      if (isNaN(x) && isNaN(y)) return 0;
      if (isNaN(x)) return 1;
      if (isNaN(y)) return -1;
      return x - y;
    });
  };

  BaseDataMapper.prototype.findFacilityById = function (id) {
    var list = this.getFacilities();
    for (var i = 0; i < list.length; i++) {
      if (String(list[i].id) === String(id)) return list[i];
    }
    return null;
  };

  // ── 시설 카드 공용 렌더러 ───────────────────────────────
  // index 하단 SPECIAL / facility 하단 SPECIAL 이 같은 마크업을 쓴다.
  // 원본(udosky) 카드 마크업:
  //   .swiper-slide.box > a.link(카드 전체 덮개) + .img(배경) + .txt_box
  //     .txt_box > strong(span.special_txt "SPECIAL 01" + 영문명) + p(한글명) + a.btn_more
  //
  // 번호(SPECIAL 01)는 데이터가 아니라 카드 순번이다.
  BaseDataMapper.prototype.renderSpecialCards = function (selector) {
    var self = this;
    var facilities = this.getFacilities();

    document.querySelectorAll(selector).forEach(function (wrapper) {
      wrapper.innerHTML = '';

      facilities.forEach(function (f, i) {
        var name = self.cleanText(f.name);
        var nameEn = self.cleanText(f.nameEn);
        if (!name && !nameEn) return;

        var href = './facility.html?id=' + f.id;

        var slide = document.createElement('div');
        slide.className = 'swiper-slide box';

        var overlay = document.createElement('a');
        overlay.className = 'link';
        overlay.href = href;

        var imgBox = document.createElement('div');
        imgBox.className = 'img';
        self.setBackground(imgBox, self.getFirstSelectedImage(f.images || []), '부대시설 이미지');

        var txtBox = document.createElement('div');
        txtBox.className = 'txt_box';

        var strong = document.createElement('strong');
        var num = document.createElement('span');
        num.className = 'special_txt';
        num.textContent = 'SPECIAL ' + (i + 1 < 10 ? '0' : '') + (i + 1);
        strong.appendChild(num);
        // 영문명이 없으면 대제목 자리에 한글명을 쓴다(빈 줄 방지)
        strong.appendChild(document.createTextNode(nameEn || name));

        // 영문·한글이 같으면 같은 문구가 두 줄 반복되므로 아랫줄을 비운다
        var p = document.createElement('p');
        p.textContent = nameEn && name !== nameEn ? name : '';

        var more = document.createElement('a');
        more.className = 'btn_more';
        more.href = href;
        more.textContent = 'VIEW';
        more.style.background = 'url(images/common/spe_view.png) no-repeat 78% 50%';

        txtBox.appendChild(strong);
        txtBox.appendChild(p);
        txtBox.appendChild(more);

        slide.appendChild(overlay);
        slide.appendChild(imgBox);
        slide.appendChild(txtBox);
        wrapper.appendChild(slide);
      });
    });
  };

  // ── 객실 탭 네비 공용 렌더러 ─────────────────────────────
  // layout-map.html / room.html 의 .sub_cate_wrap ul.
  // 첫 번째 li("미리보기")는 유지하고 그 뒤에 객실 li 를 생성한다.
  // currentId 와 일치하는 항목에 .on 을 준다 (없으면 미리보기가 .on).
  // ── 객실 탭 네비 공용 렌더러 ─────────────────────────────
  // layout-map.html / room.html 의 `.sub_cate_wrap ul`.
  // 첫 번째 li("미리보기")는 유지하고 그 뒤에 항목을 생성한다.
  //
  // 그룹 모드에서 **그룹 안에 들어오면 그 그룹의 객실만 보여준다.**
  // 헤더 메뉴는 그룹명 하나로 접어 두는데(getRoomMenuItems), 상세 페이지에서도
  // 그대로 접으면 그룹의 첫 객실 외에는 갈 방법이 없다.
  //
  //   그룹 A동(3실) 안에서 볼 때 →  미리보기 | 객실1 | 객실2 | 객실3
  //   그룹 밖(미리보기 / 미그룹 객실) →  미리보기 | A동 | B동 | 미그룹객실…
  //
  // 다른 그룹은 이 줄에 섞지 않는다. 그룹명과 객실명이 나란히 놓이면
  // 부모/자식이 형제처럼 보인다. 다른 그룹으로는 헤더 ROOMS 메뉴나
  // `미리보기`(layout-map)를 거쳐 이동한다.
  //
  // 멤버가 1실인 그룹은 펼치지 않는다. 펼쳐 봐야 항목이 하나뿐이라
  // 탭이 비다시피 하고 그룹명과 객실명이 1:1 이라 의미도 없다.
  BaseDataMapper.prototype.renderRoomNav = function (selector, currentId) {
    var self = this;
    var roomItems = this.getRoomMenuItems();

    function appendItem(ul, label, href, active) {
      if (!String(label).trim()) return;
      var li = document.createElement('li');
      li.setAttribute('data-generated', 'room');
      if (active) li.className = 'on';
      var a = document.createElement('a');
      a.href = href;
      a.textContent = label;
      // 탭이 화면을 넘치면 가로 스크롤로 밀어서 봐야 한다.
      // 스크롤 없이도 전체 이름을 확인할 수 있게 툴팁으로 남긴다.
      a.title = label;
      li.appendChild(a);
      ul.appendChild(li);
    }

    document.querySelectorAll(selector).forEach(function (ul) {
      // 이전 생성분 제거 (preview 재렌더 대비)
      ul.querySelectorAll('[data-generated="room"]').forEach(function (li) {
        li.remove();
      });

      // 첫 li 는 "미리보기"(layout-map) 다. 미리보기가 꺼져 있으면 눌러도 404 이므로 숨긴다.
      var first = ul.querySelector('li');
      if (first) {
        first.className = currentId ? '' : 'on';
        first.style.display = self.isLayoutMapEnabled() ? '' : 'none';
      }

      // 현재 객실이 속한 그룹(멤버 2실 이상)을 찾는다
      var group = null;
      roomItems.forEach(function (item) {
        var members = (item && item.roomtypes) || [];
        if (members.length > 1 && self.isRoomMenuItemActive(item, currentId)) group = item;
      });

      // 그룹 안이면 그 그룹의 객실만 보여준다
      if (group) {
        group.roomtypes.forEach(function (rt) {
          appendItem(
            ul,
            self.getRoomtypeName(rt),
            './room.html?room_id=' + rt.id,
            String(rt.id) === String(currentId)
          );
        });
        return;
      }

      // 그룹 밖이면 헤더 메뉴와 같은 목록(그룹명 + 미그룹 객실)
      roomItems.forEach(function (item) {
        appendItem(
          ul,
          self.getRoomMenuLabel(item),
          self.getRoomMenuLink(item),
          self.isRoomMenuItemActive(item, currentId)
        );
      });
    });
  };

  // ── 연락처 정규화 ────────────────────────────────────────
  // BFF의 property.contactPhone 은 문자열 배열(string[])로 내려온다.
  // 배포 시점 차이로 문자열/누락도 들어올 수 있으므로 셋 다 허용해 문자열 배열로 정규화한다.
  // 계약 타입(총판A/총판B/판매대행) 분기는 BFF가 판단하므로 템플릿은 받은 배열을 그대로 렌더링한다.
  BaseDataMapper.prototype.toPhoneList = function (value) {
    var fallbackPhone = '1833-9306';
    var list = [];
    if (Array.isArray(value)) {
      list = value.filter(function (v) {
        return typeof v === 'string' && v.trim();
      });
    } else if (typeof value === 'string' && value.trim()) {
      list = [value];
    }
    return list.length > 0 ? list : [fallbackPhone];
  };

  // ── SEO 메타태그 업데이트 ──────────────────────────────────────
  BaseDataMapper.prototype.updateMetaTags = function (pageSEO) {
    var hp = this.getHomepage();
    var globalSEO = (hp && hp.seo) || {};
    var finalSEO = Object.assign({}, globalSEO, pageSEO || {});

    if (Object.keys(finalSEO).length > 0) {
      this.updateSEOInfo(finalSEO);
    }
  };

  BaseDataMapper.prototype.updateSEOInfo = function (seo) {
    if (!seo) return;

    // name 기반 meta 태그를 upsert (값 없으면 태그 생성 안 함 → 빈 태그 방지)
    function upsertMetaByName(name, content) {
      if (!content) return;
      var meta = document.head.querySelector('meta[name="' + name + '"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    }

    if (seo.title) {
      var titleEl =
        document.querySelector('title[data-page-title]') || document.querySelector('title');
      if (titleEl) titleEl.textContent = seo.title;
    }

    upsertMetaByName('description', seo.description);
    upsertMetaByName('keywords', seo.keywords);
    upsertMetaByName('naver-site-verification', seo.naverSiteVerification);
    upsertMetaByName('google-site-verification', seo.googleSiteVerification);
  };

  global.BaseDataMapper = BaseDataMapper;
})(window);
