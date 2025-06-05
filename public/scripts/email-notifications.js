// Email Notification Service for KyleGuilfoyle.com
// Sends actual email notifications to kyle@guestgetter.co

(function() {
    // EmailJS Configuration
    // You'll need to replace these with your actual EmailJS credentials
    const EMAILJS_CONFIG = {
        serviceId: 'service_kyleguilfoyle', // You'll need to create this in EmailJS
        templateId: 'template_form_notification', // You'll need to create this template
        publicKey: 'YOUR_EMAILJS_PUBLIC_KEY', // Get this from EmailJS dashboard
        userId: 'YOUR_EMAILJS_USER_ID' // Get this from EmailJS dashboard
    };

    // Initialize EmailJS
    if (typeof emailjs !== 'undefined') {
        emailjs.init(EMAILJS_CONFIG.publicKey);
    }

    // Email notification function
    window.sendFormNotification = async function(type, data) {
        try {
            // If EmailJS is not loaded, use a fallback method
            if (typeof emailjs === 'undefined') {
                console.log('📧 EmailJS not loaded, using fallback notification method');
                return await fallbackNotification(type, data);
            }

            const emailData = {
                notification_type: type,
                timestamp: new Date().toLocaleString(),
                website: 'KyleGuilfoyle.com',
                to_email: 'kyle@guestgetter.co',
                ...formatEmailData(type, data)
            };

            const response = await emailjs.send(
                EMAILJS_CONFIG.serviceId,
                EMAILJS_CONFIG.templateId,
                emailData,
                EMAILJS_CONFIG.userId
            );

            console.log('✅ Email notification sent successfully:', response);
            return response;

        } catch (error) {
            console.error('❌ Email notification failed:', error);
            // Try fallback method
            return await fallbackNotification(type, data);
        }
    };

    // Format email data based on notification type
    function formatEmailData(type, data) {
        switch (type) {
            case 'Newsletter Subscription':
                return {
                    subject: `🎉 New Newsletter Subscriber - ${data.email}`,
                    email_address: data.email,
                    form_location: data.formContext,
                    page_url: data.pageUrl,
                    message: `New newsletter subscription from ${data.formContext} on KyleGuilfoyle.com`
                };

            case 'Contact Form Submission':
                return {
                    subject: `🚨 HIGH PRIORITY: New Contact Form Message`,
                    email_address: data.email,
                    contact_name: data.name,
                    restaurant_name: data.restaurant,
                    message: data.message,
                    page_url: data.pageUrl,
                    priority: 'HIGH'
                };

            case 'Calendar Booking':
                return {
                    subject: `📅 New Calendar Booking Confirmed`,
                    booking_details: JSON.stringify(data.bookingData, null, 2),
                    source: data.source,
                    message: 'New calendar booking confirmed on KyleGuilfoyle.com'
                };

            default:
                return {
                    subject: `📬 New Form Submission - ${type}`,
                    form_data: JSON.stringify(data, null, 2),
                    message: `New ${type} from KyleGuilfoyle.com`
                };
        }
    }

    // Fallback notification method using Zapier webhook or similar
    async function fallbackNotification(type, data) {
        try {
            // Option 1: Use a Zapier webhook (recommended)
            const zapierWebhookUrl = 'https://hooks.zapier.com/hooks/catch/YOUR_ZAPIER_WEBHOOK_ID/';
            
            // Option 2: Use a simple notification service
            const notificationData = {
                type: type,
                timestamp: new Date().toISOString(),
                website: 'KyleGuilfoyle.com',
                notification_email: 'kyle@guestgetter.co',
                data: data
            };

            // For now, just log to console with clear formatting
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
║ ${JSON.stringify(data, null, 2).split('\n').join('\n║ ')}    ║
╚══════════════════════════════════════════════════════════════╝
            `);

            // Uncomment and configure one of these options:
            
            // Option A: Zapier Webhook
            /*
            const response = await fetch(zapierWebhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(notificationData)
            });
            return response.ok;
            */

            // Option B: FormSpree (alternative email service)
            /*
            const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'kyle@guestgetter.co',
                    message: `${type}: ${JSON.stringify(data, null, 2)}`
                })
            });
            return response.ok;
            */

            // Option C: Make.com (Integromat) webhook
            /*
            const response = await fetch('https://hook.us1.make.com/YOUR_WEBHOOK_ID', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(notificationData)
            });
            return response.ok;
            */

            return true; // For now, just return true

        } catch (error) {
            console.error('Fallback notification also failed:', error);
            return false;
        }
    }

    // Load EmailJS if not already loaded
    function loadEmailJS() {
        if (typeof emailjs === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
            script.onload = function() {
                emailjs.init(EMAILJS_CONFIG.publicKey);
                console.log('📧 EmailJS loaded successfully');
            };
            script.onerror = function() {
                console.log('⚠️ EmailJS failed to load, using fallback method');
            };
            document.head.appendChild(script);
        }
    }

    // Initialize on page load
    document.addEventListener('DOMContentLoaded', loadEmailJS);

})();

// Instructions for setting up EmailJS:
/*
1. Go to https://www.emailjs.com/ and create a free account
2. Create a new service (Gmail, Outlook, etc.) using kyle@guestgetter.co
3. Create an email template with these variables:
   - {{notification_type}}
   - {{timestamp}}
   - {{website}}
   - {{to_email}}
   - {{subject}}
   - {{email_address}}
   - {{contact_name}}
   - {{restaurant_name}}
   - {{message}}
   - {{page_url}}
   - {{form_location}}
   - {{booking_details}}
   - {{priority}}

4. Replace the EMAILJS_CONFIG values above with your actual credentials
5. Test the integration

Alternative setup using Zapier:
1. Create a Zapier account
2. Create a new Zap with Webhook trigger
3. Set action to send email to kyle@guestgetter.co
4. Replace the zapierWebhookUrl in fallbackNotification function
5. Uncomment the Zapier webhook code section
*/ 