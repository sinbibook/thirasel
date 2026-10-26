/* ============================================================
   pages/facility.js — facility.html 슬라이더 초기화

   매퍼가 슬라이드를 만든 뒤에 호출되어야 하므로 여기서 직접 실행하지 않고
   window.initFacilitySwipers 로 노출한다. FacilityMapper.mapPage() 끝에서 부른다.

   원본 udosky.kr /js/custom.js 기준:
     .sub_visual    : swiper   — fade / loop / autoplay 4초 (`.visual .swiper-container`)
     .main_special  : sld_opt4 — #content.sub_special_detail 일 때 3열 breakpoints
   하단 '다른 부대시설' 목록만 여러 열로 깔린다. index 의 .main_special(한 장씩)과
   다른 옵션이다.
   ============================================================ */
window.initFacilitySwipers = function () {
  TplSwiper.init('facilityHero', '.sub_visual .swiper-container', {
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

  // 하단 '다른 부대시설' — 원본 sld_opt4 의 breakpoints 를 쓴다.
  // 시설이 열 수보다 적으면 initRoomList 가 열 수를 줄이고 loop 를 끈다.
  // (객실/시설 카드가 같은 3열 규격이라 같은 헬퍼를 쓴다)
  TplSwiper.initRoomList('facilityList', '.sub_special_detail_box .swiper-container', {
    navigation: {
      prevEl: '.sub_special_detail_box .swiper-button-prev',
      nextEl: '.sub_special_detail_box .swiper-button-next'
    },
    lockHide: '.sub_special_detail_box .main_special .arw_box'
  });
};
