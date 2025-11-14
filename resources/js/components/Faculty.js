import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FiSearch, FiChevronDown, FiPlus, FiUser, FiEdit3, FiTrash2, FiX } from 'react-icons/fi';

const DEPARTMENTS = ['Engineering', 'Business', 'Sciences', 'Humanities'];
const STATUS_OPTIONS = ['Active', 'On Leave', 'Retired'];
const FACULTY_API = '/api/faculties';

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
  }
};

const getCsrfToken = () => document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
const ensureCsrfCookie = async () => {
  try {
    await fetch('/sanctum/csrf-cookie', { credentials: 'same-origin' });
  } catch (err) {
    console.warn('ensureCsrfCookie failed', err);
  }
};

export default function Faculty() {
  const [facultyList, setFacultyList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ department: 'All', status: 'All' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalSaving, setModalSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadFaculty = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(FACULTY_API);
        if (!response.ok) {
          throw new Error(`Failed to load faculty (${response.status})`);
        }
        const data = await response.json();
        if (!cancelled) {
          setFacultyList(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    loadFaculty();
    return () => { cancelled = true; };
  }, []);

  const filteredFaculty = useMemo(() => {
    const lowerSearch = searchTerm.trim().toLowerCase();
    return facultyList.filter((faculty) => {
      const matchesDepartment = filters.department === 'All' || faculty.department === filters.department;
      const matchesStatus = filters.status === 'All' || faculty.status === filters.status;
      const name = faculty.name || `${faculty.first_name ?? ''} ${faculty.last_name ?? ''}`;
      const matchesSearch = !lowerSearch || name.toLowerCase().includes(lowerSearch) ||
        (faculty.faculty_id || '').toLowerCase().includes(lowerSearch);
      return matchesDepartment && matchesStatus && matchesSearch;
    });
  }, [facultyList, filters, searchTerm]);

  const resetFilters = () => setFilters({ department: 'All', status: 'All' });
  const openAddModal = () => setShowAddModal(true);
  const closeAddModal = () => setShowAddModal(false);

  const handleSaveFaculty = async (payload) => {
    setModalSaving(true);
    setModalMessage('');
    try {
      await ensureCsrfCookie();
      const csrfToken = getCsrfToken();
      const response = await fetch(FACULTY_API, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {})
        },
        body: JSON.stringify(payload)
      });
      const rawText = await response.text();
      const contentType = response.headers.get('content-type') || '';
      let body = rawText;
      if (contentType.includes('application/json')) {
        try {
          body = JSON.parse(rawText || '{}');
        } catch (_parseErr) {
          body = rawText;
        }
      }
      if (!response.ok) {
        const detail = typeof body === 'object' ? (body.message || JSON.stringify(body)) : body;
        throw new Error(detail ? `Create failed: ${response.status} ${detail}` : `Create failed: ${response.status}`);
      }
      const created = typeof body === 'object' ? body : null;
      if (!created) {
        throw new Error('Unexpected response from server while creating faculty.');
      }
      setFacultyList((prev) => [created, ...prev]);
      return created;
    } catch (err) {
      const message = err?.message || 'Unable to create faculty.';
      throw new Error(message);
    } finally {
      setModalSaving(false);
    }
  };

  return (
    <div className="faculty-dashboard">
      <section className="faculty-header-card">
        <div>
          <p className="eyebrow">Faculty Management</p>
          <h1>Team Directory</h1>
          <p className="subtext">Keep faculty information tidy, searchable, and ready for action.</p>
        </div>
        <div className="faculty-header-actions">
          <div className="search-input">
            <FiSearch />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by name or ID"
            />
          </div>
          <div className="header-buttons">
            <button type="button" className="filter-pill">
              <FiChevronDown className="icon" /> Filter
            </button>
            <button type="button" className="add-student-btn" onClick={openAddModal}>
              <FiPlus className="h-4 w-4" /> Add Faculty
            </button>
          </div>
        </div>
      </section>

      <section className="faculty-filter-panel">
        <div className="filter-select">
          <label>Department</label>
          <select
            value={filters.department}
            onChange={(event) => setFilters((prev) => ({ ...prev, department: event.target.value }))}
          >
            <option value="All">All departments</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
        <div className="filter-select">
          <label>Status</label>
          <select
            value={filters.status}
            onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
          >
            <option value="All">All statuses</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
        <button type="button" className="reset-link" onClick={resetFilters}>Reset filters</button>
      </section>

      <div className="faculty-table-card">
        <table>
          <thead>
            <tr>
              {['Avatar', 'Faculty ID', 'Name', 'Department', 'Position', 'Status', 'Actions'].map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="no-results">Loading faculty records...</td>
              </tr>
            )}
            {!loading && error && (
              <tr>
                <td colSpan={7} className="no-results">{error}</td>
              </tr>
            )}
            {!loading && !error && filteredFaculty.length === 0 && (
              <tr>
                <td colSpan={7} className="no-results">No faculty matched the filters.</td>
              </tr>
            )}
            {!loading && !error && filteredFaculty.map((faculty) => (
              <tr key={faculty.id || faculty.faculty_id}>
                <td className="avatar-cell">
                  {faculty.profile_picture ? (
                    <img src={faculty.profile_picture} alt={faculty.name || `${faculty.first_name} ${faculty.last_name}`} className="avatar-img" />
                  ) : (
                    <FiUser className="avatar-placeholder" />
                  )}
                </td>
                <td className="faculty-id-cell">{faculty.faculty_id || faculty.id}</td>
                <td>{faculty.name || `${faculty.first_name ?? ''} ${faculty.last_name ?? ''}`}</td>
                <td>{faculty.department}</td>
                <td>{faculty.position}</td>
                <td>
                  <span className={`status-pill status-${(faculty.status || 'unknown').replace(/\s+/g, '-').toLowerCase()}`}>
                    {faculty.status || 'Unknown'}
                  </span>
                </td>
                <td className="actions">
                  <button type="button" className="action-btn edit-btn" title="Edit"><FiEdit3 /></button>
                  <button type="button" className="action-btn archive-btn" title="Remove"><FiTrash2 /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showAddModal && (
        <AddFacultyModal onSave={handleSaveFaculty} onClose={closeAddModal} loading={modalSaving} />
      )}
    </div>
  );
}

const AddFacultyModal = ({ onSave, onClose, loading }) => {
  const [formData, setFormData] = useState({
    FacultyID: '',
    FirstName: '',
    LastName: '',
    Email: '',
    Department: DEPARTMENTS[0],
    Position: '',
    PhoneNumber: '',
    Status: STATUS_OPTIONS[0],
    Region: '',
    Province: '',
    City: '',
    ProfilePicture: ''
  });
  const [provinceOptions, setProvinceOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [formError, setFormError] = useState('');
  const firstInputRef = useRef(null);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegionChange = (event) => {
    const region = event.target.value;
    setFormData((prev) => ({ ...prev, Region: region, Province: '', City: '' }));
    if (!region) {
      setProvinceOptions([]);
      setCityOptions([]);
      return;
    }
    const provinces = Object.keys(PH_LOCATIONS[region]?.provinces || {});
    setProvinceOptions(provinces);
    setCityOptions([]);
  };

  const handleProvinceChange = (event) => {
    const province = event.target.value;
    setFormData((prev) => ({ ...prev, Province: province, City: '' }));
    const region = formData.Region;
    if (!region || !province) {
      setCityOptions([]);
      return;
    }
    setCityOptions(PH_LOCATIONS[region].provinces[province] || []);
  };

  const handleAvatar = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result);
      setFormData((prev) => ({ ...prev, ProfilePicture: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.FirstName.trim() || !formData.LastName.trim()) {
      setFormError('First and last name are required.');
      return;
    }
    setFormError('');
    const payload = {
      FacultyID: formData.FacultyID || null,
      FirstName: formData.FirstName,
      LastName: formData.LastName,
      Name: `${formData.FirstName} ${formData.LastName}`,
      Email: formData.Email,
      Department: formData.Department,
      Position: formData.Position,
      PhoneNumber: formData.PhoneNumber,
      Status: formData.Status,
      Region: formData.Region,
      Province: formData.Province,
      City: formData.City,
      ProfilePicture: formData.ProfilePicture || avatarPreview
    };
    try {
      await onSave(payload);
      onClose();
    } catch (err) {
      setFormError(err?.message || 'Failed to save faculty.');
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div className="modal-dialog" role="dialog" aria-modal="true" tabIndex={-1}>
        <div className="modal-header">
          <h3>Add New Faculty</h3>
          <button type="button" className="modal-close" onClick={onClose}><FiX /></button>
        </div>
        <form className="modal-body" onSubmit={handleSubmit}>
          <div className="modal-grid">
            <div className="form-field">
              <label className="form-label">Faculty ID</label>
              <input className="form-input" name="FacultyID" value={formData.FacultyID} onChange={handleChange} placeholder="Optional identifier" />
            </div>
            <div className="form-field">
              <label className="form-label">First Name</label>
              <input className="form-input" ref={firstInputRef} name="FirstName" value={formData.FirstName} onChange={handleChange} required />
            </div>
            <div className="form-field">
              <label className="form-label">Last Name</label>
              <input className="form-input" name="LastName" value={formData.LastName} onChange={handleChange} required />
            </div>
            <div className="form-field">
              <label className="form-label">Department</label>
              <select className="form-select" name="Department" value={formData.Department} onChange={handleChange}>
                {DEPARTMENTS.map((dept) => <option key={dept} value={dept}>{dept}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Position</label>
              <input className="form-input" name="Position" value={formData.Position} onChange={handleChange} placeholder="Professor, Instructor, etc." />
            </div>
            <div className="form-field">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" name="Email" value={formData.Email} onChange={handleChange} placeholder="faculty@example.com" />
            </div>
            <div className="form-field">
              <label className="form-label">Phone Number</label>
              <input className="form-input" name="PhoneNumber" value={formData.PhoneNumber} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label className="form-label">Status</label>
              <select className="form-select" name="Status" value={formData.Status} onChange={handleChange}>
                {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Region</label>
              <select className="form-select" name="Region" value={formData.Region} onChange={handleRegionChange}>
                <option value="">Select region</option>
                {Object.keys(PH_LOCATIONS).map((region) => <option key={region} value={region}>{region}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Province</label>
              <select className="form-select" name="Province" value={formData.Province} onChange={handleProvinceChange}>
                <option value="">Select province</option>
                {provinceOptions.map((prov) => <option key={prov} value={prov}>{prov}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">City</label>
              <select className="form-select" name="City" value={formData.City} onChange={handleChange}>
                <option value="">Select city</option>
                {cityOptions.map((city) => <option key={city} value={city}>{city}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Profile Picture</label>
              <input type="file" accept="image/*" className="form-input" onChange={handleAvatar} />
              {avatarPreview && <img src={avatarPreview} alt="preview" className="avatar-preview" />}
            </div>
          </div>
          {formError && <p className="error-text" role="alert">{formError}</p>}
          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="submit-btn add-student-btn" disabled={loading}>
              {loading ? 'Saving...' : 'Save Faculty'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
