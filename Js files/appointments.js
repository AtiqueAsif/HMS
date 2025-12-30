// Appointments Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    loadDoctors();
    loadAppointments();
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('appointmentDate').setAttribute('min', today);
    
    // Handle form submission
    document.getElementById('appointmentForm').addEventListener('submit', handleAppointmentSubmit);
    
    // Update department when doctor is selected
    document.getElementById('doctorSelect').addEventListener('change', function() {
        const doctorId = this.value;
        if (doctorId) {
            updateDepartment(doctorId);
        }
    });
});

async function loadDoctors() {
    try {
        const doctors = await API.getDoctors();
        const select = document.getElementById('doctorSelect');
        
        select.innerHTML = '<option value="">Choose a doctor</option>';
        
        doctors.forEach(doctor => {
            if (doctor.isAvailable) {
                const option = document.createElement('option');
                option.value = doctor.id;
                option.textContent = `${doctor.name} - ${doctor.department}`;
                option.setAttribute('data-department', doctor.department);
                select.appendChild(option);
            }
        });
    } catch (error) {
        console.error('Error loading doctors:', error);
        showError(document.getElementById('appointmentsList'), 'Failed to load doctors. Please try again.');
    }
}

function updateDepartment(doctorId) {
    const select = document.getElementById('doctorSelect');
    const selectedOption = select.options[select.selectedIndex];
    const department = selectedOption.getAttribute('data-department');
    document.getElementById('department').value = department || '';
}

async function loadAppointments() {
    const user = getUser();
    if (!user || !user.id) {
        return;
    }
    
    try {
        const appointments = await API.getPatientAppointments(user.id);
        displayAppointments(appointments);
    } catch (error) {
        console.error('Error loading appointments:', error);
    }
}

function displayAppointments(appointments) {
    const container = document.getElementById('appointmentsList');
    
    if (!appointments || appointments.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5 text-muted">
                <i class="bi bi-calendar-x fs-1 d-block mb-3"></i>
                <p>No appointments yet. Book your first appointment!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = appointments.map(appointment => `
        <div class="card mb-3">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <h6 class="card-title mb-0">Dr. ${appointment.doctorName || 'Unknown'}</h6>
                    ${getStatusBadge(appointment.status)}
                </div>
                <div class="text-muted small">
                    <p class="mb-1"><i class="bi bi-calendar3 me-2"></i>${formatDate(appointment.appointmentDate)}</p>
                    <p class="mb-1"><i class="bi bi-clock me-2"></i>${formatTime(appointment.appointmentTime)}</p>
                    <p class="mb-0"><i class="bi bi-building me-2"></i>${appointment.department || 'N/A'}</p>
                </div>
                ${appointment.reason ? `<p class="mt-2 mb-0"><small>${appointment.reason}</small></p>` : ''}
            </div>
        </div>
    `).join('');
}

async function handleAppointmentSubmit(e) {
    e.preventDefault();
    
    const user = getUser();
    if (!user || !user.id) {
        alert('Please login first');
        window.location.href = 'login.html';
        return;
    }
    
    const formData = {
        patientId: user.id,
        doctorId: document.getElementById('doctorSelect').value,
        appointmentDate: document.getElementById('appointmentDate').value,
        appointmentTime: document.getElementById('appointmentTime').value,
        department: document.getElementById('department').value,
        reason: document.getElementById('reason').value,
        status: 'PENDING',
        type: 'IN_PERSON'
    };
    
    if (!formData.doctorId || !formData.appointmentDate || !formData.appointmentTime || !formData.reason) {
        alert('Please fill in all required fields');
        return;
    }
    
    try {
        const appointment = await API.createAppointment(formData);
        alert('Appointment requested successfully!');
        
        // Reset form
        document.getElementById('appointmentForm').reset();
        document.getElementById('department').value = '';
        
        // Reload appointments
        loadAppointments();
    } catch (error) {
        console.error('Error creating appointment:', error);
        alert('Failed to create appointment. Please try again.');
    }
}

