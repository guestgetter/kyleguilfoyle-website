// Google Analytics (GA4) Configuration with your specific Measurement ID
function initGoogleAnalytics() {
    // Google tag (gtag.js)
    const gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = "https://www.googletagmanager.com/gtag/js?id=G-X6L1RHLPJJ";
    document.head.appendChild(gaScript);

    // Initialize the dataLayer
    window.dataLayer = window.dataLayer || [];
    function gtag() {
        dataLayer.push(arguments);
    }
    gtag('js', new Date());
    gtag('config', 'G-X6L1RHLPJJ');

    // Add custom event tracking
    setupEventTracking();
}

// Microsoft Clarity Configuration
function initMicrosoftClarity() {
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "qzwubnekrt");
}

// Setup custom event tracking for important user interactions
function setupEventTracking() {
    // Wait for DOM to be fully loaded
    document.addEventListener('DOMContentLoaded', () => {
        // Track outbound links
        trackOutboundLinks();
        
        // Track calendar bookings if on contact page
        trackCalendarBookings();
        
        // Track newsletter signups
        trackNewsletterSignups();
    });
}

// Track clicks on external links
function trackOutboundLinks() {
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.href;
            if (href && href.indexOf(window.location.hostname) === -1 && href.indexOf('javascript:') === -1) {
                gtag('event', 'click', {
                    'event_category': 'outbound',
                    'event_label': href,
                    'transport_type': 'beacon'
                });
            }
        });
    });
}

// Track calendar booking completions (specific to contact page)
function trackCalendarBookings() {
    // Check if we're on the contact page with a calendar
    const calendar = document.getElementById('0pnYrjzzGgMExaZw3vZD_1742911360670');
    if (calendar) {
        // This would need to be customized based on how the calendar signals a booking
        // Here we're using a simplified approach to detect calendar iframe load events
        calendar.addEventListener('load', function() {
            // We'll monitor for calendar confirmation screens inside the iframe
            // Note: Cross-origin restrictions might limit this; fallback is to track clicks
            gtag('event', 'calendar_view', {
                'event_category': 'engagement',
                'event_label': 'calendar_loaded'
            });
        });
    }
}

// Track newsletter signup form submissions
function trackNewsletterSignups() {
    const newsletterForms = document.querySelectorAll('.newsletter-form, .newsletter-form-minimal');
    
    newsletterForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            gtag('event', 'newsletter_signup', {
                'event_category': 'conversion',
                'event_label': 'newsletter'
            });
        });
    });
}

// Initialize both analytics platforms
initGoogleAnalytics();
initMicrosoftClarity(); 