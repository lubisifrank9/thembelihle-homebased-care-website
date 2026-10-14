/* =====================================================
   THEMBELIHLE HOMEBASED CARE - OUR TEAM & PARTNERS PAGE SCRIPTS
   ===================================================== */
(function () {
  'use strict';

  /* ---------- MOBILE MENU ---------- */
  var navToggle = document.getElementById('navToggle');
  var nav = document.getElementById('primaryNav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open);
      navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- FADE-IN ON SCROLL ---------- */
  var fades = document.querySelectorAll('.fade-in');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    fades.forEach(function (el) { io.observe(el); });
  } else {
    fades.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---------- SHOW MORE / SHOW LESS ---------- */
  document.querySelectorAll('[data-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var box = document.getElementById(btn.getAttribute('data-toggle'));
      var willShow = box.hasAttribute('hidden');
      if (willShow) { box.removeAttribute('hidden'); } else { box.setAttribute('hidden', ''); }
      btn.textContent = willShow ? 'Show less' : 'Show more';
      btn.setAttribute('aria-expanded', willShow);
    });
  });
  /* ---------- PLACEHOLDER LINKS (e.g. Facebook until the real link is added) ---------- */
  document.querySelectorAll('[data-placeholder]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); });
  });

  /* ---------- FOOTER YEAR ---------- */
  var yr = document.getElementById('year');
  if (yr) { yr.textContent = new Date().getFullYear(); }

  /* ---------- PICTURE VIEWER: click any photo to open it in full ---------- */
  var images = Array.prototype.slice.call(document.querySelectorAll('img[data-zoom]'));
  if (images.length) {
    var viewer = document.createElement('div');
    viewer.className = 'viewer';
    viewer.setAttribute('role', 'dialog');
    viewer.setAttribute('aria-modal', 'true');
    viewer.setAttribute('aria-label', 'Photo viewer');
    viewer.innerHTML =
      '<div class="viewer-bar">' +
        '<span class="viewer-caption" id="vCaption"></span>' +
        '<div class="viewer-tools">' +
          '<button type="button" class="v-out" aria-label="Zoom out">&minus;</button>' +
          '<button type="button" class="v-in" aria-label="Zoom in">+</button>' +
          '<button type="button" class="v-reset">Reset</button>' +
          '<button type="button" class="v-close" aria-label="Close viewer">&times;</button>' +
        '</div>' +
      '</div>' +
      '<div class="viewer-stage" id="vStage">' +
        '<button type="button" class="v-nav v-prev" aria-label="Previous photo">&#8249;</button>' +
        '<img id="vImg" alt="" draggable="false">' +
        '<button type="button" class="v-nav v-next" aria-label="Next photo">&#8250;</button>' +
      '</div>';
    document.body.appendChild(viewer);

    var vImg = viewer.querySelector('#vImg');
    var vCap = viewer.querySelector('#vCaption');
    var stage = viewer.querySelector('#vStage');
    var cur = 0, scale = 1, tx = 0, ty = 0;
    var lastFocus = null;

    var apply = function () {
      vImg.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + scale + ')';
    };
    var resetZoom = function () { scale = 1; tx = 0; ty = 0; apply(); };
    var zoomBy = function (f) {
      scale = Math.min(5, Math.max(1, scale * f));
      if (scale === 1) { tx = 0; ty = 0; }
      apply();
    };
    var show = function (i) {
      cur = (i + images.length) % images.length;
      vImg.src = images[cur].currentSrc || images[cur].src;
      vImg.alt = images[cur].alt;
      vCap.textContent = images[cur].alt + '  (' + (cur + 1) + ' of ' + images.length + ')';
      resetZoom();
    };
    var openViewer = function (i) {
      lastFocus = document.activeElement;
      show(i);
      viewer.classList.add('open');
      document.body.classList.add('no-scroll');
      viewer.querySelector('.v-close').focus();
    };
    var closeViewer = function () {
      viewer.classList.remove('open');
      document.body.classList.remove('no-scroll');
      if (lastFocus) { lastFocus.focus(); }
    };

    images.forEach(function (img, i) {
      img.addEventListener('click', function () { openViewer(i); });
    });
    document.querySelectorAll('[data-open-image]').forEach(function (b) {
      b.addEventListener('click', function () {
        var target = document.getElementById(b.getAttribute('data-open-image'));
        var idx = images.indexOf(target);
        if (idx > -1) { openViewer(idx); }
      });
    });

    viewer.querySelector('.v-close').addEventListener('click', closeViewer);
    viewer.querySelector('.v-in').addEventListener('click', function () { zoomBy(1.4); });
    viewer.querySelector('.v-out').addEventListener('click', function () { zoomBy(1 / 1.4); });
    viewer.querySelector('.v-reset').addEventListener('click', resetZoom);
    viewer.querySelector('.v-prev').addEventListener('click', function () { show(cur - 1); });
    viewer.querySelector('.v-next').addEventListener('click', function () { show(cur + 1); });
    if (images.length < 2) {
      viewer.querySelector('.v-prev').style.display = 'none';
      viewer.querySelector('.v-next').style.display = 'none';
    }
    stage.addEventListener('click', function (e) { if (e.target === stage) { closeViewer(); } });
    stage.addEventListener('wheel', function (e) {
      e.preventDefault();
      zoomBy(e.deltaY < 0 ? 1.15 : 1 / 1.15);
    }, { passive: false });
    vImg.addEventListener('dblclick', function () {
      if (scale > 1) { resetZoom(); } else { scale = 2.5; apply(); }
    });

    /* move a zoomed photo (mouse or finger) and pinch to zoom */
    var pointers = {}, lastDist = null, lastX = 0, lastY = 0;
    vImg.addEventListener('pointerdown', function (e) {
      vImg.setPointerCapture(e.pointerId);
      pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
      lastX = e.clientX; lastY = e.clientY;
      vImg.classList.add('dragging');
    });
    vImg.addEventListener('pointermove', function (e) {
      if (!pointers[e.pointerId]) { return; }
      pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
      var ids = Object.keys(pointers);
      if (ids.length === 2) {
        var a = pointers[ids[0]], b = pointers[ids[1]];
        var d = Math.hypot(a.x - b.x, a.y - b.y);
        if (lastDist) { zoomBy(d / lastDist); }
        lastDist = d;
      } else if (scale > 1) {
        tx += e.clientX - lastX; ty += e.clientY - lastY; apply();
      }
      lastX = e.clientX; lastY = e.clientY;
    });
    var endPointer = function (e) {
      delete pointers[e.pointerId];
      lastDist = null;
      if (!Object.keys(pointers).length) { vImg.classList.remove('dragging'); }
    };
    vImg.addEventListener('pointerup', endPointer);
    vImg.addEventListener('pointercancel', endPointer);

    document.addEventListener('keydown', function (e) {
      if (!viewer.classList.contains('open')) { return; }
      if (e.key === 'Escape') { closeViewer(); }
      else if (e.key === 'ArrowLeft') { show(cur - 1); }
      else if (e.key === 'ArrowRight') { show(cur + 1); }
      else if (e.key === '+' || e.key === '=') { zoomBy(1.4); }
      else if (e.key === '-') { zoomBy(1 / 1.4); }
    });
  }
})();
