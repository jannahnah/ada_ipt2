import React, { useMemo, useState } from 'react';
import { FiPlus, FiEdit3, FiArchive, FiRotateCcw } from 'react-icons/fi';

const TAB_CONFIG = [
  { id: 'courses', label: 'Courses' },
  { id: 'academicYears', label: 'Academic Years' },
  { id: 'archived', label: 'Archived' }
];

const SAMPLE_COURSES = [
  { id: 'course-1', title: 'Computer Science', code: 'CS-101', description: 'Core computing curriculum' },
  { id: 'course-2', title: 'Business Administration', code: 'BA-204', description: 'Leadership + strategy' }
];

const SAMPLE_YEARS = [
  { id: 'year-1', year: '2024/2025', start: '2024-09-01', end: '2025-06-30' },
  { id: 'year-2', year: '2023/2024', start: '2023-09-01', end: '2024-06-30' }
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('courses');
  const [courses, setCourses] = useState(SAMPLE_COURSES);
  const [academicYears, setAcademicYears] = useState(SAMPLE_YEARS);
  const [archivedCourses, setArchivedCourses] = useState([]);
  const [archivedYears, setArchivedYears] = useState([]);
  const [courseForm, setCourseForm] = useState({ title: '', code: '' });
  const [yearForm, setYearForm] = useState({ year: '', start: '', end: '' });
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [editingYearId, setEditingYearId] = useState(null);
  const [formAlert, setFormAlert] = useState('');

  const archivedItems = useMemo(
    () => [
      ...archivedCourses.map((item) => ({ ...item, type: 'Course' })),
      ...archivedYears.map((item) => ({ ...item, type: 'Academic Year' }))
    ],
    [archivedCourses, archivedYears]
  );

  const resetCourseForm = () => {
    setCourseForm({ title: '', code: '' });
    setEditingCourseId(null);
  };

  const resetYearForm = () => {
    setYearForm({ year: '', start: '', end: '' });
    setEditingYearId(null);
  };

  const handleCourseSubmit = (event) => {
    event.preventDefault();
    if (!courseForm.title.trim() || !courseForm.code.trim()) {
      setFormAlert('Both course title and code are required.');
      return;
    }
    setFormAlert('');
    if (editingCourseId) {
      setCourses((prev) =>
        prev.map((course) => (course.id === editingCourseId ? { ...course, ...courseForm } : course))
      );
    } else {
      setCourses((prev) => [
        { id: `course-${Date.now()}`, ...courseForm },
        ...prev
      ]);
    }
    resetCourseForm();
  };

  const handleYearSubmit = (event) => {
    event.preventDefault();
    if (!yearForm.year.trim() || !yearForm.start || !yearForm.end) {
      setFormAlert('Please provide the academic year plus start and end dates.');
      return;
    }
    setFormAlert('');
    if (editingYearId) {
      setAcademicYears((prev) => prev.map((year) => (year.id === editingYearId ? { ...year, ...yearForm } : year)));
    } else {
      setAcademicYears((prev) => [
        { id: `year-${Date.now()}`, ...yearForm },
        ...prev
      ]);
    }
    resetYearForm();
  };

  const handleEditCourse = (course) => {
    setCourseForm({ title: course.title, code: course.code });
    setEditingCourseId(course.id);
    setActiveTab('courses');
  };

  const handleEditYear = (year) => {
    setYearForm({ year: year.year, start: year.start, end: year.end });
    setEditingYearId(year.id);
    setActiveTab('academicYears');
  };

  const archiveCourse = (id) => {
    setCourses((prev) => {
      const target = prev.find((course) => course.id === id);
      if (!target) return prev;
      setArchivedCourses((items) => [{ ...target, archivedAt: new Date().toISOString() }, ...items]);
      return prev.filter((course) => course.id !== id);
    });
    if (editingCourseId === id) resetCourseForm();
  };

  const archiveYear = (id) => {
    setAcademicYears((prev) => {
      const target = prev.find((year) => year.id === id);
      if (!target) return prev;
      setArchivedYears((items) => [{ ...target, archivedAt: new Date().toISOString() }, ...items]);
      return prev.filter((year) => year.id !== id);
    });
    if (editingYearId === id) resetYearForm();
  };

  const restoreItem = (item) => {
    if (item.type === 'Course') {
      setArchivedCourses((prev) => prev.filter((arch) => arch.id !== item.id));
      setCourses((prev) => [{ id: item.id, title: item.title, code: item.code }, ...prev]);
    } else {
      setArchivedYears((prev) => prev.filter((arch) => arch.id !== item.id));
      setAcademicYears((prev) => [{ id: item.id, year: item.year, start: item.start, end: item.end }, ...prev]);
    }
  };

  return (
    <div className="module-settings">
      <div className="settings-header">
        <p className="eyebrow">System settings</p>
        <h1>Academic configurations</h1>
        <p className="subtext">Manage courses, academic years, and keep track of archived entries for reporting.</p>
      </div>
      <div className="settings-tabs">
        {TAB_CONFIG.map((tab) => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'courses' && (
        <section className="settings-panel">
          <div className="panel-form">
            <div className="panel-heading">
              <h2>{editingCourseId ? 'Edit course' : 'Add course'}</h2>
              <p>Keep your catalog organized and versioned.</p>
            </div>
            <form onSubmit={handleCourseSubmit} className="settings-form">
              <label>
                Course Title
                <input
                  value={courseForm.title}
                  onChange={(event) => setCourseForm((prev) => ({ ...prev, title: event.target.value }))}
                  placeholder="e.g. Digital Marketing"
                />
              </label>
              <label>
                Course Code
                <input
                  value={courseForm.code}
                  onChange={(event) => setCourseForm((prev) => ({ ...prev, code: event.target.value }))}
                  placeholder="e.g. MKT-301"
                />
              </label>
              {formAlert && <p className="form-alert">{formAlert}</p>}
              <div className="form-actions">
                {editingCourseId && (
                  <button type="button" className="ghost-btn" onClick={resetCourseForm}>
                    Cancel edit
                  </button>
                )}
                <button type="submit" className="primary-btn">
                  <FiPlus /> {editingCourseId ? 'Save changes' : 'Add course'}
                </button>
              </div>
            </form>
          </div>
          <div className="panel-table">
            <div className="panel-heading">
              <h3>Active courses</h3>
              <p>Tap actions to modify or archive.</p>
            </div>
            <div className="settings-table">
              <div className="table-head">
                <span>Title</span>
                <span>Code</span>
                <span>Actions</span>
              </div>
              {courses.length === 0 && <p className="empty">No active courses. Add one above.</p>}
              {courses.map((course) => (
                <div key={course.id} className="table-row">
                  <span>{course.title}</span>
                  <span>{course.code}</span>
                  <span className="row-actions">
                    <button type="button" className="ghost-btn" onClick={() => handleEditCourse(course)}>
                      <FiEdit3 /> Edit
                    </button>
                    <button type="button" className="ghost-btn danger" onClick={() => archiveCourse(course.id)}>
                      <FiArchive /> Archive
                    </button>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {activeTab === 'academicYears' && (
        <section className="settings-panel">
          <div className="panel-form">
            <div className="panel-heading">
              <h2>{editingYearId ? 'Edit academic year' : 'Add academic year'}</h2>
              <p>Each year defines enrollment cycles for reports.</p>
            </div>
            <form onSubmit={handleYearSubmit} className="settings-form">
              <label>
                Year label
                <input
                  value={yearForm.year}
                  onChange={(event) => setYearForm((prev) => ({ ...prev, year: event.target.value }))}
                  placeholder="e.g. 2025/2026"
                />
              </label>
              <label>
                Start date
                <input
                  type="date"
                  value={yearForm.start}
                  onChange={(event) => setYearForm((prev) => ({ ...prev, start: event.target.value }))}
                />
              </label>
              <label>
                End date
                <input
                  type="date"
                  value={yearForm.end}
                  onChange={(event) => setYearForm((prev) => ({ ...prev, end: event.target.value }))}
                />
              </label>
              {formAlert && <p className="form-alert">{formAlert}</p>}
              <div className="form-actions">
                {editingYearId && (
                  <button type="button" className="ghost-btn" onClick={resetYearForm}>
                    Cancel edit
                  </button>
                )}
                <button type="submit" className="primary-btn">
                  <FiPlus /> {editingYearId ? 'Save changes' : 'Add academic year'}
                </button>
              </div>
            </form>
          </div>
          <div className="panel-table">
            <div className="panel-heading">
              <h3>Academic years</h3>
              <p>Active cycles that drive enrollments.</p>
            </div>
            <div className="settings-table">
              <div className="table-head">
                <span>Year</span>
                <span>Start</span>
                <span>End</span>
                <span>Actions</span>
              </div>
              {academicYears.length === 0 && <p className="empty">No academic years defined yet.</p>}
              {academicYears.map((year) => (
                <div key={year.id} className="table-row">
                  <span>{year.year}</span>
                  <span>{year.start}</span>
                  <span>{year.end}</span>
                  <span className="row-actions">
                    <button type="button" className="ghost-btn" onClick={() => handleEditYear(year)}>
                      <FiEdit3 /> Edit
                    </button>
                    <button type="button" className="ghost-btn danger" onClick={() => archiveYear(year.id)}>
                      <FiArchive /> Archive
                    </button>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {activeTab === 'archived' && (
        <section className="archived-panel">
          <div className="panel-heading">
            <h2>Archived items</h2>
            <p>These entries were archived. Restore them to make them active again.</p>
          </div>
          {archivedItems.length === 0 ? (
            <p className="empty">No archived data yet.</p>
          ) : (
            <div className="settings-table">
              <div className="table-head">
                <span>Type</span>
                <span>Label</span>
                <span>Details</span>
                <span>Actions</span>
              </div>
              {archivedItems.map((item) => (
                <div key={item.id} className="table-row">
                  <span>{item.type}</span>
                  <span>{item.type === 'Course' ? item.title : item.year}</span>
                  <span>
                    {item.type === 'Course'
                      ? item.code
                      : `${item.start} → ${item.end}`}
                  </span>
                  <span className="row-actions">
                    <button type="button" className="ghost-btn" onClick={() => restoreItem(item)}>
                      <FiRotateCcw /> Restore
                    </button>
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
