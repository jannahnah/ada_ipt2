import React, { useState, useMemo } from 'react';
// Icons from Lucide for a modern, clean look
import { Search, ChevronDown, Plus, Edit, Trash2, User, Menu, X, ArrowLeft, Save } from 'lucide-react';

// --- MOCK DATA (to simulate fetching from your Laravel API) ---
const MOCK_STUDENTS = [
    { StudentID: 'STU-2023-001', Name: 'Alice Johnson', Course: 'Computer Science', Department: 'Engineering', Status: 'Active' },
    { StudentID: 'STU-2023-002', Name: 'Bob Williams', Course: 'Business Administration', Department: 'Business', Status: 'Active' },
    { StudentID: 'STU-2023-003', Name: 'Charlie Brown', Course: 'Biology', Department: 'Sciences', Status: 'On Leave' },
    { StudentID: 'STU-2023-004', Name: 'Diana Miller', Course: 'Psychology', Department: 'Humanities', Status: 'Graduated' },
    { StudentID: 'STU-2023-005', Name: 'Eve Davis', Course: 'Computer Science', Department: 'Engineering', Status: 'Active' },
];

const COURSES = ['Computer Science', 'Business Administration', 'Biology', 'Psychology', 'History', 'Electrical Engineering'];
const DEPARTMENTS = ['Engineering', 'Business', 'Sciences', 'Humanities'];
const STATUS_OPTIONS = ['Active', 'Inactive', 'On Leave', 'Graduated', 'Suspended'];

// --- Main App Component (Handles State and Navigation) ---
export default function StudentDashboard() {
    const [view, setView] = useState('list'); // 'list', 'add', 'edit'
    const [students, setStudents] = useState(MOCK_STUDENTS);
    const [currentStudent, setCurrentStudent] = useState(null);

    const handleAddNew = () => setView('add');

    const handleEdit = (student) => {
        setCurrentStudent(student);
        setView('edit');
    };

    const handleCancel = () => {
        setCurrentStudent(null);
        setView('list');
    };
    
    // CREATE: Adds a new student to the list
    const handleSaveNewStudent = (newStudent) => {
        // In a real app, the backend would generate the ID.
        // For this demo, we'll create a simple, unique ID.
        const studentWithId = { 
            ...newStudent, 
            StudentID: `STU-2023-${String(students.length + 1).padStart(3, '0')}` 
        };
        setStudents(prevStudents => [...prevStudents, studentWithId]);
        setView('list');
    };
    
    // UPDATE: Updates an existing student's information
    const handleUpdateStudent = (updatedStudent) => {
        setStudents(prevStudents => 
            prevStudents.map(student => 
                student.StudentID === updatedStudent.StudentID ? updatedStudent : student
            )
        );
        setView('list');
        setCurrentStudent(null);
    };

    // DELETE: Removes a student from the list
    const handleDelete = (studentId) => {
        // Use a simple confirmation dialog. A custom modal is better for real apps.
        if (window.confirm(`Are you sure you want to delete student ${studentId}? This action cannot be undone.`)) {
             setStudents(prevStudents => prevStudents.filter(s => s.StudentID !== studentId));
        }
    };


    return (
        // SCSS body style handles the main background and font.
        <div className="main-app-wrapper"> 
            <Navbar />
            <main className="container">
                {view === 'list' && (
                    <StudentListPage 
                        students={students} 
                        onAddNew={handleAddNew} 
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                )}
                {view === 'add' && <AddStudentPage onSave={handleSaveNewStudent} onCancel={handleCancel} />}
                {view === 'edit' && <EditStudentPage student={currentStudent} onSave={handleUpdateStudent} onCancel={handleCancel} />}
            </main>
            <Footer />
        </div>
    );
}

// --- Page Components ---

const StudentListPage = ({ students, onAddNew, onEdit, onDelete }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ course: '', department: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // READ: Filter and search logic
    const filteredStudents = useMemo(() => {
        let result = students;
        if (filters.course && filters.course !== 'All') result = result.filter(s => s.Course === filters.course);
        if (filters.department && filters.department !== 'All') result = result.filter(s => s.Department === filters.department);
        if (searchTerm) {
            const lowerCaseSearch = searchTerm.toLowerCase();
            result = result.filter(s =>
                s.Name.toLowerCase().includes(lowerCaseSearch) ||
                s.StudentID.toLowerCase().includes(lowerCaseSearch)
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
            <div className="module-header">
                <h1>Students Module</h1>
            </div>
            {/* Added a basic section to mimic a GitHub-style management info block */}
            <div className="management-section">
                {/*  - Placeholder for illustrative image, but keeping it text-based for now to match SCSS structure */}
                <div className="management-content">
                    <h2>Manage Student Records</h2>
                    <p>
                        View, search, filter, and modify all student information. Use the controls below to quickly find and manage specific student records.
                    </p>
                </div>
            </div>
            
            <FilterBar 
                searchTerm={searchTerm} 
                setSearchTerm={setSearchTerm} 
                filters={filters} 
                setFilters={setFilters} 
                handleNewStudent={onAddNew} 
            />
            <StudentTable students={paginatedStudents} onEdit={onEdit} onDelete={onDelete} />
            <Pagination 
                totalItems={filteredStudents.length} 
                itemsPerPage={itemsPerPage} 
                currentPage={currentPage} 
                onPageChange={setCurrentPage} 
            />
        </div>
    );
};

// NOTE: Add/Edit pages are given minimal styling as the SCSS focuses on the List page.
const AddStudentPage = ({ onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        Name: '',
        Course: COURSES[0],
        Department: DEPARTMENTS[0],
        Status: STATUS_OPTIONS[0]
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if(formData.Name.trim() === '') {
            alert('Please enter a full name.');
            return;
        }
        onSave(formData);
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
                        <InputField label="Full Name" placeholder="Enter Student's Full Name" name="Name" value={formData.Name} onChange={handleChange} required />
                    </div>
                    <div className="form-group-grid">
                        <SelectField label="Course" name="Course" value={formData.Course} onChange={handleChange} options={COURSES} />
                        <SelectField label="Department" name="Department" value={formData.Department} onChange={handleChange} options={DEPARTMENTS} />
                    </div>
                     <SelectField label="Status" name="Status" value={formData.Status} onChange={handleChange} options={STATUS_OPTIONS} />
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
    const [formData, setFormData] = useState({ ...student });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
         if(formData.Name.trim() === '') {
            alert('Full name cannot be empty.');
            return;
        }
        onSave(formData);
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
                            <InputField label="Full Name" name="Name" value={formData.Name} onChange={handleChange} required />
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
                <Search className="search-icon" />
                <div className="profile-pic">
                    <User className="profile-icon" />
                </div>
                {/* Mobile menu button (no SCSS for mobile menu, keeping it functional) */}
                <button className="menu-toggle-btn" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
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

const FilterBar = ({ searchTerm, setSearchTerm, filters, setFilters, handleNewStudent }) => {
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="controls-section">
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search students by name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {/* Search icon is left out here as SCSS doesn't define it inside the input */}
            </div>
            <div className="filters">
                <FilterDropdown label="Filter by Course" options={['All', ...COURSES]} current={filters.course} onChange={(v) => handleFilterChange('course', v)} />
                <FilterDropdown label="Filter by Department" options={['All', ...DEPARTMENTS]} current={filters.department} onChange={(v) => handleFilterChange('department', v)} />
            </div>
            <button
                onClick={handleNewStudent}
                className="add-student-btn"
            >
                <Plus className="h-4 w-4" />
                Add New Student
            </button>
        </div>
    );
};

const FilterDropdown = ({ label, options, current, onChange }) => {
    return (
        <div className="dropdown-container">
            <select
                className="filter-dropdown"
                value={current || 'All'}
                onChange={(e) => onChange(e.target.value)}
            >
                <option value="All">{label}</option>
                {options.filter(o => o !== 'All').map(option => (
                    <option key={option} value={option}>{option}</option>
                ))}
            </select>
            {/* The ChevronDown icon is now handled by the SCSS's background-image on .filter-dropdown */}
        </div>
    );
};

const StudentTable = ({ students, onEdit, onDelete }) => {
    const getStatusClass = (status) => {
        switch (status) {
            case 'Active': return 'status-active';
            case 'On Leave': return 'status-leave';
            case 'Graduated': return 'status-graduated';
            default: return 'status-default'; // No specific style for others, use a fallback
        }
    };

    return (
        <div className="table-section">
            <table>
                <thead>
                    <tr>
                        {['Student ID', 'Name', 'Course', 'Department', 'Status', 'Actions'].map(header => (
                            <th key={header} scope="col">
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {students.length > 0 ? (
                        students.map((student) => (
                            <tr key={student.StudentID}>
                                <td>{student.StudentID}</td>
                                <td>{student.Name}</td>
                                <td>{student.Course}</td>
                                <td>{student.Department}</td>
                                <td>
                                    <span className={getStatusClass(student.Status)}>
                                        {student.Status}
                                    </span>
                                </td>
                                <td className="actions">
                                    <button onClick={() => onEdit(student)} className="action-btn edit-btn" title="Edit Record"><Edit className="h-4 w-4" /></button>
                                    <button onClick={() => onDelete(student.StudentID)} className="action-btn archive-btn" title="Delete Record"><Trash2 className="h-4 w-4" /></button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="no-students">
                                No students found.
                            </td>
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

const Footer = () => (
    <footer className="footer">
        <p>&copy; {new Date().getFullYear()} Student Management System. All Rights Reserved.</p>
        <div className="footer-left">
            <a href="#">Legal</a>
            <a href="#">Company</a>
            <a href="#">Support</a>
        </div>
    </footer>
);

// --- Form Field Components ---
// These are given minimal, non-Tailwind-specific classes for integration with the dark mode.
const InputField = ({ label, ...props }) => (
    <div className="form-field">
        <label className="form-label">{label}</label>
        <input {...props} className={`form-input ${props.disabled ? 'disabled-input' : ''}`} />
    </div>
);

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