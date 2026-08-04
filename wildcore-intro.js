/* ==========================================================================
   Wildcore Retreats — Intro & page transition
   Runs before the page paints, so nothing flashes underneath.

   First visit of a session : the full intro (~2.6s) — mark, wordmark, trail.
   Every visit after that   : a short panel swipe (~1s) between pages.
   ========================================================================== */
(function () {
    'use strict';

    var REDUCED = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var doc = document;
    var root = doc.documentElement;

    /* language pages live one folder down, so assets need the right prefix */
    var BASE = /\/(en|es)\//.test(location.pathname) ? '../' : '';
    var MARK = BASE + 'images/logo-mark.png';

    var LANG = (root.lang || 'nl').slice(0, 2).toLowerCase();
    var TAGLINE = {
        nl: 'Niet presteren. Beleven.',
        en: 'Not performing. Experiencing.',
        es: 'No rendir. Vivir.'
    };
    var tagline = TAGLINE[LANG] || TAGLINE.nl;

    /* the ridge and the trail that draws over it */
    var TRAIL = 'M8 76 C 44 72 60 56 86 52 S 130 60 156 42 S 204 22 238 28 S 292 18 312 12';
    var RIDGE = 'M0 84 L44 54 L74 68 L116 36 L152 62 L192 30 L236 56 L282 32 L320 60 L320 90 L0 90 Z';

    var SEEN_KEY = 'wc-intro-seen';
    var seen;
    try { seen = sessionStorage.getItem(SEEN_KEY) === '1'; } catch (e) { seen = false; }

    function el(html) {
        var d = doc.createElement('div');
        d.innerHTML = html.trim();
        return d.firstChild;
    }

    /* mount as early as possible — the script sits at the top of <body> */
    function mount(node) {
        if (doc.body) doc.body.insertBefore(node, doc.body.firstChild);
        else doc.addEventListener('DOMContentLoaded', function () {
            doc.body.insertBefore(node, doc.body.firstChild);
        });
    }

    /* ------------------------------------------------------------- intro -- */
    function buildIntro() {
        var word = 'WILDCORE';
        var letters = '';
        for (var i = 0; i < word.length; i++) {
            letters += '<span style="animation-delay:' + (560 + i * 55) + 'ms">' +
                       word.charAt(i) + '</span>';
        }

        return el(
            '<div class="wc-intro" id="wcIntro" aria-hidden="true">' +
              '<div class="wc-intro-inner">' +
                '<span class="wc-intro-ring"></span>' +
                '<img class="wc-intro-mark" src="' + MARK + '" alt="" width="96" height="96">' +
                '<div class="wc-intro-word">' + letters + '</div>' +
                '<svg class="wc-intro-route" viewBox="0 0 320 90" fill="none" aria-hidden="true">' +
                  '<path class="wc-intro-ridge" d="' + RIDGE + '"/>' +
                  '<path class="wc-intro-line-soft" d="' + TRAIL + '"/>' +
                  '<path class="wc-intro-line" d="' + TRAIL + '"/>' +
                  '<circle class="wc-intro-dot" r="4.6">' +
                    '<animateMotion dur="1500ms" begin="620ms" fill="freeze" ' +
                      'calcMode="spline" keyPoints="0;1" keyTimes="0;1" ' +
                      'keySplines="0.5 0 0.2 1" path="' + TRAIL + '"/>' +
                  '</circle>' +
                '</svg>' +
                '<p class="wc-intro-tag">' + tagline + '</p>' +
              '</div>' +
            '</div>'
        );
    }

    function runIntro() {
        var node = buildIntro();
        root.classList.add('wc-intro-on');
        mount(node);

        var done = false;
        function finish() {
            if (done) return;
            done = true;
            node.classList.add('is-out');
            root.classList.remove('wc-intro-on');
            setTimeout(function () {
                if (node.parentNode) node.parentNode.removeChild(node);
            }, 900);
        }

        /* the animation needs ~2.2s to land; a slow page may borrow a little
           longer, but never past 2.9s — this is a welcome, not a wait */
        var MIN = 2200, MAX = 2900;
        var t0 = Date.now();
        var ceiling = setTimeout(finish, MAX);

        function finishWhenSettled() {
            var left = Math.max(0, MIN - (Date.now() - t0));
            setTimeout(function () { clearTimeout(ceiling); finish(); }, left);
        }
        if (doc.readyState === 'complete') finishWhenSettled();
        else window.addEventListener('load', finishWhenSettled);

        /* a click skips ahead */
        node.addEventListener('click', function () { clearTimeout(ceiling); finish(); });

        try { sessionStorage.setItem(SEEN_KEY, '1'); } catch (e) {}
    }

    /* ---------------------------------------------------- page transition -- */
    function buildSwipe() {
        return el(
            '<div class="wc-swipe" id="wcSwipe" aria-hidden="true">' +
              '<div class="wc-swipe-badge">' +
                '<img src="' + MARK + '" alt="" width="56" height="56">' +
                '<span class="wc-swipe-track"><i></i></span>' +
              '</div>' +
            '</div>'
        );
    }

    function arrive() {
        var node = buildSwipe();
        node.classList.add('is-arriving');
        mount(node);
        /* one frame to paint the panel, then slide it off */
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                setTimeout(function () {
                    node.classList.remove('is-arriving');
                    node.classList.add('is-leaving');
                    setTimeout(function () {
                        if (node.parentNode) node.parentNode.removeChild(node);
                    }, 700);
                }, 220);
            });
        });
    }

    function wireLinks() {
        var swipe = null;

        doc.addEventListener('click', function (e) {
            if (e.defaultPrevented || e.button !== 0) return;
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

            var a = e.target.closest ? e.target.closest('a[href]') : null;
            if (!a) return;
            if (a.target && a.target !== '_self') return;
            if (a.hasAttribute('download')) return;

            var url;
            try { url = new URL(a.href, location.href); } catch (err) { return; }
            if (url.origin !== location.origin) return;
            if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
            /* an anchor on this same page is a scroll, not a page change */
            if (url.pathname === location.pathname && url.search === location.search) return;

            e.preventDefault();
            if (!swipe) { swipe = buildSwipe(); mount(swipe); }
            /* let the panel settle before handing over */
            requestAnimationFrame(function () {
                swipe.classList.add('is-covering');
                setTimeout(function () { location.href = url.href; }, 480);
            });
        }, true);
    }

    /* --------------------------------------------------------------- go --- */
    if (REDUCED) {
        try { sessionStorage.setItem(SEEN_KEY, '1'); } catch (e) {}
        return;
    }

    if (!seen) runIntro();
    else arrive();

    wireLinks();
})();
