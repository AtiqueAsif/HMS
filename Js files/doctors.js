// Doctors Page JavaScript

let allDoctors = [];
const DEPT_MAP = {
    'Orthopaedics': ['Orthopedics'],
    'Child Development / Counselling': ['Pediatrics', 'Counselling Center'],
    'Medicine': ['Medicine'],
    'Cardiology': ['Cardiology'],
    'Dermatology': ['Dermatology'],
    'Neurology': ['Neurology']
};
const DEPT_DESC = {
    'Medicine': 'General medicine and internal medicine services',
    'Orthopaedics': 'Bone, joint, and musculoskeletal system care',
    'Cardiology': 'Heart and cardiovascular system treatment',
    'Child Development / Counselling': 'Pediatric care and child development services',
    'Dermatology': 'Skin, hair, and nail care',
    'Neurology': 'Brain and nervous system care'
};

document.addEventListener('DOMContentLoaded', function() {
    loadDepartments();
    loadDoctors();
    document.getElementById('searchInput').addEventListener('input', debounce(filterDoctors, 300));
    const deptSelect = document.getElementById('departmentFilter');
    deptSelect.addEventListener('change', function(){
        const help = document.getElementById('departmentHelp');
        if (help) {
            help.textContent = DEPT_DESC[this.value] || '';
        }
        filterDoctors();
    });
    document.getElementById('experienceFilter').addEventListener('change', filterDoctors);
});

async function loadDoctors() {
    try {
        allDoctors = await API.getDoctors();
        displayDoctors(allDoctors);
    } catch (error) {
        console.error('Error loading doctors:', error);
        document.getElementById('doctorsContainer').innerHTML = `
            <div class="alert alert-danger">
                <i class="bi bi-exclamation-triangle me-2"></i>
                Failed to load doctors. Please try again later.
            </div>
        `;
    }
}

function filterDoctors() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const department = document.getElementById('departmentFilter').value;
    const experience = document.getElementById('experienceFilter').value;
    
    let filtered = allDoctors;
    
    if (searchTerm) {
        filtered = filtered.filter(doctor => 
            doctor.name.toLowerCase().includes(searchTerm) ||
            (doctor.specialization && doctor.specialization.toLowerCase().includes(searchTerm))
        );
    }
    
    if (department) {
        const map = DEPT_MAP[department];
        if (map && map.length) {
            filtered = filtered.filter(doctor => doctor.department && map.some(m => doctor.department.toLowerCase() === m.toLowerCase()));
        } else {
            filtered = filtered.filter(doctor => doctor.department && doctor.department.toLowerCase() === department.toLowerCase());
        }
    }
    
    if (experience) {
        filtered = filtered.filter(doctor => 
            doctor.experienceLevel && doctor.experienceLevel.toLowerCase() === experience
        );
    }
    
    displayDoctors(filtered);
}

function displayDoctors(doctors) {
    const container = document.getElementById('doctorsContainer');
    
    if (!doctors || doctors.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-person-x fs-1 text-muted d-block mb-3"></i>
                <h5 class="text-muted">No doctors found</h5>
                <p class="text-muted">Try adjusting your search or filter criteria</p>
            </div>
        `;
        return;
    }
    
    // Group doctors by department
    const doctorsByDepartment = {};
    doctors.forEach(doctor => {
        const dept = doctor.department || 'Other';
        if (!doctorsByDepartment[dept]) {
            doctorsByDepartment[dept] = [];
        }
        doctorsByDepartment[dept].push(doctor);
    });
    
    // Sort departments alphabetically
    const sortedDepartments = Object.keys(doctorsByDepartment).sort();
    
    // Build HTML with departments and their doctors
    let html = `
        <div class="mb-4">
            <p class="text-muted">Showing ${doctors.length} of ${allDoctors.length} doctors</p>
        </div>
    `;
    
    sortedDepartments.forEach(department => {
        const departmentDoctors = doctorsByDepartment[department];
        html += `
            <div class="mb-5">
                <div class="d-flex align-items-center mb-4">
                    <div class="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 50px; height: 50px;">
                        <i class="bi bi-building fs-4 text-primary"></i>
                    </div>
                    <div>
                        <h2 class="fw-bold mb-0">${department}</h2>
                        <p class="text-muted small mb-0">${departmentDoctors.length} doctor${departmentDoctors.length !== 1 ? 's' : ''}</p>
                    </div>
                </div>
                <div class="row g-4">
                    ${departmentDoctors.map(doctor => createDoctorCard(doctor)).join('')}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function createDoctorCard(doctor) {
    const experienceBadge = getExperienceBadge(doctor.experienceLevel);
    const availableBadge = doctor.isAvailable 
        ? '<span class="badge bg-success">Available</span>' 
        : '<span class="badge bg-secondary">Unavailable</span>';
    
    return `
        <div class="col-md-6 col-lg-4">
            <div class="card h-100 shadow-sm">
                <div class="card-body">
                    <div class="d-flex align-items-center mb-3">
                        <div class="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 60px; height: 60px;">
                            <i class="bi bi-person-fill fs-3 text-primary"></i>
                        </div>
                        <div>
                            <h5 class="card-title mb-0">${doctor.name}</h5>
                            <p class="text-muted small mb-0">${doctor.department}</p>
                            ${experienceBadge}
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <p class="small mb-1"><i class="bi bi-mortarboard me-2"></i>${doctor.qualification || 'N/A'}</p>
                        ${doctor.specialization ? `<p class="small mb-1"><i class="bi bi-briefcase me-2"></i>${doctor.specialization}</p>` : ''}
                        <p class="small mb-0">${availableBadge}</p>
                    </div>
                    
                    <div class="d-grid gap-2">
                        <a href="doctor-profile.html?id=${doctor.id}" class="btn btn-outline-primary btn-sm">
                            <i class="bi bi-eye me-2"></i>View Profile
                        </a>
                        <a href="appointments.html?doctor=${doctor.id}" class="btn btn-primary btn-sm">
                            <i class="bi bi-calendar-plus me-2"></i>Book Now
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getExperienceBadge(level) {
    if (!level) return '';
    
    const levelLower = level.toLowerCase();
    let badgeClass = 'bg-secondary';
    let text = level;
    
    if (levelLower === 'senior') {
        badgeClass = 'bg-success';
    } else if (levelLower === 'specialist') {
        badgeClass = 'bg-primary';
    }
    
    return `<span class="badge ${badgeClass}">${text}</span>`;
}

async function loadDepartments() {
    try {
        const depts = await API.getDepartments();
        const select = document.getElementById('departmentFilter');
        if (!select) return;
        select.innerHTML = '<option value="">All Departments</option>' +
            (depts || []).sort().map(d => `<option value="${escapeHtml(d)}">${escapeHtml(d)}</option>`).join('');
    } catch (e) {
        // keep existing options if backend fails
    }
}

function escapeHtml(text){
    if(typeof text !== 'string') return text;
    return text
        .replaceAll('&','&amp;')
        .replaceAll('<','&lt;')
        .replaceAll('>','&gt;')
        .replaceAll('"','&quot;')
        .replaceAll("'",'&#039;');
}
