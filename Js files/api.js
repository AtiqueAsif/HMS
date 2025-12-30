// API Service for Hospital Management System
// Base URL for backend API
const API_BASE_URL = 'http://localhost:8080/api';

// Helper function to get auth token
function getAuthToken() {
    return localStorage.getItem('token');
}

// Helper function to get user data
function getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

// Helper function to set user data
function setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
}

// Helper function to clear auth data
function clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('patient');
}

// Generic API request function
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = getAuthToken();
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
    };
    
    if (token) {
        defaultOptions.headers['Authorization'] = `Bearer ${token}`;
    }
    
    const finalOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...(options.headers || {}),
        },
    };
    
    try {
        const response = await fetch(url, finalOptions);
        
        if (response.status === 401) {
            clearAuth();
            window.location.href = 'login.html';
            return null;
        }
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}

// API Service Object
const API = {
    // Patient endpoints
    async getPatients() {
        return await apiRequest('/patients');
    },
    
    async getPatient(id) {
        return await apiRequest(`/patients/${id}`);
    },
    
    async loginPatient(patientId, password) {
        const response = await fetch(`${API_BASE_URL}/patients/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ patientId, password }),
        });
        
        if (response.ok) {
            return await response.json();
        }
        return null;
    },
    
    async registerPatient(patientData) {
        return await apiRequest('/patients/register', {
            method: 'POST',
            body: JSON.stringify(patientData),
        });
    },
    
    // Doctor endpoints
    async getDoctors() {
        return await apiRequest('/doctors');
    },
    
    async getDoctor(id) {
        return await apiRequest(`/doctors/${id}`);
    },
    
    async getDoctorsByDepartment(department) {
        return await apiRequest(`/doctors/department/${encodeURIComponent(department)}`);
    },
    
    async searchDoctors(name) {
        return await apiRequest(`/doctors/search?name=${encodeURIComponent(name)}`);
    },
    
    async getDepartments() {
        return await apiRequest('/doctors/departments');
    },
    
    // Appointment endpoints
    async getAppointments() {
        return await apiRequest('/appointments');
    },
    
    async getPatientAppointments(patientId) {
        return await apiRequest(`/appointments/patient/${patientId}`);
    },
    
    async getDoctorAppointments(doctorId) {
        return await apiRequest(`/appointments/doctor/${doctorId}`);
    },
    
    async createAppointment(appointmentData) {
        return await apiRequest('/appointments', {
            method: 'POST',
            body: JSON.stringify(appointmentData),
        });
    },
    
    async updateAppointmentStatus(id, status) {
        return await apiRequest(`/appointments/${id}/status?status=${status}`, {
            method: 'PUT',
        });
    },
    
    // Emergency endpoints
    async bookAmbulance(bookingData) {
        return await apiRequest('/emergency/ambulance', {
            method: 'POST',
            body: JSON.stringify(bookingData),
        });
    },
    
    async requestCallBack(phoneNumber) {
        return await apiRequest('/emergency/ambulance/call-me', {
            method: 'POST',
            body: JSON.stringify({ phoneNumber }),
        });
    },
    
    async getBloodBankInventory() {
        return await apiRequest('/emergency/blood-bank');
    },
    
    async requestBlood(requestData) {
        return await apiRequest('/emergency/blood-bank/request', {
            method: 'POST',
            body: JSON.stringify(requestData),
        });
    },
    
    // Report endpoints
    async getPatientReports(patientId) {
        return await apiRequest(`/reports/patient/${patientId}`);
    },
    
    async getReport(id) {
        return await apiRequest(`/reports/${id}`);
    },
    
    // Funding endpoints
    async createFundingRequest(requestData) {
        return await apiRequest('/funding/request', {
            method: 'POST',
            body: JSON.stringify(requestData),
        });
    },
    
    async getPatientFundingRequests(patientId) {
        return await apiRequest(`/funding/patient/${patientId}`);
    },
    
    async getAllFundingRequests() {
        return await apiRequest('/funding/all');
    },
    
    async getNGOs() {
        return await apiRequest('/funding/ngos');
    },
    
    async approveFundingRequest(id, adminNotes) {
        return await apiRequest(`/funding/${id}/approve`, {
            method: 'PUT',
            body: JSON.stringify({ adminNotes }),
        });
    },
    
    async rejectFundingRequest(id, adminNotes) {
        return await apiRequest(`/funding/${id}/reject`, {
            method: 'PUT',
            body: JSON.stringify({ adminNotes }),
        });
    },
    
    // Hospital Transfer endpoints
    async createHospitalTransfer(transferData) {
        return await apiRequest('/hospital-transfers', {
            method: 'POST',
            body: JSON.stringify(transferData),
        });
    },
    
    async getHospitalList() {
        return await apiRequest('/hospital-transfers/hospitals');
    },
    
    // Pandemic endpoints
    async getPandemicInfo() {
        return await apiRequest('/pandemic');
    },

    // AI assistant endpoints
    async askAI(question) {
        return await apiRequest('/ai/ask', {
            method: 'POST',
            body: JSON.stringify({ question }),
        });
    },
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API;
}

