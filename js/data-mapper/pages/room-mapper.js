(function (global) {
  'use strict';

  function setAllText(selector, value) {
    document.querySelectorAll(selector).forEach(function (el) {
      el.textContent = value;
    });
  }

  function RoomMapper() {
    BaseDataMapper.call(this);
  }
  RoomMapper.prototype = Object.create(BaseDataMapper.prototype);
  RoomMapper.prototype.constructor = RoomMapper;

  // 데이터 소스 — pages.room[] 은 비어 있는 응답이 흔하다(현재 샘플도 빈 배열).
  // 상세 내용은 전부 customFields.roomtypes[] + 최상위 rooms[] 에서 온다.
  //   roomtypes[i].images  → 히어로 슬라이더 / 상세 이미지 / 평면도
  //   rooms[j]             → 객실명·인원·평형·구조·집기품목 (id 로 매칭)
  RoomMapper.prototype.getCurrentId = function () {
    var id = new URLSearchParams(window.location.search).get('room_id');
    if (id) return id;
    // ?room_id= 없이 들어오면 첫 객실을 보여준다.
    // (헤더·미리보기 링크는 항상 id 를 붙이므로 직접 URL 을 친 경우다)
    var roomtypes = this.getRoomtypes();
    return roomtypes.length ? String(roomtypes[0].id) : '';
  };

  RoomMapper.prototype.getCurrentRoomtype = function () {
    var id = this.getCurrentId();
    var roomtypes = this.getRoomtypes();
    for (var i = 0; i < roomtypes.length; i++) {
      if (String(roomtypes[i].id) === String(id)) return roomtypes[i];
    }
    return null;
  };

  RoomMapper.prototype.mapPage = function () {
    var roomtype = this.getCurrentRoomtype();

    // 객실이 하나도 없거나 잘못된 room_id → 404.
    // 백오피스 preview 에서는 리다이렉트하지 않는다(layout-map 과 같은 규칙).
    if (!roomtype) {
      if (!this.isPreviewMode()) {
        window.location.href = '404.html';
        return;
      }
    }

    this.mapPropertyNames();
    this.mapRoomHeading(roomtype);
    this.mapHeroSlides(roomtype);
    this.renderRoomNav('[data-room-nav]', roomtype ? roomtype.id : null);
    this.mapTable(roomtype);
    this.mapFloorplan(roomtype);
    this.mapDetailBlocks(roomtype);
    this.mapRoomListIntro();
    this.renderRoomSlides('[data-room-list-slides]');

    if (typeof window.initRoomSwipers === 'function') window.initRoomSwipers();
  };

  RoomMapper.prototype.mapPropertyNames = function () {
    setAllText('[data-property-name-en]', this.getPropertyNameEn());
    setAllText('[data-property-name]', this.getPropertyName());
    this.applyPropertyCaptions();
  };

  // MAPPER: 객실명 + 구조 문자열 → 히어로 문구와 .sub_title_box 두 곳
  //
  // ⚠️ 여기 객실명은 **개별 객실명**이다(getRoomtypeName). 그룹명이 아니다.
  //    그룹명은 헤더 메뉴와 layout-map 카드에서만 쓴다 — 상세는 그 그룹 안의
  //    특정 객실을 보는 화면이라 그룹명을 쓰면 형제 객실이 모두 같은 제목이 된다.
  RoomMapper.prototype.mapRoomHeading = function (roomtype) {
    var name = this.getRoomtypeName(roomtype);
    var structure = this.formatRoomStructure(this.findRoomById(roomtype && roomtype.id));

    setAllText('[data-room-name]', name);

    // 구조 문자열이 없으면 줄째 숨긴다 (빈 p 가 히어로 문구에 여백만 남긴다)
    document.querySelectorAll('[data-room-structure]').forEach(function (el) {
      el.textContent = structure;
      el.style.display = structure ? '' : 'none';
    });
  };

  // 히어로 슬라이더용 객실 사진 — 실내(interior) 전체를 원본 순서 그대로 쓴다.
  // 썸네일(roomtype_thumbnail)은 카드용이라 섞지 않는다.
  // exterior(표 아래 그리드 전용 큐레이션)는 여기 섞지 않는다 — 겹치는 사진이 있으면
  // 같은 사진이 히어로에 중복으로 뜬다 (getRoomDetailImages 참고).
  RoomMapper.prototype.getRoomPhotos = function (roomtype) {
    if (!roomtype) return [];
    return this.getRoomtypeImages(roomtype, 'roomtype_interior');
  };

  // 표 아래 "ROOMS DETAIL" 그리드용 사진.
  // 원본은 이 자리를 히어로 갤러리와 별개로 직접 큐레이션해 둔다 — 겹치는 사진이 있어도
  // 순서·선별 기준이 다르다(크롤러 조사 결과: 히어로 1~8인데 그리드는 1,2,3,4,6,7 인 사이트,
  // 순서 자체가 무관한 사이트도 있다). exterior 가 있으면 그 순서를 그대로 쓰고,
  // 없는 경우(구버전 크롤 결과 등)에만 interior 앞 N 장으로 폴백한다.
  RoomMapper.prototype.getRoomDetailImages = function (roomtype) {
    if (!roomtype) return [];
    var exterior = this.getRoomtypeImages(roomtype, 'roomtype_exterior');
    return exterior.length ? exterior : this.getRoomPhotos(roomtype);
  };

  // MAPPER: roomtypes[i].images → .sub_visual 슬라이더
  RoomMapper.prototype.mapHeroSlides = function (roomtype) {
    var self = this;
    var images = this.getRoomPhotos(roomtype);
    if (!images.length) {
      var thumb = this.getRoomThumbUrl(roomtype);
      if (thumb) images = [{ url: thumb }];
    }

    var wrapper = document.querySelector('[data-room-hero-slides]');
    if (!wrapper) return;
    wrapper.innerHTML = '';

    // 사진이 없으면 100vh 빈 화면이 되므로 placeholder 슬라이드 한 장을 세운다
    if (!images.length) {
      var empty = document.createElement('div');
      empty.className = 'swiper-slide';
      ImageHelpers.applyBackgroundPlaceholder(empty, '객실 이미지');
      wrapper.appendChild(empty);
      return;
    }

    images.forEach(function (img) {
      var slide = document.createElement('div');
      slide.className = 'swiper-slide';
      self.setBackground(slide, img.url, '객실 이미지');
      wrapper.appendChild(slide);
    });
  };

  // MAPPER: rooms[j] → 객실 정보 표 (PC 5열 / 모바일 4열)
  //
  // 원본은 PC 표에 평형까지 5열, 모바일은 평형을 뺀 4열을 쓴다.
  // 모바일 표는 thead 가 없고 첫 tr 이 머리글 역할을 한다.
  RoomMapper.prototype.mapTable = function (roomtype) {
    var room = this.findRoomById(roomtype && roomtype.id) || {};
    var name = this.getRoomtypeName(roomtype);
    var structure = this.formatRoomStructure(room);
    var pyeong = this.toPyeong(room.size);

    // 값이 없으면 빈 칸 대신 '-' 를 넣는다. 표는 칸이 비면 무너져 보인다.
    var dash = function (v) {
      var s = v === 0 ? '0' : this.cleanText(v);
      return s || '-';
    }.bind(this);

    var cells = [name, room.baseOccupancy, room.maxOccupancy, structure, pyeong];

    function fillRow(tbody, values) {
      var tr = document.createElement('tr');
      values.forEach(function (v) {
        var td = document.createElement('td');
        td.textContent = v;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    }

    document.querySelectorAll('[data-room-table-pc]').forEach(function (tbody) {
      tbody.innerHTML = '';
      fillRow(tbody, cells.map(dash));
    });

    // 모바일: 머리글 tr + 값 tr, 평형 제외
    document.querySelectorAll('[data-room-table-m]').forEach(function (tbody) {
      tbody.innerHTML = '';
      fillRow(tbody, ['객실명', '기준', '최대', '유형']);
      fillRow(tbody, cells.slice(0, 4).map(dash));
    });

    this.mapAmenities(room);
  };

  // MAPPER: rooms[j].amenities → .table_text 집기품목
  // PC / 모바일 두 벌 모두에 같은 내용을 넣는다. 없으면 목록째 숨긴다.
  RoomMapper.prototype.mapAmenities = function (room) {
    var list = (room && room.amenities) || [];

    document.querySelectorAll('[data-room-amenities]').forEach(function (ul) {
      ul.innerHTML = '';
      if (!list.length) {
        ul.style.display = 'none';
        return;
      }
      ul.style.display = '';
      var li = document.createElement('li');
      var strong = document.createElement('strong');
      strong.textContent = '집기품목';
      li.appendChild(strong);
      li.appendChild(document.createTextNode(' : ' + list.join(', ')));
      ul.appendChild(li);
    });
  };

  // MAPPER: roomtypes[i] 평면도 → .wide_img
  //
  // 크롤러가 객실 상세의 평면도 영역에서 찾았을 때만 채워지는 필드다.
  // **없으면 영역째 숨긴다.** 평면도는 부가 정보라 placeholder 를 세우면
  // 안내 문구만 덩그러니 남는다. (layout-map 의 배치도는 그 페이지의 본 목적이라 반대다)
  RoomMapper.prototype.mapFloorplan = function (roomtype) {
    var self = this;
    var images = this.getRoomFloorplanImages(roomtype);
    var wrap = document.querySelector('[data-room-floorplan]');
    var host = document.querySelector('[data-room-floorplan-images]');

    if (!images.length) {
      if (wrap) wrap.style.display = 'none';
      return;
    }
    if (wrap) wrap.style.display = '';
    if (!host) return;

    var name = this.getRoomtypeName(roomtype);
    host.innerHTML = '';
    images.forEach(function (image) {
      var img = document.createElement('img');
      img.src = image.url;
      img.alt = self.cleanText(image.description) || (name ? name + ' 평면도' : '평면도');
      host.appendChild(img);
    });
  };

  // 상세 이미지 블록의 리듬 — 원본이 고정 4블록 사이클이다.
  // udosky / gpcaravan 두 판본이 완전히 같다.
  //
  //   1. sub_img_wrap        2장  .inner 있음   1200px 안 2열 (67% + 32%)
  //   2. sub_img_wrap type3  1장  .inner 없음   ← 전폭 배너
  //   3. sub_img_wrap type2  2장  .inner 있음   1200px 안 2열 (32% + 67%)
  //   4. sub_img_wrap type3  1장  .inner 있음   1200px 안 1장
  //
  // 2번만 .inner 를 두르지 않아 화면 폭을 꽉 채운다. 원본의 "배너" 자리다.
  //
  // ⚠️ 한 사이클(6장)에서 자른다. 반복하지 않는다.
  //    원본 두 판본 모두 사진 수와 무관하게 상세에는 6장만 쓴다.
  //      udosky    : 히어로 8장  → 상세 6장
  //      gpcaravan : 히어로 19장 → 상세 6장
  //    "6장이 이 레이아웃의 완성형" 이라는 원본의 디자인 판단이다. 반복하면
  //    사진 많은 숙소에서 배너가 여러 번 나오는 긴 페이지가 된다.
  //    어느 6장을 쓸지는 백오피스에서 sortOrder(사진 순서)로 정한다.
  // 앞 두 블록에만 원본 그대로의 장식 캡션이 붙는다(3·4번 블록은 캡션 없음).
  // 두 예시 사이트(udosky/gpcaravan)가 본문까지 글자 하나 안 틀리고 같아서
  // 영문 숙소명이 들어가는 첫 줄만 빼면 템플릿 고정 문구로 본다.
  RoomMapper.prototype.DETAIL_CAPTIONS = [
    {
      title: function (nameEn) {
        return 'Clean & Cozy' + (nameEn ? ', ' + nameEn : '');
      },
      body:
        'Stay with your beloved companion\nIn a clean, cozy Pension.\nEnjoy a happy moment with your companion.'
    },
    {
      title: function () {
        return 'Place For You';
      },
      body:
        'All seasons of the year are beautiful here. Ocean view pension\nI give you a gift for your life.'
    }
  ];

  RoomMapper.prototype.DETAIL_PATTERN = [
    { count: 2, cls: 'sub_img_wrap', inner: true, caption: 0 },
    { count: 1, cls: 'sub_img_wrap type3', inner: false, caption: 1 },
    { count: 2, cls: 'sub_img_wrap type2', inner: true },
    { count: 1, cls: 'sub_img_wrap type3', inner: true }
  ];

  // 상세에 쓰는 사진 수 = 한 사이클 장수의 합. 패턴을 고치면 함께 따라온다.
  RoomMapper.prototype.detailImageLimit = function () {
    return this.DETAIL_PATTERN.reduce(function (sum, spec) {
      return sum + spec.count;
    }, 0);
  };

  // 블록 하나를 만든다. chunk 가 비면 spec.count 만큼 placeholder 칸을 세운다.
  RoomMapper.prototype.buildDetailBlock = function (spec, chunk) {
    var self = this;

    var wrap = document.createElement('div');
    // 사진이 모자란 블록은 실제 장수에 맞는 클래스로 낮춘다.
    // 빈 뼈대(chunk 없음)는 원래 장수 그대로 보여야 몇 장인지 알 수 있다.
    wrap.className = chunk.length && chunk.length < spec.count ? 'sub_img_wrap type3' : spec.cls;

    var ul = document.createElement('ul');
    var slots = chunk.length ? chunk : new Array(spec.count).fill(null);
    slots.forEach(function (img) {
      var li = document.createElement('li');
      if (img) self.setBackground(li, img.url, '객실 이미지');
      else ImageHelpers.applyBackgroundPlaceholder(li, '객실 이미지');
      ul.appendChild(li);
    });

    // 캡션이 있는 블록(1·2번)은 ul 다음 형제로 .txt 를 둔다 — 원본 마크업과 같은 자리다.
    var txt = null;
    if (spec.caption !== undefined && this.DETAIL_CAPTIONS[spec.caption]) {
      var caption = this.DETAIL_CAPTIONS[spec.caption];
      txt = document.createElement('div');
      txt.className = 'txt';
      var strong = document.createElement('strong');
      strong.textContent = caption.title(this.getPropertyNameEn());
      var p = document.createElement('p');
      p.innerHTML = this.nl2br(caption.body);
      txt.appendChild(strong);
      txt.appendChild(p);
    }

    // .inner 를 두르지 않는 블록은 화면 폭을 꽉 채우는 배너가 된다
    if (spec.inner) {
      var inner = document.createElement('div');
      inner.className = 'inner';
      inner.appendChild(ul);
      if (txt) inner.appendChild(txt);
      wrap.appendChild(inner);
    } else {
      wrap.appendChild(ul);
      if (txt) wrap.appendChild(txt);
    }
    return wrap;
  };

  // MAPPER: roomtypes[i].images(roomtype_exterior 우선) → .sub_img_wrap 상세 이미지 블록
  //
  // exterior 가 있으면 그 순서 그대로, 없으면 interior 로 폴백한다(getRoomDetailImages).
  // 사이클을 한 번만 돌고 남는 사진은 쓰지 않는다.
  // 사진이 6장에 못 미치면 있는 만큼만 채우고, 2장짜리 자리에 1장만 남으면
  // 그 블록은 type3(전폭)으로 낮춘다 — 기본/type2 는 67%+32% 2열이라
  // 한 장만 넣으면 옆이 빈다.
  //
  // **사진이 하나도 없으면 4블록 뼈대를 그대로 세운다.** 영역이 사라지면
  // 편집자가 이 자리가 있다는 것도, 몇 장이 들어가는지도 알 수 없다.
  // placeholder 6칸이 2·1(전폭)·2·1 배치를 그대로 보여준다.
  //
  // 1·2번 블록의 문구(.txt)는 DETAIL_CAPTIONS 의 고정 장식 캡션이다 — 두 예시 사이트가
  // 본문까지 완전히 같아서 roomtypes 데이터가 아니라 템플릿 상수로 둔다. 첫 줄의 숙소
  // 영문명만 getPropertyNameEn() 으로 채운다. roomtypes 자체에는 블록 단위 문구가 없다.
  RoomMapper.prototype.mapDetailBlocks = function (roomtype) {
    var self = this;
    var pattern = this.DETAIL_PATTERN;
    var images = this.getRoomDetailImages(roomtype).slice(0, this.detailImageLimit());

    var container = document.querySelector('[data-room-detail-blocks]');
    var heading = document.querySelector('[data-room-detail-heading]');
    if (!container) return;

    container.innerHTML = '';
    container.style.display = '';
    if (heading) heading.style.display = '';

    if (!images.length) {
      pattern.forEach(function (spec) {
        container.appendChild(self.buildDetailBlock(spec, []));
      });
      return;
    }

    var cursor = 0;
    for (var step = 0; step < pattern.length && cursor < images.length; step++) {
      var chunk = images.slice(cursor, cursor + pattern[step].count);
      cursor += chunk.length;
      container.appendChild(this.buildDetailBlock(pattern[step], chunk));
    }
  };

  // MAPPER: .main_room .title_box — 배정할 블록이 없어 원본 문구 + 숙소명이다.
  RoomMapper.prototype.mapRoomListIntro = function () {
    var name = this.getPropertyName();
    setAllText(
      '[data-room-list-lead]',
      '안락하게 준비된 ' + (name ? name + '의 ' : '') + '객실입니다.'
    );
  };

  document.addEventListener('DOMContentLoaded', function () {
    // 초기화 주체는 preview-handler 다. 중복 실행을 막는다.
    if (window.previewHandler) return;
    new RoomMapper().initialize();
  });

  global.RoomMapper = RoomMapper;
})(window);
