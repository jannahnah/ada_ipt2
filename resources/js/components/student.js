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
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
            <Navbar />
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
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
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-900">Students Module</h1>
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
        <div className="max-w-4xl mx-auto">
            <button onClick={onCancel} className="flex items-center text-sm text-slate-600 hover:text-blue-600 mb-4 transition-colors">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Student List
            </button>
            <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200">
                <h1 className="text-2xl font-bold text-slate-900 mb-6">Add New Student</h1>
                <h2 className="text-lg font-semibold text-slate-700 mb-4">Student Information</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="Student ID" placeholder="Will be auto-generated" disabled />
                        <InputField label="Full Name" placeholder="Enter Student's Full Name" name="Name" value={formData.Name} onChange={handleChange} required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SelectField label="Course" name="Course" value={formData.Course} onChange={handleChange} options={COURSES} />
                        <SelectField label="Department" name="Department" value={formData.Department} onChange={handleChange} options={DEPARTMENTS} />
                    </div>
                     <SelectField label="Status" name="Status" value={formData.Status} onChange={handleChange} options={STATUS_OPTIONS} />
                    <div className="flex justify-end items-center pt-6 border-t border-slate-200 mt-8">
                        <button type="button" onClick={onCancel} className="px-6 py-2 text-sm font-semibold text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">Cancel</button>
                        <button type="submit" className="flex items-center px-6 py-2 ml-4 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                           <Save className="h-4 w-4 mr-2" />
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
        <div className="max-w-4xl mx-auto">
             <button onClick={onCancel} className="flex items-center text-sm text-slate-600 hover:text-blue-600 mb-4 transition-colors">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Student List
            </button>
            <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200">
                <h1 className="text-2xl font-bold text-slate-900 mb-6">Edit Student Record</h1>
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-700 mb-4">Personal Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField label="Student ID" value={formData.StudentID} readOnly disabled />
                            <InputField label="Full Name" name="Name" value={formData.Name} onChange={handleChange} required />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-slate-700 mb-4">Academic Details</h2>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <SelectField label="Course" name="Course" value={formData.Course} onChange={handleChange} options={COURSES} />
                            <SelectField label="Department" name="Department" value={formData.Department} onChange={handleChange} options={DEPARTMENTS} />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-slate-700 mb-4">Status</h2>
                        <div className="flex flex-wrap gap-x-6 gap-y-2">
                           {STATUS_OPTIONS.map(status => (
                               <RadioField key={status} label={status} name="Status" value={status} checked={formData.Status === status} onChange={handleChange} />
                           ))}
                        </div>
                    </div>
                    <div className="flex justify-end items-center pt-6 border-t border-slate-200 mt-8">
                        <button type="button" onClick={onCancel} className="px-6 py-2 text-sm font-semibold text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">Cancel</button>
                        <button type="submit" className="px-6 py-2 ml-4 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- Reusable UI Components ---

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <header className="bg-white p-4 shadow-sm sticky top-0 z-10 border-b border-slate-200">
            <div className="container mx-auto flex justify-between items-center">
                <div className="flex items-center space-x-8">
                    <span className="text-xl font-extrabold text-blue-600 flex items-center">
                        <span className="text-3xl mr-1">✳</span>logo
                    </span>
                    <nav className="hidden md:flex space-x-6 text-sm">
                        <a href="#" className="text-slate-900 font-semibold border-b-2 border-blue-600 pb-2">Students</a>
                        <a href="#" className="text-slate-500 hover:text-slate-900 transition duration-150 pb-2">Reports</a>
                        <a href="#" className="text-slate-500 hover:text-slate-900 transition duration-150 pb-2">System Settings</a>
                    </nav>
                </div>
                <div className="flex items-center space-x-4">
                    <Search className="h-5 w-5 text-slate-500 cursor-pointer hover:text-slate-900 hidden md:block" />
                    <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center cursor-pointer border-2 border-transparent hover:border-blue-600 transition duration-150 overflow-hidden">
                        <User className="h-5 w-5 text-slate-600" />
                    </div>
                    <button className="md:hidden text-slate-800" onClick={() => setIsOpen(!isOpen)}>
                        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>
            {isOpen && (
                <nav className="md:hidden mt-4 space-y-2 px-2 text-sm text-center bg-white p-2 rounded-lg shadow-lg">
                    <a href="#" className="block text-slate-900 font-semibold p-2 bg-slate-100 rounded-lg">Students</a>
                    <a href="#" className="block text-slate-500 hover:text-slate-900 p-2 hover:bg-slate-100 rounded-lg">Reports</a>
                    <a href="#" className="block text-slate-500 hover:text-slate-900 p-2 hover:bg-slate-100 rounded-lg">System Settings</a>
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
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
            <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search students by name or ID..."
                    className="w-full pl-10 pr-4 py-2 bg-white text-slate-800 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <FilterDropdown label="Filter by Course" options={['All', ...COURSES]} current={filters.course} onChange={(v) => handleFilterChange('course', v)} />
            <FilterDropdown label="Filter by Department" options={['All', ...DEPARTMENTS]} current={filters.department} onChange={(v) => handleFilterChange('department', v)} />
            <button
                onClick={handleNewStudent}
                className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-150 shadow-sm min-w-[150px] text-sm"
            >
                <Plus className="h-4 w-4 mr-2" />
                Add New Student
            </button>
        </div>
    );
};

const FilterDropdown = ({ label, options, current, onChange }) => {
    return (
        <div className="relative text-sm min-w-[180px]">
            <select
                className="w-full appearance-none bg-white text-slate-800 py-2 px-4 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 cursor-pointer text-sm"
                value={current || 'All'}
                onChange={(e) => onChange(e.target.value)}
            >
                <option value="All">{label}</option>
                {options.filter(o => o !== 'All').map(option => (
                    <option key={option} value={option}>{option}</option>
                ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>
    );
};

const StudentTable = ({ students, onEdit, onDelete }) => {
    const getStatusStyle = (status) => {
        switch (status) {
            case 'Active': return 'bg-green-100 text-green-800';
            case 'On Leave': return 'bg-yellow-100 text-yellow-800';
            case 'Graduated': return 'bg-blue-100 text-blue-800';
            case 'Suspended': return 'bg-orange-100 text-orange-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    return (
        <div className="overflow-x-auto bg-white rounded-xl shadow-md border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                    <tr>
                        {['Student ID', 'Name', 'Course', 'Department', 'Status', 'Actions'].map(header => (
                            <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                    {students.length > 0 ? (
                        students.map((student) => (
                            <tr key={student.StudentID} className="hover:bg-slate-50 transition duration-150">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">{student.StudentID}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{student.Name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{student.Course}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{student.Department}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(student.Status)}`}>
                                        {student.Status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-4">
                                    <button onClick={() => onEdit(student)} className="flex items-center text-blue-600 hover:text-blue-800 transition-colors" title="Edit Record"><Edit className="h-4 w-4" /></button>
                                    <button onClick={() => onDelete(student.StudentID)} className="flex items-center text-red-600 hover:text-red-800 transition-colors" title="Delete Record"><Trash2 className="h-4 w-4" /></button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
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
        <div className="flex justify-end items-center mt-4">
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 text-sm text-slate-600 bg-white rounded-md border border-slate-300 hover:bg-slate-100 disabled:opacity-50 transition-colors">Previous</button>
            <div className="mx-2">
                {pages.map(page => (
                    <button key={page} onClick={() => onPageChange(page)} className={`px-3 py-1 mx-1 text-sm rounded-md transition-colors ${currentPage === page ? 'bg-blue-600 text-white font-semibold' : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100'}`}>{page}</button>
                ))}
            </div>
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 text-sm text-slate-600 bg-white rounded-md border border-slate-300 hover:bg-slate-100 disabled:opacity-50 transition-colors">Next</button>
        </div>
    );
};

const Footer = () => (
    <footer className="mt-12 p-6 bg-white border-t border-slate-200 text-slate-500 text-sm">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-center">
            <p>&copy; {new Date().getFullYear()} Student Management System. All Rights Reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="hover:text-blue-600 transition duration-150">Legal</a>
                <a href="#" className="hover:text-blue-600 transition duration-150">Company</a>
                <a href="#" className="hover:text-blue-600 transition duration-150">Support</a>
            </div>
        </div>
    </footer>
);

// --- Form Field Components ---
const InputField = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
        <input {...props} className={`w-full px-4 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ${props.disabled ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`} />
    </div>
);

const SelectField = ({ label, options, ...props }) => (
     <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
        <select {...props} className="w-full px-4 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 appearance-none bg-no-repeat bg-right-3" style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em'}}>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
    </div>
);

const RadioField = ({ label, ...props }) => (
    <label className="flex items-center space-x-2 text-sm text-slate-700 cursor-pointer">
        <input type="radio" {...props} className="h-4 w-4 text-blue-600 border-slate-300 focus:ring-blue-500" />
        <span>{label}</span>
    </label>
);

