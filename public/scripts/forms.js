// Enhanced HighLevel Form Integration for KyleGuilfoyle.com
// Includes proper tagging, email notifications, conversion tracking, and smooth UX

document.addEventListener('DOMContentLoaded', function() {
    
    // Configuration
    const HIGHLEVEL_CONFIG = {
        apiKey: '23ba76e4-34b2-4b0a-b50e-d5353e568b89',
        locationId: '5Ycss9q6zHpD6qfCOk4F',
        baseUrl: 'https://rest.gohighlevel.com/v1',
        notificationEmail: 'kyle@guestgetter.co'
    };

    // Enhanced UI components for better UX
    function createLoadingSpinner() {
        const spinner = document.createElement('span');
        spinner.className = 'form-spinner';
        spinner.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="31.416" stroke-dashoffset="31.416">
                    <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                    <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
                </circle>
            </svg>
        `;
        return spinner;
    }

    function createSuccessIcon() {
        return `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            </svg>
        `;
    }

    function createErrorIcon() {
        return `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
                <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
            </svg>
        `;
    }

    // Enhanced form state management
    function setFormState(form, state, options = {}) {
        const submitButton = form.querySelector('button[type="submit"]');
        const emailInput = form.querySelector('input[type="email"]');
        
        // Remove any existing state classes
        form.classList.remove('form-loading', 'form-success', 'form-error');
        
        switch(state) {
            case 'loading':
                form.classList.add('form-loading');
                submitButton.disabled = true;
                emailInput.disabled = true;
                
                // Clear existing content and add spinner
                const spinner = createLoadingSpinner();
                submitButton.innerHTML = `${spinner.outerHTML} ${options.text || 'Subscribing...'}`;
                break;
                
            case 'success':
                form.classList.add('form-success');
                submitButton.disabled = false;
                emailInput.disabled = false;
                submitButton.innerHTML = `${createSuccessIcon()} ${options.text || 'Subscribed!'}`;
                
                // Reset after delay
                setTimeout(() => {
                    form.classList.remove('form-success');
                    submitButton.innerHTML = options.originalText || 'Get The Growth OS';
                }, 3000);
                break;
                
            case 'error':
                form.classList.add('form-error');
                submitButton.disabled = false;
                emailInput.disabled = false;
                submitButton.innerHTML = `${createErrorIcon()} ${options.text || 'Try Again'}`;
                
                // Reset after delay
                setTimeout(() => {
                    form.classList.remove('form-error');
                    submitButton.innerHTML = options.originalText || 'Get The Growth OS';
                }, 4000);
                break;
                
            case 'reset':
            default:
                submitButton.disabled = false;
                emailInput.disabled = false;
                submitButton.innerHTML = options.originalText || 'Get The Growth OS';
                break;
        }
    }

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

    // Enhanced HighLevel API submission with retry logic
    async function submitToHighLevel(contactData, retries = 2) {
        for (let attempt = 0; attempt <= retries; attempt++) {
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
                console.error(`❌ HighLevel submission attempt ${attempt + 1} failed:`, error);
                
                if (attempt === retries) {
                    throw error;
                }
                
                // Wait before retry (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            }
        }
    }

    // Enhanced email validation
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Newsletter Form Handler (Main and Sidebar) - Enhanced UX
    const newsletterForms = document.querySelectorAll('.newsletter-form, .sidebar-newsletter-form, .newsletter-form-minimal');
    
    newsletterForms.forEach(form => {
        const emailInput = form.querySelector('input[type="email"]');
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        
        // Prevent double submissions
        let isSubmitting = false;
        
        // Enhanced email validation on input
        emailInput.addEventListener('input', function() {
            const email = this.value.trim();
            
            // Remove any validation classes
            this.classList.remove('email-valid', 'email-invalid');
            
            if (email) {
                if (validateEmail(email)) {
                    this.classList.add('email-valid');
                    submitButton.disabled = false;
                } else {
                    this.classList.add('email-invalid');
                    submitButton.disabled = true;
                }
            } else {
                submitButton.disabled = false;
            }
        });

        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (isSubmitting) return; // Prevent double submission
            
            const email = emailInput.value.trim();
            
            if (!email || !validateEmail(email)) {
                showMessage(form, 'Please enter a valid email address.', 'error');
                emailInput.focus();
                return;
            }

            isSubmitting = true;
            setFormState(form, 'loading', { 
                text: 'Subscribing...', 
                originalText: originalButtonText 
            });

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

                // Submit to HighLevel with retry logic
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

                // Show success state
                setFormState(form, 'success', { 
                    text: 'Welcome to The Growth OS!', 
                    originalText: originalButtonText 
                });
                
                // Enhanced success message
                showMessage(form, '🎉 Success! Check your email for The Growth OS welcome message.', 'success');
                
                // Clear form
                form.reset();
                emailInput.classList.remove('email-valid', 'email-invalid');

                // Optional: Show additional success animation
                if (formContext === 'Homepage') {
                    // Could trigger confetti or other celebration animations
                    console.log('🎊 Main newsletter signup completed!');
                }

            } catch (error) {
                console.error('Newsletter subscription error:', error);
                
                setFormState(form, 'error', { 
                    text: 'Try Again', 
                    originalText: originalButtonText 
                });
                
                showMessage(form, 'Oops! Something went wrong. Please try again or email kyle@guestgetter.co directly.', 'error');
                
                // Fallback: Still send email notification about the attempt
                await sendEmailNotification('Newsletter Subscription Failed', {
                    email: email,
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
                
            } finally {
                isSubmitting = false;
                
                // Reset form state after delay if not already handled
                setTimeout(() => {
                    if (form.classList.contains('form-loading')) {
                        setFormState(form, 'reset', { originalText: originalButtonText });
                    }
                }, 5000);
            }
        });
    });

    // Contact Form Handler (if one exists) - Enhanced UX
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        let isSubmitting = false;
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (isSubmitting) return;
            
            const nameInput = contactForm.querySelector('#name');
            const emailInput = contactForm.querySelector('#email');
            const restaurantInput = contactForm.querySelector('#restaurant');
            const messageInput = contactForm.querySelector('#message');
            
            // Basic validation
            if (!nameInput.value.trim() || !emailInput.value.trim() || !messageInput.value.trim()) {
                showMessage(contactForm, 'Please fill in all required fields.', 'error');
                return;
            }
            
            if (!validateEmail(emailInput.value.trim())) {
                showMessage(contactForm, 'Please enter a valid email address.', 'error');
                emailInput.focus();
                return;
            }

            isSubmitting = true;
            submitButton.innerHTML = `${createLoadingSpinner().outerHTML} Sending Message...`;
            submitButton.disabled = true;

            try {
                const formData = {
                    name: nameInput.value.trim(),
                    email: emailInput.value.trim(),
                    restaurant: restaurantInput.value.trim(),
                    message: messageInput.value.trim()
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

                // Show success
                submitButton.innerHTML = `${createSuccessIcon()} Message Sent!`;
                showMessage(contactForm, '✅ Thank you! Your message has been sent. I\'ll get back to you within 24 hours.', 'success');
                contactForm.reset();

                // Reset button after delay
                setTimeout(() => {
                    submitButton.innerHTML = originalButtonText;
                    submitButton.disabled = false;
                }, 3000);

            } catch (error) {
                console.error('Contact form submission error:', error);
                
                submitButton.innerHTML = `${createErrorIcon()} Try Again`;
                showMessage(contactForm, 'Message failed to send. Please email kyle@guestgetter.co directly.', 'error');
                
                // Fallback notification
                await sendEmailNotification('Contact Form Failed', {
                    error: error.message,
                    timestamp: new Date().toISOString(),
                    formData: contactForm.querySelector('#email')?.value
                });
                
                // Reset button after delay
                setTimeout(() => {
                    submitButton.innerHTML = originalButtonText;
                    submitButton.disabled = false;
                }, 4000);
                
            } finally {
                isSubmitting = false;
            }
        });
    }

    // Enhanced message display with better animations
    function showMessage(form, message, type) {
        // Remove any existing messages
        const existingMessage = form.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => existingMessage.remove(), 300);
        }

        // Create new message with enhanced styling
        setTimeout(() => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `form-message form-${type}`;
            messageDiv.innerHTML = `
                <span class="message-icon">
                    ${type === 'success' ? createSuccessIcon() : createErrorIcon()}
                </span>
                <span class="message-text">${message}</span>
            `;
            
            // Enhanced styling
            messageDiv.style.cssText = `
                margin-top: 1rem;
                padding: 1rem 1.25rem;
                border-radius: 12px;
                font-weight: 500;
                text-align: center;
                animation: slideInBounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                backdrop-filter: blur(10px);
                ${type === 'success' ? 
                    'background: linear-gradient(135deg, #1A472A, #2A5A3A); color: white; border: 1px solid rgba(255, 255, 255, 0.2);' : 
                    'background: linear-gradient(135deg, #FF6B6B, #FF8F8F); color: white; border: 1px solid rgba(255, 255, 255, 0.2);'
                }
            `;

            form.appendChild(messageDiv);

            // Auto-remove success messages after 6 seconds
            if (type === 'success') {
                setTimeout(() => {
                    if (messageDiv && messageDiv.parentNode) {
                        messageDiv.style.animation = 'slideOut 0.4s ease';
                        setTimeout(() => messageDiv.remove(), 400);
                    }
                }, 6000);
            }
        }, existingMessage ? 300 : 0);
    }

    // Enhanced CSS for animations and form states
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInBounce {
            0% { opacity: 0; transform: translateY(-20px) scale(0.9); }
            50% { opacity: 1; transform: translateY(-5px) scale(1.02); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes slideOut {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(-10px); }
        }
        
        .form-message {
            transition: all 0.3s ease;
        }
        
        .form-message .message-icon svg {
            width: 18px;
            height: 18px;
            flex-shrink: 0;
        }
        
        .form-spinner svg {
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        
        /* Form state styles */
        .form-loading .newsletter-button,
        .form-loading .submit-button {
            background: #6b7280 !important;
            cursor: not-allowed !important;
        }
        
        .form-success .newsletter-button,
        .form-success .submit-button {
            background: linear-gradient(135deg, #1A472A, #2A5A3A) !important;
            transform: scale(1.02);
        }
        
        .form-error .newsletter-button,
        .form-error .submit-button {
            background: linear-gradient(135deg, #dc2626, #ef4444) !important;
            animation: shake 0.5s ease-in-out;
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
        
        /* Enhanced input validation styles */
        .newsletter-input.email-valid,
        input.email-valid {
            border-color: #1A472A !important;
            box-shadow: 0 0 0 3px rgba(26, 71, 42, 0.1) !important;
        }
        
        .newsletter-input.email-invalid,
        input.email-invalid {
            border-color: #ef4444 !important;
            box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
        }
        
        /* Smooth transitions for all form elements */
        .newsletter-input,
        .newsletter-button,
        .submit-button,
        input,
        button {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
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

    console.log('🚀 Enhanced HighLevel form integration with improved UX loaded for KyleGuilfoyle.com');
}); 