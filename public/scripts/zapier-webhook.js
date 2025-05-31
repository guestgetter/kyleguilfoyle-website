// Simple Zapier Webhook Integration for KyleGuilfoyle.com
// Easy setup for email notifications to kyle@guestgetter.co

(function() {
    // Zapier Webhook Configuration
    // Replace this with your actual Zapier webhook URL
    const ZAPIER_WEBHOOK_URL = 'https://hooks.zapier.com/hooks/catch/YOUR_ZAPIER_WEBHOOK_ID/';
    
    // Set to true when you have your Zapier webhook URL configured
    const ZAPIER_ENABLED = false;

    // Global function to send notifications via Zapier
    window.sendZapierNotification = async function(type, data) {
        if (!ZAPIER_ENABLED || !ZAPIER_WEBHOOK_URL.includes('YOUR_ZAPIER_WEBHOOK_ID') === false) {
            console.log('📧 Zapier webhook not configured. Notification logged to console.');
            logNotificationToConsole(type, data);
            return false;
        }

        try {
            const payload = {
                notification_type: type,
                timestamp: new Date().toISOString(),
                website: 'KyleGuilfoyle.com',
                recipient_email: 'kyle@guestgetter.co',
                data: data,
                // Add specific fields based on notification type
                ...formatNotificationData(type, data)
            };

            const response = await fetch(ZAPIER_WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                console.log('✅ Zapier notification sent successfully');
                return true;
            } else {
                throw new Error(`Zapier webhook failed: ${response.status}`);
            }

        } catch (error) {
            console.error('❌ Zapier notification failed:', error);
            logNotificationToConsole(type, data);
            return false;
        }
    };

    // Format notification data for specific types
    function formatNotificationData(type, data) {
        switch (type) {
            case 'Newsletter Subscription':
                return {
                    email_subject: `🎉 New Newsletter Subscriber: ${data.email}`,
                    subscriber_email: data.email,
                    form_location: data.formContext,
                    page_url: data.pageUrl,
                    priority: 'normal'
                };

            case 'Contact Form Submission':
                return {
                    email_subject: `🚨 HIGH PRIORITY: Contact Form Message`,
                    contact_email: data.email,
                    contact_name: data.name,
                    restaurant_name: data.restaurant,
                    message: data.message,
                    page_url: data.pageUrl,
                    priority: 'high'
                };

            case 'Calendar Booking':
                return {
                    email_subject: `📅 New Calendar Booking Confirmed`,
                    booking_data: JSON.stringify(data.bookingData, null, 2),
                    source: data.source,
                    priority: 'high'
                };

            default:
                return {
                    email_subject: `📬 New ${type} from KyleGuilfoyle.com`,
                    form_data: JSON.stringify(data, null, 2),
                    priority: 'normal'
                };
        }
    }

    // Fallback: Log to console with clear formatting
    function logNotificationToConsole(type, data) {
        const timestamp = new Date().toLocaleString();
        console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                           📧 EMAIL NOTIFICATION ALERT                        ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║ TO: kyle@guestgetter.co                                                       ║
║ FROM: KyleGuilfoyle.com                                                       ║
║ TYPE: ${type.padEnd(68)} ║
║ TIME: ${timestamp.padEnd(68)} ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║ NOTIFICATION DATA:                                                            ║
║${JSON.stringify(data, null, 2).split('\n').map(line => '║ ' + line.padEnd(76) + '║').join('\n')}
╚═══════════════════════════════════════════════════════════════════════════════╝
        `);
    }

    // Override the email notification function if available
    if (typeof window.sendFormNotification === 'undefined') {
        window.sendFormNotification = window.sendZapierNotification;
    }

    console.log('🔗 Zapier webhook integration loaded for KyleGuilfoyle.com');

})();

/*
=============================================================================
SETUP INSTRUCTIONS FOR ZAPIER EMAIL NOTIFICATIONS:
=============================================================================

1. CREATE ZAPIER ACCOUNT:
   - Go to https://zapier.com
   - Sign up for a free account

2. CREATE A NEW ZAP:
   - Click "Create Zap"
   - Search for "Webhooks" as your trigger
   - Choose "Catch Hook"
   - Copy the webhook URL provided

3. CONFIGURE THE WEBHOOK:
   - Replace ZAPIER_WEBHOOK_URL above with your actual webhook URL
   - Set ZAPIER_ENABLED to true

4. SET UP EMAIL ACTION:
   - Add an action step
   - Choose "Email" or "Gmail" (depending on your preference)
   - Configure to send to: kyle@guestgetter.co
   - Use these dynamic fields in your email template:
     * Subject: {{email_subject}}
     * Body: Include {{notification_type}}, {{timestamp}}, {{data}}

5. TEST THE INTEGRATION:
   - Test your Zap in Zapier
   - Submit a form on your website
   - Check that the email is received

6. TURN ON THE ZAP:
   - Once tested, turn on your Zap
   - You'll receive email notifications for all form submissions

ALTERNATIVE SETUP WITH FORMSPREE:
=============================================================================
1. Go to https://formspree.io
2. Create a free account
3. Create a new form endpoint
4. Replace the webhook URL with your Formspree endpoint
5. Formspree will send emails directly to kyle@guestgetter.co

ALTERNATIVE SETUP WITH MAKE.COM:
=============================================================================
1. Go to https://make.com (formerly Integromat)
2. Create a webhook scenario
3. Set up email module to send to kyle@guestgetter.co
4. Replace webhook URL and enable

This provides multiple easy options for getting email notifications!
*/ 