/**
 * Popup Manager
 * 홈페이지 팝업 기능 관리
 * - standard-template-data.json(homepage.customFields.popup.popups)에서 팝업 데이터 로드
 * - 미리보기 모드에서 postMessage(POPUP_UPDATE)로 실시간 업데이트 (preview-handler 연동)
 * - 표시 방식: jajakdoaroma 스타일로 "여러 팝업 박스를 한 번에 나란히" 표시 (슬라이더 아님)
 *   · 각 팝업의 isSelected 이미지마다 박스 1개 → 동시에 표시
 *   · 박스별 닫기 / "오늘 하루 보지 않기"(실사이트만 적용) / 배경·ESC 로 전체 닫기
 */

// 중복 선언 방지
if (typeof window.PopupManager === 'undefined') {
  class PopupManager {
    constructor() {
      this.boxes = [];
      this.container = null;
      this.isPreviewMode = false;
      this.isInitialized = false;
      this._baseMapper = typeof window.BaseMapper === 'function' ? new window.BaseMapper() : null;
      this._escHandler = null;
      this._resizeHandler = null;
      this._disabledPopupIds = new Set();
    }

    /**
     * 초기화
     */
    async init() {
      if (this.isInitialized) return;
      this.isInitialized = true;

      // 팝업 컨테이너 가져오기 또는 생성
      this.container = document.getElementById('popup-container');
      if (!this.container) {
        this.container = document.createElement('div');
        this.container.id = 'popup-container';
        document.body.appendChild(this.container);
      }

      // 미리보기 모드 감지 (iframe 내부인 경우)
      this.isPreviewMode = window.parent !== window;

      // 메인 페이지에서만 실행 (미리보기 모드에서는 항상 실행)
      if (!this.isPreviewMode && !this.isMainPage()) {
        return;
      }

      // 미리보기 모드가 아닌 경우에만 JSON에서 데이터 로드
      if (!this.isPreviewMode) {
        await this.loadPopupData();
      }
    }

    /**
     * 메인 페이지 여부 확인
     */
    isMainPage() {
      const path = window.location.pathname;
      return path.endsWith('/') || path.endsWith('/index.html');
    }

    /**
     * standard-template-data.json에서 팝업 데이터 로드
     */
    async loadPopupData() {
      try {
        const response = await fetch('./standard-template-data.json');
        if (!response.ok) return;
        const data = await response.json();
        const popupData = data?.homepage?.customFields?.popup?.popups || [];
        this.processPopups(popupData);
      } catch (error) {
        // 조용히 무시
      }
    }

    /**
     * 팝업 데이터 처리 → 박스 목록 생성 후 표시
     */
    processPopups(popupData) {
      if (!Array.isArray(popupData)) {
        this.boxes = [];
        this.hide();
        return;
      }

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      this.trackEnabledToggles(popupData);

      const activePopups = popupData
        .filter((p) => {
          if (!p.enabled) return false;
          if (!this.isWithinDisplayPeriod(p, today)) return false;
          return this.getPopupMedia(p).length > 0;
        })
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

      // 각 팝업의 노출 미디어(선택 이미지들 + 노출 영상)마다 박스 1개 (여러 박스 동시 표시)
      // "오늘 하루 보지 않기"는 박스(boxId) 단위 → 같은 팝업의 다른 미디어는 영향 없음
      this.boxes = [];
      activePopups.forEach((p) => {
        this.getPopupMedia(p).forEach((media) => {
          const boxId = this.getBoxId(p, media);
          // preview는 sessionStorage, 실사이트는 localStorage 기준으로 숨김 상태를 유지한다.
          // 프리뷰에서도 편집 중 데이터 갱신마다 닫은 팝업이 다시 뜨지 않게 한다.
          if (this.isHiddenToday(boxId)) return;
          this.boxes.push({
            boxId: boxId,
            popupId: p.id,
            // 백오피스에서 고른 팝업 폭(px). 없으면 기본 폭
            width: Number(p.width) > 0 ? Number(p.width) : PopupManager.DEFAULT_BOX_WIDTH,
            mediaKind: media.kind,
            url: media.url,
            link: p.link && p.link.trim() ? p.link.trim() : '',
            title: p.title || '',
            description: p.description || ''
          });
        });
      });

      if (this.boxes.length > 0) {
        this.show();
      } else {
        this.hide();
      }
    }

    /**
     * preview에서 enabled false -> true로 다시 켠 팝업은 숨김 상태를 초기화한다.
     */
    trackEnabledToggles(popupData) {
      if (!this.isPreviewMode || !Array.isArray(popupData)) return;

      popupData.forEach((p) => {
        if (!p || !p.id) return;
        if (!p.enabled) {
          this._disabledPopupIds.add(p.id);
          return;
        }

        if (this._disabledPopupIds.has(p.id)) {
          this.clearHiddenForPopup(p);
          this._disabledPopupIds.delete(p.id);
        }
      });
    }

    clearHiddenForPopup(popup) {
      this.getPopupMedia(popup).forEach((media) => {
        const boxId = this.getBoxId(popup, media);
        try {
          this._dismissStore().removeItem('popup_hidden_' + boxId);
        } catch (e) {
          // 무시
        }
      });
    }

    /**
     * 박스 id = 팝업 id + 미디어 고유값. "오늘 하루 보지 않기" 저장 키로도 쓴다.
     * 순번을 쓰면 미디어를 추가·삭제할 때 다른 미디어가 숨겨지므로 미디어마다 바뀌지 않는 값을 쓴다.
     */
    getBoxId(popup, media) {
      return popup.id + '_' + media.key;
    }

    /**
     * 팝업의 노출 미디어 목록 [{ kind: 'image' | 'video', url, key }]
     * - 선택 이미지들과 노출 영상 1개를 함께 띄운다 (있는 것만)
     * - key 는 미디어 id (없는 예전 데이터는 url)
     */
    getPopupMedia(popup) {
      const toMedia = (kind, item) => ({ kind: kind, url: item.url, key: item.id || item.url });
      const media = this.getSelectedImages(popup).map((img) => toMedia('image', img));
      const video = this.getSelectedVideo(popup);
      if (video) media.push(toMedia('video', video));
      return media;
    }

    /**
     * 팝업에서 노출(isSelected) 영상 (없으면 첫 영상, 영상이 없으면 null)
     */
    getSelectedVideo(popup) {
      if (!popup || !Array.isArray(popup.videos)) return null;
      const videos = popup.videos
        .filter((video) => video && video.url)
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      const selected = videos.find((video) => video.isSelected === true);
      if (selected) return selected;
      return videos.length ? videos[0] : null;
    }

    /**
     * 팝업에서 isSelected 이미지 배열 (없으면 첫 이미지)
     */
    getSelectedImages(popup) {
      if (!popup || !Array.isArray(popup.images)) return [];
      const selected = popup.images.filter((img) => img && img.isSelected === true && img.url);
      if (selected.length) {
        return selected.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      }
      if (popup.images[0] && popup.images[0].url) return [popup.images[0]];
      return [];
    }

    /**
     * 표시 기간 내인지 확인
     */
    isWithinDisplayPeriod(popup, today) {
      if (popup.startDate) {
        const start = new Date(popup.startDate);
        const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        if (today < startDay) return false;
      }
      if (popup.endDate) {
        const end = new Date(popup.endDate);
        const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
        if (today > endDay) return false;
      }
      return true;
    }

    /**
     * 숨김 저장소: preview는 세션 단위(sessionStorage), 실사이트는 하루 단위(localStorage)
     * → preview에선 같은 세션 내 새로고침엔 안 뜨고, 새 세션이면 다시 뜸(작업 중 영구 숨김 방지)
     */
    _dismissStore() {
      return this.isPreviewMode ? window.sessionStorage : window.localStorage;
    }

    /**
     * 오늘(세션) 숨김 여부 확인
     */
    isHiddenToday(id) {
      try {
        const hidden = this._dismissStore().getItem(`popup_hidden_${id}`);
        if (!hidden) return false;
        return new Date(hidden).toDateString() === new Date().toDateString();
      } catch (e) {
        return false;
      }
    }

    /**
     * 오늘 하루(세션) 보지 않기 설정
     */
    hideToday(id) {
      try {
        this._dismissStore().setItem(`popup_hidden_${id}`, new Date().toISOString());
      } catch (e) {
        // 무시
      }
    }

    /**
     * 팝업 표시 (여러 박스 동시)
     */
    show() {
      if (!this.boxes.length) {
        this.hide();
        return;
      }

      this.container.innerHTML = this.render();
      this.bindEvents();

      // 폭 계산이 끝난 뒤에 노출한다. 먼저 보여주면 이미지 원본 크기(최대 90vw)로
      // 떴다가 fitBox 가 폭을 넣으면서 줄어들어 깜빡인다.
      this.fitBoxes(() => {
        requestAnimationFrame(() => {
          const overlay = this.container.querySelector('.popup-overlay');
          if (overlay) overlay.classList.add('active');
        });
      });
    }

    /**
     * 이미지·영상 원본 비율로 박스 폭을 계산해 적용
     * → 잘림 없음 + 좌우 빈 여백 없음 (세로로 긴 이미지·영상은 화면 높이에 맞춰 축소)
     */
    fitBoxes(onReady) {
      const imgs = this.container.querySelectorAll('.popup-image');
      let pending = 0;
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        if (typeof onReady === 'function') onReady();
      };

      imgs.forEach((img) => {
        if (PopupManager.isMediaReady(img)) {
          this.fitBox(img);
        } else {
          pending++;
          const settle = () => {
            this.fitBox(img);
            if (--pending === 0) finish();
          };
          // 영상은 크기를 알 수 있는 loadedmetadata 까지만 기다린다
          img.addEventListener(img.tagName === 'VIDEO' ? 'loadedmetadata' : 'load', settle, {
            once: true
          });
          img.addEventListener('error', settle, { once: true });
        }
      });

      if (pending === 0) {
        finish();
      } else {
        // 이미지가 느려도 팝업이 영영 안 보이면 안 되므로 상한을 둔다
        setTimeout(finish, 1500);
      }

      if (!this._resizeHandler) {
        this._resizeHandler = () => this.fitBoxes();
        window.addEventListener('resize', this._resizeHandler);
      }
    }

    /**
     * 박스 1개 폭 계산
     */
    fitBox(img) {
      const box = img.closest('.popup-content');
      const size = PopupManager.getMediaSize(img);
      if (!box || !size.width || !size.height) return;

      const CHROME_W = 22; // 좌우 padding(10*2) + border(1*2)
      const CHROME_H = 80; // 상하 padding + 푸터(35) + 푸터 상단 여백(10) + border + 여유

      const boxWidth = Number(box.dataset.boxWidth) || PopupManager.DEFAULT_BOX_WIDTH;
      const maxW = Math.min(window.innerWidth * 0.9, boxWidth) - CHROME_W;
      const maxH = window.innerHeight * 0.9 - CHROME_H;
      const ratio = size.width / size.height;

      // 고른 폭으로 고정하고 이미지는 폭 100% 로 채운다.
      // 세로가 화면을 넘는 이미지만 비율을 유지한 채 폭을 줄인다 (닫기 버튼이 화면 안에 남도록)
      let w = maxW;
      if (w / ratio > maxH) w = maxH * ratio;
      w = Math.max(w, 1);

      box.style.width = Math.round(w + CHROME_W) + 'px';
    }

    /**
     * 전체 팝업 숨기기
     */
    hide() {
      const overlay = this.container && this.container.querySelector('.popup-overlay');
      this.cleanupEvents();
      if (overlay) {
        overlay.classList.remove('active');
        setTimeout(() => {
          if (this.container) this.container.innerHTML = '';
        }, 300);
      } else if (this.container) {
        this.container.innerHTML = '';
      }
    }

    /**
     * 전체 HTML 렌더링 (overlay + N개 박스)
     */
    render() {
      const boxes = this.boxes.map((box) => this.renderBox(box)).join('');
      return `
            <div class="popup-overlay" role="dialog" aria-modal="true">
                ${boxes}
            </div>
        `;
    }

    /**
     * 박스 1개 렌더링
     */
    renderBox(box) {
      const hasText =
        (box.title && box.title.trim()) || (box.description && box.description.trim());
      // 원본 비율 그대로 노출(잘림 없음) → background cover 대신 <img> / <video> 사용
      // 영상은 음소거 자동재생·반복. 재생/정지 버튼만 둔다 (소리 켜기 없음)
      const media =
        box.mediaKind === 'video'
          ? `<video class="popup-image popup-video" src="${this.escapeHtml(box.url)}" muted autoplay loop playsinline preload="metadata"></video>
                <button type="button" class="popup-video-toggle" data-action="toggle-video" aria-label="영상 정지">❚❚</button>`
          : `<img class="popup-image" src="${this.escapeHtml(box.url)}" alt="${this.escapeHtml(box.title || '팝업 이미지')}">`;
      const imageInner = `
            <div class="popup-image-wrap">
                ${media}
                ${
                  hasText
                    ? `
                    <div class="popup-text-content">
                        ${box.title && box.title.trim() ? `<h3 class="popup-title">${this.escapeHtml(box.title)}</h3>` : ''}
                        ${box.description && box.description.trim() ? `<p class="popup-description">${this.formatTextWithLineBreaks(box.description)}</p>` : ''}
                    </div>
                `
                    : ''
                }
            </div>
        `;
      const image = box.link
        ? `<a href="${this.escapeHtml(box.link)}" target="_blank" rel="noopener noreferrer" class="popup-image-link">${imageInner}</a>`
        : imageInner;

      return `
            <div class="popup-content" data-box-id="${this.escapeHtml(box.boxId)}" data-box-width="${box.width}" style="max-width: min(90vw, ${box.width}px)">
                <button class="popup-close" data-action="close-box" aria-label="팝업 닫기">&times;</button>
                ${image}
                <div class="popup-footer">
                    <button class="popup-today-hide" data-action="hide-today">오늘 하루 보지 않기</button>
                    <button class="popup-close-text" data-action="close-box">닫기</button>
                </div>
            </div>
        `;
    }

    /**
     * 이벤트 바인딩
     */
    bindEvents() {
      const self = this;

      // 박스 닫기 (× / 닫기)
      this.container.querySelectorAll('[data-action="close-box"]').forEach((el) => {
        el.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          self.closeBox(el.closest('.popup-content'));
        });
      });

      // 오늘 하루 보지 않기 → 해당 박스만 닫기 + boxId 단위 localStorage 저장
      this.container.querySelectorAll('[data-action="hide-today"]').forEach((el) => {
        el.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const content = el.closest('.popup-content');
          if (!content) return;
          const boxId = content.getAttribute('data-box-id');
          self.hideToday(boxId);
          self.closeBox(content);
        });
      });

      // 영상: 음소거 자동재생을 보장하고, 재생/정지 버튼 연결
      this.container.querySelectorAll('.popup-video').forEach((video) => {
        video.muted = true;
        const toggle = video.parentNode.querySelector('[data-action="toggle-video"]');
        const syncToggle = () => {
          if (!toggle) return;
          toggle.textContent = video.paused ? '▶' : '❚❚';
          toggle.setAttribute('aria-label', video.paused ? '영상 재생' : '영상 정지');
        };
        video.addEventListener('play', syncToggle);
        video.addEventListener('pause', syncToggle);
        if (toggle) {
          // 링크 팝업이어도 버튼 클릭은 이동하지 않게 막는다
          toggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (video.paused) {
              video.play().catch(() => {});
            } else {
              video.pause();
            }
          });
        }
        video.play().catch(() => syncToggle());
      });

      // 배경(오버레이 빈 영역) 클릭 → 전체 닫기
      const overlay = this.container.querySelector('.popup-overlay');
      if (overlay) {
        overlay.addEventListener('click', (e) => {
          if (e.target === overlay) self.hide();
        });
      }

      // ESC → 전체 닫기
      this._escHandler = (e) => {
        if (e.key === 'Escape') self.hide();
      };
      document.addEventListener('keydown', this._escHandler);
    }

    /**
     * 박스 1개 닫기 (마지막이면 전체 숨김)
     */
    closeBox(boxEl) {
      if (!boxEl) return;
      const id = boxEl.getAttribute('data-box-id');
      this.boxes = this.boxes.filter((b) => b.boxId !== id);
      boxEl.parentNode && boxEl.parentNode.removeChild(boxEl);
      if (!this.container.querySelector('.popup-content')) {
        this.hide();
      }
    }

    cleanupEvents() {
      if (this._escHandler) {
        document.removeEventListener('keydown', this._escHandler);
        this._escHandler = null;
      }
      if (this._resizeHandler) {
        window.removeEventListener('resize', this._resizeHandler);
        this._resizeHandler = null;
      }
    }

    /**
     * HTML 이스케이프
     */
    escapeHtml(str) {
      if (this._baseMapper) return this._baseMapper._escapeHTML(str);
      if (!str) return '';
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }

    /**
     * 줄바꿈 → <br>
     */
    formatTextWithLineBreaks(text) {
      if (this._baseMapper) return this._baseMapper._formatTextWithLineBreaks(text);
      if (!text) return '';
      return this.escapeHtml(text.trim()).replace(/\n/g, '<br>');
    }

    /**
     * 미리보기 모드에서 팝업 데이터 업데이트
     */
    updateFromPreview(popupData) {
      this.isPreviewMode = true;
      const popups = popupData?.popups || popupData || [];
      this.processPopups(Array.isArray(popups) ? popups : []);
    }

    /**
     * 전체 데이터에서 팝업 추출 및 업데이트
     */
    updateFromTemplateData(data) {
      this.isPreviewMode = true;
      const popupData = data?.homepage?.customFields?.popup?.popups || [];
      this.processPopups(popupData);
    }
  }

  // 팝업 폭을 고르지 않은 팝업의 기본 폭 (styles/popup.css .popup-content max-width 와 동일하게 유지)
  PopupManager.DEFAULT_BOX_WIDTH = 350;

  // 이미지·영상 원본 크기
  PopupManager.getMediaSize = (el) =>
    el.tagName === 'VIDEO'
      ? { width: el.videoWidth, height: el.videoHeight }
      : { width: el.naturalWidth, height: el.naturalHeight };

  // 크기를 알 수 있는 상태인지 (영상은 메타데이터 로드 이후)
  PopupManager.isMediaReady = (el) =>
    el.tagName === 'VIDEO'
      ? el.readyState >= 1 && el.videoWidth > 0
      : el.complete && el.naturalWidth > 0;

  // 전역 인스턴스 생성
  window.PopupManager = PopupManager;

  // 인스턴스 생성 + 초기화
  // 미리보기(iframe)에서는 preview-handler 가 popup.js 보다 먼저 로드돼
  // TEMPLATE_READY 를 보내므로, POPUP_UPDATE 가 이 파일이 받아지기 전에 도착할 수
  // 있다. 그때 preview-handler 가 보관해 둔 페이로드로 한 번 더 반영한다.
  function bootPopupManager() {
    window.popupManager = new PopupManager();
    window.popupManager.init().then(() => {
      const handler = window.previewHandler;
      if (!handler) return;
      if (handler.lastPopupData) {
        window.popupManager.updateFromPreview(handler.lastPopupData);
      } else if (handler.currentData) {
        handler.refreshPopupFromTemplate(handler.currentData);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootPopupManager);
  } else {
    bootPopupManager();
  }
} // PopupManager 중복 선언 방지 끝
