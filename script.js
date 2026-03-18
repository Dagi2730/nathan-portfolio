// Initialize AOS
AOS.init({ 
    duration: 800, 
    once: false, 
    mirror: true,
    offset: 50,
    easing: 'ease-out'
});

// Get DOM elements
const container = document.getElementById('scroll-container');
const bar = document.getElementById('prog-bar');
const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.getElementById('nav-links');
const navItems = document.querySelectorAll('.nav-links a');

// Mobile Menu Toggle
if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });
}

// Close mobile menu when clicking a link
navItems.forEach(link => {
    link.addEventListener('click', () => {
        if (window.innerWidth <= 599) {
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 599) {
        if (!navLinks.contains(e.target) && !menuToggle.contains(e.target) && navLinks.classList.contains('active')) {
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
});

// Update progress bar on scroll
container.addEventListener('scroll', () => {
    const totalHeight = container.scrollHeight - container.clientHeight;
    const progress = (container.scrollTop / totalHeight) * 100;
    bar.style.width = progress + "%";
    
    if (window.requestAnimationFrame) {
        window.requestAnimationFrame(updateActiveNavLink);
    } else {
        updateActiveNavLink();
    }
}, { passive: true });

// Smooth navigation for anchor links
navItems.forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const target = document.querySelector(targetId);
        
        if (target) {
            target.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
            history.pushState(null, null, targetId);
        }
    });
});

// Update active nav link
function updateActiveNavLink() {
    const sections = document.querySelectorAll('.page-section');
    let currentSection = '';
    
    sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;
        const scrollPosition = container.scrollTop + 150;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navItems.forEach(link => {
        link.style.opacity = '0.6';
        link.style.fontWeight = '400';
        
        const linkHash = link.getAttribute('href').substring(1);
        
        if (linkHash === currentSection) {
            link.style.opacity = '1';
            link.style.fontWeight = '700';
        } else if ((currentSection === 'exp-1' || currentSection === 'exp-2') && linkHash === 'exp-1') {
            link.style.opacity = '1';
            link.style.fontWeight = '700';
        }
    });
}

// Debounced resize handler
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        AOS.refresh();
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        
        if (window.innerWidth > 599) {
            if (navLinks.classList.contains('active')) {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    }, 250);
});

// Initialize on load
window.addEventListener('load', () => {
    AOS.refresh();
    
    setTimeout(() => {
        const totalHeight = container.scrollHeight - container.clientHeight;
        const progress = (container.scrollTop / totalHeight) * 100;
        bar.style.width = progress + "%";
        updateActiveNavLink();
    }, 300);
});

// Fix for Safari vh issue
const setVh = () => {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
};

window.addEventListener('resize', setVh);
setVh();