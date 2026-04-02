const NAV_INJECT_CONTAINER_ID = 'navbar-container';
const FOOTER_INJECT_CONTAINER_ID = 'footer-container';
const NAV_BREAKPOINT_PX = 768;

function getCurrentPageId() {
    const body = document.body;
    const fromData = body?.dataset?.page;
    if (fromData) return fromData;

    const filename = (window.location.pathname.split('/').pop() || '').toLowerCase();
    const withoutExt = filename.replace(/\.html$/i, '');
    return withoutExt || 'index';
}

async function injectNavbar() {
    const container = document.getElementById(NAV_INJECT_CONTAINER_ID);
    if (!container) return;

    const pageId = getCurrentPageId();

    // Prefer loading from navbar.html so we have one source of truth.
    // If `fetch` is blocked (e.g., file://), fall back to embedded markup.
    let navbarHtml = null;
    try {
        const res = await fetch('navbar.html', { cache: 'no-store' });
        if (res.ok) navbarHtml = await res.text();
    } catch {
        navbarHtml = null;
    }

    const fallback = `
        <nav class="mirror-nav" aria-label="Primary navigation">
            <div class="logo" aria-label="Nathan Tadesse">NATHAN TADESSE</div>

            <button
                class="menu-toggle"
                id="menu-toggle"
                type="button"
                aria-label="Open navigation menu"
                aria-expanded="false"
                aria-controls="navLinks"
            >
                <span></span>
                <span></span>
                <span></span>
            </button>

            <div class="nav-links" id="navLinks">
                <a href="index.html" data-page="index">HOME</a>
                <a href="summary.html" data-page="summary">SUMMARY</a>
                <a href="experience.html" data-page="experience">EXPERIENCE</a>

                <div class="nav-dropdown" data-dropdown="niches">
                    <button
                        class="dropdown-toggle"
                        type="button"
                        aria-haspopup="true"
                        aria-expanded="false"
                        aria-controls="niches-menu"
                    >
                        Niches <span class="dropdown-caret" aria-hidden="true"></span>
                    </button>

                    <div class="dropdown-menu" id="niches-menu" role="menu" aria-label="Niches submenu">
                        <a href="it-pm.html" data-page="it-pm" role="menuitem">IT Project Management</a>
                        <a href="non-profit-pm.html" data-page="non-profit-pm" role="menuitem">Non-Profit / Impact PM</a>
                        <a href="construction-pm.html" data-page="construction-pm" role="menuitem">Construction PM</a>
                    </div>
                </div>

                <a href="skills.html" data-page="skills">SKILLS</a>
                <a href="education.html" data-page="education">EDUCATION</a>
                <a href="acknowledgments.html" data-page="acknowledgments">ACKNOWLEDGMENTS</a>
                <a href="contact.html" data-page="contact">CONTACT</a>
            </div>
        </nav>
    `;

    container.innerHTML = navbarHtml || fallback;

    const links = Array.from(container.querySelectorAll('a[data-page]'));
    links.forEach((a) => {
        if ((a.dataset.page || '') === pageId) a.classList.add('active');
    });

    // Niches dropdown (desktop hover + click, mobile vertical inside hamburger menu)
    const dropdown = container.querySelector('.nav-dropdown[data-dropdown="niches"]') || container.querySelector('.nav-dropdown');
    const dropdownToggle = dropdown?.querySelector('.dropdown-toggle');
    const closeDropdown = () => {
        if (!dropdown) return;
        dropdown.classList.remove('open');
        if (dropdownToggle) dropdownToggle.setAttribute('aria-expanded', 'false');
    };
    const openDropdown = () => {
        if (!dropdown) return;
        dropdown.classList.add('open');
        if (dropdownToggle) dropdownToggle.setAttribute('aria-expanded', 'true');
    };
    if (dropdownToggle) {
        dropdownToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = dropdown.classList.contains('open');
            if (isOpen) closeDropdown();
            else openDropdown();
        });
    }

    // Mobile hamburger menu behavior.
    const menuToggle = container.querySelector('#menu-toggle');
    const navLinks = container.querySelector('#navLinks');
    if (!menuToggle || !navLinks) return;

    const closeMenu = () => {
        menuToggle.classList.remove('active');
        navLinks.classList.remove('active');
        closeDropdown();
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    };

    const openMenu = () => {
        menuToggle.classList.add('active');
        navLinks.classList.add('active');
        menuToggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    };

    menuToggle.addEventListener('click', () => {
        const isOpen = navLinks.classList.contains('active');
        if (isOpen) closeMenu();
        else openMenu();
    });

    // Close menu when navigating.
    links.forEach((link) => {
        link.addEventListener('click', () => closeMenu());
    });

    // Close menu when clicking outside.
    document.addEventListener('click', (e) => {
        const isMenuOpen = navLinks.classList.contains('active');
        if (isMenuOpen && !navLinks.contains(e.target) && !menuToggle.contains(e.target)) closeMenu();

        // Close dropdown when clicking outside dropdown.
        if (dropdown && dropdown.classList.contains('open') && !dropdown.contains(e.target)) closeDropdown();
    });

    // If we resize to desktop, ensure menu is closed.
    window.addEventListener('resize', () => {
        if (window.innerWidth >= NAV_BREAKPOINT_PX && navLinks.classList.contains('active')) {
            closeMenu();
        }
        if (window.innerWidth >= NAV_BREAKPOINT_PX) closeDropdown();
    });
}

async function injectFooter() {
    const container = document.getElementById(FOOTER_INJECT_CONTAINER_ID);
    if (!container) return;

    let footerHtml = null;
    try {
        const res = await fetch('footer.html', { cache: 'no-store' });
        if (res.ok) footerHtml = await res.text();
    } catch {
        footerHtml = null;
    }

    const fallback = `
        <footer class="site-footer" aria-label="Site footer">
            <div class="footer-credit">
                Prepared by
                <a href="http://www.linkedin.com/in/dagmawit-andargachew-b05140239" target="_blank" rel="noopener noreferrer">Dagmawit Andargachew</a>
                &amp;
                <a href="http://LinkedIn.com/in/meklit-mengestu-tech" target="_blank" rel="noopener noreferrer">Meklit Mengistu</a>
            </div>
        </footer>
    `;

    container.innerHTML = footerHtml || fallback;
}

async function loadPageContent() {
    const contentSrc = document.body?.dataset?.contentSrc;
    if (!contentSrc) return;

    const targetId = document.body?.dataset?.contentTargetId || 'page-content';
    const target = document.getElementById(targetId);
    if (!target) return;

    try {
        const res = await fetch(contentSrc, { cache: 'no-store' });
        if (res.ok) {
            const html = await res.text();
            target.innerHTML = html;
        }
    } catch {
        // If content can't be fetched (e.g., file:// restrictions), keep existing markup.
    }
}

// Safari vh fix (keeps iOS address bar from breaking some layouts)
function setVh() {
    document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
}
window.addEventListener('resize', setVh);
setVh();

window.addEventListener('DOMContentLoaded', async () => {
    if (window.AOS) {
        AOS.init({
            duration: 800,
            once: false,
            mirror: true,
            offset: 50,
            easing: 'ease-out',
        });
    }

    await injectNavbar();
    await loadPageContent();
    await injectFooter();

    if (window.AOS) AOS.refresh();
});