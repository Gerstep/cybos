/* ══════════════════════════════════════════════════════════════════════════
   FRDM CIRCLE — interface layer

   Motion stack: GSAP is the animation system and Lenis is the one and only
   smooth-scroll engine, driven from the GSAP ticker so a single clock runs
   the page. Under prefers-reduced-motion neither is initialised at all and
   every element renders in its final state.
   ══════════════════════════════════════════════════════════════════════════ */

/* ── the only part anyone should need to edit ──────────────────────────── */
var CONFIG = {
  /* Where signups go. Anything that accepts a POST works: Formspree, Basin,
     Getform, Netlify, an Apps Script URL, your own API. Leave empty and the
     form runs in demo mode — it validates and thanks you, and sends nothing. */
  formEndpoint: 'https://formspree.io/f/xyeglkee',

  /* The real number of people on the list. Updated by hand. Not simulated. */
  memberCount: 0,
  goal: 10000,

  /* Optional: a URL returning {"count": 1234} to read the live number. */
  countEndpoint: '',

  siteUrl: 'https://frdmcircle.org',
  contactEmail: 'hello@frdmcircle.org',
  shareText: "FRDM Circle: a global circle of women, $10 a month. Give. Vote. Ask. They're gathering 10,000 founding members before registering the fund."
};

(function () {
  'use strict';

  var doc = document;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  var lenis = null;
  var lenisTick = null;

  if (hasGsap) {
    window.gsap.registerPlugin(window.ScrollTrigger);
    window.gsap.defaults({ ease: 'power3.out', duration: 0.85 });
  }

  /* ════════════════════════════════════════════════════════════════════
     SMOOTH SCROLL — exactly one engine, wired to ScrollTrigger
     ════════════════════════════════════════════════════════════════════ */
  if (!reduced && window.Lenis && hasGsap) {
    lenis = new window.Lenis({
      lerp: 0.09,
      smoothWheel: true,
      wheelMultiplier: 0.9,
      anchors: { offset: -90 }
    });
    lenis.on('scroll', window.ScrollTrigger.update);
    lenisTick = function (time) { lenis.raf(time * 1000); };
    window.gsap.ticker.add(lenisTick);
    window.gsap.ticker.lagSmoothing(0);
  }

  function refreshLayout() {
    if (hasGsap) window.ScrollTrigger.refresh();
    measureRail();
    renderRail();
  }

  /* ════════════════════════════════════════════════════════════════════
     HEADINGS — word by word, with the accessible name left whole
     ════════════════════════════════════════════════════════════════════ */
  function escapeHTML(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function splitHeading(el) {
    if (el.dataset.split === 'done') return [];
    /* The emphasis span carries meaning, so it is rebuilt around the words
       rather than flattened away. */
    var parts = [];
    function walk(node, em) {
      Array.prototype.forEach.call(node.childNodes, function (n) {
        if (n.nodeType === 3) parts.push({ text: n.nodeValue, em: em });
        else if (n.nodeType === 1) {
          var tag = n.tagName.toLowerCase();
          /* Authored line breaks are the typesetting, not decoration —
             they are what keeps the headline three lines instead of four. */
          if (tag === 'br') parts.push({ br: true });
          else walk(n, em || tag === 'em');
        }
      });
    }
    walk(el, false);

    /* A line break is whitespace to a reader and must be whitespace to a
       screen reader too, or two sentences run together in the label. */
    var label = parts.map(function (x) { return x.br ? ' ' : x.text; })
      .join('').replace(/\s+/g, ' ').trim();
    el.setAttribute('aria-label', label);

    var html = '';
    parts.forEach(function (part) {
      if (part.br) { html += '<br aria-hidden="true">'; return; }
      part.text.split(/(\s+)/).forEach(function (tok) {
        if (!tok) return;
        if (!tok.trim()) { html += ' '; return; }
        html += '<span class="w-mask" aria-hidden="true"><span class="w"' +
          (part.em ? ' style="color:var(--leaf)"' : '') + '>' +
          escapeHTML(tok) + '</span></span>';
      });
    });

    el.innerHTML = html;
    el.dataset.split = 'done';
    return Array.prototype.slice.call(el.querySelectorAll('.w'));
  }

  var headings = Array.prototype.slice.call(doc.querySelectorAll('[data-words]'));

  if (reduced || !hasGsap) {
    headings.forEach(function (el) { el.classList.add('is-split'); });
  } else {
    headings.forEach(function (el) {
      var words = splitHeading(el);
      if (!words.length) { el.classList.add('is-split'); return; }
      /* Start state first, then reveal the heading, then animate. Doing it
         in this order means the words are never seen in the down position. */
      window.gsap.set(words, { yPercent: 112 });
      el.classList.add('is-split');
      window.gsap.to(words, {
        yPercent: 0,
        duration: 0.82,
        ease: 'power3.out',
        stagger: 0.035,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });
  }

  /* ════════════════════════════════════════════════════════════════════
     BLOCK REVEALS
     ════════════════════════════════════════════════════════════════════ */
  var revealables = doc.querySelectorAll('.rv');
  if (reduced || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(revealables, function (el) { el.classList.add('in'); });
  } else {
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        rio.unobserve(en.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    Array.prototype.forEach.call(revealables, function (el) { rio.observe(el); });
  }

  /* ════════════════════════════════════════════════════════════════════
     DOCK — spring magnification and a pointer-tracked rim
     ════════════════════════════════════════════════════════════════════ */
  var dock = doc.getElementById('dock');
  var items = dock ? Array.prototype.slice.call(dock.querySelectorAll('[data-dock]')) : [];
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  var narrow = window.matchMedia('(max-width: 760px)');

  var springs = items.map(function () { return { v: 0, vel: 0, target: 0 }; });
  var boxes = [];
  var dockBox = null;
  var dockPointer = { x: -9999, y: -9999, inside: false, focused: false };
  var rim = { angle: 2.4, bright: 0 };
  var dockRaf = 0;
  var dockDirty = false;

  function measureDock() {
    if (!dock) return;
    dockBox = dock.getBoundingClientRect();
    boxes = items.map(function (el) {
      var r = el.getBoundingClientRect();
      return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, w: r.width, h: r.height };
    });
  }

  function retargetDock() {
    if (!boxes.length) return;
    var reach = 132;
    for (var i = 0; i < items.length; i++) {
      var d = Math.abs(dockPointer.x - boxes[i].cx);
      var t = dockPointer.inside && fine.matches && !narrow.matches
        ? Math.max(0, 1 - Math.min(1, d / reach))
        : 0;
      springs[i].target = t * t;
    }
  }

  function dockFrame(now) {
    dockRaf = 0;
    if (!dock) return;

    var dt = 1 / 60;
    var moving = false;

    for (var i = 0; i < items.length; i++) {
      var s = springs[i];
      s.vel += (s.target - s.v) * 190 * dt;
      s.vel *= Math.exp(-23 * dt);
      s.v += s.vel * dt;
      if (Math.abs(s.vel) > 0.0008 || Math.abs(s.target - s.v) > 0.0008) moving = true;
      var lift = s.v * 3.2;
      var scale = 1 + s.v * 0.14;
      items[i].style.transform = 'translateY(' + lift.toFixed(2) + 'px) scale(' + scale.toFixed(4) + ')';
      var near = s.v > 0.36;
      if ((items[i].dataset.near === 'true') !== near) {
        items[i].dataset.near = near ? 'true' : 'false';
      }
    }

    if (dockBox) {
      var want = 0;
      if ((dockPointer.inside && fine.matches) || dockPointer.focused) {
        var dx = dockPointer.x - (dockBox.left + dockBox.width / 2);
        var dy = dockPointer.y - (dockBox.top + dockBox.height / 2);
        rim.angle += (Math.atan2(-dy, dx) - rim.angle) * 0.24;
        var edge = Math.max(Math.abs(dx) - dockBox.width / 2, Math.abs(dy) - dockBox.height / 2);
        want = dockPointer.focused ? 0.92 : Math.max(0, 1 - Math.min(1, edge / 150));
      }
      rim.bright += (want - rim.bright) * 0.14;
      if (Math.abs(want - rim.bright) > 0.002) moving = true;
      dock.style.setProperty('--rim-angle', rim.angle.toFixed(3) + 'rad');
      dock.style.setProperty('--rim', rim.bright.toFixed(3));
    }

    if (moving) requestDock();
    else dockDirty = false;
  }

  function requestDock() {
    if (dockRaf) return;
    dockRaf = requestAnimationFrame(dockFrame);
    dockDirty = true;
  }

  if (dock) {
    window.addEventListener('pointermove', function (ev) {
      if (ev.pointerType === 'touch') return;
      dockPointer.x = ev.clientX;
      dockPointer.y = ev.clientY;
      dockPointer.inside = true;
      retargetDock();
      requestDock();
    }, { passive: true });

    window.addEventListener('pointerleave', function () {
      dockPointer.inside = false;
      retargetDock();
      requestDock();
    });
    window.addEventListener('blur', function () {
      dockPointer.inside = false;
      dockPointer.focused = false;
      retargetDock();
      requestDock();
    });

    items.forEach(function (el, i) {
      el.addEventListener('focus', function () {
        dockPointer.focused = true;
        for (var j = 0; j < springs.length; j++) {
          springs[j].target = j === i ? 1 : (Math.abs(j - i) === 1 ? 0.24 : 0);
        }
        var b = boxes[i];
        if (b) { dockPointer.x = b.cx; dockPointer.y = b.cy; }
        requestDock();
      });
      el.addEventListener('blur', function () {
        dockPointer.focused = false;
        for (var j = 0; j < springs.length; j++) springs[j].target = 0;
        requestDock();
      });
    });
  }

  /* ── active section ─────────────────────────────────────────────────── */
  var spies = items.filter(function (el) { return el.dataset.spy; });
  if (spies.length && 'IntersectionObserver' in window) {
    var seen = {};
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { seen[en.target.id] = en.isIntersecting ? en.intersectionRatio : 0; });
      var bestId = null, best = 0;
      Object.keys(seen).forEach(function (id) {
        if (seen[id] > best) { best = seen[id]; bestId = id; }
      });
      spies.forEach(function (el) {
        var on = el.dataset.spy === bestId;
        el.classList.toggle('is-active', on);
        if (on) el.setAttribute('aria-current', 'true');
        else el.removeAttribute('aria-current');
      });
    }, { threshold: [0, 0.15, 0.4, 0.75] });
    spies.forEach(function (el) {
      var target = doc.getElementById(el.dataset.spy);
      if (target) sio.observe(target);
    });
  }

  /* ── anchors: hand them to Lenis so one engine owns the scroll ──────── */
  doc.addEventListener('click', function (ev) {
    var link = ev.target.closest ? ev.target.closest('a[href^="#"]') : null;
    if (!link) return;
    var id = link.getAttribute('href');
    if (!id || id === '#') return;
    var target = doc.querySelector(id);
    if (!target) return;
    ev.preventDefault();
    /* Clear the fixed dock, which sits at the top on every size. */
    var offset = narrow.matches ? -78 : -96;
    if (lenis) lenis.scrollTo(target, { offset: offset, duration: 1.1 });
    else {
      var y = target.getBoundingClientRect().top + window.pageYOffset + offset;
      window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
    }
    if (history.replaceState) history.replaceState(null, '', id);
  });

  /* ════════════════════════════════════════════════════════════════════
     HOW IT WORKS — the rail draws itself
     ════════════════════════════════════════════════════════════════════ */
  var stepsWrap = doc.getElementById('stepsWrap');
  var rail = stepsWrap ? stepsWrap.querySelector('.rail') : null;
  var steps = stepsWrap ? Array.prototype.slice.call(stepsWrap.querySelectorAll('.step')) : [];
  var dots = steps.map(function (s) { return s.querySelector('.step-dot'); });
  var railGeom = null;

  function measureRail() {
    if (!stepsWrap || !rail || !dots.length || !dots[0]) return;
    var wrapTop = stepsWrap.getBoundingClientRect().top + window.pageYOffset;
    var centres = dots.map(function (d) {
      var r = d.getBoundingClientRect();
      return r.top + window.pageYOffset + r.height / 2;
    });
    rail.style.setProperty('--rail-top', (centres[0] - wrapTop) + 'px');
    rail.style.setProperty('--rail-height', (centres[centres.length - 1] - centres[0]) + 'px');
    railGeom = { centres: centres, first: centres[0], last: centres[centres.length - 1] };
  }

  function renderRail() {
    if (!railGeom || !rail) return;
    var span = railGeom.last - railGeom.first;
    var anchor = window.pageYOffset + window.innerHeight * 0.54;
    var p = reduced || span <= 0 ? 1 : Math.max(0, Math.min(1, (anchor - railGeom.first) / span));
    rail.style.setProperty('--progress', p.toFixed(4));

    var active = -1;
    railGeom.centres.forEach(function (c, i) { if (anchor >= c) active = i; });
    steps.forEach(function (s, i) {
      var on = reduced ? true : i <= active;
      s.classList.toggle('active', on);
      if (i === active && !reduced) s.setAttribute('aria-current', 'step');
      else s.removeAttribute('aria-current');
    });
  }

  var railQueued = false;
  function queueRail() {
    if (railQueued) return;
    railQueued = true;
    requestAnimationFrame(function () { railQueued = false; renderRail(); });
  }

  /* ════════════════════════════════════════════════════════════════════
     FAQ — native <details>, animated open
     ════════════════════════════════════════════════════════════════════ */
  Array.prototype.forEach.call(doc.querySelectorAll('.faq details'), function (d) {
    var body = d.querySelector('.answer');
    if (!body) return;
    if (reduced || !hasGsap) {
      body.style.height = '';
      return;
    }
    var inner = body.firstElementChild;
    body.style.height = d.open ? 'auto' : '0px';

    d.addEventListener('toggle', function () {
      window.gsap.killTweensOf(body);
      if (d.open) {
        window.gsap.fromTo(body, { height: 0 }, {
          height: inner.offsetHeight,
          duration: 0.44,
          ease: 'power2.out',
          onComplete: function () {
            body.style.height = 'auto';
            if (hasGsap) window.ScrollTrigger.refresh();
          }
        });
      } else {
        window.gsap.fromTo(body, { height: inner.offsetHeight }, {
          height: 0,
          duration: 0.34,
          ease: 'power2.in',
          onComplete: function () { if (hasGsap) window.ScrollTrigger.refresh(); }
        });
      }
    });
  });

  /* ════════════════════════════════════════════════════════════════════
     CHIPS — mirror the checked state onto a class as well as :has()
     ════════════════════════════════════════════════════════════════════ */
  Array.prototype.forEach.call(doc.querySelectorAll('.chips'), function (group) {
    var chips = Array.prototype.slice.call(group.querySelectorAll('.chip'));
    function syncChips() {
      chips.forEach(function (chip) {
        var input = chip.querySelector('input');
        chip.classList.toggle('is-on', !!(input && input.checked));
      });
    }
    group.addEventListener('change', syncChips);
    syncChips();
  });

  /* ════════════════════════════════════════════════════════════════════
     CONTACT + YEAR
     ════════════════════════════════════════════════════════════════════ */
  var yearEl = doc.getElementById('year');
  if (yearEl) yearEl.textContent = '\u00A9 ' + new Date().getFullYear() + ' The Freedom Circle';

  var contact = doc.getElementById('contactLink');
  if (contact) contact.href = 'mailto:' + CONFIG.contactEmail;
  Array.prototype.forEach.call(doc.querySelectorAll('[data-email]'), function (el) {
    el.textContent = CONFIG.contactEmail;
    if (el.tagName === 'A') el.href = 'mailto:' + CONFIG.contactEmail;
  });

  /* ════════════════════════════════════════════════════════════════════
     COUNTER
     ════════════════════════════════════════════════════════════════════ */
  var numEl = doc.getElementById('countNum');
  var barEl = doc.getElementById('countBar');
  var capEl = doc.getElementById('countCap');
  var fmt = new Intl.NumberFormat('en-US');
  var currentCount = CONFIG.memberCount;

  function renderCount(n) {
    if (!numEl || !barEl || !capEl) return;
    var pct = Math.max(0, Math.min(100, (n / CONFIG.goal) * 100));
    barEl.style.width = pct.toFixed(3) + '%';

    if (reduced) {
      numEl.textContent = fmt.format(n);
    } else {
      var from = 0, dur = 1200, t0 = 0;
      requestAnimationFrame(function tickN(now) {
        if (!t0) t0 = now;
        var p = Math.min(1, (now - t0) / dur);
        var eased = 1 - Math.pow(1 - p, 3);
        numEl.textContent = fmt.format(Math.round(from + (n - from) * eased));
        if (p < 1) requestAnimationFrame(tickN);
      });
    }

    capEl.textContent = n === 0
      ? 'We are at the very beginning. Be the first name on the list.'
      : fmt.format(CONFIG.goal - n) + ' more women and we register the fund. This is the real count, updated by hand — nothing here is simulated.';
  }

  if (CONFIG.countEndpoint) {
    fetch(CONFIG.countEndpoint)
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d && typeof d.count === 'number') currentCount = d.count;
        renderCount(currentCount);
      })
      .catch(function () { renderCount(currentCount); });
  } else {
    renderCount(currentCount);
  }

  /* ════════════════════════════════════════════════════════════════════
     SHARE
     ════════════════════════════════════════════════════════════════════ */
  var shareRow = doc.getElementById('shareRow');
  if (shareRow) {
    var url = encodeURIComponent(CONFIG.siteUrl);
    var txt = encodeURIComponent(CONFIG.shareText);
    shareRow.innerHTML =
      '<a target="_blank" rel="noopener" href="https://wa.me/?text=' + txt + '%20' + url + '">WhatsApp</a>' +
      '<a target="_blank" rel="noopener" href="https://twitter.com/intent/tweet?text=' + txt + '&url=' + url + '">X</a>' +
      '<a target="_blank" rel="noopener" href="https://www.linkedin.com/sharing/share-offsite/?url=' + url + '">LinkedIn</a>' +
      '<a href="mailto:?subject=' + encodeURIComponent('FRDM Circle') + '&body=' + txt + '%20' + url + '">Email</a>' +
      '<button type="button" id="copyLink">Copy link</button>';

    shareRow.addEventListener('click', function (ev) {
      var t = ev.target;
      if (!t || t.id !== 'copyLink') return;
      ev.preventDefault();
      if (!navigator.clipboard) return;
      navigator.clipboard.writeText(CONFIG.siteUrl).then(function () {
        t.textContent = 'Copied';
        setTimeout(function () { t.textContent = 'Copy link'; }, 2000);
      }).catch(function () { /* clipboard denied — leave the label alone */ });
    });
  }

  /* ════════════════════════════════════════════════════════════════════
     FORM
     ════════════════════════════════════════════════════════════════════ */
  var form = doc.getElementById('joinForm');
  if (form) {
    var thanks = doc.getElementById('thanks');
    var btn = doc.getElementById('submitBtn');
    var errEmail = doc.getElementById('errEmail');
    var errConsent = doc.getElementById('errConsent');
    var errSubmit = doc.getElementById('errSubmit');
    var emailEl = doc.getElementById('email');
    var consentEl = doc.getElementById('consent');

    function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim()); }

    function setError(el, msgEl, on) {
      msgEl.classList.toggle('show', on);
      if (el) el.setAttribute('aria-invalid', on ? 'true' : 'false');
    }

    emailEl.addEventListener('input', function () {
      if (errEmail.classList.contains('show') && validEmail(emailEl.value)) setError(emailEl, errEmail, false);
    });
    consentEl.addEventListener('change', function () {
      if (consentEl.checked) setError(consentEl, errConsent, false);
    });

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      errSubmit.classList.remove('show');

      /* Bot: the honeypot is filled, so stop without telling it anything. */
      if (doc.getElementById('website').value) return;

      var emailOk = validEmail(emailEl.value);
      var consentOk = consentEl.checked;
      setError(emailEl, errEmail, !emailOk);
      setError(consentEl, errConsent, !consentOk);
      if (!emailOk || !consentOk) {
        (emailOk ? consentEl : emailEl).focus();
        return;
      }

      var data = {};
      new FormData(form).forEach(function (val, key) { if (key !== 'website') data[key] = val; });
      data.consent = 'yes';
      data.submitted_at = new Date().toISOString();
      data._subject = 'FRDM Circle — new founding member';

      btn.disabled = true;
      btn.textContent = 'Sending…';

      function succeed() {
        form.style.display = 'none';
        thanks.classList.add('show');
        /* Her seat lights up on the ring, and the count moves with it. */
        if (window.FRDMScene && window.FRDMScene.ignite) window.FRDMScene.ignite(1);
        renderCount(currentCount + 1);
        thanks.focus({ preventScroll: true });
        if (lenis) lenis.scrollTo(thanks, { offset: -140, duration: 0.9 });
        else thanks.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
        if (hasGsap) window.ScrollTrigger.refresh();
      }

      if (!CONFIG.formEndpoint) {
        doc.getElementById('thanksLine').textContent =
          'Demo mode — no endpoint is configured yet, so nothing was actually sent. Add your form endpoint in CONFIG.formEndpoint to go live.';
        setTimeout(succeed, 400);
        return;
      }

      fetch(CONFIG.formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data)
      })
        .then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          succeed();
        })
        .catch(function () {
          btn.disabled = false;
          btn.textContent = 'Join the waitlist';
          errSubmit.textContent = 'Something went wrong on our side. Please try again, or email ' +
            CONFIG.contactEmail + ' and we\u2019ll add you by hand.';
          errSubmit.classList.add('show');
        });
    });
  }

  /* ════════════════════════════════════════════════════════════════════
     MEASUREMENT
     ════════════════════════════════════════════════════════════════════ */
  window.addEventListener('scroll', queueRail, { passive: true });
  window.addEventListener('resize', function () {
    measureDock();
    measureRail();
    queueRail();
    if (hasGsap) window.ScrollTrigger.refresh();
  });

  measureDock();
  measureRail();
  renderRail();

  window.addEventListener('load', function () {
    measureDock();
    refreshLayout();
  });

  if (doc.fonts && doc.fonts.ready) {
    doc.fonts.ready.then(function () {
      measureDock();
      refreshLayout();
    });
  }

  window.addEventListener('pagehide', function () {
    if (lenisTick && window.gsap) window.gsap.ticker.remove(lenisTick);
    if (lenis) lenis.destroy();
    if (hasGsap) window.ScrollTrigger.getAll().forEach(function (t) { t.kill(); });
  }, { once: true });
})();
