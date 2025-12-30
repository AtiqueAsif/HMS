// Patient Portal Login JavaScript

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('patientLoginForm').addEventListener('submit', handlePatientLogin);
});

async function handlePatientLogin(e) {
    e.preventDefault();
    
    const patientId = document.getElementById('patientId').value;
    const password = document.getElementById('password').value;
    const errorAlert = document.getElementById('errorAlert');
    
    errorAlert.innerHTML = '';
    
    try {
        const patient = await API.loginPatient(patientId, password);
        
        if (patient) {
            localStorage.setItem('patient', JSON.stringify(patient));
            window.location.href = 'patient-portal.html';
        } else {
            showError(errorAlert, 'Invalid Patient ID or Password');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError(errorAlert, 'Login failed. Please try again.');
    }
}

