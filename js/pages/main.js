/* ============================================================
   pages/main.js — main.html 슬라이더 초기화

   매퍼가 슬라이드를 만든 뒤에 호출되어야 하므로 여기서 직접 실행하지 않고
   window.initMainSwipers 로 노출한다. MainMapper.mapPage() 끝에서 부른다.

   원본 custom.js 는 히어로를 `.visual .swiper-container` 로 잡는다.
   index 의 `.main_visual.visual` 과 이 페이지의 `.sub_visual.visual` 이
   같은 선택자에 걸리므로 옵션도 동일하다 — fade / loop / autoplay 4초.
   ============================================================ */
window.initMainSwipers = function () {
  TplSwiper.init('mainVisual', '.sub_visual .swiper-container', {
    loop: true,
    spaceBetween: 0,
    effect: 'fade',
    autoplay: { delay: 4000, disableOnInteraction: false },
    navigation: {
      prevEl: '.sub_visual .swiper-button-prev',
      nextEl: '.sub_visual .swiper-button-next'
    },
    // 외경 사진이 한 장이면 넘길 게 없으므로 화살표 영역을 숨긴다
    lockHide: '.sub_visual .arw_box'
  });
};
