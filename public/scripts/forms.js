// HighLevel Form Handlers
document.addEventListener('DOMContentLoaded', function() {
    // Newsletter Form Handler (Main and Sidebar)
    const newsletterForms = document.querySelectorAll('.newsletter-form, .sidebar-newsletter-form');
    newsletterForms.forEach(form => {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitButton = form.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;

            try {
                const response = await fetch('https://rest.gohighlevel.com/v1/contacts/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer 23ba76e4-34b2-4b0a-b50e-d5353e568b89'
                    },
                    body: JSON.stringify({
                        locationId: '5Ycss9q6zHpD6qfCOk4F',
                        email: form.querySelector('input[type="email"]').value,
                        tags: ['Newsletter Subscriber'],
                        source: 'Website Newsletter'
                    })
                });

                if (response.ok) {
                    // Show success message
                    const successMessage = document.createElement('div');
                    successMessage.className = 'form-success';
                    successMessage.textContent = 'Thank you for subscribing to The Growth OS!';
                    successMessage.style.color = '#1A472A';
                    successMessage.style.marginTop = '1rem';
                    form.appendChild(successMessage);
                    form.reset();
                } else {
                    throw new Error('Submission failed');
                }
            } catch (error) {
                console.error('Error:', error);
                // Show error message
                const errorMessage = document.createElement('div');
                errorMessage.className = 'form-error';
                errorMessage.textContent = 'Something went wrong. Please try again.';
                errorMessage.style.color = '#FF6B6B';
                errorMessage.style.marginTop = '1rem';
                form.appendChild(errorMessage);
            } finally {
                submitButton.textContent = originalButtonText;
                submitButton.disabled = false;
            }
        });
    });

    // Contact Form Handler
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;

            try {
                const formData = {
                    name: contactForm.querySelector('#name').value,
                    email: contactForm.querySelector('#email').value,
                    restaurant: contactForm.querySelector('#restaurant').value,
                    message: contactForm.querySelector('#message').value
                };

                const response = await fetch('https://rest.gohighlevel.com/v1/contacts/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer 23ba76e4-34b2-4b0a-b50e-d5353e568b89'
                    },
                    body: JSON.stringify({
                        locationId: '5Ycss9q6zHpD6qfCOk4F',
                        firstName: formData.name.split(' ')[0],
                        lastName: formData.name.split(' ').slice(1).join(' '),
                        email: formData.email,
                        companyName: formData.restaurant,
                        customField: {
                            message: formData.message
                        },
                        tags: ['Contact Form Submission'],
                        source: 'Website Contact Form'
                    })
                });

                if (response.ok) {
                    // Show success message
                    const successMessage = document.createElement('div');
                    successMessage.className = 'form-success';
                    successMessage.textContent = 'Thank you for your message! I\'ll get back to you soon.';
                    successMessage.style.color = '#1A472A';
                    successMessage.style.marginTop = '1rem';
                    contactForm.appendChild(successMessage);
                    contactForm.reset();
                } else {
                    throw new Error('Submission failed');
                }
            } catch (error) {
                console.error('Error:', error);
                // Show error message
                const errorMessage = document.createElement('div');
                errorMessage.className = 'form-error';
                errorMessage.textContent = 'Something went wrong. Please try again.';
                errorMessage.style.color = '#FF6B6B';
                errorMessage.style.marginTop = '1rem';
                contactForm.appendChild(errorMessage);
            } finally {
                submitButton.textContent = originalButtonText;
                submitButton.disabled = false;
            }
        });
    }
}); 