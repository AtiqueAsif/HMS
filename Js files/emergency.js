// Emergency Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Service type selection
    document.querySelectorAll('input[name="serviceType"]').forEach(radio => {
        radio.addEventListener('change', function() {
            showServiceForm(this.value);
        });
    });
    
    // Ambulance method selection
    document.querySelectorAll('input[name="ambulanceMethod"]').forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'call') {
                document.getElementById('callMeForm').style.display = 'block';
                document.getElementById('onlineBookingForm').style.display = 'none';
            } else {
                document.getElementById('callMeForm').style.display = 'none';
                document.getElementById('onlineBookingForm').style.display = 'block';
            }
        });
    });
    
    // Form submissions
    document.getElementById('callMeFormElement').addEventListener('submit', handleCallBack);
    document.getElementById('ambulanceBookingForm').addEventListener('submit', handleAmbulanceBooking);
    document.getElementById('bloodRequestForm').addEventListener('submit', handleBloodRequest);
    
    // Show initial form
    showServiceForm('ambulance');
});

function showServiceForm(type) {
    // Hide all forms
    document.querySelectorAll('.service-form').forEach(form => {
        form.style.display = 'none';
    });
    
    // Show selected form
    if (type === 'ambulance') {
        document.getElementById('ambulanceForm').style.display = 'block';
    } else if (type === 'blood') {
        document.getElementById('bloodForm').style.display = 'block';
    }
}

async function handleCallBack(e) {
    e.preventDefault();
    
    const phoneNumber = document.getElementById('callbackPhone').value;
    
    try {
        await API.requestCallBack(phoneNumber);
        alert('We will call you back shortly!');
        document.getElementById('callMeFormElement').reset();
    } catch (error) {
        console.error('Error requesting callback:', error);
        alert('Failed to request callback. Please try again.');
    }
}

async function handleAmbulanceBooking(e) {
    e.preventDefault();
    
    const bookingData = {
        phoneNumber: document.getElementById('ambulancePhone').value,
        pickupAddress: document.getElementById('pickupAddress').value,
        pickupTime: document.getElementById('pickupTime').value,
        emergencyType: 'EMERGENCY'
    };
    
    try {
        await API.bookAmbulance(bookingData);
        alert('Ambulance booking confirmed! Expected arrival: ~20 minutes');
        document.getElementById('ambulanceBookingForm').reset();
    } catch (error) {
        console.error('Error booking ambulance:', error);
        alert('Failed to book ambulance. Please try again.');
    }
}

async function handleBloodRequest(e) {
    e.preventDefault();
    
    const requestData = {
        patientName: document.getElementById('bloodPatientName').value,
        bloodGroup: document.getElementById('bloodGroup').value,
        units: parseInt(document.getElementById('bloodUnits').value),
        contactNumber: document.getElementById('bloodContact').value,
        urgency: document.getElementById('bloodUrgency').value
    };
    
    try {
        const result = await API.requestBlood(requestData);
        if (result) {
            alert('Blood request submitted successfully! We will contact you with availability.');
            document.getElementById('bloodRequestForm').reset();
        } else {
            alert('Blood not available at the moment. We will contact you with alternatives.');
        }
    } catch (error) {
        console.error('Error requesting blood:', error);
        alert('Failed to submit blood request. Please try again.');
    }
}

