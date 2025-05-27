document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    const mobileSocialIcons = document.querySelector('.mobile-social-icons');
    const navLinksItems = document.querySelectorAll('.nav-links a');
    
    // Toggle menu function
    function toggleMenu() {
        const isOpen = navLinks.classList.toggle('active');
        mobileNavToggle.classList.toggle('is-active', isOpen);
        mobileNavToggle.setAttribute('aria-expanded', isOpen);
        document.body.classList.toggle('no-scroll', isOpen);
        
        // Toggle active class on social icons
        if (mobileSocialIcons) {
            mobileSocialIcons.classList.toggle('active', isOpen);
            console.log('Social icons active class:', isOpen);
        } else {
            console.warn('Mobile social icons not found in the DOM');
        }
    }
    
    // Close menu function
    function closeMenu() {
        navLinks.classList.remove('active');
        mobileNavToggle.classList.remove('is-active');
        mobileNavToggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('no-scroll');
        
        // Remove active class from social icons
        if (mobileSocialIcons) {
            mobileSocialIcons.classList.remove('active');
        }
    }
    
    // Event listeners
    if (mobileNavToggle) {
        mobileNavToggle.addEventListener('click', toggleMenu);
    }
    
    // Close menu when clicking a nav link
    navLinksItems.forEach(link => {
        link.addEventListener('click', closeMenu);
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        const isInsideMenu = event.target.closest('.nav-links');
        const isMenuToggle = event.target.closest('.mobile-nav-toggle');
        const isMenuOpen = navLinks.classList.contains('active');
        
        if (isMenuOpen && !isInsideMenu && !isMenuToggle) {
            closeMenu();
        }
    });
    
    // Handle resize events (close menu if window resized to desktop)
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && navLinks.classList.contains('active')) {
            closeMenu();
        }
    });
}); 