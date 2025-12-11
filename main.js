/* ========================================
   HOISS WERBETECHNIK - JAVASCRIPT
   ======================================== */

'use strict';

// ========================================
// HEADER & FOOTER LADEN
// ========================================

document.addEventListener('DOMContentLoaded', () => {

    // Header laden
    fetch('header.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Header konnte nicht geladen werden');
            }
            return response.text();
        })
        .then(data => {
            document.getElementById('header-placeholder').innerHTML = data;
            initNavigation();
            highlightActiveNavLink();
        })
        .catch(error => {
            console.error('Fehler beim Laden des Headers:', error);
            document.getElementById('header-placeholder').innerHTML =
                '<header class="site-header"><div class="container"><p style="color: red; padding: 20px;">Header konnte nicht geladen werden.</p></div></header>';
        });

    // Footer laden
    fetch('footer.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Footer konnte nicht geladen werden');
            }
            return response.text();
        })
        .then(data => {
            document.getElementById('footer-placeholder').innerHTML = data;

            // â­ WICHTIG: Cookie-Banner NACH Footer-Laden initialisieren
            setTimeout(() => {
                if (typeof window.initCookieBanner === 'function') {
                    console.log('ðŸª Initialisiere Cookie-Banner...');
                    window.initCookieBanner();
                } else {
                    console.error('âŒ initCookieBanner Funktion nicht gefunden!');
                }
            }, 200);
        })
        .catch(error => {
            console.error('Fehler beim Laden des Footers:', error);
        });

    // Initialisierung
    initMobileNav();
    initDropdowns();
    initSmoothScroll();
    initHeaderScroll();
    initActiveNavLink();

    console.log('âœ… HoiÃŸ Werbetechnik - Website initialisiert');
});

// ========================================
// NAVIGATION FUNKTIONALITÃ„T
// ========================================

function initNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const dropdownToggles = document.querySelectorAll('.nav-dropdown-toggle');

    // Mobile Menu Toggle
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            const isActive = navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
            navToggle.setAttribute('aria-expanded', isActive);
        });

        // MenÃ¼ schlieÃŸen bei Klick auÃŸerhalb
        document.addEventListener('click', (e) => {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Dropdown Toggle (Mobile)
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            if (window.innerWidth <= 992) {
                e.preventDefault();
                const isExpanded = toggle.getAttribute('aria-expanded') === 'true';

                dropdownToggles.forEach(otherToggle => {
                    if (otherToggle !== toggle) {
                        otherToggle.setAttribute('aria-expanded', 'false');
                    }
                });

                toggle.setAttribute('aria-expanded', !isExpanded);
            }
        });
    });

    // Header Scroll-Effekt
    let lastScroll = 0;
    const header = document.querySelector('.site-header');

    if (header) {
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;

            if (currentScroll > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }

            lastScroll = currentScroll;
        });
    }
}

// Mobile Navigation Toggle
const initMobileNav = () => {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (!navToggle || !navMenu) return;

    navToggle.addEventListener('click', () => {
        const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', !isExpanded);
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
};

// Dropdown Toggle fÃ¼r Mobile
const initDropdowns = () => {
    const dropdownToggles = document.querySelectorAll('.nav-dropdown-toggle');

    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            if (window.innerWidth <= 992) {
                e.preventDefault();
                const isExpanded = toggle.getAttribute('aria-expanded') === 'true';

                dropdownToggles.forEach(t => {
                    if (t !== toggle) {
                        t.setAttribute('aria-expanded', 'false');
                    }
                });

                toggle.setAttribute('aria-expanded', !isExpanded);
            }
        });
    });
};

// Smooth Scrolling fÃ¼r Anker-Links
const initSmoothScroll = () => {
    setTimeout(() => {
        const anchorLinks = document.querySelectorAll('a[href^="#"]');

        anchorLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');

                if (href && href !== '#') {
                    const target = document.querySelector(href);

                    if (target) {
                        e.preventDefault();

                        const headerHeight = document.querySelector('.site-header')?.offsetHeight || 100;
                        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });

                        const navMenu = document.querySelector('.nav-menu');
                        const navToggle = document.querySelector('.nav-toggle');
                        if (navMenu && navToggle) {
                            navMenu.classList.remove('active');
                            navToggle.classList.remove('active');
                            navToggle.setAttribute('aria-expanded', 'false');
                        }
                    }
                }
            });
        });
    }, 100);
};

// Header Scroll-Effekt
const initHeaderScroll = () => {
    const header = document.querySelector('.site-header');
    if (!header) return;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
};

// Aktiven Nav-Link beim Scrollen markieren
const initActiveNavLink = () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    if (sections.length === 0 || navLinks.length === 0) return;

    window.addEventListener('scroll', () => {
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;

            if (window.pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('nav-link-active');

            const href = link.getAttribute('href');
            if (href === `#${current}`) {
                link.classList.add('nav-link-active');
            }
        });
    });
};

// Aktive Seite hervorheben
function highlightActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link, .nav-dropdown-link');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');

        if (href === currentPage || href === './' + currentPage) {
            link.classList.add('nav-link-active');

            const parentDropdown = link.closest('.nav-dropdown');
            if (parentDropdown) {
                const parentToggle = parentDropdown.querySelector('.nav-dropdown-toggle');
                if (parentToggle) {
                    parentToggle.classList.add('nav-link-active');
                }
            }
        }
    });
}

// ========================================
// COOKIE-BANNER - DSGVO-KONFORM
// ========================================

(function() {
    'use strict';

    const COOKIE_NAME = 'hoiss_cookie_consent';
    const COOKIE_DURATION = 365;

    // â­ WICHTIG: Diese Funktion wird global verfÃ¼gbar gemacht
    window.initCookieBanner = function() {
        console.log('ðŸª Cookie-Banner Initialisierung gestartet...');

        const consent = getCookieConsent();

        if (!consent) {
            console.log('ðŸ“‹ Kein Cookie gefunden - zeige Banner');
            setTimeout(showBanner, 800);
        } else {
            console.log('âœ… Cookie vorhanden - lade Einstellungen');
            loadCookies(consent);
        }

        // â­ Event Listener HIER registrieren (nachdem Footer geladen ist)
        setupEventListeners();
    };

    function showBanner() {
        const banner = document.getElementById('cookie-banner');
        if (banner) {
            banner.classList.add('active');
            console.log('âœ… Banner angezeigt');
        } else {
            console.error('âŒ Banner Element nicht gefunden!');
        }
    }

    function hideBanner() {
        const banner = document.getElementById('cookie-banner');
        if (banner) {
            banner.classList.remove('active');
            console.log('âœ… Banner ausgeblendet');
        }
    }

    function showModal() {
        console.log('ðŸ” showModal() aufgerufen');
        const modal = document.getElementById('cookie-modal');
        if (modal) {
            modal.classList.add('active');
            console.log('âœ… Modal geÃ¶ffnet');
        } else {
            console.error('âŒ Modal Element nicht gefunden!');
        }
    }

    function hideModal() {
        console.log('ðŸ” hideModal() aufgerufen');
        const modal = document.getElementById('cookie-modal');
        if (modal) {
            modal.classList.remove('active');
            console.log('âœ… Modal geschlossen');
        }
    }

    function setupEventListeners() {
        console.log('ðŸ”— Registriere Event Listener...');

        // Alle akzeptieren
        const acceptBtn = document.getElementById('cookie-accept-all');
        if (acceptBtn) {
            console.log('âœ… Accept-Button gefunden');
            acceptBtn.addEventListener('click', function() {
                console.log('ðŸ‘† Accept-Button geklickt');
                const consent = {
                    necessary: true,
                    analytics: true,
                    marketing: true,
                    timestamp: new Date().toISOString()
                };
                saveConsent(consent);
                loadCookies(consent);
                hideBanner();
            });
        } else {
            console.error('âŒ Accept-Button NICHT gefunden');
        }

        // Nur notwendige
        const declineBtn = document.getElementById('cookie-decline-all');
        if (declineBtn) {
            console.log('âœ… Decline-Button gefunden');
            declineBtn.addEventListener('click', function() {
                console.log('ðŸ‘† Decline-Button geklickt');
                const consent = {
                    necessary: true,
                    analytics: false,
                    marketing: false,
                    timestamp: new Date().toISOString()
                };
                saveConsent(consent);
                loadCookies(consent);
                hideBanner();
            });
        } else {
            console.error('âŒ Decline-Button NICHT gefunden');
        }

        // Einstellungen Ã¶ffnen
        const settingsBtn = document.getElementById('cookie-settings-open');
        if (settingsBtn) {
            console.log('âœ… Settings-Button gefunden');
            settingsBtn.addEventListener('click', function(e) {
                console.log('ðŸ‘† Settings-Button geklickt!');
                e.preventDefault();
                showModal();
            });
        } else {
            console.error('âŒ Settings-Button NICHT gefunden');
        }

        // Modal schlieÃŸen
        const closeBtn = document.getElementById('cookie-modal-close');
        if (closeBtn) {
            console.log('âœ… Close-Button gefunden');
            closeBtn.addEventListener('click', function() {
                console.log('ðŸ‘† Close-Button geklickt');
                hideModal();
            });
        } else {
            console.error('âŒ Close-Button NICHT gefunden');
        }

        // Einstellungen speichern
        const saveBtn = document.getElementById('cookie-save-settings');
        if (saveBtn) {
            console.log('âœ… Save-Button gefunden');
            saveBtn.addEventListener('click', function() {
                console.log('ðŸ‘† Save-Button geklickt');
                const analyticsCheckbox = document.getElementById('cookie-toggle-analytics');
                const marketingCheckbox = document.getElementById('cookie-toggle-marketing');

                const consent = {
                    necessary: true,
                    analytics: analyticsCheckbox ? analyticsCheckbox.checked : false,
                    marketing: marketingCheckbox ? marketingCheckbox.checked : false,
                    timestamp: new Date().toISOString()
                };

                saveConsent(consent);
                loadCookies(consent);
                hideModal();
                hideBanner();
            });
        } else {
            console.error('âŒ Save-Button NICHT gefunden');
        }

        console.log('âœ… Event Listener Registrierung abgeschlossen');
    }

    function saveConsent(consent) {
        const consentString = JSON.stringify(consent);
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + COOKIE_DURATION);

        document.cookie = COOKIE_NAME + '=' + encodeURIComponent(consentString) + 
                         '; expires=' + expiryDate.toUTCString() + 
                         '; path=/; SameSite=Lax';

        console.log('âœ… Cookie-Einwilligung gespeichert:', consent);
    }

    function getCookieConsent() {
        const cookies = document.cookie.split(';');

        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();

            if (cookie.startsWith(COOKIE_NAME + '=')) {
                try {
                    const value = cookie.substring(COOKIE_NAME.length + 1);
                    return JSON.parse(decodeURIComponent(value));
                } catch (e) {
                    console.error('Fehler beim Parsen der Cookie-Einwilligung:', e);
                    return null;
                }
            }
        }

        return null;
    }

    function loadCookies(consent) {
        console.log('ðŸ“Š Lade Cookies basierend auf Einwilligung:', consent);

        loadNecessaryCookies();

        if (consent.analytics) {
            loadAnalyticsCookies();
        }

        if (consent.marketing) {
            loadMarketingCookies();
        }
    }

    function loadNecessaryCookies() {
        console.log('âœ“ Notwendige Cookies geladen');
    }

    function loadAnalyticsCookies() {
        console.log('âœ“ Analytics-Cookies geladen');
        // Hier Google Analytics Code einfÃ¼gen
    }

    function loadMarketingCookies() {
        console.log('âœ“ Marketing-Cookies geladen');
        // Hier Marketing-Cookies Code einfÃ¼gen
    }

    window.revokeCookieConsent = function() {
        document.cookie = COOKIE_NAME + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        location.reload();
    };

})();

// ========== SCHEMA MARKUP ==========

document.addEventListener('DOMContentLoaded', function() {

  // Organization Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Hoiß Werbetechnik",
    "alternateName": "Hoiß Beklebe & Werbetechnik",
    "url": "https://www.werbetechnik-hoiss.de/",
    "logo": "https://www.werbetechnik-hoiss.de/wp-content/uploads/2024/07/Hoiss_Werbetechnik_Gebaede-1.webp",
    "description": "Professionelle Werbetechnik in Rosenheim - Fahrzeugbeschriftungen, Schilder, Glasbeschriftungen und Digitaldruck",
    "sameAs": [
      "https://www.facebook.com/hoiss.werbetechnik",
      "https://www.instagram.com/hoiss.werbetechnik"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "telephone": "+49-8031-9003379",
      "email": "info@werbetechnik-hoiss.de"
    }
  };

  // LocalBusiness Schema
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Hoiß Werbetechnik",
    "image": "https://www.werbetechnik-hoiss.de/wp-content/uploads/2024/07/Hoiss_Werbetechnik_Gebaede-1.webp",
    "description": "Fahrzeugbeschriftungen, Schilder, Glasbeschriftungen und professionelle Werbetechnik in Rosenheim und Umgebung",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Lochberg 12",
      "addressLocality": "Schechen",
      "postalCode": "83135",
      "addressCountry": "DE"
    },
    "telephone": "+49-8031-9003379",
    "email": "info@werbetechnik-hoiss.de",
    "url": "https://www.werbetechnik-hoiss.de/",
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "08:00",
        "closes": "17:00"
      }
    ],
    "priceRange": "€€€",
    "areaServed": {
      "@type": "State",
      "name": "Bayern"
    },
    "sameAs": [
      "https://www.facebook.com/hoiss.werbetechnik",
      "https://www.instagram.com/hoiss.werbetechnik"
    ]
  };

  // Service Schema
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Hoiß Werbetechnik",
    "hasOfferingDescription": [
      {
        "@type": "Service",
        "name": "Fahrzeugbeschriftung",
        "description": "Professionelle Fahrzeugbeklebungen für Autos, LKW und Anhänger. Hochwertige Fahrzeugfolien als mobile Werbefläche – individuell gestaltet.",
        "provider": {
          "@type": "LocalBusiness",
          "name": "Hoiß Werbetechnik"
        },
        "areaServed": "DE"
      },
      {
        "@type": "Service",
        "name": "Glasbeschriftung",
        "description": "Schaufensterbeschriftungen mit Glasdekorfolien für Sichtschutz und Design. Selbstklebende Folien in vielen Farben.",
        "provider": {
          "@type": "LocalBusiness",
          "name": "Hoiß Werbetechnik"
        },
        "areaServed": "DE"
      },
      {
        "@type": "Service",
        "name": "Schilder",
        "description": "Hochwertige Schilder und Beschilderungssysteme für Fassaden. Individuelle Designs in robusten Materialien.",
        "provider": {
          "@type": "LocalBusiness",
          "name": "Hoiß Werbetechnik"
        },
        "areaServed": "DE"
      }
    ]
  };

  // Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Startseite",
        "item": "https://www.werbetechnik-hoiss.de/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Fahrzeugbeschriftung",
        "item": "https://www.werbetechnik-hoiss.de/fahrzeugbeschriftung.html"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Glasbeschriftung",
        "item": "https://www.werbetechnik-hoiss.de/glasdekor-sichtschutz.html"
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": "Schilder",
        "item": "https://www.werbetechnik-hoiss.de/schilder-leitsysteme.html"
      }
    ]
  };

  // Function to add schema to page
  function addSchema(schemaData) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schemaData);
    document.head.appendChild(script);
  }

  // Add all schemas
  addSchema(organizationSchema);
  addSchema(localBusinessSchema);
  addSchema(serviceSchema);
  addSchema(breadcrumbSchema);
});

// ========== END SCHEMA MARKUP ==========