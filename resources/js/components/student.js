import React, { useState, useMemo, useEffect } from 'react';
// Feather icons via react-icons for a minimalist look
// Alias some icons to the short names used in JSX (Plus, Save, ArrowLeft)
import {
    FiSearch,
    FiChevronDown,
    FiPlus as Plus,
    FiPlus,
    FiEdit3,
    FiTrash2,
    FiUser,
    FiMenu,
    FiX,
    FiArrowLeft as ArrowLeft,
    FiArrowLeft,
    FiSave as Save,
    FiSave
} from 'react-icons/fi';

// NOTE: Replaced local MOCK_STUDENTS with real API integration.
// Configure your API base if needed (e.g. process.env.MIX_API_URL). By default it uses the Laravel conventional /api/students endpoint.
const API_BASE = '/api/students';

// Normalize backend student objects (snake_case) into the PascalCase shape the React UI expects.
const normalizeStudent = (s = {}) => {
    // keep original reference but expose the UI-friendly properties
    const student = { ...s };
    student.StudentID = student.StudentID ?? student.student_id ?? student.studentId ?? null;
    student.FirstName = student.FirstName ?? student.first_name ?? (student.name ? String(student.name).split(' ')[0] : null) ?? null;
    student.LastName = student.LastName ?? student.last_name ?? (student.name ? String(student.name).split(' ').slice(1).join(' ') : null) ?? null;
    student.Name = student.Name ?? student.name ?? `${student.FirstName || ''} ${student.LastName || ''}`.trim();
    student.Email = student.Email ?? student.email ?? null;
    student.PhoneNumber = student.PhoneNumber ?? student.phone_number ?? null;
    student.ProfilePicture = student.ProfilePicture ?? student.profile_picture ?? student.avatar ?? null;
    student.Course = student.Course ?? student.course ?? null;
    student.Department = student.Department ?? student.department ?? null;
    student.EnrollmentDate = student.EnrollmentDate ?? student.enrollment_date ?? null;
    student.Status = student.Status ?? student.status ?? 'Active';
    student.AcademicYear = student.AcademicYear ?? student.academic_year ?? null;
    student.Region = student.Region ?? student.region ?? null;
    student.Province = student.Province ?? student.province ?? null;
    student.City = student.City ?? student.city ?? null;
    // ensure id exists (Eloquent returns id)
    student.id = student.id ?? student.ID ?? null;
    return student;
}
// --- CSRF / helper utilities ---
const getCsrfToken = () => document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

const ensureCsrfCookie = async () => {
    // If using Laravel Sanctum/session auth this will set the XSRF-TOKEN cookie.
    try {
        await fetch('/sanctum/csrf-cookie', { credentials: 'same-origin' });
    } catch (e) {
        // don't block — surface errors later
        console.warn('ensureCsrfCookie failed', e);
    }
};


const COURSES = ['Computer Science', 'Business Administration', 'Biology', 'Psychology', 'History', 'Electrical Engineering'];
const DEPARTMENTS = ['Engineering', 'Business', 'Sciences', 'Humanities'];
const STATUS_OPTIONS = ['Active', 'Inactive', 'On Leave', 'Graduated', 'Suspended', 'Archived'];
const ACADEMIC_YEARS = ['2021-2022', '2022-2023', '2023-2024', '2024-2025'];
const YEAR_LEVELS = ['1', '2', '3', '4', '5'];

// Minimal Philippines region / province / city dataset (representative).
// Expand as needed; this is used to populate dependent selects: Region -> Province -> City
const PH_LOCATIONS = {
    'NCR': {
        provinces: {
            'Metro Manila': ['Manila', 'Quezon City', 'Makati', 'Pasig', 'Taguig']
        }
    },
    'Region I (Ilocos Region)': {
        provinces: {
            'Ilocos Norte': ['Laoag', 'Batac'],
            'Ilocos Sur': ['Vigan', 'Candon']
        }
    },
    'Region IV-A (CALABARZON)': {
        provinces: {
            'Cavite': ['Imus', 'Bacoor'],
            'Laguna': ['Calamba', 'San Pablo'],
            'Batangas': ['Batangas City', 'Lipa']
        }
    },
    'Region VII (Central Visayas)': {
        provinces: {
            'Cebu': ['Cebu City', 'Mandaue', 'Lapu-Lapu'],
            'Bohol': ['Tagbilaran']
        }
    },
    'Region XI (Davao Region)': {
        provinces: {
            'Davao del Sur': ['Davao City', 'Digos'],
            'Davao del Norte': ['Tagum']
        }
    }
};

// --- Main App Component (Handles State and Navigation) ---
export default function StudentDashboard() {
    const [view, setView] = useState('list'); // 'list', 'add', 'edit'
    const [students, setStudents] = useState([]);
    const [currentStudent, setCurrentStudent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(API_BASE, { 
                credentials: 'same-origin',
                headers: { 'Accept': 'application/json' }
            });
            if (!res.ok) {
                let body;
                try { body = await res.json(); } catch { body = await res.text(); }
                throw new Error(`Failed to fetch students: ${res.status} ${JSON.stringify(body)}`);
            }
            const data = await res.json();
            // Normalize backend fields to what the UI expects
            const list = Array.isArray(data) ? data.map(normalizeStudent) : [];
            setStudents(list);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddNew = () => setShowAddModal(true);

    const handleEdit = (student) => {
        setCurrentStudent(student);
        setShowEditModal(true);
    };

    const handleCancel = () => {
        setCurrentStudent(null);
        setView('list');
    };
    
    // CREATE: Persist a new student to the backend and update UI
    const handleSaveNewStudent = async (newStudent) => {
        try {
            setLoading(true);
            await ensureCsrfCookie();
            const csrf = getCsrfToken();

            const res = await fetch(API_BASE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(csrf ? { 'X-CSRF-TOKEN': csrf } : {})
                },
                credentials: 'same-origin',
                body: JSON.stringify(newStudent),
            });

            // read text then try to parse JSON so we can show helpful info for HTML error pages too
            const rawText = await res.text();
            let parsedBody;
            const contentType = res.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
                try { parsedBody = JSON.parse(rawText); } catch (e) { parsedBody = rawText; }
            } else {
                parsedBody = rawText;
            }

            if (!res.ok) {
                console.error('Create student failed response:', res.status, parsedBody);
                // build a readable error message
                const bodyMsg = typeof parsedBody === 'object' ? (parsedBody.message || JSON.stringify(parsedBody)) : String(parsedBody);
                throw new Error(`Create failed: ${res.status} ${bodyMsg}`);
            }

            // success
            const created = parsedBody;
            // Normalize server response before appending to UI state
            const normalized = normalizeStudent(created);
            setStudents(prev => [...prev, normalized]);
            setView('list');
        } catch (err) {
            console.error('Failed to create student (caught):', err);
            alert('Failed to create student: ' + (err.message || err));
        } finally {
            setLoading(false);
        }
    };
    
    // UPDATE: Persist updated student to backend and update UI
    const handleUpdateStudent = async (updatedStudent) => {
        try {
            setLoading(true);
            await ensureCsrfCookie();
            const csrf = getCsrfToken();
            const idSegment = encodeURIComponent(updatedStudent.id ?? updatedStudent.StudentID);
            const res = await fetch(`${API_BASE}/${idSegment}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(csrf ? { 'X-CSRF-TOKEN': csrf } : {})
                },
                credentials: 'same-origin',
                body: JSON.stringify(updatedStudent),
            });
            if (!res.ok) {
                let errBody;
                try { errBody = await res.json(); } catch { errBody = await res.text(); }
                throw new Error(`Update failed: ${res.status} ${errBody}`);
            }
            const saved = await res.json();
            const savedNormalized = normalizeStudent(saved);
            setStudents(prevStudents => 
                prevStudents.map(student => {
                    if (savedNormalized.id && student.id) return student.id === savedNormalized.id ? savedNormalized : student;
                    if (savedNormalized.StudentID && student.StudentID) return student.StudentID === savedNormalized.StudentID ? savedNormalized : student;
                    return student;
                })
            );
            setView('list');
            setCurrentStudent(null);
        } catch (err) {
            console.error(err);
            alert('Failed to update student: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // DELETE: Remove from backend then update UI
    const handleDelete = async (studentId) => {
        // Soft-archive flow: set Status to 'Archived' via update API (avoids hard delete).
        if (!window.confirm(`Archive student ${studentId}? This will mark the student as Archived.`)) return;
        try {
            setLoading(true);
            // find the student locally
            const target = students.find(s => String(s.StudentID) === String(studentId) || String(s.id) === String(studentId));
            if (!target) throw new Error('Student not found locally');
            const updated = { ...target, Status: 'Archived' };
            await handleUpdateStudent(updated);
        } catch (err) {
            console.error(err);
            alert('Failed to archive student: ' + err.message);
        } finally {
            setLoading(false);
        }
    };


    return (
        // SCSS body style handles the main background and font.
        <div className="main-app-wrapper"> 
            <main className="container">
                <StudentListPage 
                    students={students} 
                    onAddNew={handleAddNew} 
                    onEdit={handleEdit}
                    onArchive={handleDelete}
                    loading={loading}
                    error={error}
                />

                {showAddModal && (
                    <AddStudentModal 
                        onSave={async (payload) => {
                            await handleSaveNewStudent(payload);
                            setShowAddModal(false);
                        }}
                        onClose={() => setShowAddModal(false)}
                    />
                )}

                {showEditModal && currentStudent && (
                    <EditStudentModal 
                        student={currentStudent}
                        onSave={async (payload) => {
                            await handleUpdateStudent(payload);
                            setShowEditModal(false);
                            setCurrentStudent(null);
                        }}
                        onClose={() => { setShowEditModal(false); setCurrentStudent(null); }}
                    />
                )}
            </main>
        </div>
    );
}

// --- Page Components ---
const StudentListPage = ({ students, onAddNew, onEdit, onArchive, loading, error }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ course: '', department: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const totalStudents = students.length;

    // READ: Filter and search logic
    const filteredStudents = useMemo(() => {
        let result = students;
        if (filters.course && filters.course !== 'All') result = result.filter(s => s.Course === filters.course || s.course === filters.course);
        if (filters.department && filters.department !== 'All') result = result.filter(s => s.Department === filters.department || s.department === filters.department);
        if (searchTerm) {
            const lowerCaseSearch = searchTerm.toLowerCase();
            result = result.filter(s =>
                (s.Name && s.Name.toLowerCase().includes(lowerCaseSearch)) ||
                (s.StudentID && s.StudentID.toLowerCase().includes(lowerCaseSearch)) ||
                (s.FirstName && s.FirstName.toLowerCase().includes(lowerCaseSearch)) ||
                (s.LastName && s.LastName.toLowerCase().includes(lowerCaseSearch)) ||
                (s.id && String(s.id).includes(lowerCaseSearch))
            );
        }
        return result;
    }, [students, searchTerm, filters]);

    const paginatedStudents = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredStudents.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredStudents, currentPage, itemsPerPage]);

    return (
        <div className="student-dashboard">
            <section className="student-header-card">
                <div>
                    <p className="eyebrow">Student Management</p>
                    <h1>Client Data</h1>
                    <p className="subtext">Manage student records — add, edit, and keep everything organized.</p>
                </div>
                <div className="student-header-actions">
                    <div className="search-input">
                        <FiSearch />
                        <input
                            type="text"
                            placeholder="Search by name or ID"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="header-buttons">
                        <button className="filter-pill" type="button">
                            <FiChevronDown className="icon" /> Filter
                        </button>
                        <button onClick={onAddNew} className="add-student-btn"><FiPlus className="h-4 w-4"/> Add New</button>
                    </div>
                </div>
            </section>
            <section className="filter-panel">
                <div className="filter-select">
                    <label>Course</label>
                    <select value={filters.course || 'All'} onChange={(e) => setFilters(prev => ({ ...prev, course: e.target.value === 'All' ? '' : e.target.value }))}>
                        <option value="All">All courses</option>
                        {COURSES.map(course => <option key={course} value={course}>{course}</option>)}
                    </select>
                </div>
                <div className="filter-select">
                    <label>Department</label>
                    <select value={filters.department || 'All'} onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value === 'All' ? '' : e.target.value }))}>
                        <option value="All">All departments</option>
                        {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                    </select>
                </div>
                <button type="button" className="reset-link" onClick={() => setFilters({ course: '', department: '' })}>Reset filters</button>
            </section>

            {loading ? (
                <div className="loading">Loading students...</div>
            ) : error ? (
                <div className="error">Error loading students: {error}</div>
            ) : (
                <>
                    <StudentTable students={paginatedStudents} onEdit={onEdit} onArchive={onArchive} />
                    <Pagination 
                        totalItems={filteredStudents.length} 
                        itemsPerPage={itemsPerPage} 
                        currentPage={currentPage} 
                        onPageChange={setCurrentPage} 
                    />
                </>
            )}
        </div>
    );
};


// NOTE: Add/Edit pages are given minimal styling as the SCSS focuses on the List page.
const AddStudentPage = ({ onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        FirstName: '',
        LastName: '',
        Sex: 'Male',
        EnrollmentDate: '',
        Address: '',
        PhoneNumber: '',
        Email: '',
        ProfilePicture: '',
        Course: COURSES[0],
        Department: DEPARTMENTS[0],
        AcademicYear: ACADEMIC_YEARS[0],
        Status: STATUS_OPTIONS[0]
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if(formData.FirstName.trim() === '' || formData.LastName.trim() === '') {
            alert('Please enter first and last name.');
            return;
        }
        const payload = {
            FirstName: formData.FirstName,
            LastName: formData.LastName,
            Name: `${formData.FirstName} ${formData.LastName}`,
            Sex: formData.Sex,
            EnrollmentDate: formData.EnrollmentDate,
            Address: formData.Address,
            PhoneNumber: formData.PhoneNumber,
            Email: formData.Email,
            ProfilePicture: formData.ProfilePicture,
            Course: formData.Course,
            Department: formData.Department,
            AcademicYear: formData.AcademicYear,
            Status: formData.Status
        };
        onSave(payload);
    };
    
    return (
        <div className="form-page-wrapper">
            <button onClick={onCancel} className="back-btn">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Student List
            </button>
            <div className="form-container">
                <h1 className="form-title">Add New Student</h1>
                <form onSubmit={handleSubmit} className="form-content">
                    <div className="form-group-grid">
                        <InputField label="Student ID" placeholder="Will be auto-generated" disabled />
                        <InputField label="First Name" placeholder="First name" name="FirstName" value={formData.FirstName} onChange={handleChange} required />
                        <InputField label="Last Name" placeholder="Last name" name="LastName" value={formData.LastName} onChange={handleChange} required />
                    </div>
                    <div className="form-group-grid">
                        <div className="form-field">
                            <label className="form-label">Sex</label>
                            <div className="radio-group-inline">
                                <RadioField label="Male" name="Sex" value="Male" checked={formData.Sex === 'Male'} onChange={handleChange} />
                                <RadioField label="Female" name="Sex" value="Female" checked={formData.Sex === 'Female'} onChange={handleChange} />
                                <RadioField label="Other" name="Sex" value="Other" checked={formData.Sex === 'Other'} onChange={handleChange} />
                            </div>
                        </div>
                        <InputField label="Enrollment Date" name="EnrollmentDate" type="date" value={formData.EnrollmentDate} onChange={handleChange} />
                    </div>
                    <div className="form-group-grid">
                        <SelectField label="Course" name="Course" value={formData.Course} onChange={handleChange} options={COURSES} />
                        <SelectField label="Department" name="Department" value={formData.Department} onChange={handleChange} options={DEPARTMENTS} />
                    </div>
                    <div className="form-group-grid">
                        <SelectField label="Academic Year" name="AcademicYear" value={formData.AcademicYear} onChange={handleChange} options={ACADEMIC_YEARS} />
                        <SelectField label="Status" name="Status" value={formData.Status} onChange={handleChange} options={STATUS_OPTIONS} />
                    </div>
                    <InputField label="Email" name="Email" type="email" value={formData.Email} onChange={handleChange} />
                    <InputField label="Phone Number" name="PhoneNumber" value={formData.PhoneNumber} onChange={handleChange} />
                    <div className="form-field">
                        <label className="form-label">Address</label>
                        <textarea name="Address" value={formData.Address} onChange={handleChange} className="form-textarea" />
                    </div>
                    <InputField label="Profile Picture (URL)" name="ProfilePicture" value={formData.ProfilePicture} onChange={handleChange} placeholder="Optional URL to profile image" />
                    <div className="form-actions">
                        <button type="button" onClick={onCancel} className="cancel-btn">Cancel</button>
                        <button type="submit" className="submit-btn add-student-btn">
                           <Save className="h-4 w-4" />
                           Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const EditStudentPage = ({ student, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        FirstName: student?.FirstName || student?.Name?.split(' ')[0] || '',
        LastName: student?.LastName || (student?.Name ? student.Name.split(' ').slice(1).join(' ') : '') || '',
        Sex: student?.Sex || 'Male',
        EnrollmentDate: student?.EnrollmentDate || '',
        Address: student?.Address || '',
        PhoneNumber: student?.PhoneNumber || '',
        Email: student?.Email || '',
        ProfilePicture: student?.ProfilePicture || '',
        Course: student?.Course || COURSES[0],
        Department: student?.Department || DEPARTMENTS[0],
        AcademicYear: student?.AcademicYear || ACADEMIC_YEARS[0],
        Status: student?.Status || STATUS_OPTIONS[0],
        StudentID: student?.StudentID || ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
         if(formData.Name?.trim() === '' && (formData.FirstName.trim() === '' || formData.LastName.trim() === '')) {
            alert('Full name cannot be empty.');
            return;
        }
        const payload = {
            ...formData,
            Name: `${formData.FirstName} ${formData.LastName}`
        };
        // include StudentID for server identification if present
        if(student?.StudentID) payload.StudentID = student.StudentID;
        onSave(payload);
    };

    return (
        <div className="form-page-wrapper">
             <button onClick={onCancel} className="back-btn">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Student List
            </button>
            <div className="form-container">
                <h1 className="form-title">Edit Student Record</h1>
                <form onSubmit={handleSubmit} className="form-content space-y-8">
                    <div className="form-section">
                        <h2 className="form-subtitle">Personal Information</h2>
                        <div className="form-group-grid">
                            <InputField label="Student ID" value={formData.StudentID} readOnly disabled />
                            <InputField label="First Name" name="FirstName" value={formData.FirstName} onChange={handleChange} required />
                            <InputField label="Last Name" name="LastName" value={formData.LastName} onChange={handleChange} required />
                        </div>
                    </div>
                    <div className="form-section">
                        <h2 className="form-subtitle">Academic Details</h2>
                         <div className="form-group-grid">
                            <SelectField label="Course" name="Course" value={formData.Course} onChange={handleChange} options={COURSES} />
                            <SelectField label="Department" name="Department" value={formData.Department} onChange={handleChange} options={DEPARTMENTS} />
                        </div>
                    </div>
                    <div className="form-section">
                        <h2 className="form-subtitle">Status</h2>
                        <div className="radio-group">
                           {STATUS_OPTIONS.map(status => (
                               <RadioField key={status} label={status} name="Status" value={status} checked={formData.Status === status} onChange={handleChange} />
                           ))}
                        </div>
                    </div>
                    <div className="form-section">
                        <h2 className="form-subtitle">Contact</h2>
                        <div className="form-group-grid">
                            <InputField label="Email" name="Email" type="email" value={formData.Email} onChange={handleChange} />
                            <InputField label="Phone Number" name="PhoneNumber" value={formData.PhoneNumber} onChange={handleChange} />
                        </div>
                        <div className="form-field">
                            <label className="form-label">Address</label>
                            <textarea name="Address" value={formData.Address} onChange={handleChange} className="form-textarea" />
                        </div>
                        <InputField label="Profile Picture (URL)" name="ProfilePicture" value={formData.ProfilePicture} onChange={handleChange} />
                    </div>
                    <div className="form-actions">
                        <button type="button" onClick={onCancel} className="cancel-btn">Cancel</button>
                        <button type="submit" className="submit-btn add-student-btn">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- Reusable UI Components ---

const Navbar = () => {
    // Mobile menu state is intentionally kept, though SCSS only defines desktop layout.
    const [isOpen, setIsOpen] = useState(false);
    return (
        <header className="navbar">
            <div className="navbar-left">
                <span className="logo">✳ logo</span>
                <nav className="nav-desktop">
                    <a href="#" className="nav-item active">Students</a>
                    <a href="#" className="nav-item">Reports</a>
                    <a href="#" className="nav-item">System Settings</a>
                </nav>
            </div>
            <div className="navbar-right">
                <FiSearch className="search-icon" />
                <div className="profile-pic">
                    <FiUser className="profile-icon" />
                </div>
                {/* Mobile menu button (no SCSS for mobile menu, keeping it functional) */}
                <button className="menu-toggle-btn" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
                </button>
            </div>
            {/* Simple mobile menu overlay for functionality */}
            {isOpen && (
                <nav className="mobile-nav-menu">
                    <a href="#" className="nav-item active">Students</a>
                    <a href="#" className="nav-item">Reports</a>
                    <a href="#" className="nav-item">System Settings</a>
                </nav>
            )}
        </header>
    );
};

const StudentTable = ({ students, onEdit, onArchive }) => {
    return (
        <div className="student-table-card">
            <table>
                <thead>
                    <tr>
                        {['Avatar', 'Student ID', 'First Name', 'Last Name', 'Department', 'Actions'].map(header => (
                            <th key={header} scope="col">{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {students && students.length > 0 ? (
                        students.map((student) => (
                            <tr key={student.StudentID || student.id}>
                                <td className="avatar-cell">
                                    {student.ProfilePicture ? (
                                        <img src={student.ProfilePicture} alt="avatar" className="avatar-img" />
                                    ) : (
                                        <FiUser className="h-6 w-6 avatar-placeholder" />
                                    )}
                                </td>
                                <td className="student-id-cell">{student.StudentID}</td>
                                <td>{student.FirstName || (student.Name && student.Name.split(' ')[0])}</td>
                                <td>{student.LastName || (student.Name && student.Name.split(' ').slice(1).join(' '))}</td>
                                <td>{student.Department}</td>
                                <td className="actions">
                                    <button onClick={() => onEdit(student)} className="action-btn edit-btn" title="Edit Record"><FiEdit3 className="h-4 w-4" /></button>
                                    <button onClick={() => onArchive(student.StudentID || student.id)} className="action-btn archive-btn" title="Archive Record"><FiTrash2 className="h-4 w-4" /></button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={6} className="no-students">No students found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

const Pagination = ({ totalItems, itemsPerPage, currentPage, onPageChange }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return null;

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className="pagination">
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
            <div className="page-numbers">
                {pages.map(page => (
                    <button key={page} onClick={() => onPageChange(page)} className={currentPage === page ? 'active' : ''}>{page}</button>
                ))}
            </div>
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
        </div>
    );
};



// --- Form Field Components ---
// These are given minimal, non-Tailwind-specific classes for integration with the dark mode.
const InputField = React.forwardRef(({ label, ...props }, ref) => (
    <div className="form-field">
        <label className="form-label">{label}</label>
        <input ref={ref} {...props} className={`form-input ${props.disabled ? 'disabled-input' : ''}`} />
    </div>
));

const SelectField = ({ label, options, ...props }) => (
     <div className="form-field">
        <label className="form-label">{label}</label>
        {/* Reusing .filter-dropdown styling for a select field in the form */}
        <select {...props} className="form-select filter-dropdown"> 
            {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
    </div>
);

const RadioField = ({ label, ...props }) => (
    <label className="radio-label">
        <input type="radio" {...props} className="radio-input" />
        <span>{label}</span>
    </label>
);

// --- Modal Components: Add / Edit student in modal dialogs ---
const AddStudentModal = ({ onSave, onClose }) => {
    const [formData, setFormData] = useState({
        FirstName: '', LastName: '', Sex: 'Male', EnrollmentDate: '', Address: '', PhoneNumber: '', Email: '', ProfilePicture: '', Course: COURSES[0], Department: DEPARTMENTS[0], AcademicYear: ACADEMIC_YEARS[0], Status: STATUS_OPTIONS[0], Region: '', Province: '', City: ''
    });
    const [provinceOptions, setProvinceOptions] = useState([]);
    const [cityOptions, setCityOptions] = useState([]);
    const [avatarPreview, setAvatarPreview] = useState('');
    const dialogRef = React.useRef(null);
    const firstInputRef = React.useRef(null);

    useEffect(() => {
        // focus the first input when the modal opens
        try { firstInputRef.current?.focus(); } catch (e) {}
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRegionChange = (e) => {
        const region = e.target.value;
        setFormData(prev => ({ ...prev, Region: region, Province: '', City: '' }));
        if (!region) { setProvinceOptions([]); setCityOptions([]); return; }
        const provincesObj = PH_LOCATIONS[region]?.provinces || {};
        const provinces = Object.keys(provincesObj);
        setProvinceOptions(provinces);
        setCityOptions([]);
    };

    const handleProvinceChange = (e) => {
        const prov = e.target.value;
        setFormData(prev => ({ ...prev, Province: prov, City: '' }));
        const region = formData.Region;
        if (!region || !prov) { setCityOptions([]); return; }
        const cities = PH_LOCATIONS[region].provinces[prov] || [];
        setCityOptions(cities);
    };

    const handleCityChange = (e) => setFormData(prev => ({ ...prev, City: e.target.value }));

    const handleAvatar = (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            setAvatarPreview(reader.result);
            setFormData(prev => ({ ...prev, ProfilePicture: reader.result }));
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.FirstName.trim() || !formData.LastName.trim()) { alert('Please enter first and last name'); return; }
        const payload = {
            FirstName: formData.FirstName,
            LastName: formData.LastName,
            Name: `${formData.FirstName} ${formData.LastName}`,
            Sex: formData.Sex,
            EnrollmentDate: formData.EnrollmentDate,
            Address: formData.Address,
            PhoneNumber: formData.PhoneNumber,
            Email: formData.Email,
            ProfilePicture: formData.ProfilePicture,
            Course: formData.Course,
            Department: formData.Department,
            AcademicYear: formData.AcademicYear,
            Status: formData.Status,
            Region: formData.Region,
            Province: formData.Province,
            City: formData.City
        };
        await onSave(payload);
    };

    return (
        <div
            className="modal-overlay"
            style={{ zIndex: 2000, position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto' }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                className="modal-dialog"
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                tabIndex={-1}
                onClick={(e) => e.stopPropagation()}
                style={{ zIndex: 99999, pointerEvents: 'auto' }}
            >
                <div className="modal-header">
                    <h3>Add New Student</h3>
                    <button className="modal-close" onClick={onClose} type="button"><FiX /></button>
                </div>
                <form className="modal-body" onSubmit={handleSubmit}>
                    <div className="modal-grid">
                        <InputField label="First Name" name="FirstName" value={formData.FirstName} onChange={handleChange} required ref={firstInputRef} />
                        <InputField label="Last Name" name="LastName" value={formData.LastName} onChange={handleChange} required />
                        <SelectField label="Course" name="Course" value={formData.Course} onChange={handleChange} options={COURSES} />
                        <SelectField label="Department" name="Department" value={formData.Department} onChange={handleChange} options={DEPARTMENTS} />
                        <SelectField label="Academic Year" name="AcademicYear" value={formData.AcademicYear} onChange={handleChange} options={ACADEMIC_YEARS} />
                        <SelectField label="Status" name="Status" value={formData.Status} onChange={handleChange} options={STATUS_OPTIONS} />
                        <InputField label="Email" name="Email" type="email" value={formData.Email} onChange={handleChange} />
                        <InputField label="Phone Number" name="PhoneNumber" value={formData.PhoneNumber} onChange={handleChange} />
                        <div className="form-field">
                            <label className="form-label">Region</label>
                            <select name="Region" value={formData.Region} onChange={handleRegionChange} className="form-select">
                                <option value="">Select region</option>
                                {Object.keys(PH_LOCATIONS).map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <div className="form-field">
                            <label className="form-label">Province</label>
                            <select name="Province" value={formData.Province} onChange={handleProvinceChange} className="form-select">
                                <option value="">Select province</option>
                                {provinceOptions.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div className="form-field">
                            <label className="form-label">City / Municipality</label>
                            <select name="City" value={formData.City} onChange={handleCityChange} className="form-select">
                                <option value="">Select city</option>
                                {cityOptions.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="form-field">
                            <label className="form-label">Address</label>
                            <textarea name="Address" value={formData.Address} onChange={handleChange} className="form-textarea" />
                        </div>
                        <div className="form-field">
                            <label className="form-label">Avatar</label>
                            <input type="file" accept="image/*" onChange={handleAvatar} />
                            {avatarPreview && <img src={avatarPreview} alt="preview" className="avatar-preview" />}
                        </div>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Add Student</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const EditStudentModal = ({ student, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        FirstName: student?.FirstName || (student?.Name ? student.Name.split(' ')[0] : ''),
        LastName: student?.LastName || (student?.Name ? student.Name.split(' ').slice(1).join(' ') : ''),
        Sex: student?.Sex || 'Male', EnrollmentDate: student?.EnrollmentDate || '', Address: student?.Address || '', PhoneNumber: student?.PhoneNumber || '', Email: student?.Email || '', ProfilePicture: student?.ProfilePicture || '', Course: student?.Course || COURSES[0], Department: student?.Department || DEPARTMENTS[0], AcademicYear: student?.AcademicYear || ACADEMIC_YEARS[0], Status: student?.Status || STATUS_OPTIONS[0], Region: student?.Region || '', Province: student?.Province || '', City: student?.City || '', StudentID: student?.StudentID || ''
    });
    const [provinceOptions, setProvinceOptions] = useState([]);
    const [cityOptions, setCityOptions] = useState([]);
    const [avatarPreview, setAvatarPreview] = useState(student?.ProfilePicture || '');
    const dialogRef = React.useRef(null);
    const firstInputRef = React.useRef(null);

    useEffect(() => {
        try { firstInputRef.current?.focus(); } catch (e) {}
        if (formData.Region) {
            const provinces = Object.keys(PH_LOCATIONS[formData.Region]?.provinces || {});
            setProvinceOptions(provinces);
        }
        if (formData.Region && formData.Province) {
            setCityOptions(PH_LOCATIONS[formData.Region].provinces[formData.Province] || []);
        }
    }, []);

    useEffect(() => {
        if (formData.Region) {
            const provinces = Object.keys(PH_LOCATIONS[formData.Region]?.provinces || {});
            setProvinceOptions(provinces);
        }
        if (formData.Region && formData.Province) {
            setCityOptions(PH_LOCATIONS[formData.Region].provinces[formData.Province] || []);
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRegionChange = (e) => {
        const region = e.target.value;
        setFormData(prev => ({ ...prev, Region: region, Province: '', City: '' }));
        if (!region) { setProvinceOptions([]); setCityOptions([]); return; }
        const provincesObj = PH_LOCATIONS[region]?.provinces || {};
        const provinces = Object.keys(provincesObj);
        setProvinceOptions(provinces);
        setCityOptions([]);
    };

    const handleProvinceChange = (e) => {
        const prov = e.target.value;
        setFormData(prev => ({ ...prev, Province: prov, City: '' }));
        const region = formData.Region;
        if (!region || !prov) { setCityOptions([]); return; }
        const cities = PH_LOCATIONS[region].provinces[prov] || [];
        setCityOptions(cities);
    };

    const handleAvatar = (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            setAvatarPreview(reader.result);
            setFormData(prev => ({ ...prev, ProfilePicture: reader.result }));
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            Name: `${formData.FirstName} ${formData.LastName}`
        };
        if (student?.StudentID) payload.StudentID = student.StudentID;
        await onSave(payload);
    };

    return (
        <div
            className="modal-overlay"
            style={{ zIndex: 2000, position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto' }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                className="modal-dialog"
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                tabIndex={-1}
                onClick={(e) => e.stopPropagation()}
                style={{ zIndex: 99999, pointerEvents: 'auto' }}
            >
                <div className="modal-header">
                    <h3>Edit Student</h3>
                    <button className="modal-close" onClick={onClose} type="button"><FiX /></button>
                </div>
                <form className="modal-body" onSubmit={handleSubmit}>
                    <div className="modal-grid">
                        <InputField label="Student ID" name="StudentID" value={formData.StudentID} disabled />
                        <InputField label="First Name" name="FirstName" value={formData.FirstName} onChange={handleChange} required ref={firstInputRef} />
                        <InputField label="Last Name" name="LastName" value={formData.LastName} onChange={handleChange} required />
                        <SelectField label="Course" name="Course" value={formData.Course} onChange={handleChange} options={COURSES} />
                        <SelectField label="Department" name="Department" value={formData.Department} onChange={handleChange} options={DEPARTMENTS} />
                        <SelectField label="Academic Year" name="AcademicYear" value={formData.AcademicYear} onChange={handleChange} options={ACADEMIC_YEARS} />
                        <SelectField label="Status" name="Status" value={formData.Status} onChange={handleChange} options={STATUS_OPTIONS} />
                        <InputField label="Email" name="Email" type="email" value={formData.Email} onChange={handleChange} />
                        <InputField label="Phone Number" name="PhoneNumber" value={formData.PhoneNumber} onChange={handleChange} />
                        <div className="form-field">
                            <label className="form-label">Region</label>
                            <select name="Region" value={formData.Region} onChange={handleRegionChange} className="form-select">
                                <option value="">Select region</option>
                                {Object.keys(PH_LOCATIONS).map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <div className="form-field">
                            <label className="form-label">Province</label>
                            <select name="Province" value={formData.Province} onChange={handleProvinceChange} className="form-select">
                                <option value="">Select province</option>
                                {provinceOptions.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div className="form-field">
                            <label className="form-label">City / Municipality</label>
                            <select name="City" value={formData.City} onChange={(e) => setFormData(prev => ({ ...prev, City: e.target.value }))} className="form-select">
                                <option value="">Select city</option>
                                {cityOptions.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="form-field">
                            <label className="form-label">Address</label>
                            <textarea name="Address" value={formData.Address} onChange={handleChange} className="form-textarea" />
                        </div>
                        <div className="form-field">
                            <label className="form-label">Avatar</label>
                            <input type="file" accept="image/*" onChange={handleAvatar} />
                            {avatarPreview && <img src={avatarPreview} alt="preview" className="avatar-preview" />}
                        </div>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
