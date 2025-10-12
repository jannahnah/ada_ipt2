import React, { useState, useMemo } from 'react';
// Icons from Lucide for a modern look
import { Search, ChevronDown, Plus, Edit, Archive, User, Menu, X } from 'lucide-react';

// --- MOCK DATA (to simulate fetching from your Laravel API) ---
const MOCK_STUDENTS = [
    { StudentID: 'S001', Name: 'Alice Johnson', Course: 'Computer Science', Department: 'Engineering', Status: 'Active', Email: 'alice.j@example.edu' },
    { StudentID: 'S002', Name: 'Bob Williams', Course: 'Business Administration', Department: 'Business', Status: 'Active', Email: 'bob.w@example.edu' },
    { StudentID: 'S003', Name: 'Charlie Brown', Course: 'Biology', Department: 'Sciences', Status: 'On Leave', Email: 'charlie.b@example.edu' },
    { StudentID: 'S004', Name: 'Diana Miller', Course: 'Psychology', Department: 'Humanities', Status: 'Graduated', Email: 'diana.m@example.edu' },
    { StudentID: 'S005', Name: 'Eve Davis', Course: 'Computer Science', Department: 'Engineering', Status: 'Active', Email: 'eve.d@example.edu' },
    { StudentID: 'S006', Name: 'Frank White', Course: 'History', Department: 'Humanities', Status: 'Active', Email: 'frank.w@example.edu' },
    { StudentID: 'S007', Name: 'Grace Lee', Course: 'Electrical Engineering', Department: 'Engineering', Status: 'On Leave', Email: 'grace.l@example.edu' },
];

const COURSES = ['Computer Science', 'Business Administration', 'Biology', 'Psychology', 'History', 'Electrical Engineering'];
const DEPARTMENTS = ['Engineering', 'Business', 'Sciences', 'Humanities'];

// --- Components ---

// Navbar Component
const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="bg-gray-800 p-4 border-b border-gray-700">
            <div className="container mx-auto flex justify-between items-center">
                {/* Logo and Nav Links */}
                <div className="flex items-center space-x-8">
                    <span className="text-xl font-bold text-teal-400">★logo</span>
                    <nav className="hidden md:flex space-x-6 text-sm">
                        <a href="#" className="text-white font-semibold">Students</a>
                        <a href="#" className="text-gray-400 hover:text-white transition duration-150">Reports</a>
                        <a href="#" className="text-gray-400 hover:text-white transition duration-150">System Settings</a>
                    </nav>
                </div>

                {/* Search and User */}
                <div className="flex items-center space-x-4">
                    <Search className="h-5 w-5 text-gray-400 cursor-pointer hover:text-white hidden md:block" />
                    <div className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center cursor-pointer border-2 border-teal-400">
                        <User className="h-4 w-4 text-white" />
                    </div>
                    {/* Mobile Menu Button */}
                    <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
                        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>
            
            {/* Mobile Menu */}
            {isOpen && (
                <nav className="md:hidden mt-4 space-y-2 px-2 text-sm text-center">
                    <a href="#" className="block text-white font-semibold p-2 bg-gray-700 rounded-lg">Students</a>
                    <a href="#" className="block text-gray-400 hover:text-white p-2 hover:bg-gray-700 rounded-lg">Reports</a>
                    <a href="#" className="block text-gray-400 hover:text-white p-2 hover:bg-gray-700 rounded-lg">System Settings</a>
                    <Search className="h-5 w-5 text-gray-400 mx-auto mt-4 cursor-pointer" />
                </nav>
            )}
        </header>
    );
};

// Header/Banner Component
const HeaderBanner = () => (
    <div className="p-8 bg-gray-800 rounded-xl shadow-lg flex flex-col lg:flex-row items-center justify-start mb-8">
        <div className="w-full lg:w-1/3 mb-6 lg:mb-0 lg:pr-8">
            {/* Placeholder for the image */}
            <div className="p-4 bg-gray-700 rounded-lg flex justify-center items-center h-48">
                <img 
                    src="https://placehold.co/200x150/1f2937/ffffff?text=Student+Image" 
                    alt="Students in a meeting" 
                    className="rounded-md max-h-full max-w-full"
                    onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/200x150/1f2937/ffffff?text=Student+Image" }}
                />
            </div>
        </div>
        <div className="w-full lg:w-2/3 text-center lg:text-left">
            <h1 className="text-3xl font-bold text-white mb-2">Manage Your Student Records Seamlessly</h1>
            <p className="text-gray-400">
                Efficiently add, update, and archive student information. Utilize powerful search and filter options to quickly find specific students by course or department, ensuring your data is always organized and accessible.
            </p>
        </div>
    </div>
);

// Filter/Action Bar Component
const FilterBar = ({ searchTerm, setSearchTerm, filters, setFilters, handleNewStudent }) => {
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value === 'All' ? '' : value }));
    };

    return (
        <div className="flex flex-col md:flex-row items-stretch md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
            {/* Search Input */}
            <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search students by name, ID, or email..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-teal-500 focus:border-teal-500 transition duration-150"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Filter by Course */}
            <FilterDropdown 
                label="Course"
                options={['All', ...COURSES]}
                current={filters.course}
                onChange={(value) => handleFilterChange('course', value)}
            />

            {/* Filter by Department */}
            <FilterDropdown 
                label="Department"
                options={['All', ...DEPARTMENTS]}
                current={filters.department}
                onChange={(value) => handleFilterChange('department', value)}
            />

            {/* Add New Student Button */}
            <button
                onClick={handleNewStudent}
                className="flex items-center justify-center px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition duration-150 shadow-lg shadow-teal-900/50 min-w-[150px]"
            >
                <Plus className="h-5 w-5 mr-2" />
                Add New Student
            </button>
        </div>
    );
};

// Generic Dropdown Component
const FilterDropdown = ({ label, options, current, onChange }) => {
    return (
        <div className="relative text-sm min-w-[150px]">
            <select
                className="w-full appearance-none bg-gray-700 text-white py-2 px-4 pr-10 border border-gray-600 rounded-lg focus:ring-teal-500 focus:border-teal-500 transition duration-150 cursor-pointer"
                value={current || 'All'}
                onChange={(e) => onChange(e.target.value)}
            >
                {options.map(option => (
                    <option key={option} value={option}>{`Filter by ${label}: ${option}`}</option>
                ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
    );
};


// Student Table Component
const StudentTable = ({ students }) => {
    // Helper to determine status styling
    const getStatusStyle = (status) => {
        switch (status) {
            case 'Active':
                return 'bg-green-600/20 text-green-400';
            case 'On Leave':
                return 'bg-yellow-600/20 text-yellow-400';
            case 'Graduated':
                return 'bg-purple-600/20 text-purple-400';
            default:
                return 'bg-gray-600/20 text-gray-400';
        }
    };

    return (
        <div className="overflow-x-auto bg-gray-800 rounded-xl shadow-2xl">
            <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                    <tr>
                        {['Student ID', 'Name', 'Course', 'Department', 'Status', 'Email', 'Actions'].map(header => (
                            <th
                                key={header}
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                    {students.length > 0 ? (
                        students.map((student) => (
                            <tr key={student.StudentID} className="hover:bg-gray-700 transition duration-150">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-300">{student.StudentID}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{student.Name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{student.Course}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{student.Department}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(student.Status)}`}>
                                        {student.Status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-teal-400">{student.Email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button 
                                        onClick={() => console.log(`Editing ${student.Name}`)}
                                        className="inline-flex items-center px-3 py-1 mr-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition duration-150"
                                        title="Edit Record"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button 
                                        onClick={() => console.log(`Archiving ${student.Name}`)}
                                        className="inline-flex items-center px-3 py-1 bg-red-800/30 text-red-400 rounded-lg hover:bg-red-800/50 transition duration-150"
                                        title="Archive Record"
                                    >
                                        <Archive className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                No students match your current filter and search criteria.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

// Pagination Component
const Pagination = ({ totalItems, itemsPerPage, currentPage, onPageChange }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const PageButton = ({ page, current, disabled = false }) => (
        <button
            onClick={() => onPageChange(page)}
            disabled={disabled}
            className={`px-4 py-2 mx-1 rounded-lg text-sm font-medium transition duration-150
                ${current ? 'bg-teal-600 text-white shadow-md' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
        >
            {page}
        </button>
    );
    
    // Simple pagination logic for display
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className="flex justify-end items-center mt-6">
            <button 
                onClick={() => onPageChange(currentPage - 1)} 
                disabled={currentPage === 1}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg mr-2 hover:bg-gray-600 disabled:opacity-50 transition duration-150"
            >
                <ChevronDown className="h-4 w-4 rotate-90 mr-1" /> Previous
            </button>
            
            {pages.map(page => (
                <PageButton key={page} page={page} current={page === currentPage} />
            ))}

            <button 
                onClick={() => onPageChange(currentPage + 1)} 
                disabled={currentPage === totalPages}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg ml-2 hover:bg-gray-600 disabled:opacity-50 transition duration-150"
            >
                Next <ChevronDown className="h-4 w-4 -rotate-90 ml-1" />
            </button>
        </div>
    );
};

// Footer Component
const Footer = () => (
    <footer className="mt-12 p-6 bg-gray-800 border-t border-gray-700 text-gray-400 text-sm">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
            <div className="flex space-x-6 mb-4 md:mb-0">
                <a href="#" className="hover:text-white transition duration-150">Legal</a>
                <a href="#" className="hover:text-white transition duration-150">Company</a>
                <a href="#" className="hover:text-white transition duration-150">Support</a>
            </div>
            <div className="flex space-x-4">
                {/* Mock Social Icons */}
                <span className="cursor-pointer hover:text-white">♫</span>
                <span className="cursor-pointer hover:text-white">⅏</span>
                <span className="cursor-pointer hover:text-white">Ψ</span>
            </div>
        </div>
        <p className="text-xs text-center mt-4">Made with 💜</p>
    </footer>
);


// --- Main App Component ---
export default function App() { // CRITICAL FIX: Ensures this component is the default export
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ course: '', department: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; // Matching the mock data size shown in the image

    // Filtering and Searching Logic
    const filteredStudents = useMemo(() => {
        let result = MOCK_STUDENTS;

        // 1. Filter by Course
        if (filters.course) {
            result = result.filter(student => student.Course === filters.course);
        }

        // 2. Filter by Department
        if (filters.department) {
            result = result.filter(student => student.Department === filters.department);
        }

        // 3. Filter by Search Term
        if (searchTerm) {
            const lowerCaseSearch = searchTerm.toLowerCase();
            result = result.filter(student => 
                student.Name.toLowerCase().includes(lowerCaseSearch) ||
                student.StudentID.toLowerCase().includes(lowerCaseSearch) ||
                student.Email.toLowerCase().includes(lowerCaseSearch)
            );
        }
        
        return result;
    }, [searchTerm, filters]);

    // Apply Pagination
    const paginatedStudents = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredStudents.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredStudents, currentPage, itemsPerPage]);


    const handleNewStudent = () => {
        // We replace alert() with console.log to avoid iframe warnings
        console.log('Action: Open form to add a new student!');
    };

    return (
        <div className="min-h-screen bg-gray-900 font-sans">
            <Navbar />
            
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                <h1 className="text-3xl font-extrabold text-white mb-6">Students Module</h1>
                
                <HeaderBanner />
                
                <FilterBar
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    filters={filters}
                    setFilters={setFilters}
                    handleNewStudent={handleNewStudent}
                />
                
                <StudentTable students={paginatedStudents} />
                
                <Pagination
                    totalItems={filteredStudents.length}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                />
            </main>

            <Footer />
        </div>
    );
}
