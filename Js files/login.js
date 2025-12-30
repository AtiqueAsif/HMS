// Login Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Toggle password visibility
    document.getElementById('togglePassword').addEventListener('click', function() {
        const passwordInput = document.getElementById('password');
        const eyeIcon = document.getElementById('eyeIcon');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            eyeIcon.classList.remove('bi-eye');
            eyeIcon.classList.add('bi-eye-slash');
        } else {
            passwordInput.type = 'password';
            eyeIcon.classList.remove('bi-eye-slash');
            eyeIcon.classList.add('bi-eye');
        }
    });
    
    // Handle form submission
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
});

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    const errorAlert = document.getElementById('errorAlert');
    
    errorAlert.innerHTML = '';
    
    try {
        // For now, we'll use a simple mock login
        // In a real application, you'd call the actual API
        if (email && password) {
            // Store user data (mock)
            const user = {
                id: 1,
                email: email,
                fullName: email.split('@')[0],
                role: role
            };
            
            setUser(user);
            localStorage.setItem('token', 'mock-token-' + Date.now());
            
            // Redirect based on role
            if (role === 'admin') {
                window.location.href = 'admin-panel.html';
            } else if (role === 'doctor') {
                window.location.href = 'doctors.html';
            } else {
                window.location.href = 'index.html';
            }
        } else {
            showError(errorAlert, 'Please enter email and password');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError(errorAlert, 'Login failed. Please check your credentials and try again.');
    }
}