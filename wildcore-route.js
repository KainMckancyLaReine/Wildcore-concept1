/* ==========================================================================
   Wildcore Retreats — The Route
   Builds an animated trail map above the weekend programme. The day names,
   distances and elevation are read straight off the existing day cards, so
   the map stays correct in Dutch, English and Spanish and keeps following
   whatever the CMS puts in those cards.
   ========================================================================== */
(function () {
    'use strict';

    var REDUCED = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* one lap of the trail, plus a short breather at the summit before it resets */
    var RUN_MS = 17000;
    var HOLD_MS = 900;

    /* eased progress — each day's run starts and settles gently instead of
       snapping to a stop, which is what makes the loop feel smooth */
    function ease(t) {
        if (t <= 0) return 0;
        if (t >= 1) return 1;
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    var COPY = {
        nl: { eyebrow: 'De route', dist: 'Afstand', elev: 'Hoogtemeters',
              start: 'Villa', finish: 'Finish', low: 'Vallei', high: 'Kam',
              reached: 'Top bereikt' },
        en: { eyebrow: 'The route', dist: 'Distance', elev: 'Elevation',
              start: 'Villa', finish: 'Finish', low: 'Valley', high: 'Ridge',
              reached: 'Summit reached' },
        es: { eyebrow: 'La ruta', dist: 'Distancia', elev: 'Desnivel',
              start: 'Villa', finish: 'Meta', low: 'Valle', high: 'Cresta',
              reached: 'Cima alcanzada' }
    };

    /* ---------------------------------------------------------------- land --
       Altitude bands, a river through the valley and two distant ranges. All
       of it survives being stretched, which is why the trees, rocks and peaks
       further down are HTML sprites instead. */
    var LAND =
        /* valley floor */
        '<path class="lb lb-valley" d="M0,400 L0,318 C120,300 210,330 330,318 ' +
            'C460,305 540,332 660,322 C790,311 880,334 1000,326 L1000,400 Z"></path>' +
        /* lower slopes */
        '<path class="lb lb-slope" d="M0,326 L0,252 C130,232 220,266 350,250 ' +
            'C470,235 560,262 690,250 C810,239 900,264 1000,254 L1000,400 L0,400 Z"></path>' +
        /* upper slopes */
        '<path class="lb lb-upper" d="M0,258 L0,176 C140,152 250,190 380,172 ' +
            'C500,155 590,184 720,170 C840,157 920,182 1000,174 L1000,400 L0,400 Z"></path>' +
        /* rock and ridge */
        '<path class="lb lb-rock" d="M0,180 L0,104 C150,78 270,118 400,98 ' +
            'C530,78 620,108 750,92 C870,77 930,102 1000,96 L1000,400 L0,400 Z"></path>' +
        /* the river finding its way down the valley, with light moving on it */
        '<path class="wc-river" d="M -20,352 C 120,340 200,364 330,352 ' +
            'C 450,341 520,362 650,350 C 770,339 880,358 1020,346"></path>' +
        '<path class="wc-river-lit" d="M -20,352 C 120,340 200,364 330,352 ' +
            'C 450,341 520,362 650,350 C 770,339 880,358 1020,346"></path>' +
        /* four ranges, each peak built from a lit face, a shadow face and a
           snow cap, so the skyline reads as modelled rock rather than a zigzag */
        ridge(0, 74, 46, 7, 'r0') +
        ridge(1, 104, 54, 8, 'r1') +
        '<rect class="wc-haze" x="0" y="92" width="1000" height="52"></rect>' +
        ridge(2, 140, 58, 9, 'r2') +
        ridge(3, 178, 44, 11, 'r3');

    /* One range: alternating peaks with a sunlit left flank, a shaded right
       flank and, on the taller ones, a cap of snow. Light comes from the left,
       so every shadow falls the same way and the relief holds together. */
    function ridge(layer, baseY, amp, count, cls) {
        var out = '', step = 1000 / count, seed = layer * 3.7;
        for (var i = -1; i <= count; i++) {
            var cx = i * step + (Math.sin(i * 1.7 + seed) * step * 0.18);
            var h = amp * (0.62 + Math.abs(Math.sin(i * 1.31 + seed)) * 0.55);
            var w = step * (0.62 + Math.abs(Math.cos(i * 0.9 + seed)) * 0.34);
            var top = baseY - h, l = cx - w, r = cx + w;
            /* a slightly off-centre summit keeps the peaks from looking stamped */
            var sx = cx + Math.sin(i * 2.3 + seed) * w * 0.22;
            out += '<polygon class="wc-pk ' + cls + '" points="' +
                l.toFixed(0) + ',' + baseY + ' ' + sx.toFixed(0) + ',' + top.toFixed(0) +
                ' ' + r.toFixed(0) + ',' + baseY + '"></polygon>' +
                /* the shaded side, from the summit down the right flank */
                '<polygon class="wc-pk-sh ' + cls + '" points="' +
                sx.toFixed(0) + ',' + top.toFixed(0) + ' ' + r.toFixed(0) + ',' + baseY +
                ' ' + (cx + w * 0.12).toFixed(0) + ',' + baseY + '"></polygon>';
            if (h > amp * 0.85) {
                var capW = w * 0.3, capH = h * 0.26;
                out += '<polygon class="wc-pk-cap ' + cls + '" points="' +
                    (sx - capW).toFixed(0) + ',' + (top + capH).toFixed(0) + ' ' +
                    sx.toFixed(0) + ',' + top.toFixed(0) + ' ' +
                    (sx + capW).toFixed(0) + ',' + (top + capH).toFixed(0) + ' ' +
                    (sx + capW * 0.3).toFixed(0) + ',' + (top + capH * 0.55).toFixed(0) + ' ' +
                    (sx - capW * 0.35).toFixed(0) + ',' + (top + capH * 0.8).toFixed(0) +
                    '"></polygon>';
            }
        }
        return '<g class="wc-ridge-layer ' + cls + '">' + out + '</g>';
    }

    /* clouds and birds live above the land and are not part of the survey */
    var SKY =
        '<span class="wc-cloud c1"></span><span class="wc-cloud c2"></span>' +
        '<span class="wc-cloud c3"></span>' +
        '<span class="wc-bird b1"><svg viewBox="0 0 20 8"><path d="M1 6 Q5 1 9.5 5.5 Q14 1 19 6"/></svg></span>' +
        '<span class="wc-bird b2"><svg viewBox="0 0 20 8"><path d="M1 6 Q5 1 9.5 5.5 Q14 1 19 6"/></svg></span>' +
        '<span class="wc-bird b3"><svg viewBox="0 0 20 8"><path d="M1 6 Q5 1 9.5 5.5 Q14 1 19 6"/></svg></span>';

    /* map furniture */
    var COMPASS =
        '<span class="wc-compass"><svg viewBox="0 0 40 40">' +
        '<circle class="cp-r" cx="20" cy="20" r="15"/>' +
        '<path class="cp-n" d="M20 5 L24 20 L20 17 L16 20 Z"/>' +
        '<path class="cp-s" d="M20 35 L16 20 L20 23 L24 20 Z"/>' +
        '<path class="cp-t" d="M20 2v3M38 20h-3M20 38v-3M2 20h3"/>' +
        '</svg><b>N</b></span>';

    /* --------------------------------------------------------- map sprites --
       Everything he passes on the way up. `at` is how far along the route it
       appears, so the map fills in behind him. */
    var FEATURES = [
        { k: 'village', x: 4.5,  y: 88, s: 30, at: 0.005 },
        { k: 'pine',    x: 11,   y: 82, s: 22, at: 0.02 },
        { k: 'oak',     x: 15,   y: 90, s: 20, at: 0.04 },
        { k: 'pine',    x: 8,    y: 94, s: 19, at: 0.05 },
        { k: 'bridge',  x: 20,   y: 87, s: 26, at: 0.08 },
        { k: 'oak',     x: 25,   y: 80, s: 23, at: 0.10 },
        { k: 'pine',    x: 29,   y: 92, s: 18, at: 0.12 },
        { k: 'fall',    x: 33,   y: 74, s: 46, at: 0.15, label: 'wf1' },
        { k: 'pine',    x: 37,   y: 86, s: 21, at: 0.18 },
        { k: 'rock',    x: 40,   y: 76, s: 14, at: 0.21 },
        { k: 'oak',     x: 43,   y: 90, s: 22, at: 0.24 },
        { k: 'pine',    x: 46,   y: 74, s: 19, at: 0.27 },
        { k: 'peak',    x: 52,   y: 40, s: 46, at: 0.30 },
        { k: 'pine',    x: 50,   y: 86, s: 20, at: 0.33 },
        { k: 'rock',    x: 55,   y: 66, s: 16, at: 0.36 },
        { k: 'oak',     x: 58,   y: 82, s: 21, at: 0.39 },
        { k: 'peak',    x: 66,   y: 31, s: 56, at: 0.42 },
        { k: 'fall',    x: 64,   y: 64, s: 50, at: 0.46, label: 'wf2' },
        { k: 'pine',    x: 60,   y: 74, s: 18, at: 0.49 },
        { k: 'rock',    x: 69,   y: 64, s: 15, at: 0.52 },
        { k: 'pine',    x: 72,   y: 80, s: 21, at: 0.55 },
        { k: 'view',    x: 76,   y: 56, s: 20, at: 0.58 },
        { k: 'rock',    x: 79,   y: 58, s: 17, at: 0.62 },
        { k: 'pine',    x: 82,   y: 74, s: 19, at: 0.65 },
        { k: 'peak',    x: 88,   y: 25, s: 62, at: 0.69 },
        { k: 'rock',    x: 85,   y: 50, s: 15, at: 0.73 },
        { k: 'rock',    x: 90,   y: 62, s: 13, at: 0.77 },
        { k: 'pine',    x: 93,   y: 76, s: 17, at: 0.81 },
        { k: 'cairn',   x: 96,   y: 41, s: 24, at: 0.88 }
    ];

    /* the two waterfalls get a name on the map */
    var FALL_NAMES = {
        nl: { wf1: 'Salt de la Nòvia', wf2: 'Barranc del Carraixet' },
        en: { wf1: 'Salt de la Nòvia', wf2: 'Barranc del Carraixet' },
        es: { wf1: 'Salt de la Nòvia', wf2: 'Barranc del Carraixet' }
    };

    var SPRITES = {
        /* a pine and a broadleaf, so the forest is not one shape repeated */
        pine: '<svg viewBox="0 0 24 34"><g class="sway">' +
              '<path class="tr-t" d="M12 2 4 15h4L2 26h20L16 15h4z"/></g>' +
              '<rect class="tr-s" x="10.6" y="25" width="2.8" height="8" rx="1.2"/></svg>',
        oak:  '<svg viewBox="0 0 28 32"><g class="sway">' +
              '<path class="tr-t" d="M14 2c4.2 0 6.4 2.2 7.4 4.6 2.6.5 4.6 2.6 4.6 5.2 0 3.1-2.6 5.6-6 5.9' +
              'C18.6 19.6 16.5 21 14 21s-4.6-1.4-6-3.3c-3.4-.3-6-2.8-6-5.9 0-2.6 2-4.7 4.6-5.2C7.6 4.2 9.8 2 14 2z"/></g>' +
              '<rect class="tr-s" x="12.6" y="18" width="2.8" height="13" rx="1.2"/></svg>',
        rock: '<svg viewBox="0 0 26 18"><path class="rk" d="M2 17 8 4l6 5 5-7 5 15z"/>' +
              '<path class="rk-l" d="M8 4l6 5 5-7"/></svg>',
        peak: '<svg viewBox="0 0 60 44"><path class="pk" d="M2 43 22 5l11 17 8-11 17 32z"/>' +
              '<path class="pk-sh" d="M22 5l11 17 8-11 17 32H33z"/>' +
              '<path class="pk-cap" d="M22 5l6 9-4 2-3-3-3 2z"/></svg>',
        village: '<svg viewBox="0 0 34 22"><path class="vg" d="M2 21V11l6-5 6 5v10z"/>' +
                 '<path class="vg" d="M16 21v-7l5-4 5 4v7z"/><path class="vg-r" d="M28 21v-5l3-2 2 2v5z"/>' +
                 '<path class="vg-w" d="M7 14h2v3H7zM20 15h2v2h-2z"/></svg>',
        bridge: '<svg viewBox="0 0 30 16"><path class="bg" d="M1 12h28M6 12V7M15 12V4M24 12V7"/>' +
                '<path class="bg-a" d="M1 8C8 1 22 1 29 8"/></svg>',
        view: '<svg viewBox="0 0 22 22"><circle class="vw" cx="11" cy="11" r="8"/>' +
              '<path class="vw-l" d="M11 1v3M11 18v3M1 11h3M18 11h3"/></svg>',
        cairn: '<svg viewBox="0 0 22 28"><path class="cn" d="M4 27h14M6 22h10M7.5 17h7M8.5 12h5M9.5 7h3"/></svg>',
        /* the waterfall is built per instance in fallSprite(), because the
           falling water is clipped and every clipPath needs its own id */
        fall: ''
    };

    /* ----------------------------------------------------------- waterfall --
       A stepped cliff, water tipping over a lip and flaring as it drops, a
       clipped curtain so nothing spills past the rock, foam and ripples in the
       plunge pool, spray rising off it and a stream running away downhill. */
    function fallSprite(id) {
        /* the curtain: a notch at the lip that flares as the water falls */
        var CURTAIN = 'M14.4 9 H25.6 L29 40 Q20 45 11 40 Z';

        var streaks = '';
        var lanes = [
            { x: 15.0, w: 1.4, h: 16, d: 1.45, o: 0 },
            { x: 17.4, w: 2.6, h: 24, d: 1.05, o: -.4 },
            { x: 20.6, w: 1.1, h: 13, d: 1.7,  o: -.85 },
            { x: 22.2, w: 2.0, h: 20, d: 1.25, o: -.2 },
            { x: 24.6, w: 1.3, h: 15, d: 1.55, o: -.65 },
            { x: 16.2, w: .9,  h: 11, d: 1.95, o: -1.15 }
        ];
        lanes.forEach(function (l) {
            streaks += '<rect class="wf-st" x="' + l.x + '" y="-8" width="' + l.w +
                '" height="' + l.h + '" rx="' + (l.w / 2) +
                '" style="animation-duration:' + l.d + 's;animation-delay:' + l.o + 's"/>';
        });

        var spray = '';
        for (var i = 0; i < 6; i++) {
            spray += '<circle class="wf-sp" cx="' + (13.5 + i * 2.7) + '" cy="43.5" r="' +
                (0.8 + (i % 3) * 0.32) + '" style="animation-delay:' + (i * 0.36) + 's"/>';
        }

        return '<svg viewBox="0 0 40 58">' +
            '<defs>' +
                '<clipPath id="' + id + '"><path d="' + CURTAIN + '"/></clipPath>' +
                '<linearGradient id="' + id + 'g" x1="0" y1="0" x2="0" y2="1">' +
                    '<stop offset="0%"   stop-color="#e2f2f6"/>' +
                    '<stop offset="35%"  stop-color="#b6dbe5"/>' +
                    '<stop offset="100%" stop-color="#7db4c6"/>' +
                '</linearGradient>' +
            '</defs>' +

            /* Rock is cut as a notch either side of the water rather than a
               slab behind it, so at map size the silhouette reads as a gorge
               with the fall coming through it. */
            '<path class="wf-rock" d="M0 16 L8 12 L14.4 9 L14.4 20 L10 26 L6 44 L0 44 Z"/>' +
            '<path class="wf-rock" d="M40 16 L32 12 L25.6 9 L25.6 20 L30 26 L34 44 L40 44 Z"/>' +
            '<path class="wf-rock rk-dark" d="M0 26 L6 22 L10 30 L7 44 L0 44 Z"/>' +
            '<path class="wf-rock rk-dark" d="M40 26 L34 22 L30 30 L33 44 L40 44 Z"/>' +
            '<path class="wf-strata" d="M2 22h5M33 22h5M2.5 33h4M33.5 33h4"/>' +

            /* the water, clipped to the curtain */
            '<g clip-path="url(#' + id + ')">' +
                '<path class="wf-body" d="' + CURTAIN + '" fill="url(#' + id + 'g)"/>' +
                streaks +
            '</g>' +
            /* soft edges where the curtain meets the rock */
            '<path class="wf-edge" d="M14.4 9 L11 40M25.6 9 L29 40"/>' +

            /* the crest tipping over the lip */
            '<path class="wf-lip" d="M13.8 10.4 Q20 7 26.2 10.4"/>' +

            /* the plunge pool */
            '<ellipse class="wf-pool" cx="20" cy="45" rx="13" ry="4.8"/>' +
            '<ellipse class="wf-foam" cx="20" cy="43.4" rx="6.4" ry="2.4"/>' +
            '<ellipse class="wf-ring r1" cx="20" cy="45" rx="5.5" ry="2"/>' +
            '<ellipse class="wf-ring r2" cx="20" cy="45" rx="5.5" ry="2"/>' +
            '<ellipse class="wf-ring r3" cx="20" cy="45" rx="5.5" ry="2"/>' +
            '<g class="wf-spray">' + spray + '</g>' +
            '<ellipse class="wf-mist" cx="20" cy="41" rx="11" ry="6.5"/>' +

            /* the stream running on down the valley */
            '<path class="wf-out" d="M32 46 Q36 49 40 48"/>' +
            '</svg>';
    }

    /* The trail itself: out of the valley, over two climbs, along the ridge.
       Drawn in a 1000x400 box; every marker is placed by measuring this path
       rather than by guessing coordinates. */
    /* Three routes, one per day, each covering its own part of the range.
       Friday is the short valley loop, Saturday the long climb over the ridge,
       Sunday the gentler recovery loop back down. */
    var TRAILS = [
        {   /* vrijdag — Casinos Sunset Loop */
            d: 'M 52,346 C 104,336 138,308 182,300 C 226,292 250,318 292,310 ' +
               'C 330,303 348,282 372,266',
            elev: '0,66 90,62 190,64 290,54 390,58 490,46 590,50 690,40 790,44 ' +
                  '890,34 1000,30'
        },
        {   /* zaterdag — Serra Calderona Grand Loop */
            d: 'M 372,266 C 404,244 418,210 452,186 C 488,160 524,172 560,150 ' +
               'C 600,126 598,86 640,70 C 684,53 720,88 764,80 C 800,73 814,50 846,42',
            elev: '0,62 80,54 170,58 260,42 350,46 440,26 530,32 620,16 710,22 ' +
                  '810,10 900,16 1000,8'
        },
        {   /* zondag — Rebalsadors Recovery Loop */
            d: 'M 846,42 C 878,36 906,54 934,72 C 962,90 962,124 940,146 ' +
               'C 916,170 872,164 846,182',
            elev: '0,20 100,26 200,22 300,34 400,30 500,42 600,38 700,50 800,46 ' +
                  '900,56 1000,52'
        }
    ];
    /* the first trail is what the geometry helpers measure against */
    var TRAIL = TRAILS[0].d;

    /* the same climb read as an elevation profile */
    var ELEV = '0,64 70,58 145,62 215,46 290,50 360,30 430,36 505,20 ' +
        '575,26 650,10 725,18 800,6 875,14 940,4 1000,10';

    function $(s, r) { return (r || document).querySelector(s); }
    function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
    function el(tag, cls, html) {
        var n = document.createElement(tag);
        if (cls) n.className = cls;
        if (html != null) n.innerHTML = html;
        return n;
    }
    function lang() {
        var l = (document.documentElement.lang || 'nl').slice(0, 2).toLowerCase();
        return COPY[l] ? l : 'nl';
    }

    /* "20–23 km" -> 23   "±850 hm" -> 850 */
    function biggestNumber(str) {
        var nums = (str || '').replace(/[.,](?=\d{3}\b)/g, '').match(/\d+(?:[.,]\d+)?/g);
        if (!nums) return 0;
        return nums.reduce(function (a, b) {
            return Math.max(a, parseFloat(String(b).replace(',', '.')));
        }, 0);
    }

    function readDays() {
        return $$('#programma .day-card').map(function (card) {
            var stats = $$('.stats span', card);
            return {
                label: (($('.day-label', card) || {}).textContent || '').trim(),
                name: (($('h3', card) || {}).textContent || '').trim(),
                km: stats[0] ? stats[0].textContent.trim() : '',
                hm: stats[1] ? stats[1].textContent.trim() : ''
            };
        });
    }

    function build() {
        var section = $('#programma');
        if (!section || $('.wc-route')) return;
        var container = $('.container', section);
        var head = $('.section-head', section);
        var grid = $('.program-grid', section);
        if (!container || !grid) return;

        var days = readDays();
        if (days.length < 2) return;
        var t = COPY[lang()];

        var totalKm = days.reduce(function (a, d) { return a + biggestNumber(d.km); }, 0);
        var totalHm = days.reduce(function (a, d) { return a + biggestNumber(d.hm); }, 0);

        /* the mark is borrowed off an image already on the page, so the path
           resolves correctly from the root as well as from /en and /es */
        var markEl = document.querySelector('img[src*="logo-mark"]');
        var mark = markEl ? markEl.getAttribute('src') : '';

        var root = el('div', 'wc-route');
        root.setAttribute('aria-hidden', 'true');
        root.innerHTML =
            '<div class="wc-route-head">' +
                '<span class="wc-route-eyebrow"><i></i>' + t.eyebrow + '</span>' +
                '<div class="wc-route-totals">' +
                    '<div><span>' + t.dist + '</span><b class="wc-km">0 km</b></div>' +
                    '<div><span>' + t.elev + '</span><b class="wc-hm">0 hm</b></div>' +
                '</div>' +
            '</div>' +

            '<div class="wc-map">' +
                '<svg viewBox="0 0 1000 400" preserveAspectRatio="none">' +
                    '<defs><linearGradient id="wcHaze" x1="0" y1="0" x2="0" y2="1">' +
                        '<stop offset="0%" stop-color="#f8f2e6" stop-opacity="0"></stop>' +
                        '<stop offset="60%" stop-color="#f8f2e6" stop-opacity=".85"></stop>' +
                        '<stop offset="100%" stop-color="#f8f2e6" stop-opacity="0"></stop>' +
                    '</linearGradient></defs>' +
                    /* the land, drawn twice: a survey ghost that is always there,
                       and the surveyed version that wipes in as he walks */
                    '<g class="wc-land wc-land-ghost">' + LAND + '</g>' +
                    '<g class="wc-land wc-land-live">' + LAND + '</g>' +
                    '<path class="wc-contour"    d="M 90,372 C 240,330 300,392 470,352 C 640,312 760,364 950,320"></path>' +
                    '<path class="wc-contour c2" d="M 60,300 C 230,254 330,318 500,270 C 660,224 800,286 980,236"></path>' +
                    '<path class="wc-contour c3" d="M 40,222 C 220,176 340,240 520,190 C 690,142 830,206 990,156"></path>' +
                    /* all three days are always on the map as planned route;
                       the active one is drawn over the top in full colour */
                    TRAILS.map(function (t, i) {
                        return '<path class="wc-plan wc-plan-' + i + '" d="' + t.d + '"></path>';
                    }).join('') +
                    '<g class="wc-ticks"></g>' +
                    TRAILS.map(function (t, i) {
                        return '<path class="wc-trail-glow wc-day-' + i + '" d="' + t.d + '"></path>' +
                               '<path class="wc-trail-case wc-day-' + i + '" d="' + t.d + '"></path>' +
                               '<path class="wc-trail wc-day-' + i + '"      d="' + t.d + '"></path>';
                    }).join('') +
                '</svg>' +
                '<span class="wc-sun"></span>' +
                '<div class="wc-sky">' + SKY + '</div>' +
                '<div class="wc-features"></div>' +
                (mark ? '<img class="wc-watermark" src="' + mark + '" alt="" aria-hidden="true">' : '') +
                COMPASS +
                '<span class="wc-scale"><i></i><b>5 km</b></span>' +
                '<span class="wc-flag wc-flag-start">' + t.start + '</span>' +
                '<span class="wc-flag wc-flag-end">' + t.finish +
                    '<b class="wc-flag-burst"></b></span>' +
                '<span class="wc-summit">' + t.reached + '</span>' +
                '<div class="wc-runner"><span class="halo"></span><span class="body"></span></div>' +
            '</div>' +

            '<div class="wc-profile">' +
                '<div class="wc-profile-chart">' +
                    '<svg viewBox="0 0 1000 74" preserveAspectRatio="none">' +
                        TRAILS.map(function (t, i) {
                            return '<polygon class="wc-elev-fill wc-day-' + i + '" points="' +
                                       t.elev + ' 1000,74 0,74"></polygon>' +
                                   '<polyline class="wc-elev-base wc-day-' + i + '" points="' + t.elev + '"></polyline>' +
                                   '<polyline class="wc-elev-line wc-day-' + i + '" points="' + t.elev + '"></polyline>';
                        }).join('') +
                    '</svg>' +
                    '<span class="wc-head"></span>' +
                '</div>' +
                '<div class="wc-profile-legend"><span>' + t.low + '</span><span>' + t.high + '</span></div>' +
            '</div>' +

            '<ul class="wc-route-days">' + days.map(function (d) {
                return '<li><i></i><b>' + d.label + '</b> ' + d.name +
                    '<span>' + d.km + '</span></li>';
            }).join('') + '</ul>';

        /* the three day cards come first, the map sits underneath them as the
           closing image of the section */
        if (grid.nextSibling) container.insertBefore(root, grid.nextSibling);
        else container.appendChild(root);
        root.classList.add('wc-route-below');
        return { root: root, days: days, totalKm: totalKm, totalHm: totalHm };
    }

    function wire(ctx) {
        var root = ctx.root;
        var map = $('.wc-map', root);
        var trail = $('.wc-trail', root);
        var glow = $('.wc-trail-glow', root);
        var runner = $('.wc-runner', root);
        var kmOut = $('.wc-km', root);
        var hmOut = $('.wc-hm', root);
        var listItems = $$('.wc-route-days li', root);

        /* Every day is its own route with its own length, so each gets its own
           dash setup and its own runner pass. */
        var routes = TRAILS.slice(0, Math.max(1, ctx.days.length)).map(function (t, i) {
            var line = $('.wc-trail.wc-day-' + i, root);
            var l = line.getTotalLength();
            [line, $('.wc-trail-glow.wc-day-' + i, root), $('.wc-trail-case.wc-day-' + i, root)]
                .forEach(function (n) {
                    if (!n) return;
                    n.style.strokeDasharray = l;
                    n.style.strokeDashoffset = l;
                });
            return { line: line, len: l, i: i };
        });

        /* a pin at the midpoint of each day's own route, with a hairline
           dropping from its card down onto the trail — as in the reference */
        var pins = routes.map(function (r, i) {
            var day = ctx.days[i] || ctx.days[ctx.days.length - 1];
            var pt = r.line.getPointAtLength(r.len * 0.5);
            var cls = 'wc-pin wc-pin-' + i +
                (i === routes.length - 1 ? ' pin-end' : '') +
                (pt.y < 150 ? ' pin-below' : '');
            var pin = el('div', cls,
                '<span class="ring"></span><span class="dot"></span>' +
                '<span class="stalk"></span>' +
                '<span class="card"><em>' + day.label + '</em>' +
                '<strong>' + day.name + '</strong>' +
                '<u>' + day.km + (day.hm ? '  ·  ' + day.hm : '') + '</u></span>');
            pin.style.left = (pt.x / 1000 * 100) + '%';
            pin.style.top = (pt.y / 400 * 100) + '%';
            map.appendChild(pin);
            return { node: pin, item: listItems[i] || null, day: day };
        });
        /* keep the old single-trail measurements working for the ticks below */
        var len = routes[0].len;
        root.style.setProperty('--len', len);

        /* the land he walks past, appearing behind him as he goes */
        var featureLayer = $('.wc-features', root);
        var falls = FALL_NAMES[lang()] || FALL_NAMES.nl;
        var features = FEATURES.map(function (f, i) {
            var inner = f.k === 'fall' ? fallSprite('wcFall' + i) : (SPRITES[f.k] || '');
            if (f.label && falls[f.label]) {
                inner += '<b class="wc-ft-name">' + falls[f.label] + '</b>';
            }
            var node = el('span', 'wc-ft wc-ft-' + f.k, inner);
            node.style.left = f.x + '%';
            node.style.top = f.y + '%';
            /* the size goes in as a variable so the stylesheet can scale the
               whole cast down on a narrow map */
            node.style.setProperty('--s', f.s);
            /* a touch of variation so no two trees breathe in step */
            node.style.setProperty('--d', (i % 7) * 0.4 + 's');
            featureLayer.appendChild(node);
            return { node: node, at: f.at, on: false };
        });

        /* kilometre ticks, square to the path, spread over all three routes so
           the whole weekend is marked out rather than only the first day */
        var ticksGroup = $('.wc-ticks', root);
        var ticks = [];
        var perRoute = 5;
        routes.forEach(function (r) {
            for (var k = 1; k < perRoute; k++) {
                var f = k / perRoute;
                var a = r.line.getPointAtLength(r.len * f);
                var b = r.line.getPointAtLength(Math.min(r.len, r.len * f + 1));
                var dx = b.x - a.x, dy = b.y - a.y;
                var m = Math.sqrt(dx * dx + dy * dy) || 1;
                var nx = -dy / m * 6, ny = dx / m * 6;
                var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('class', 'wc-tick');
                line.setAttribute('x1', a.x - nx); line.setAttribute('y1', a.y - ny);
                line.setAttribute('x2', a.x + nx); line.setAttribute('y2', a.y + ny);
                ticksGroup.appendChild(line);
                /* `at` is measured against the whole weekend */
                ticks.push({ node: line, at: (r.i + f) / routes.length });
            }
        });

        /* start and finish flags on the real path ends */
        /* the weekend starts at the villa on day one and finishes at the end of
           the last day's route, not at the end of the first */
        var lastRoute = routes[routes.length - 1];
        var s = routes[0].line.getPointAtLength(0);
        var e = lastRoute.line.getPointAtLength(lastRoute.len);
        var fs = $('.wc-flag-start', root), fe = $('.wc-flag-end', root);
        fs.style.left = (s.x / 1000 * 100) + '%'; fs.style.top = (s.y / 400 * 100 - 4) + '%';
        fe.style.left = (e.x / 1000 * 100) + '%'; fe.style.top = (e.y / 400 * 100 - 4) + '%';

        /* how far into the whole weekend each day's route starts and ends —
           used so the terrain, the ticks and the counters keep telling one
           continuous story while the routes run one after another */
        var kmPer = ctx.days.map(function (d) { return biggestNumber(d.km); });
        var hmPer = ctx.days.map(function (d) { return biggestNumber(d.hm); });
        function sumTo(arr, n) { var s = 0; for (var i = 0; i < n; i++) s += arr[i] || 0; return s; }

        var day = 0;   /* which route is running */
        var locale = lang();
        var lastKm = '', lastHm = '';

        /* the three strokes that make up each day's trail, looked up once —
           querying them every frame is what used to make the loop stutter */
        var strokes = routes.map(function (rt) {
            return [rt.line,
                    $('.wc-trail-glow.wc-day-' + rt.i, root),
                    $('.wc-trail-case.wc-day-' + rt.i, root)]
                   .filter(Boolean);
        });

        function place(p) {
            var r = routes[day];
            var pt = r.line.getPointAtLength(r.len * p);
            runner.style.left = (pt.x / 1000 * 100) + '%';
            runner.style.top = (pt.y / 400 * 100) + '%';
        }

        function paint(p) {
            var r = routes[day];
            /* the active route draws itself; the days already walked stay drawn */
            routes.forEach(function (rt, i) {
                var done = rt.i < day ? 1 : (rt.i === day ? p : 0);
                var off = rt.len * (1 - done);
                strokes[i].forEach(function (n) { n.style.strokeDashoffset = off; });
            });

            /* overall progress across the weekend feeds the land and the ticks */
            var g = (day + p) / routes.length;
            root.style.setProperty('--p', g);
            if (root.getAttribute('data-day') !== String(day)) {
                root.setAttribute('data-day', day);
            }
            place(p);

            /* the counters only get touched when the rounded number actually
               changes — writing the same text 60x a second costs paint time */
            var km = Math.round(sumTo(kmPer, day) + (kmPer[day] || 0) * p) + ' km';
            if (km !== lastKm) { lastKm = km; kmOut.textContent = km; }
            var hm = Math.round(sumTo(hmPer, day) + (hmPer[day] || 0) * p)
                .toLocaleString(locale) + ' hm';
            if (hm !== lastHm) { lastHm = hm; hmOut.textContent = hm; }

            pins.forEach(function (pin, i) {
                var on = i < day || (i === day && p >= 0.5);
                if (on !== pin.node.classList.contains('is-reached')) {
                    pin.node.classList.toggle('is-reached', on);
                    if (pin.item) pin.item.classList.toggle('is-reached', on);
                }
                pin.node.classList.toggle('is-active', i === day);
                if (pin.item) pin.item.classList.toggle('is-active', i === day);
            });
            ticks.forEach(function (tk) {
                tk.node.classList.toggle('is-passed', g >= tk.at);
            });
            features.forEach(function (f) {
                var on = g >= f.at;
                if (on !== f.on) { f.on = on; f.node.classList.toggle('is-shown', on); }
            });
            /* the moment the last day tops out */
            root.classList.toggle('is-finished', day === routes.length - 1 && p >= 0.995);
        }

        if (REDUCED) { day = routes.length - 1; paint(1); root.classList.add('is-in'); return; }

        /* --- the clock ----------------------------------------------------
           Each day is its own lap with its own breather at the end. After the
           third the map resets and the weekend starts over. */
        var t0 = 0, raf = null, running = false;
        var LAP = RUN_MS / routes.length;          /* one day's run */
        var CYCLE = (LAP + HOLD_MS) * routes.length;

        function frame(now) {
            if (!running) return;
            if (!t0) t0 = now;
            var elapsed = (now - t0) % CYCLE;
            var slot = LAP + HOLD_MS;
            var idx = Math.floor(elapsed / slot);
            var within = elapsed - idx * slot;
            if (idx !== day) {
                day = Math.min(idx, routes.length - 1);
                /* a fresh day wipes the previous route's finish state */
                root.classList.remove('is-finished');
            }
            var holding = within > LAP;
            /* the runner dips out during the breather so the jump to the next
               day's start point is a fade rather than a teleport */
            root.classList.toggle('is-holding', holding);
            paint(holding ? 1 : ease(within / LAP));
            raf = requestAnimationFrame(frame);
        }
        function start() {
            if (running) return;
            running = true; t0 = 0; day = 0;
            root.classList.add('is-live');
            raf = requestAnimationFrame(frame);
        }
        function stop() {
            running = false;
            cancelAnimationFrame(raf);
            root.classList.remove('is-live');
            root.classList.remove('is-holding');
        }

        if ('IntersectionObserver' in window) {
            new IntersectionObserver(function (entries) {
                entries.forEach(function (en) {
                    if (en.isIntersecting) { root.classList.add('is-in'); start(); }
                    else stop();
                });
            }, { threshold: 0.25 }).observe(root);
        } else {
            root.classList.add('is-in');
            start();
        }

        /* a resize changes nothing about the path, but the flags and pins are
           positioned in percentages so they follow on their own */
        window.addEventListener('resize', function () { if (running) place(0); }, { passive: true });
    }

    /* ------------------------------------------------------------ terrain --
       The land is drawn in SVG by default. Drop a rendered relief map at
       images/route-map.jpg (or .png / .webp) and it takes over as the base:
       the drawn bands, ranges and scenery step aside and everything that
       moves — the three routes, the runner, the cards, the flags and the
       instruments — keeps running on top of it. */
    var TERRAIN = ['images/route-map.jpg', 'images/route-map.png', 'images/route-map.webp'];

    function useTerrain(root) {
        var map = $('.wc-map', root);
        if (!map) return;
        var base = document.querySelector('img[src*="logo-mark"]');
        var prefix = base && /^\.\.\//.test(base.getAttribute('src') || '') ? '../' : '';

        (function tryNext(i) {
            if (i >= TERRAIN.length) return;
            var src = prefix + TERRAIN[i];
            var probe = new Image();
            probe.onload = function () {
                var img = el('img', 'wc-terrain');
                img.src = src;
                img.alt = '';
                img.setAttribute('aria-hidden', 'true');
                map.insertBefore(img, map.firstChild);
                root.classList.add('has-terrain');
            };
            probe.onerror = function () { tryNext(i + 1); };
            probe.src = src;
        })(0);
    }

    /* The map used to lean and parallax towards the pointer. That is gone —
       it now sits completely still under the mouse. */

    function init() {
        try {
            var ctx = build();
            if (ctx) { wire(ctx); useTerrain(ctx.root); }
        } catch (e) { /* the programme section renders exactly as before */ }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
