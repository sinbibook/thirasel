(function () {
  'use strict';

  function loadCSS(href) {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }

  function loadScript(src, onload) {
    var script = document.createElement('script');
    script.src = src;
    if (onload) script.onload = onload;
    document.body.appendChild(script);
  }

  // 공통 조각은 캐시를 타면 수정이 반영되지 않는다.
  // standard-template-data.json 과 같은 방식으로 매번 새로 받는다.
  function loadHTML(url) {
    return fetch(url + '?t=' + Date.now()).then(function (res) {
      if (!res.ok) throw new Error('Failed to load: ' + url);
      return res.text();
    });
  }

  function loadHeader() {
    return loadHTML('common/header.html').then(function (html) {
      var hw = document.getElementById('header-wrap');
      if (hw) {
        hw.innerHTML = html;
      } else {
        var temp = document.createElement('div');
        temp.innerHTML = html;
        var header = temp.querySelector('header, .header');
        if (header) document.body.insertBefore(header, document.body.firstChild);
      }
    });
  }

  function loadFooter() {
    return loadHTML('common/footer.html').then(function (html) {
      var fw = document.getElementById('footer-wrap');
      if (fw) {
        fw.innerHTML = html;
      } else {
        var temp = document.createElement('div');
        temp.innerHTML = html;
        var footer = temp.querySelector('footer, .footer_wrap');
        if (footer) document.body.appendChild(footer);
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    window.loaderReady = Promise.all([loadHeader(), loadFooter()])
      .then(function () {
        document.dispatchEvent(new Event('headerFooterLoaded'));
      })
      .catch(function (err) {
        console.error('[header-footer-loader]', err);
        document.dispatchEvent(new Event('headerFooterLoaded'));
      });
  });
})();
