// Enhanced HighLevel Form Integration for KyleGuilfoyle.com
// Includes proper tagging, email notifications, and conversion tracking

document.addEventListener('DOMContentLoaded', function() {
    
    // Configuration
    const HIGHLEVEL_CONFIG = {
        apiKey: '23ba76e4-34b2-4b0a-b50e-d5353e568b89',
        locationId: '5Ycss9q6zHpD6qfCOk4F',
        baseUrl: 'https://rest.gohighlevel.com/v1',
        notificationEmail: 'kyle@guestgetter.co'
    };

    // Utility function to send email notifications
    async function sendEmailNotification(type, formData) {
        try {
            // Use the global email notification service if available
            if (typeof window.sendFormNotification === 'function') {
                return await window.sendFormNotification(type, formData);
            }
            
            // Fallback: Log to console with clear formatting
            console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    📧 EMAIL NOTIFICATION                     ║
╠══════════════════════════════════════════════════════════════╣
║ To: kyle@guestgetter.co                                      ║
║ Subject: ${type}                                             ║
║ Time: ${new Date().toLocaleString()}                         ║
║ Website: KyleGuilfoyle.com                                   ║
╠══════════════════════════════════════════════════════════════╣
║ Data:                                                        ║
║ ${JSON.stringify(formData, null, 2).split('\n').join('\n║ ')} ║
╚══════════════════════════════════════════════════════════════╝
            `);
            
        } catch (error) {
            console.error('Email notification failed:', error);
        }
    }

    // Utility function to track conversions
    function trackConversion(formType, email) {
        // Google Analytics 4 event tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', 'form_submit', {
                event_category: 'Lead Generation',
                event_label: formType,
                custom_parameter_1: 'KyleGuilfoyle.com'
            });
        }

        // HighLevel custom event tracking (if available)
        if (typeof hlTrack !== 'undefined') {
            hlTrack('form_submit', {
                form_type: formType,
                source: 'KyleGuilfoyle.com Website',
                timestamp: new Date().toISOString()
            });
        }

        console.log(`🎯 Conversion tracked: ${formType} - ${email}`);
    }

    // Enhanced HighLevel API submission
    async function submitToHighLevel(contactData) {
        try {
            const response = await fetch(`${HIGHLEVEL_CONFIG.baseUrl}/contacts/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${HIGHLEVEL_CONFIG.apiKey}`,
                    'User-Agent': 'KyleGuilfoyle.com-Website'
                },
                body: JSON.stringify({
                    locationId: HIGHLEVEL_CONFIG.locationId,
                    ...contactData,
                    // Enhanced tagging system
                    tags: [
                        ...contactData.tags,
                        'KyleGuilfoyle.com',
                        'Website Lead',
                        `Source: ${contactData.source}`,
                        `Date: ${new Date().toLocaleDateString()}`
                    ],
                    customField: {
                        ...contactData.customField,
                        website_source: 'KyleGuilfoyle.com',
                        submission_timestamp: new Date().toISOString(),
                        user_agent: navigator.userAgent,
                        page_url: window.location.href,
                        referrer: document.referrer || 'Direct'
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`HighLevel API Error: ${response.status} - ${errorData}`);
            }

            const result = await response.json();
            console.log('✅ Contact successfully added to HighLevel:', result);
            return result;
            
        } catch (error) {
            console.error('❌ HighLevel submission failed:', error);
            throw error;
        }
    }

    // Newsletter Form Handler (Main and Sidebar)
    const newsletterForms = document.querySelectorAll('.newsletter-form, .sidebar-newsletter-form, .newsletter-form-minimal');
    
    newsletterForms.forEach(form => {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const emailInput = form.querySelector('input[type="email"]');
            const submitButton = form.querySelector('button[type="submit"]');
            const email = emailInput.value.trim();
            
            if (!email) {
                showMessage(form, 'Please enter a valid email address.', 'error');
                return;
            }

            const originalButtonText = submitButton.textContent;
            submitButton.textContent = '📤 Subscribing...';
            submitButton.disabled = true;

            try {
                // Determine form context for better tagging
                const formContext = form.classList.contains('sidebar-newsletter-form') ? 
                    'Guide Sidebar' : 
                    form.classList.contains('newsletter-form-minimal') ? 
                    'About Page' : 
                    'Homepage';

                const contactData = {
                    email: email,
                    tags: [
                        'Newsletter Subscriber',
                        `${formContext} Subscription`,
                        'Growth OS Subscriber'
                    ],
                    source: `KyleGuilfoyle.com - ${formContext} Newsletter`,
                    customField: {
                        subscription_type: 'Newsletter',
                        form_location: formContext,
                        lead_magnet: 'Restaurant Growth OS Newsletter'
                    }
                };

                // Submit to HighLevel
                await submitToHighLevel(contactData);

                // Send email notification
                await sendEmailNotification('Newsletter Subscription', {
                    email: email,
                    formContext: formContext,
                    timestamp: new Date().toISOString(),
                    pageUrl: window.location.href
                });

                // Track conversion
                trackConversion(`Newsletter_${formContext}`, email);

                // Show success message
                showMessage(form, '🎉 Welcome to The Growth OS! Check your email for confirmation.', 'success');
                form.reset();

                // Optional: Redirect to thank you page after delay
                setTimeout(() => {
                    // You could redirect to a thank you page here
                    // window.location.href = '/thank-you-newsletter';
                }, 2000);

            } catch (error) {
                console.error('Newsletter subscription error:', error);
                showMessage(form, '⚠️ Something went wrong. Please try again or email kyle@guestgetter.co directly.', 'error');
                
                // Fallback: Still send email notification about the attempt
                await sendEmailNotification('Newsletter Subscription Failed', {
                    email: email,
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
                
            } finally {
                submitButton.textContent = originalButtonText;
                submitButton.disabled = false;
            }
        });
    });

    // Contact Form Handler (if one exists)
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.textContent = '📤 Sending Message...';
            submitButton.disabled = true;

            try {
                const formData = {
                    name: contactForm.querySelector('#name')?.value || '',
                    email: contactForm.querySelector('#email')?.value || '',
                    restaurant: contactForm.querySelector('#restaurant')?.value || '',
                    message: contactForm.querySelector('#message')?.value || ''
                };

                const nameParts = formData.name.split(' ');
                const contactData = {
                    firstName: nameParts[0] || '',
                    lastName: nameParts.slice(1).join(' ') || '',
                    email: formData.email,
                    companyName: formData.restaurant,
                    tags: [
                        'Contact Form Submission',
                        'High Priority Lead',
                        'Direct Inquiry'
                    ],
                    source: 'KyleGuilfoyle.com - Contact Form',
                    customField: {
                        message: formData.message,
                        restaurant_name: formData.restaurant,
                        inquiry_type: 'Contact Form',
                        priority: 'High'
                    }
                };

                // Submit to HighLevel
                await submitToHighLevel(contactData);

                // Send priority email notification
                await sendEmailNotification('Contact Form Submission', {
                    ...formData,
                    timestamp: new Date().toISOString(),
                    pageUrl: window.location.href,
                    priority: 'HIGH'
                });

                // Track conversion
                trackConversion('Contact_Form', formData.email);

                // Show success message
                showMessage(contactForm, '✅ Thank you for your message! I\'ll get back to you within 24 hours.', 'success');
                contactForm.reset();

            } catch (error) {
                console.error('Contact form submission error:', error);
                showMessage(contactForm, '⚠️ Message failed to send. Please email kyle@guestgetter.co directly.', 'error');
                
                // Fallback notification
                await sendEmailNotification('Contact Form Failed', {
                    error: error.message,
                    timestamp: new Date().toISOString(),
                    formData: contactForm.querySelector('#email')?.value
                });
                
            } finally {
                submitButton.textContent = originalButtonText;
                submitButton.disabled = false;
            }
        });
    }

    // Utility function to show messages
    function showMessage(form, message, type) {
        // Remove any existing messages
        const existingMessage = form.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `form-message form-${type}`;
        messageDiv.textContent = message;
        
        // Styling
        messageDiv.style.cssText = `
            margin-top: 1rem;
            padding: 0.75rem 1rem;
            border-radius: 8px;
            font-weight: 500;
            text-align: center;
            animation: slideIn 0.3s ease;
            ${type === 'success' ? 
                'background: linear-gradient(135deg, #1A472A, #2A5A3A); color: white;' : 
                'background: linear-gradient(135deg, #FF6B6B, #FF8F8F); color: white;'
            }
        `;

        form.appendChild(messageDiv);

        // Auto-remove success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                if (messageDiv && messageDiv.parentNode) {
                    messageDiv.style.animation = 'slideOut 0.3s ease';
                    setTimeout(() => messageDiv.remove(), 300);
                }
            }, 5000);
        }
    }

    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideOut {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(-10px); }
        }
        .form-message {
            transition: all 0.3s ease;
        }
    `;
    document.head.appendChild(style);

    // Initialize HighLevel tracking pixel (if not already loaded)
    if (!window.hlTrack) {
        const script = document.createElement('script');
        script.src = `https://api.leadconnectorhq.com/analytics/v1/${HIGHLEVEL_CONFIG.locationId}.js`;
        script.async = true;
        document.head.appendChild(script);
    }

    // Calendar booking tracking (for the existing HighLevel calendar)
    const calendarWrapper = document.querySelector('.calendar-wrapper');
    if (calendarWrapper) {
        // Listen for calendar events
        window.addEventListener('message', function(event) {
            if (event.origin === 'https://api.leadconnectorhq.com') {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'booking_confirmed') {
                        // Track calendar booking
                        trackConversion('Calendar_Booking', data.email || 'unknown');
                        
                        // Send notification
                        sendEmailNotification('Calendar Booking', {
                            timestamp: new Date().toISOString(),
                            bookingData: data,
                            source: 'KyleGuilfoyle.com Contact Page'
                        });
                    }
                } catch (e) {
                    // Not our message, ignore
                }
            }
        });
    }

    console.log('🚀 Enhanced HighLevel form integration loaded for KyleGuilfoyle.com');
}); 