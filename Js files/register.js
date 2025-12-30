// Register Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
});

async function handleRegister(e) {
    e.preventDefault();
    
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorAlert = document.getElementById('errorAlert');
    const successAlert = document.getElementById('successAlert');
    
    errorAlert.innerHTML = '';
    successAlert.innerHTML = '';
    
    if (password !== confirmPassword) {
        showError(errorAlert, 'Passwords do not match');
        return;
    }
    
    if (password.length < 6) {
        showError(errorAlert, 'Password must be at least 6 characters');
        return;
    }
    
    const patientData = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        dateOfBirth: document.getElementById('dateOfBirth').value,
        gender: document.getElementById('gender').value,
        bloodGroup: document.getElementById('bloodGroup').value,
        address: document.getElementById('address').value,
        password: password
    };
    
    try {
        const patient = await API.registerPatient(patientData);
        showSuccess(successAlert, 'Registration successful! Redirecting to login...');
        
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    } catch (error) {
        console.error('Registration error:', error);
        showError(errorAlert, 'Registration failed. Please try again.');
    }
}

