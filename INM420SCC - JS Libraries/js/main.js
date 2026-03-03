/* ============================================
   HORIZONS TRAVEL — Main JavaScript
   Libraries: Glide.js, AOS, Leaflet, Chart.js,
              Lightbox2, fullPage.js
   ============================================ */

'use strict';

document.addEventListener('DOMContentLoaded', function () {

    /* --------------------------------------------------
       1. NAVBAR — scroll effect + mobile hamburger
       -------------------------------------------------- */
    (function initNav() {
        var navbar = document.getElementById('navbar');
        var hamburger = document.getElementById('hamburger');
        var mobileMenu = document.getElementById('mobile-menu');
        var mobileLinks = mobileMenu.querySelectorAll('a');

        // Scrolling style is instead managed via fullPage.js onLeave callback
        // to ensure it works correctly with section-snapping.


        hamburger.addEventListener('click', function () {
            var isOpen = mobileMenu.classList.toggle('open');
            hamburger.classList.toggle('active', isOpen);
            hamburger.setAttribute('aria-expanded', String(isOpen));
        });

        mobileLinks.forEach(function (link) {
            link.addEventListener('click', function () {
                mobileMenu.classList.remove('open');
                hamburger.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            });
        });
    }());


    /* --------------------------------------------------
       2. GLIDE.JS — Hero Carousel  (Library 1)
       -------------------------------------------------- */
    (function initGlide() {
        if (typeof Glide === 'undefined') { console.warn('Glide.js not loaded'); return; }

        new Glide('#hero-glide', {
            type: 'carousel',
            autoplay: 5000,
            hoverpause: true,
            animationDuration: 800,
            animationTimingFunc: 'ease-in-out',
            perView: 1,
        }).mount();
    }());


    /* --------------------------------------------------
       3. AOS — Animate On Scroll  (Library 2)
       AOS is reinitialised inside fullPage.js afterLoad
       callbacks so elements animate when sections scroll
       into view.
       -------------------------------------------------- */
    (function initAOS() {
        if (typeof AOS === 'undefined') { console.warn('AOS not loaded'); return; }

        AOS.init({
            duration: 700,
            easing: 'ease-out-cubic',
            once: true,
            offset: 40,
            disable: false,
        });
    }());


    /* --------------------------------------------------
       4. LEAFLET — Interactive Destination Map  (Library 3)
       -------------------------------------------------- */
    (function initLeaflet() {
        if (typeof L === 'undefined') { console.warn('Leaflet not loaded'); return; }

        var destinations = [
            {
                name: 'Santorini, Greece', coords: [36.3932, 25.4615], price: '$2,499',
                img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=280&auto=format',
                desc: 'Iconic white-washed cliffs, volcanic beaches & world-class sunsets.'
            },
            {
                name: 'Kyoto, Japan', coords: [35.0116, 135.7681], price: '$3,199',
                img: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=280&auto=format',
                desc: 'Ancient temples, bamboo groves & cherry blossom season.'
            },
            {
                name: 'Amalfi Coast, Italy', coords: [40.6333, 14.6029], price: '$2,799',
                img: 'https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?w=280&auto=format',
                desc: 'Dramatic sea cliffs, pastel villages & fresh limoncello by the shore.'
            },
            {
                name: 'Bali, Indonesia', coords: [-8.3405, 115.0920], price: '$1,899',
                img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=280&auto=format',
                desc: 'Lush rice terraces, sacred temples & legendary surf breaks.'
            },
            {
                name: 'Machu Picchu, Peru', coords: [-13.1631, -72.5450], price: '$2,999',
                img: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=280&auto=format',
                desc: 'The legendary Inca citadel perched high in the Andes.'
            },
            {
                name: 'Maldives', coords: [3.2028, 73.2207], price: '$4,499',
                img: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=280&auto=format',
                desc: 'Overwater bungalows, crystal-clear lagoons & vibrant coral reefs.'
            },
        ];

        function makeIcon() {
            return L.divIcon({
                className: '',
                html: '<div style="width:32px;height:32px;background:#c8973a;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 3px 10px rgba(0,0,0,0.3);"></div>',
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -36],
            });
        }

        var map = L.map('travel-map', {
            center: [20, 15],
            zoom: 2,
            scrollWheelZoom: false,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>',
            maxZoom: 18,
        }).addTo(map);

        destinations.forEach(function (dest) {
            L.marker(dest.coords, { icon: makeIcon() })
                .addTo(map)
                .bindPopup(
                    '<div style="width:280px;font-family:Inter,sans-serif;padding:0;overflow:hidden;border-radius:4px;">' +
                    '<img src="' + dest.img + '" alt="' + dest.name + '" ' +
                    'style="width:100%;height:160px;object-fit:cover;display:block;">' +
                    '<div style="padding:16px;">' +
                    '<strong style="font-size:1.05rem;color:#0d3b5e;display:block;margin-bottom:4px;">' + dest.name + '</strong>' +
                    '<span style="font-size:0.85rem;color:#6b7c93;display:block;margin-bottom:8px;line-height:1.4;">' + dest.desc + '</span>' +
                    '<span style="font-weight:700;color:#c8973a;font-size:0.95rem;">From ' + dest.price + '</span>' +
                    '</div></div>',
                    {
                        maxWidth: 320,
                        className: 'custom-popup'
                    }
                );
        });

        window._travelMap = map;
    }());


    /* --------------------------------------------------
       5. CHART.JS — Travel Stats Charts  (Library 4)
       -------------------------------------------------- */
    (function initCharts() {
        if (typeof Chart === 'undefined') { console.warn('Chart.js not loaded'); return; }

        Chart.defaults.font.family = "'Inter', sans-serif";
        Chart.defaults.color = 'rgba(255,255,255,0.65)';

        var barEl = document.getElementById('chart-months');
        if (barEl) {
            new Chart(barEl, {
                type: 'bar',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    datasets: [{
                        label: 'Travellers (thousands)',
                        data: [42, 38, 55, 68, 74, 95, 112, 108, 82, 70, 52, 60],
                        backgroundColor: [
                            '#c8973a', '#c8973a', '#c8973a', '#3a7bbf', '#3a7bbf',
                            '#e8c46a', '#e8c46a', '#e8c46a', '#3a7bbf', '#3a7bbf',
                            '#c8973a', '#c8973a',
                        ],
                        borderRadius: 6,
                        borderSkipped: false,
                    }],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: { label: function (ctx) { return ' ' + ctx.parsed.y + 'k travellers'; } },
                        },
                    },
                    scales: {
                        x: { grid: { color: 'rgba(255,255,255,0.08)' }, ticks: { color: 'rgba(255,255,255,0.6)' } },
                        y: { grid: { color: 'rgba(255,255,255,0.08)' }, ticks: { color: 'rgba(255,255,255,0.6)' }, beginAtZero: true },
                    },
                    animation: { duration: 1400, easing: 'easeOutQuart' },
                },
            });
        }

        var doughnutEl = document.getElementById('chart-types');
        if (doughnutEl) {
            new Chart(doughnutEl, {
                type: 'doughnut',
                data: {
                    labels: ['Couples', 'Families', 'Solo', 'Groups', 'Luxury'],
                    datasets: [{
                        data: [32, 24, 18, 14, 12],
                        backgroundColor: ['#c8973a', '#0d3b5e', '#e8c46a', '#3a7bbf', '#9b59b6'],
                        borderColor: 'rgba(17,24,32,0.6)',
                        borderWidth: 3,
                        hoverOffset: 10,
                    }],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    cutout: '65%',
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { color: 'rgba(255,255,255,0.7)', padding: 16, usePointStyle: true, pointStyleWidth: 10 },
                        },
                        tooltip: {
                            callbacks: { label: function (ctx) { return ' ' + ctx.label + ': ' + ctx.parsed + '%'; } },
                        },
                    },
                    animation: { animateRotate: true, duration: 1400 },
                },
            });
        }
    }());


    /* --------------------------------------------------
       6. LIGHTBOX2 config  (Library 5)
       -------------------------------------------------- */
    (function initLightbox() {
        if (typeof lightbox === 'undefined') { return; }
        lightbox.option({
            resizeDuration: 200,
            wrapAround: true,
            albumLabel: 'Photo %1 of %2',
            disableScrolling: true,
            fadeDuration: 300,
        });
    }());


    /* --------------------------------------------------
       7. FULLPAGE.JS — Full-viewport scroll  (Library 6)
       -------------------------------------------------- */
    (function initFullpage() {
        if (typeof fullpage === 'undefined') { console.warn('fullPage.js not loaded'); return; }

        new fullpage('#fullpage', {
            // Section anchors — match data-anchor attributes in HTML
            anchors: ['hero', 'destinations', 'gallery', 'map', 'stats', 'booking'],
            sectionSelector: '.section',

            // Scroll behaviour
            autoScrolling: true,
            scrollBar: true,
            scrollingSpeed: 750,
            easing: 'easeInOutCubic',
            easingcss3: 'ease',

            // Visual navigation dots on the right edge
            navigation: true,
            navigationPosition: 'right',
            navigationTooltips: ['Home', 'Destinations', 'Gallery', 'Map', 'Stats', 'Book Now'],
            showActiveTooltip: true,

            // Keyboard & touch
            keyboardScrolling: true,
            touchSensitivity: 15,

            // Looping
            loopBottom: false,
            loopTop: false,

            // Disable vertical centering so CSS Grid controls layout
            verticalCentered: false,

            // Allow internal scrolling on these CSS Grid containers
            normalScrollElements: '.destinations__grid, .gallery__grid, .stats__grid, .booking__card, .map-wrapper',

            // ── Callbacks ──────────────────────────────────

            // After each section loads, refresh AOS so
            // scroll-triggered animations fire correctly.
            afterLoad: function (origin, destination /*, direction */) {
                var anchor = destination.anchor;

                // Re-trigger AOS for newly visible elements
                if (typeof AOS !== 'undefined') { AOS.refresh(); }

                // Invalidate Leaflet map size whenever the map section becomes active,
                // so the tile layer fills the container correctly.
                if (anchor === 'map' && window._travelMap) {
                    setTimeout(function () { window._travelMap.invalidateSize(); }, 50);
                }
            },

            // Prevent fullPage from swallowing the Lightbox2 click events
            // inside the gallery section.
            onLeave: function (origin, destination, direction) {
                // Instantly update navbar scrolled state as soon as scrolling starts
                var navbar = document.getElementById('navbar');
                if (navbar) {
                    if (window.innerWidth < 1024 || destination.anchor !== 'hero') {
                        navbar.classList.add('scrolled');
                    } else {
                        navbar.classList.remove('scrolled');
                    }
                }

                // Close any open lightbox when navigating away from gallery
                if (origin.anchor === 'gallery') {
                    var lb = document.getElementById('lightbox');
                    if (lb && lb.style.display !== 'none') {
                        lightbox.end();
                    }
                }
            },
            afterRender: function () {
                var navbar = document.getElementById('navbar');
                var currentSection = window.location.hash.replace('#', '') || 'hero';
                if (navbar) {
                    if (window.innerWidth < 1024 || currentSection !== 'hero') {
                        navbar.classList.add('scrolled');
                    } else {
                        navbar.classList.remove('scrolled');
                    }
                }

                // Make sure it updates on window resize (debounced for performance)
                var resizeTimer;
                window.addEventListener('resize', function () {
                    clearTimeout(resizeTimer);
                    resizeTimer = setTimeout(function () {
                        var currentHash = window.location.hash.replace('#', '') || 'hero';
                        if (navbar) {
                            if (window.innerWidth < 1024 || currentHash !== 'hero') {
                                navbar.classList.add('scrolled');
                            } else {
                                navbar.classList.remove('scrolled');
                            }
                        }
                    }, 150);
                });
            }
        });

    }());


    /* --------------------------------------------------
       8. BOOKING FORM — validation + UX
       -------------------------------------------------- */
    (function initBookingForm() {
        var form = document.getElementById('booking-form');
        if (!form) { return; }

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var valid = true;

            form.querySelectorAll('[required]').forEach(function (field) {
                if (!field.value.trim()) {
                    field.style.borderColor = '#e74c3c';
                    field.style.boxShadow = '0 0 0 3px rgba(231,76,60,0.15)';
                    valid = false;
                } else {
                    field.style.borderColor = '';
                    field.style.boxShadow = '';
                }
            });

            if (valid) {
                var btn = form.querySelector('.form-submit');
                btn.textContent = '✓ Request Sent! We\'ll be in touch soon.';
                btn.style.background = 'linear-gradient(90deg,#27ae60,#2ecc71)';
                btn.style.color = '#fff';
                btn.disabled = true;
            }
        });

        form.querySelectorAll('input, select, textarea').forEach(function (field) {
            field.addEventListener('input', function () {
                field.style.borderColor = '';
                field.style.boxShadow = '';
            });
        });
    }());


    /* --------------------------------------------------
       9. Animated stat counters (Intersection Observer)
       -------------------------------------------------- */
    (function animateCounters() {
        var counters = document.querySelectorAll('[data-count]');
        if (!counters.length) { return; }

        function ease(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) { return; }
                observer.unobserve(entry.target);

                var el = entry.target;
                var target = parseFloat(el.dataset.count);
                var suffix = el.dataset.suffix || '';
                var duration = 1800;
                var startTime = null;

                function tick(ts) {
                    if (!startTime) { startTime = ts; }
                    var progress = Math.min((ts - startTime) / duration, 1);
                    el.textContent = Math.round(ease(progress) * target) + suffix;
                    if (progress < 1) { requestAnimationFrame(tick); }
                }
                requestAnimationFrame(tick);
            });
        }, { threshold: 0.4 });

        counters.forEach(function (c) { observer.observe(c); });
    }());

}); // end DOMContentLoaded
