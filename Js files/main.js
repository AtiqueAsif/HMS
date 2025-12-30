// Main JavaScript file for Hospital Management System

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check backend connection first
    checkBackendConnection();
    
    // Add fade-in animation to cards
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('fade-in');
        }, index * 100);
    });
    
    // Update navigation active state
    updateActiveNav();
    
    // Check if user is logged in
    checkAuthStatus();

    // Initialize speciality section interactions
    initSpecialities();
    initAIIntegration();
    initAISettings();
});

// Update active navigation link
function updateActiveNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        } else {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
        }
    });
}

// Check authentication status
function checkAuthStatus() {
    const user = getUser();
    const authNav = document.querySelector('.navbar-nav:last-child');
    
    if (user && authNav) {
        authNav.innerHTML = `
            <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown">
                    <i class="bi bi-person-circle me-1"></i>${user.fullName || user.name || 'User'}
                </a>
                <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="patient-portal-login.html">Patient Portal</a></li>
                    <li><a class="dropdown-item" href="appointments.html">My Appointments</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item" href="#" onclick="logout()">Logout</a></li>
                </ul>
            </li>
        `;
    }
}

// Logout function
function logout() {
    clearAuth();
    window.location.href = 'index.html';
}

// Show loading spinner
function showLoading(element) {
    if (element) {
        element.innerHTML = `
            <div class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-3 text-muted">Loading...</p>
            </div>
        `;
    }
}

// Show error message
function showError(element, message) {
    if (element) {
        element.innerHTML = `
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
    }
}

// Show success message
function showSuccess(element, message) {
    if (element) {
        element.innerHTML = `
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                <i class="bi bi-check-circle-fill me-2"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
    }
}

// Format date
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Format time
function formatTime(timeString) {
    if (!timeString) return 'N/A';
    return timeString;
}

// Get status badge HTML
function getStatusBadge(status) {
    const statusLower = status.toLowerCase();
    let badgeClass = 'bg-secondary';
    
    if (statusLower === 'confirmed' || statusLower === 'approved' || statusLower === 'completed') {
        badgeClass = 'bg-success';
    } else if (statusLower === 'pending') {
        badgeClass = 'bg-warning';
    } else if (statusLower === 'cancelled' || statusLower === 'rejected') {
        badgeClass = 'bg-danger';
    }
    
    return `<span class="badge ${badgeClass}">${status}</span>`;
}

// Validate email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validate phone
function validatePhone(phone) {
    const re = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    return re.test(phone);
}

// Debounce function
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

// Check backend connection (only once per session)
async function checkBackendConnection() {
    const toastElement = document.getElementById('connectionToast');
    const toastTitle = document.getElementById('connectionTitle');
    const toastMessage = document.getElementById('connectionMessage');
    const toastIcon = document.getElementById('connectionIcon');
    
    if (!toastElement) return;
    
    // Check if notification has already been shown in this session
    const connectionChecked = sessionStorage.getItem('backendConnectionChecked');
    if (connectionChecked) {
        // Hide the toast element if it was already shown
        toastElement.style.display = 'none';
        return;
    }
    
    try {
        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        // Try to fetch from backend API
        const response = await fetch('http://localhost:8080/api/doctors', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
            // Connection successful
            toastElement.classList.remove('bg-danger', 'bg-warning');
            toastElement.classList.add('bg-success', 'text-white');
            toastIcon.className = 'bi bi-wifi me-2';
            toastTitle.textContent = 'Connected';
            toastMessage.textContent = 'Successfully connected to backend server!';
        } else {
            throw new Error('Backend returned error');
        }
    } catch (error) {
        // Connection failed
        toastElement.classList.remove('bg-success', 'bg-warning');
        toastElement.classList.add('bg-danger', 'text-white');
        toastIcon.className = 'bi bi-wifi-off me-2';
        toastTitle.textContent = 'Connection Failed';
        toastMessage.innerHTML = 'Cannot connect to backend server. <br><small>Make sure backend is running on http://localhost:8080</small>';
    }
    
    // Mark as checked in session storage
    sessionStorage.setItem('backendConnectionChecked', 'true');
    
    // Show toast notification
    const toast = new bootstrap.Toast(toastElement, {
        autohide: true,
        delay: 5000 // Show for 5 seconds
    });
    toast.show();
}

// Specialities interactions
function initSpecialities() {
    const specialityCards = document.querySelectorAll('.speciality-card');
    if (specialityCards.length) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('show');
                }
            });
        }, { threshold: 0.2 });

        specialityCards.forEach(card => observer.observe(card));
    }

    const specialityModal = document.getElementById('specialityModal');
    const modalTitle = document.getElementById('specialityModalLabel');
    const modalBody = document.getElementById('specialityModalBody');

    if (specialityModal && modalTitle && modalBody) {
        specialityModal.addEventListener('show.bs.modal', event => {
            const button = event.relatedTarget;
            if (!button) return;
            const card = button.closest('.speciality-card');
            if (!card) return;

            modalTitle.textContent = card.dataset.title || 'Speciality';
            modalBody.innerHTML = card.dataset.description || '';
        });
    }
}

function initAIIntegration() {
    const form = document.getElementById('ai-form');
    const questionInput = document.getElementById('ai-question');
    const responseElement = document.getElementById('ai-response');
    const statusElement = document.getElementById('ai-status');

    if (!form || !questionInput || !responseElement || !statusElement || typeof API === 'undefined') {
        return;
    }

    // Function to clean up AI response text
    function cleanAIResponse(text) {
        if (!text) return text;
        
        // Remove markdown formatting characters
        return text
            .replace(/\*\*/g, '')  // Remove bold markers
            .replace(/\*/g, '')     // Remove italic markers
            .replace(/__/g, '')     // Remove underline markers
            .replace(/#/g, '')      // Remove hash symbols
            .replace(/```[a-z]*\n?/g, '')  // Remove code block markers
            .replace(/```/g, '')    // Remove remaining code block markers
            .replace(/~~/g, '')     // Remove strikethrough markers
            .replace(/\|/g, '')     // Remove table markers
            .replace(/\\n/g, '\n') // Fix escaped newlines
            .trim();                // Trim whitespace
    }

    // Function to format text with proper line breaks
    function formatAIResponse(text) {
        if (!text) return text;
        
        // Clean the text first
        const cleanedText = cleanAIResponse(text);
        
        // Convert newlines to HTML line breaks for proper display
        return cleanedText.replace(/\n/g, '<br>');
    }
    
    // Check if API key is already set and hide settings section
    const settingsCard = document.querySelector('.mt-5');
    const savedKey = localStorage.getItem('openrouter_api_key') || '';
    if (savedKey && settingsCard) {
        settingsCard.style.display = 'none';
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const question = questionInput.value.trim();
        if (!question) {
            return;
        }

        statusElement.textContent = 'Asking AI...';
        responseElement.innerHTML = '<span class="text-muted small">Waiting for response...</span>';

        try {
            var savedKey = localStorage.getItem('openrouter_api_key') || '';
            var savedModel = localStorage.getItem('openrouter_model') || 'openai/gpt-4o';
            var savedReferer = localStorage.getItem('openrouter_referer') || '';
            var savedTitle = localStorage.getItem('openrouter_title') || 'HMS';
            var key = savedKey || window.OPENROUTER_API_KEY;
            if (key && typeof OpenRouterClient !== 'undefined') {
                const client = new OpenRouterClient({
                    apiKey: key,
                    defaultHeaders: {
                        'HTTP-Referer': savedReferer || window.OPENROUTER_REFERER || '',
                        'X-Title': savedTitle || window.OPENROUTER_TITLE || 'HMS'
                    }
                });
                const completion = await client.chat.send({
                    model: savedModel,
                    messages: [{ role: 'user', content: question }],
                    stream: false
                });
                const answer = completion && completion.choices && completion.choices[0] && completion.choices[0].message && completion.choices[0].message.content;
                responseElement.innerHTML = formatAIResponse(answer) || 'No response received.';
            } else {
                const result = await API.askAI(question);
                const answer = result && (result.answer || result.message || result.response);
                responseElement.innerHTML = formatAIResponse(answer) || 'No response received.';
            }
            statusElement.textContent = '';
        } catch (error) {
            console.error('AI request failed:', error);
            responseElement.textContent = 'There was an error contacting the AI service. Please try again later.';
            statusElement.textContent = '';
        }
    });
}

function initAISettings() {
    var form = document.getElementById('ai-settings-form');
    var keyInput = document.getElementById('openrouterKey');
    var modelSelect = document.getElementById('openrouterModel');
    var refererInput = document.getElementById('openrouterReferer');
    var titleInput = document.getElementById('openrouterTitle');
    var status = document.getElementById('ai-settings-status');
    var settingsCard = document.querySelector('.mt-5');
    
    if (!form || !keyInput || !modelSelect || !refererInput || !titleInput || !status) return;
    
    var sk = localStorage.getItem('openrouter_api_key') || '';
    var model = localStorage.getItem('openrouter_model') || 'openai/gpt-4o';
    var ref = localStorage.getItem('openrouter_referer') || '';
    var title = localStorage.getItem('openrouter_title') || 'HMS';
    
    keyInput.value = sk;
    modelSelect.value = model;
    refererInput.value = ref;
    titleInput.value = title;
    
    // Hide settings section if API key is already set
    if (sk && settingsCard) {
        settingsCard.style.display = 'none';
    }
    
    form.addEventListener('submit', function(e){
        e.preventDefault();
        localStorage.setItem('openrouter_api_key', keyInput.value.trim());
        localStorage.setItem('openrouter_model', modelSelect.value);
        localStorage.setItem('openrouter_referer', refererInput.value.trim());
        localStorage.setItem('openrouter_title', titleInput.value.trim() || 'HMS');
        status.textContent = 'Saved';
        
        // Hide settings section after saving if API key is provided
        if (keyInput.value.trim() && settingsCard) {
            settingsCard.style.display = 'none';
        }
        
        setTimeout(function(){ status.textContent=''; }, 2000);
    });
}
