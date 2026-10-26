((window.kakao = window.kakao || {}),
  (window.kakao.maps = window.kakao.maps || {}),
  window.daum && window.daum.maps
    ? (window.kakao.maps = window.daum.maps)
    : ((window.daum = window.daum || {}), (window.daum.maps = window.kakao.maps)),
  (function () {
    function t() {
      if (u.length) {
        a(p[u.shift()], t).start();
      } else n();
    }
    function a(t, a) {
      var n = document.createElement('script');
      return (
        (n.onload = a),
        (n.onreadystatechange = function () {
          /loaded|complete/.test(this.readyState) && a();
        }),
        {
          start: function () {
            ((n.src = t || ''),
              document.getElementsByTagName('head')[0].appendChild(n),
              (n = null));
          }
        }
      );
    }
    function n() {
      for (; o[0];) o.shift()();
      e.readyState = 2;
    }
    var e = (kakao.maps = kakao.maps || {});
    if (void 0 === e.readyState) ((e.onloadcallbacks = []), (e.readyState = 0));
    else if (2 === e.readyState) return;
    ((e.URI_FUNC = {
      ROADMAP: function (t, a, n) {
        return (
          'mts.daumcdn.net/api/v1/tile/PNGSD02/v14_3hrdp/latest/' + n + '/' + a + '/' + t + '.png'
        );
      },
      HYBRID: function (t, a, n) {
        return (
          'mts.daumcdn.net/api/v1/tile/PNGSD_SKYH02/v14_gnlfj/latest/' +
          n +
          '/' +
          a +
          '/' +
          t +
          '.png'
        );
      },
      ROADVIEW: function (t, a, n) {
        return (
          'mts.daumcdn.net/api/v1/tile/PNGSD_RV02/v11_6lcio/latest/' +
          n +
          '/' +
          a +
          '/' +
          t +
          '.png'
        );
      },
      BICYCLE: function (t, a, n) {
        return (
          'mts.daumcdn.net/api/v1/tile/PNGSD_BIKE02/v06_pr5qs/latest/' +
          n +
          '/' +
          a +
          '/' +
          t +
          '.png'
        );
      },
      USE_DISTRICT: function (t, a, n) {
        return (
          'mts.daumcdn.net/api/v1/tile/PNGSD_CAD02/v11_typc8/latest/' +
          n +
          '/' +
          a +
          '/' +
          t +
          '.png'
        );
      },
      SR: function (t, a, n) {
        return (
          'mts.daumcdn.net/api/v1/tile/PNGSD_SR02/v14_gk2za/latest/' +
          n +
          '/' +
          a +
          '/' +
          t +
          '.png'
        );
      },
      BBOUND: function (t, a, n) {
        return (
          'mts.daumcdn.net/api/v1/tile/PNGSD_BBOUND02/v12_vtnxt/latest/' +
          n +
          '/' +
          a +
          '/' +
          t +
          '.png'
        );
      },
      HBOUND: function (t, a, n) {
        return (
          'mts.daumcdn.net/api/v1/tile/PNGSD_HBOUND02/v12_a4xz9/latest/' +
          n +
          '/' +
          a +
          '/' +
          t +
          '.png'
        );
      },
      TRAFFIC: function (t, a, n) {
        return 'r.maps.daum-img.net/mapserver/file/realtimeroad/L' + n + '/' + a + '/' + t + '.png';
      },
      ROADMAP_HD: function (t, a, n) {
        return (
          'mts.daumcdn.net/api/v1/tile/PNG02/v14_li9md/latest/' + n + '/' + a + '/' + t + '.png'
        );
      },
      HYBRID_HD: function (t, a, n) {
        return (
          'mts.daumcdn.net/api/v1/tile/PNG_SKYH02/v14_to5lc/latest/' +
          n +
          '/' +
          a +
          '/' +
          t +
          '.png'
        );
      },
      ROADVIEW_HD: function (t, a, n) {
        return (
          'mts.daumcdn.net/api/v1/tile/PNG_RV02/v11_sutla/latest/' + n + '/' + a + '/' + t + '.png'
        );
      },
      BICYCLE_HD: function (t, a, n) {
        return (
          'mts.daumcdn.net/api/v1/tile/PNG_BIKE02/v06_0uvio/latest/' +
          n +
          '/' +
          a +
          '/' +
          t +
          '.png'
        );
      },
      USE_DISTRICT_HD: function (t, a, n) {
        return (
          'mts.daumcdn.net/api/v1/tile/PNG_CAD02/v11_or4aw/latest/' + n + '/' + a + '/' + t + '.png'
        );
      },
      SR_HD: function (t, a, n) {
        return (
          'mts.daumcdn.net/api/v1/tile/PNGSD_SR02/v14_gk2za/latest/' +
          n +
          '/' +
          a +
          '/' +
          t +
          '.png'
        );
      },
      BBOUND_HD: function (t, a, n) {
        return (
          'mts.daumcdn.net/api/v1/tile/PNG_BBOUND02/v12_tfxlj/latest/' +
          n +
          '/' +
          a +
          '/' +
          t +
          '.png'
        );
      },
      HBOUND_HD: function (t, a, n) {
        return (
          'mts.daumcdn.net/api/v1/tile/PNG_HBOUND02/v12_z0gnl/latest/' +
          n +
          '/' +
          a +
          '/' +
          t +
          '.png'
        );
      },
      TRAFFIC_HD: function (t, a, n) {
        return (
          'r.maps.daum-img.net/mapserver/file/realtimeroad_hd/L' + n + '/' + a + '/' + t + '.png'
        );
      }
    }),
      (e.VERSION = { ROADMAP_SUFFIX: '', SKYVIEW_VERSION: '160114', SKYVIEW_HD_VERSION: '160107' }),
      (e.RESOURCE_PATH = {
        ROADVIEW_AJAX:
          '//t1.daumcdn.net/roadviewjscore/core/css3d/200204/standard/1580795088957/roadview.js',
        ROADVIEW_CSS: '//t1.daumcdn.net/roadviewjscore/core/openapi/standard/250807/roadview.js'
      }));
    for (
      var i,
        s = 'https:' == location.protocol ? 'https:' : 'http:',
        r = '',
        d = document.getElementsByTagName('script'),
        c = d.length;
      (i = d[--c]);
    )
      if (
        /\/(beta-)?dapi\.kakao\.com\/v2\/maps\/sdk\.js\b/.test(i.src) ||
        /\/map_js_init\/open4\.test\.js\b/.test(i.src) ||
        /\/map_js_init\/open4\.cbt\.js\b/.test(i.src)
      ) {
        r = i.src;
        break;
      }
    d = null;
    var o = e.onloadcallbacks,
      u = ['v3'],
      m = '',
      p = {
        v3: s + '//t1.daumcdn.net/mapjsapi/js/main/4.4.20/kakao.js',
        services: s + '//t1.daumcdn.net/mapjsapi/js/libs/services/1.0.2/services.js',
        drawing: s + '//t1.daumcdn.net/mapjsapi/js/libs/drawing/1.2.6/drawing.js',
        clusterer: s + '//t1.daumcdn.net/mapjsapi/js/libs/clusterer/1.0.9/clusterer.js'
      },
      l = (function (t) {
        var a = {};
        return (
          t.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (t, n, e) {
            a[n] = e;
          }),
          a
        );
      })(r);
    ((m = l.appkey), m && (e.apikey = m), (e.version = '4.4.20'));
    var v = l.libraries;
    if (v) u = u.concat(v.split(','));

    // ── 템플릿 수정: autoload 분기 제거 ──────────────────────────
    // 원본은 여기서 document.write 로 kakao.js 를 넣고 readyState 를 2(로드 완료)로 올린다.
    // 크로스 사이트 parser-blocking 스크립트라 Chrome 이 경고하고,
    // 네트워크가 느리면 브라우저가 요청을 아예 막을 수 있다.
    //   "A parser-blocking, cross site script … is invoked via document.write"
    //
    // readyState 를 0(미로드)으로 두면 kakao.maps.load() 가 아래 t()/a() 의
    // 비동기 로더(script 태그 동적 삽입 + onload 체인)를 그대로 태운다.
    // 이 파일에 이미 있는 경로라 동작은 같고 경고만 사라진다.
    // 지도를 그리는 쪽(directions-mapper)은 원래부터 kakao.maps.load() 를 거친다.
    e.load = function (a) {
      switch ((o.push(a), e.readyState)) {
        case 0:
          ((e.readyState = 1), t());
          break;
        case 2:
          n();
      }
    };
  })());
