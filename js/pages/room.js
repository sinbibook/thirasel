/* ============================================================
   pages/room.js — room.html 슬라이더 초기화

   매퍼가 슬라이드를 만든 뒤에 호출되어야 하므로 여기서 직접 실행하지 않고
   window.initRoomSwipers 로 노출한다. RoomMapper.mapPage() 끝에서 부른다.

   원본 udosky.kr /js/custom.js 기준:
     .sub_visual  : swiper   — fade / loop / autoplay 4초 (`.visual .swiper-container`)
     .main_room   : sld_opt2 — #content.sub_room_detail 일 때 3열 breakpoints
   하단 객실 목록만 여러 열로 깔린다. index 의 .main_room(한 장씩)과 다른 옵션이다.
   ============================================================ */
window.initRoomSwipers = function () {
  TplSwiper.init('roomHero', '.sub_visual .swiper-container', {
    loop: true,
    spaceBetween: 0,
    effect: 'fade',
    autoplay: { delay: 4000, disableOnInteraction: false },
    navigation: {
      prevEl: '.sub_visual .swiper-button-prev',
      nextEl: '.sub_visual .swiper-button-next'
    },
    // 사진이 한 장이면 넘길 게 없으므로 화살표 영역을 숨긴다
    lockHide: '.sub_visual .arw_box'
  });

  // 하단 '다른 객실' 목록 — 원본 sld_opt2 의 breakpoints 를 쓴다.
  // 객실이 열 수보다 적으면 initRoomList 가 열 수를 줄이고 loop 를 끈다.
  TplSwiper.initRoomList('roomList', '.sub_room_detail_box .swiper-container', {
    navigation: {
      prevEl: '.sub_room_detail_box .swiper-button-prev',
      nextEl: '.sub_room_detail_box .swiper-button-next'
    },
    lockHide: '.sub_room_detail_box .main_room .arw_box'
  });
};
