import React, { useState, useMemo } from 'react';
// Icons from Lucide for a modern look
// ADDED GraduationCap, UserCheck, UserX for dynamic stats
import { Search, ChevronDown, Plus, Edit, Archive, User, Menu, X, Settings, LayoutDashboard, UserCheck, UserX, GraduationCap } from 'lucide-react';

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

// Navbar Component - Updated for the cleaner, darker look of the reference
const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="bg-[#1f2937] p-4 shadow-lg sticky top-0 z-10">
            <div className="container mx-auto flex justify-between items-center">
                {/* Logo and Nav Links */}
                <div className="flex items-center space-x-8">
                    {/* Updated logo to match the visual style of the reference */}
                    <span className="text-xl font-extrabold text-[#4f46e5] flex items-center">
                        <span className="text-3xl mr-1">★</span>logo
                    </span>
                    <nav className="hidden md:flex space-x-6 text-sm">
                        <a href="#" className="text-white font-semibold border-b-2 border-[#4f46e5] pb-1">Students</a>
                        <a href="#" className="text-gray-400 hover:text-white transition duration-150">Reports</a>
                        <a href="#" className="text-gray-400 hover:text-white transition duration-150 flex items-center space-x-1">
                            <span>System Settings</span>
                        </a>
                    </nav>
                </div>

                {/* Search and User */}
                <div className="flex items-center space-x-4">
                    <Search className="h-5 w-5 text-gray-400 cursor-pointer hover:text-white hidden md:block" />
                    <div className="flex items-center space-x-2">
                        <a href="#" className="text-gray-400 hover:text-white hidden md:block">
                            <Settings className="h-5 w-5" />
                        </a>
                        <div className="h-9 w-9 rounded-full bg-gray-600 flex items-center justify-center cursor-pointer border-2 border-transparent hover:border-[#4f46e5] transition duration-150 overflow-hidden">
                            {/* Placeholder for the user's actual profile picture */}
                            <User className="h-5 w-5 text-white" />
                        </div>
                    </div>
                    {/* Mobile Menu Button */}
                    <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
                        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>
            
            {/* Mobile Menu */}
            {isOpen && (
                <nav className="md:hidden mt-4 space-y-2 px-2 text-sm text-center bg-[#293749] p-2 rounded-lg">
                    <a href="#" className="block text-white font-semibold p-2 bg-[#4f46e5]/10 rounded-lg">Students</a>
                    <a href="#" className="block text-gray-400 hover:text-white p-2 hover:bg-gray-700 rounded-lg">Reports</a>
                    <a href="#" className="block text-gray-400 hover:text-white p-2 hover:bg-gray-700 rounded-lg">System Settings</a>
                    <Search className="h-5 w-5 text-gray-400 mx-auto mt-4 cursor-pointer" />
                </nav>
            )}
        </header>
    );
};

// NEW COMPONENT: Dynamic Statistics Card
const StatsCard = ({ title, value, icon: Icon, colorClass }) => (
    <div className="flex items-center p-4 bg-[#1f2937] rounded-lg border border-gray-700 shadow-xl transition duration-300 hover:shadow-2xl hover:border-[#4f46e5]">
        <div className={`p-3 rounded-full ${colorClass} bg-opacity-20 mr-4`}>
            <Icon className={`h-6 w-6 ${colorClass}`} />
        </div>
        <div>
            <p className="text-sm font-medium text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);


// REFACTORED Header/Banner Component - Now displays dynamic statistics
const HeaderBanner = ({ studentStats }) => (
    <div className="mb-8 space-y-6">
        {/* Management Heading and Description */}
        <div className="p-8 bg-[#293749] rounded-xl shadow-2xl border border-gray-700">
            <h1 className="text-2xl font-bold text-white mb-2">Manage Your Student Records Seamlessly</h1>
            <p className="text-gray-400">
                Efficiently view, search, and manage all student data. Quick insights are available below, highlighting the current status of your school population.
            </p>
        </div>

        {/* Dynamic Statistics Section (Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatsCard 
                title="Total Students"
                value={studentStats.total}
                icon={GraduationCap}
                colorClass="text-[#4f46e5]" // Indigo/Blue
            />
            <StatsCard 
                title="Currently Active"
                value={studentStats.active}
                icon={UserCheck}
                colorClass="text-green-400"
            />
            <StatsCard 
                title="On Leave/Inactive"
                value={studentStats.inactive}
                icon={UserX}
                colorClass="text-red-400"
            />
        </div>
    </div>
);

// Filter/Action Bar Component - Updated styling for inputs and button
const FilterBar = ({ searchTerm, setSearchTerm, filters, setFilters, handleNewStudent }) => {
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value === 'All' ? '' : value }));
    };

    return (
        <div className="flex flex-col md:flex-row items-stretch md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
            
            {/* Search Input */}
            <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search students by name, ID, or email..."
                    className="w-full pl-10 pr-4 py-2 bg-[#1f2937] text-white border border-gray-700 rounded-lg focus:ring-1 focus:ring-[#4f46e5] focus:border-[#4f46e5] transition duration-150 text-sm"
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

            {/* Add New Student Button - Updated color and shadow to match the reference */}
            <button
                onClick={handleNewStudent}
                className="flex items-center justify-center px-4 py-2 bg-[#4f46e5] text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-150 shadow-md shadow-[#4f46e5]/50 min-w-[150px] text-sm"
            >
                <Plus className="h-4 w-4 mr-2" />
                Add New Student
            </button>
        </div>
    );
};

// Generic Dropdown Component - Updated styling
const FilterDropdown = ({ label, options, current, onChange }) => {
    return (
        <div className="relative text-sm min-w-[150px]">
            <select
                className="w-full appearance-none bg-[#1f2937] text-gray-300 py-2 px-4 pr-10 border border-gray-700 rounded-lg focus:ring-1 focus:ring-[#4f46e5] focus:border-[#4f46e5] transition duration-150 cursor-pointer text-sm"
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


// Student Table Component - Updated table styling for a better dark theme contrast
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

    // Helper component for styled action buttons
    const ActionButton = ({ onClick, label, icon: Icon, colorClass, hoverClass }) => (
        <button 
            onClick={onClick}
            className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-lg transition duration-150 ${colorClass} ${hoverClass} hover:shadow-md min-w-[70px] justify-center`}
            title={label}
        >
            <Icon className="h-4 w-4 mr-1" />
            {label}
        </button>
    );

    return (
        <div className="overflow-x-auto bg-[#293749] rounded-xl shadow-2xl border border-gray-700">
            <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-[#1f2937]">
                    <tr>
                        {['Student ID', 'Name', 'Course', 'Department', 'Status', 'Email', 'Actions'].map(header => (
                            <th
                                key={header}
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider"
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                {/* Alternating row colors for better readability, similar to the reference */}
                <tbody className="divide-y divide-gray-700 text-gray-300">
                    {students.length > 0 ? (
                        students.map((student, index) => (
                            <tr 
                                key={student.StudentID} 
                                className={`transition duration-150 ${index % 2 === 0 ? 'bg-transparent' : 'bg-[#212f3e] hover:bg-[#293749]'}`}
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-300">{student.StudentID}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{student.Name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{student.Course}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{student.Department}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(student.Status)}`}>
                                        {student.Status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4f46e5]">{student.Email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-2">
                                    <ActionButton
                                        onClick={() => console.log(`Editing ${student.Name}`)}
                                        label="Edit"
                                        icon={Edit}
                                        colorClass="text-[#4f46e5] border border-gray-700 bg-transparent"
                                        hoverClass="hover:bg-[#4f46e5]/10"
                                    />
                                    <ActionButton
                                        onClick={() => console.log(`Archiving ${student.Name}`)}
                                        label="Archive"
                                        icon={Archive}
                                        colorClass="text-red-400 border border-gray-700 bg-transparent"
                                        hoverClass="hover:bg-red-400/10"
                                    />
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

// Pagination Component - Updated button styling to match the table
const Pagination = ({ totalItems, itemsPerPage, currentPage, onPageChange }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const PageButton = ({ page, current, disabled = false }) => (
        <button
            onClick={() => onPageChange(page)}
            disabled={disabled}
            className={`px-4 py-2 mx-1 rounded-lg text-sm font-medium transition duration-150
                ${current ? 'bg-[#4f46e5] text-white shadow-md' : 'bg-[#1f2937] text-gray-300 hover:bg-[#293749] border border-gray-700'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
        >
            {page}
        </button>
    );
    
    // Simple pagination logic for display
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    // Only show page buttons relevant to the current page/total
    let displayedPages = [];
    if (totalPages <= 5) {
        displayedPages = pages;
    } else {
        const start = Math.max(1, currentPage - 2);
        const end = Math.min(totalPages, currentPage + 2);
        for (let i = start; i <= end; i++) {
            displayedPages.push(i);
        }
    }


    return (
        <div className="flex justify-end items-center mt-6">
            <button 
                onClick={() => onPageChange(currentPage - 1)} 
                disabled={currentPage === 1}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-300 bg-[#1f2937] rounded-lg mr-2 hover:bg-[#293749] disabled:opacity-50 transition duration-150 border border-gray-700"
            >
                <ChevronDown className="h-4 w-4 rotate-90 mr-1" /> Previous
            </button>
            
            {displayedPages.map(page => (
                <PageButton key={page} page={page} current={page === currentPage} />
            ))}
            {totalPages > 5 && currentPage < totalPages - 2 && (
                <span className="text-gray-400 mx-1">...</span>
            )}

            <button 
                onClick={() => onPageChange(currentPage + 1)} 
                disabled={currentPage === totalPages}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-300 bg-[#1f2937] rounded-lg ml-2 hover:bg-[#293749] disabled:opacity-50 transition duration-150 border border-gray-700"
            >
                Next <ChevronDown className="h-4 w-4 -rotate-90 ml-1" />
            </button>
        </div>
    );
};

// Footer Component - Updated to match the centered, darker footer of the reference
const Footer = () => (
    <footer className="mt-12 p-6 bg-[#1f2937] border-t border-gray-700 text-gray-400 text-sm">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
            
            {/* Nav Links */}
            <div className="flex space-x-6 mb-4 md:mb-0">
                <a href="#" className="hover:text-white transition duration-150">Legal</a>
                <a href="#" className="hover:text-white transition duration-150">Company</a>
                <a href="#" className="hover:text-white transition duration-150">Support</a>
            </div>

            {/* Social Icons (using placeholders for a quick fix) */}
            <div className="flex space-x-4">
                <span className="cursor-pointer hover:text-white transition duration-150">🖧</span>
                <span className="cursor-pointer hover:text-white transition duration-150">🐦</span>
                <span className="cursor-pointer hover:text-white transition duration-150">📘</span>
                <span className="cursor-pointer hover:text-white transition duration-150">🚀</span>
            </div>
        </div>
        
        {/* Made With Text */}
        <p className="text-xs text-center mt-4 flex justify-center items-center text-[#4f46e5]">Made with <LayoutDashboard className="h-4 w-4 ml-1"/></p>
    </footer>
);


// --- Main App Component ---
export default function App() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ course: '', department: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

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

    // NEW LOGIC: Calculate Dynamic Student Statistics
    const studentStats = useMemo(() => {
        const total = MOCK_STUDENTS.length;
        const active = MOCK_STUDENTS.filter(s => s.Status === 'Active').length;
        // Inactive counts all students who are not explicitly 'Active'
        const inactive = total - active; 
        
        return { total, active, inactive };
    }, []); // MOCK_STUDENTS is static, so no dependency needed

    const handleNewStudent = () => {
        console.log('Action: Open form to add a new student!');
    };
    
    // Set global background to match the deep dark mode of the reference
    return (
        <div className="min-h-screen bg-[#111827] font-sans"> 
            <Navbar />
            
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                <h1 className="text-2xl font-bold text-white mb-4">Students Module</h1>
                
                {/* PASS DYNAMIC STATS TO THE HEADER */}
                <HeaderBanner studentStats={studentStats} />
                
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