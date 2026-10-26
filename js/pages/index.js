/* ============================================================
   pages/index.js — index.html 슬라이더 초기화

   매퍼가 슬라이드를 만든 뒤에 호출되어야 하므로 여기서 직접 실행하지 않고
   window.initIndexSwipers 로 노출한다. IndexMapper.mapPage() 끝에서 부른다.
   (preview 재렌더 때도 매번 다시 불린다 — TplSwiper 가 기존 인스턴스를 destroy 한다)

   옵션은 원본 udosky.kr /js/custom.js 를 그대로 따른다.
     .visual        : swiper      — fade / loop / autoplay 4초
     .main_special  : sld_opt3    — slidesPerView 1 / spaceBetween 30 / loop
     .main_room     : sld_opt1    — slidesPerView 1 / spaceBetween 30 / loop / fade
   원본이 세 슬라이더 모두 한 장씩 넘긴다. 부대시설·객실 카드가 여러 열로
   깔리는 건 서브페이지(sub_room_detail / sub_special_detail) 쪽 옵션이다.
   ============================================================ */
window.initIndexSwipers = function () {
  // 히어로 — 사진이 1장이면 TplSwiper 가 loop 를 끄고, 화살표는 lockHide 가 숨긴다
  TplSwiper.init('indexHero', '.main_visual .swiper-container', {
    loop: true,
    spaceBetween: 0,
    effect: 'fade',
    autoplay: { delay: 4000, disableOnInteraction: false },
    navigation: {
      prevEl: '.main_visual .swiper-button-prev',
      nextEl: '.main_visual .swiper-button-next'
    },
    lockHide: '.main_visual .arw_box'
  });

  TplSwiper.init('indexSpecial', '.main_special .swiper-container', {
    loop: true,
    spaceBetween: 30,
    navigation: {
      prevEl: '.main_special .swiper-button-prev',
      nextEl: '.main_special .swiper-button-next'
    },
    lockHide: '.main_special .arw_box'
  });

  TplSwiper.init('indexRoom', '.main_room .swiper-container', {
    loop: true,
    spaceBetween: 30,
    effect: 'fade',
    navigation: {
      prevEl: '.main_room .swiper-button-prev',
      nextEl: '.main_room .swiper-button-next'
    },
    // .main_room .arw_box 는 흰 배경 + 위쪽 테두리를 가진 카드 안 요소라
    // 넘길 게 없을 때 남겨 두면 빈 흰 띠가 보인다
    lockHide: '.main_room .arw_box'
  });
};
