// Main JavaScript functionality for JLab startup website

document.addEventListener('DOMContentLoaded', function () {
    // Initialize all functionality
    initNavigation();
    initContactForm();
    initScrollEffects();
    initAnimations();
});

// Navigation functionality
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle mobile menu
    hamburger.addEventListener('click', function () {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 70; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Navbar background on scroll
    window.addEventListener('scroll', function () {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    });
}

// Input validation and sanitization
function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    // Remove potentially dangerous characters and trim whitespace
    return input.trim().replace(/[<>]/g, '');
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validateForm(name, email, subject, message) {
    const errors = [];

    // Validate name
    if (!name || name.length < 2) {
        errors.push('Name must be at least 2 characters long.');
    }
    if (name.length > 100) {
        errors.push('Name must be less than 100 characters.');
    }

    // Validate email
    if (!email || !validateEmail(email)) {
        errors.push('Please enter a valid email address.');
    }
    if (email.length > 255) {
        errors.push('Email address is too long.');
    }

    // Validate subject
    if (!subject || subject.length < 3) {
        errors.push('Subject must be at least 3 characters long.');
    }
    if (subject.length > 200) {
        errors.push('Subject must be less than 200 characters.');
    }

    // Validate message
    if (!message || message.length < 10) {
        errors.push('Message must be at least 10 characters long.');
    }
    if (message.length > 5000) {
        errors.push('Message must be less than 5000 characters.');
    }

    return errors;
}

// Contact form functionality
function initContactForm() {
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const submitBtn = this.querySelector('button[type="submit"]');
            const btnText = submitBtn.querySelector('.btn-text');
            const btnLoading = submitBtn.querySelector('.btn-loading');

            // Get and sanitize form data
            const name = sanitizeInput(document.getElementById('name').value);
            const email = sanitizeInput(document.getElementById('email').value);
            const subject = sanitizeInput(document.getElementById('subject').value);
            const message = sanitizeInput(document.getElementById('message').value);

            // Validate form data
            const validationErrors = validateForm(name, email, subject, message);
            if (validationErrors.length > 0) {
                showMessage(validationErrors.join(' '), 'error');
                return;
            }

            // Prepare form data for Firebase
            const formData = {
                name: name,
                email: email.toLowerCase(), // Normalize email to lowercase
                subject: subject,
                message: message,
                timestamp: new Date(),
                status: 'new',
                ip: null // IP will be captured server-side if needed
            };

            // Show loading state
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline-flex';
            submitBtn.disabled = true;

            try {
                // Save to Firebase
                await db.collection('contacts').add(formData);

                // Show success message
                showMessage('Thank you for your message! We\'ll get back to you soon.', 'success');

                // Reset form
                contactForm.reset();

            } catch (error) {
                console.error('Error saving contact form:', error);
                // Don't expose internal error details to users
                showMessage('Sorry, there was an error sending your message. Please try again later.', 'error');
            } finally {
                // Reset button state
                btnText.style.display = 'inline-flex';
                btnLoading.style.display = 'none';
                submitBtn.disabled = false;
            }
        });
    }
}

// Show success/error messages
function showMessage(text, type) {
    // Remove existing messages
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Create new message
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;

    // Insert before contact form
    const contactForm = document.getElementById('contactForm');
    contactForm.parentNode.insertBefore(message, contactForm);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (message.parentNode) {
            message.remove();
        }
    }, 5000);
}

// Scroll effects
function initScrollEffects() {
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.service-card, .team-member, .stat, .contact-item');
    animateElements.forEach(el => {
        observer.observe(el);
    });
}

// Initialize animations
function initAnimations() {
    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        .service-card, .team-member, .stat, .contact-item {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.6s ease;
        }
        
        .service-card.animate-in, .team-member.animate-in, .stat.animate-in, .contact-item.animate-in {
            opacity: 1;
            transform: translateY(0);
        }
        
        .hamburger.active .bar:nth-child(2) {
            opacity: 0;
        }
        
        .hamburger.active .bar:nth-child(1) {
            transform: translateY(8px) rotate(45deg);
        }
        
        .hamburger.active .bar:nth-child(3) {
            transform: translateY(-8px) rotate(-45deg);
        }
    `;
    document.head.appendChild(style);
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Performance optimization
const debouncedScroll = debounce(function () {
    // Any scroll-based functionality can be added here
}, 10);

window.addEventListener('scroll', debouncedScroll);

// Add loading states and error handling
window.addEventListener('error', function (e) {
    console.error('JavaScript error:', e.error);
});

// Service Worker registration for PWA capabilities (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('/sw.js')
            .then(function (registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function (err) {
                console.log('ServiceWorker registration failed');
            });
    });
}
