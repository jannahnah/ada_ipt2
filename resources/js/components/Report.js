import React, { useCallback, useEffect, useState } from 'react';
import { FiDownload, FiFileText } from 'react-icons/fi';

const API_BASE = '/api';
const COURSES = ['Computer Science', 'Business Administration', 'Biology', 'Psychology', 'History', 'Electrical Engineering'];
const DEPARTMENTS = ['Engineering', 'Business', 'Sciences', 'Humanities'];
const initialStudentSummary = { total: 0, enrolled: 0, course: 'All' };
const initialFacultySummary = { total: 0, active: 0, department: 'All', departments: [] };

const formatTimestamp = (value) => {
  if (!value) return null;
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(value);
};

export default function Report() {
  const [studentCourseFilter, setStudentCourseFilter] = useState('All');
  const [facultyDepartmentFilter, setFacultyDepartmentFilter] = useState('All');
  const [students, setStudents] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [studentSummary, setStudentSummary] = useState(initialStudentSummary);
  const [facultySummary, setFacultySummary] = useState(initialFacultySummary);
  const [studentReportDate, setStudentReportDate] = useState(null);
  const [facultyReportDate, setFacultyReportDate] = useState(null);
  const [studentLoading, setStudentLoading] = useState(false);
  const [facultyLoading, setFacultyLoading] = useState(false);
  const [studentError, setStudentError] = useState(null);
  const [facultyError, setFacultyError] = useState(null);

  const fetchStudentReport = useCallback(async (filterValue) => {
    setStudentLoading(true);
    setStudentError(null);
    const params = new URLSearchParams();
    if (filterValue && filterValue !== 'All') {
      params.set('course', filterValue);
    }
    const queryString = params.toString();
    try {
      const response = await fetch(`${API_BASE}/reports/students${queryString ? `?${queryString}` : ''}`);
      if (!response.ok) {
        throw new Error(`Failed to load student report (${response.status})`);
      }
      const json = await response.json();
      const records = Array.isArray(json.students) ? json.students : [];
      setStudents(records);
      setStudentSummary({
        total: json.summary?.total ?? records.length,
        enrolled: json.summary?.enrolled ?? records.filter((record) => record.status === 'Enrolled').length,
        course: json.summary?.course ?? (filterValue || 'All'),
      });
      const timestamp = json.summary?.generated_at ?? json.generated_at;
      setStudentReportDate(timestamp ? new Date(timestamp) : new Date());
    } catch (err) {
      setStudents([]);
      setStudentSummary(initialStudentSummary);
      setStudentReportDate(null);
      setStudentError(err.message);
    } finally {
      setStudentLoading(false);
    }
  }, []);

  const fetchFacultyReport = useCallback(async (filterValue) => {
    setFacultyLoading(true);
    setFacultyError(null);
    const params = new URLSearchParams();
    if (filterValue && filterValue !== 'All') {
      params.set('department', filterValue);
    }
    const queryString = params.toString();
    try {
      const response = await fetch(`${API_BASE}/reports/faculties${queryString ? `?${queryString}` : ''}`);
      if (!response.ok) {
        throw new Error(`Failed to load faculty report (${response.status})`);
      }
      const json = await response.json();
      const records = Array.isArray(json.faculties) ? json.faculties : [];
      setFaculties(records);
      setFacultySummary({
        total: json.summary?.total ?? records.length,
        active: json.summary?.active ?? records.filter((record) => record.status === 'Active').length,
        department: json.summary?.department ?? (filterValue || 'All'),
        departments: json.summary?.departments ?? [...new Set(records.map((record) => record.department).filter(Boolean))],
      });
      const timestamp = json.summary?.generated_at ?? json.generated_at;
      setFacultyReportDate(timestamp ? new Date(timestamp) : new Date());
    } catch (err) {
      setFaculties([]);
      setFacultySummary(initialFacultySummary);
      setFacultyReportDate(null);
      setFacultyError(err.message);
    } finally {
      setFacultyLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudentReport(studentCourseFilter);
  }, [studentCourseFilter, fetchStudentReport]);

  useEffect(() => {
    fetchFacultyReport(facultyDepartmentFilter);
  }, [facultyDepartmentFilter, fetchFacultyReport]);

  const handleGenerateStudentReport = () => fetchStudentReport(studentCourseFilter);
  const handleGenerateFacultyReport = () => fetchFacultyReport(facultyDepartmentFilter);

  return (
    <div className="module-report">
      <section className="report-hero">
        <div>
          <p className="eyebrow">Reports</p>
          <h1>Academic Insights</h1>
          <p className="subtext">Generate filtered reports for students and faculty with a single click.</p>
        </div>
        <div className="hero-actions">
          <button type="button" className="secondary-btn" onClick={handleGenerateStudentReport}>
            <FiFileText /> Generate student report
          </button>
          <button type="button" className="primary-btn" onClick={handleGenerateFacultyReport}>
            <FiDownload /> Generate faculty report
          </button>
        </div>
      </section>

      <section className="panel student-report">
        <div className="panel-head">
          <div>
            <h2>Student report</h2>
            <small>Apply a course filter to focus on the program that matters most.</small>
          </div>
          <div className="panel-meta">
            {studentReportDate ? `Last generated at ${formatTimestamp(studentReportDate)}` : 'No student report generated yet'}
          </div>
        </div>

        <div className="filters">
          <div className="filter-select">
            <label htmlFor="student-course-filter">Course</label>
            <select
              id="student-course-filter"
              value={studentCourseFilter}
              onChange={(event) => setStudentCourseFilter(event.target.value)}
            >
              <option value="All">All courses</option>
              {COURSES.map((course) => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
          </div>
          <button type="button" className="ghost-btn" onClick={handleGenerateStudentReport}>Generate report</button>
        </div>

        <div className="summary-grid">
          <div className="summary-card">
            <p>Students in scope</p>
            <strong>{studentSummary.total}</strong>
          </div>
          <div className="summary-card">
            <p>Currently enrolled</p>
            <strong>{studentSummary.enrolled}</strong>
          </div>
          <div className="summary-card">
            <p>Course filter</p>
            <strong>{studentSummary.course}</strong>
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Course</th>
                <th>Year</th>
                <th>Status</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {studentLoading && (
                <tr>
                  <td colSpan={6} className="no-results">Loading student report...</td>
                </tr>
              )}
              {!studentLoading && studentError && (
                <tr>
                  <td colSpan={6} className="no-results error-message">{studentError}</td>
                </tr>
              )}
              {!studentLoading && !studentError && students.length === 0 && (
                <tr>
                  <td colSpan={6} className="no-results">No student records match the selected filters.</td>
                </tr>
              )}
              {!studentLoading && !studentError && students.map((student) => (
                <tr key={student.id || student.student_id}>
                  <td>{student.student_id || student.id}</td>
                  <td>{student.name || `${student.first_name ?? ''} ${student.last_name ?? ''}`}</td>
                  <td>{student.course || '—'}</td>
                  <td>{student.academic_year || '—'}</td>
                  <td>
                    <span className={`status-pill status-${(student.status || 'unknown').toLowerCase().replace(/\s+/g, '-')}`}>
                      {student.status || 'Unknown'}
                    </span>
                  </td>
                  <td>{student.email || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel faculty-report">
        <div className="panel-head">
          <div>
            <h2>Faculty report</h2>
            <small>Filter by department and audit teaching loads.</small>
          </div>
          <div className="panel-meta">
            {facultyReportDate ? `Last generated at ${formatTimestamp(facultyReportDate)}` : 'No faculty report generated yet'}
          </div>
        </div>

        <div className="filters">
          <div className="filter-select">
            <label htmlFor="faculty-department-filter">Department</label>
            <select
              id="faculty-department-filter"
              value={facultyDepartmentFilter}
              onChange={(event) => setFacultyDepartmentFilter(event.target.value)}
            >
              <option value="All">All departments</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <button type="button" className="ghost-btn" onClick={handleGenerateFacultyReport}>Generate report</button>
        </div>

        <div className="summary-grid">
          <div className="summary-card">
            <p>Faculty on the list</p>
            <strong>{facultySummary.total}</strong>
          </div>
          <div className="summary-card">
            <p>Active faculty</p>
            <strong>{facultySummary.active}</strong>
          </div>
          <div className="summary-card">
            <p>Departments represented</p>
            <strong>{facultySummary.departments?.length ?? 0}</strong>
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Faculty ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Position</th>
                <th>Status</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>
              {facultyLoading && (
                <tr>
                  <td colSpan={6} className="no-results">Loading faculty report...</td>
                </tr>
              )}
              {!facultyLoading && facultyError && (
                <tr>
                  <td colSpan={6} className="no-results error-message">{facultyError}</td>
                </tr>
              )}
              {!facultyLoading && !facultyError && faculties.length === 0 && (
                <tr>
                  <td colSpan={6} className="no-results">No faculty records match the selected filters.</td>
                </tr>
              )}
              {!facultyLoading && !facultyError && faculties.map((faculty) => (
                <tr key={faculty.id || faculty.faculty_id}>
                  <td>{faculty.faculty_id || faculty.id}</td>
                  <td>{faculty.name || `${faculty.first_name ?? ''} ${faculty.last_name ?? ''}`}</td>
                  <td>{faculty.department || '—'}</td>
                  <td>{faculty.position || '—'}</td>
                  <td>
                    <span className={`status-pill status-${(faculty.status || 'unknown').toLowerCase().replace(/\s+/g, '-')}`}>
                      {faculty.status || 'Unknown'}
                    </span>
                  </td>
                  <td>{faculty.phone_number || faculty.phone || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
