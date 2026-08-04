/* ==========================================================================
   Wildcore Retreats — Footsteps between the feature blocks
   Each gap between two feature rows gets a short curved walk. The prints are
   laid along that curve, tilted to follow it, left and right alternating,
   and they land one by one as the gap scrolls into view.
   ========================================================================== */
(function () {
    'use strict';

    var NS = 'http://www.w3.org/2000/svg';
    var REDUCED = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var SPACING = 27;   /* px along the curve between prints */
    var STRIDE = 7.5;   /* how far left/right of the line each foot lands */
    var MIN_GAP = 70;   /* below this a gap is too tight to be worth walking */

    function ready(fn) {
        if (document.readyState !== 'loading') fn();
        else document.addEventListener('DOMContentLoaded', fn);
    }

    ready(function () {
        var wrap = document.querySelector('.features .container');
        if (!wrap) return;

        var rows = [].slice.call(wrap.querySelectorAll('.feature-row'));
        if (rows.length < 2) return;

        var svg = document.createElementNS(NS, 'svg');
        svg.setAttribute('class', 'wc-steps');
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('fill', 'none');
        wrap.insertBefore(svg, wrap.firstChild);

        var prints = [];   /* {node, y} — y is the document offset, cached */

        /* one footprint, tilted along the walking direction */
        function print(x, y, angle) {
            var outer = document.createElementNS(NS, 'g');
            outer.setAttribute('transform',
                'translate(' + x.toFixed(1) + ',' + y.toFixed(1) + ') ' +
                'rotate(' + angle.toFixed(1) + ')');

            var inner = document.createElementNS(NS, 'g');
            inner.setAttribute('class', 'wc-step');

            var sole = document.createElementNS(NS, 'path');
            sole.setAttribute('class', 'sole');
            sole.setAttribute('d',
                'M0 -8.4c2.6 0 4.1 2.2 4.1 5 0 2.3-1 3.8-2.3 4.7-1.1.7-1.8.6-1.8.6' +
                's-.7.1-1.8-.6C-3.1-.6-4.1-2.1-4.1-4.4-4.1-7.2-2.6-8.4 0-8.4Z');
            var heel = document.createElementNS(NS, 'ellipse');
            heel.setAttribute('class', 'heel');
            heel.setAttribute('cx', '0');
            heel.setAttribute('cy', '5.6');
            heel.setAttribute('rx', '2.4');
            heel.setAttribute('ry', '2.7');

            inner.appendChild(sole);
            inner.appendChild(heel);
            outer.appendChild(inner);
            return { outer: outer, inner: inner };
        }

        function build() {
            /* start clean — a resize re-walks every gap */
            while (svg.firstChild) svg.removeChild(svg.firstChild);
            prints = [];

            var W = wrap.clientWidth;
            var H = wrap.scrollHeight;
            if (!W || !H) return;
            svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
            svg.setAttribute('width', W);
            svg.setAttribute('height', H);

            var wrapTop = wrap.getBoundingClientRect().top + window.pageYOffset;
            var foot = 0;   /* keeps left/right alternating across the whole page */

            for (var i = 0; i < rows.length - 1; i++) {
                var a = rows[i], b = rows[i + 1];
                var gapTop = a.offsetTop + a.offsetHeight;
                var gapBottom = b.offsetTop;
                var gapH = gapBottom - gapTop;
                if (gapH < MIN_GAP) continue;

                /* leave from the side the picture was on, arrive at the next one */
                var fromRight = !a.classList.contains('reverse');
                var toRight = !b.classList.contains('reverse');
                var sx = fromRight ? W * 0.74 : W * 0.26;
                var ex = toRight ? W * 0.74 : W * 0.26;
                var sy = gapTop + 10;
                var ey = gapBottom - 10;
                var pull = (ey - sy) * 0.55;

                var guide = document.createElementNS(NS, 'path');
                guide.setAttribute('d',
                    'M' + sx + ' ' + sy +
                    ' C' + sx + ' ' + (sy + pull) +
                    ' ' + ex + ' ' + (ey - pull) +
                    ' ' + ex + ' ' + ey);
                guide.setAttribute('stroke', 'none');
                guide.setAttribute('fill', 'none');
                /* it has to be in the document before it can be measured */
                svg.appendChild(guide);

                var len = guide.getTotalLength();
                var count = Math.max(3, Math.round(len / SPACING));

                for (var s = 0; s <= count; s++) {
                    var t = s / count;
                    var at = len * t;
                    var p = guide.getPointAtLength(at);
                    var q = guide.getPointAtLength(Math.min(len, at + 1));
                    var ang = Math.atan2(q.y - p.y, q.x - p.x);

                    /* step to the side of the line, perpendicular to the walk */
                    var side = (foot % 2 === 0) ? 1 : -1;
                    var ox = Math.cos(ang + Math.PI / 2) * STRIDE * side;
                    var oy = Math.sin(ang + Math.PI / 2) * STRIDE * side;

                    /* the print points the way it is heading */
                    var deg = ang * 180 / Math.PI - 90;
                    var pr = print(p.x + ox, p.y + oy, deg);
                    if (foot % 6 === 2) pr.inner.classList.add('accent');

                    svg.appendChild(pr.outer);
                    prints.push({ node: pr.inner, y: wrapTop + p.y });
                    foot++;
                }
            }

            if (REDUCED) {
                prints.forEach(function (pr) { pr.node.classList.add('is-on'); });
            }
        }

        /* ------------------------------------------------------- the reveal -- */
        var ticking = false;
        function paint() {
            ticking = false;
            /* prints land a little above the fold, so the trail is always
               a step ahead of where you are reading */
            var line = window.pageYOffset + window.innerHeight * 0.88;
            for (var i = 0; i < prints.length; i++) {
                var on = prints[i].y <= line;
                if (on !== prints[i].on) {
                    prints[i].on = on;
                    prints[i].node.classList.toggle('is-on', on);
                }
            }
        }
        function onScroll() {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(paint);
        }

        var resizeTimer = null;
        function onResize() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () { build(); paint(); }, 160);
        }

        build();
        paint();

        if (!REDUCED) {
            window.addEventListener('scroll', onScroll, { passive: true });
        }
        window.addEventListener('resize', onResize, { passive: true });
        /* images finishing late change the row heights */
        window.addEventListener('load', function () { build(); paint(); });
    });
})();
