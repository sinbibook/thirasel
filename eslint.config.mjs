import prettierConfig from 'eslint-config-prettier';

const browserGlobals = {
  window: 'readonly',
  document: 'readonly',
  console: 'readonly',
  Promise: 'readonly',
  fetch: 'readonly',
  Event: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly',
  setInterval: 'readonly',
  clearInterval: 'readonly',
  URL: 'readonly',
  URLSearchParams: 'readonly',
  location: 'readonly',
  getComputedStyle: 'readonly',
  navigator: 'readonly',
  requestAnimationFrame: 'readonly',
  module: 'writable',
};

const projectGlobals = {
  kakao: 'readonly',
  jQuery: 'readonly',
  $: 'readonly',
  Swiper: 'readonly',
  TplSwiper: 'writable', // js/common.js 가 window 에 붙이는 Swiper 공용 헬퍼
  BaseDataMapper: 'writable',
  ImageHelpers: 'readonly',
  HeaderFooterMapper: 'readonly',
  IndexMapper: 'readonly',
  MainMapper: 'readonly',
  RoomMapper: 'readonly',
  FacilityMapper: 'readonly',
  ReservationMapper: 'readonly',
  DirectionsMapper: 'readonly',
  NearbyAttractionsMapper: 'readonly',
  LayoutMapMapper: 'readonly',
  LandingMapper: 'readonly',
  PopupManager: 'writable',
};

export default [
  {
    files: ['js/**/*.js'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'script',
      globals: {
        ...browserGlobals,
        ...projectGlobals,
      },
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'error',
      'no-console': 'off',
      eqeqeq: ['warn', 'always'],
      'no-var': 'off',
    },
  },
  prettierConfig,
];
