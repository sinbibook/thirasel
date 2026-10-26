/**
 * Image Helpers
 * Utility functions for image handling and placeholder management
 */

var ImageHelpers = {
  // Empty image SVG placeholder
  EMPTY_IMAGE_SVG:
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect width="800" height="600" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E',

  /**
   * 커스텀 라벨 텍스트를 가진 placeholder SVG 생성 (이미지 없을 때 매핑 위치 안내용)
   * @param {string} text - 표시할 라벨 텍스트
   * @returns {string} data URI
   */
  buildPlaceholderSvg: function (text) {
    var label = text || 'No Image';
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">' +
      '<rect width="800" height="600" fill="#f0f0f0"/>' +
      '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" ' +
      'font-family="sans-serif" font-size="24" fill="#999">' +
      label +
      '</text></svg>';
    return 'data:image/svg+xml,' + encodeURIComponent(svg);
  },

  /**
   * Apply placeholder to an image element
   * @param {HTMLImageElement} imgElement - The image element to apply placeholder to
   * @param {string} [text] - 표시할 라벨 텍스트 (없으면 기본 "No Image")
   */
  applyPlaceholder: function (imgElement, text) {
    if (!imgElement) return;
    imgElement.src = text ? ImageHelpers.buildPlaceholderSvg(text) : ImageHelpers.EMPTY_IMAGE_SVG;
    imgElement.alt = text || 'No Image Available';
    imgElement.classList.add('empty-image-placeholder');
  },

  /**
   * Apply placeholder to a background-image element (배경 이미지 요소용)
   * @param {HTMLElement} element - The element to apply the background placeholder to
   * @param {string} [text] - 표시할 라벨 텍스트 (없으면 기본 "No Image")
   */
  applyBackgroundPlaceholder: function (element, text) {
    if (!element) return;
    // EMPTY_IMAGE_SVG는 공백/큰따옴표를 포함하므로 url()에 작은따옴표로 감싸야 CSS 파싱됨
    var svg = text ? ImageHelpers.buildPlaceholderSvg(text) : ImageHelpers.EMPTY_IMAGE_SVG;
    element.style.backgroundImage = "url('" + svg + "')";
    element.style.backgroundColor = '#f0f0f0';
    element.style.backgroundRepeat = 'no-repeat';
    element.style.backgroundPosition = 'center';
    element.style.backgroundSize = 'cover';
    element.classList.add('empty-image-placeholder');
  }
};

// Ensure ImageHelpers is available globally
window.ImageHelpers = ImageHelpers;
