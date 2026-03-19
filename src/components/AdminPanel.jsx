import { useState, useEffect } from 'react';
import axios from 'axios';

function AdminPanel() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const API = import.meta.env.VITE_API_URL;

  const showToast = (type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const session = sessionStorage.getItem('admin_auth');
    if (session === 'true') {
      setAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    setLoading(true);
    axios
      .get(`${API}/api/appointments`)
      .then((res) => setAppointments(res.data))
      .catch((err) => console.error('Error fetching appointments:', err))
      .finally(() => setLoading(false));
  }, [authenticated]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);
    try {
      const res = await axios.post(`${API}/api/admin/login`, loginData);
      if (res.data.success) {
        sessionStorage.setItem('admin_auth', 'true');
        setAuthenticated(true);
      }
    } catch (err) {
      setLoginError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth');
    setAuthenticated(false);
    setLoginData({ username: '', password: '' });
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`${API}/api/appointments/${id}/status`, { status: newStatus });
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === id ? { ...apt, status: newStatus } : apt))
      );
      showToast('success', 'Status Updated', 'The appointment status has been changed.');
    } catch (err) {
      console.error('Error updating status:', err);
      showToast('error', 'Update Failed', 'Could not change the status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) return;
    try {
      await axios.delete(`${API}/api/appointments/${id}`);
      setAppointments((prev) => prev.filter((apt) => apt.id !== id));
      showToast('info', 'Deleted', 'The appointment was successfully removed.');
    } catch (err) {
      console.error('Error deleting appointment:', err);
      showToast('error', 'Delete Failed', 'Could not delete the appointment.');
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    const q = search.toLowerCase();
    return (
      apt.patient_name.toLowerCase().includes(q) ||
      apt.email.toLowerCase().includes(q) ||
      apt.dentist_name.toLowerCase().includes(q) ||
      apt.clinic_name.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
  const currentAppointments = filteredAppointments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  if (!authenticated) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-icon">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </div>
          <h2>Admin Login</h2>
          <p>Sign in to access the patient dashboard</p>
          {loginError && <div className="auth-error">{loginError}</div>}
          <form onSubmit={handleLogin} style={{ marginTop: '24px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="admin-username">Username</label>
              <input
                className="form-input"
                type="text"
                id="admin-username"
                placeholder="Enter staff username"
                value={loginData.username}
                onChange={(e) => setLoginData((p) => ({ ...p, username: e.target.value }))}
                required
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="admin-password">Password</label>
              <input
                className="form-input"
                type="password"
                id="admin-password"
                placeholder="Enter password"
                value={loginData.password}
                onChange={(e) => setLoginData((p) => ({ ...p, password: e.target.value }))}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loggingIn}
              style={{ marginTop: '16px' }}
            >
              {loggingIn ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container admin-page">
      <div className="admin-top">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h1>Dashboard</h1>
          <span className="admin-count">{appointments.length} Total Patients</span>
        </div>
        <button className="btn btn-ghost" onClick={handleLogout} style={{ fontWeight: '600' }}>
          Sign Out &rarr;
        </button>
      </div>

      <div className="filters-bar" style={{ justifyContent: 'flex-start', padding: 0, marginBottom: '24px', background: 'transparent', boxShadow: 'none', border: 'none' }}>
        <div className="filter-group" style={{ flexGrow: 1, maxWidth: '400px' }}>
          <input
            type="text"
            className="form-input-minimal"
            placeholder="Search patients, dentists, clinics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', background: 'var(--bg-card)' }}
          />
        </div>
      </div>

      {loading ? (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                {['Patient', 'Contact Info', 'Age', 'Gender', 'Visit Date', 'Specialist', 'Clinic', 'Status', 'Actions'].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((j) => (
                    <td key={j}>
                      <div
                        className="skeleton"
                        style={{ width: `${60 + Math.random() * 30}%`, height: '16px', borderRadius: '4px' }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px', color: 'var(--text-muted)' }}>📂</div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', color: 'var(--text-primary)' }}>No Appointments Found</h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            {search ? 'Try adjusting your search query.' : 'There are no patient appointments scheduled yet.'}
          </p>
        </div>
      ) : (
        <div className="data-table-wrap">
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Contact Info</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Visit Date</th>
                  <th>Specialist</th>
                  <th>Clinic</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentAppointments.map((apt) => (
                  <tr key={apt.id}>
                    <td className="table-cell-primary">{apt.patient_name}</td>
                    <td>{apt.email}</td>
                    <td>{apt.age}</td>
                    <td>
                      <span className={`badge badge-${(apt.gender || '').toLowerCase()}`}>
                        {apt.gender}
                      </span>
                    </td>
                    <td style={{ fontWeight: '500' }}>{formatDate(apt.appointment_date)}</td>
                    <td style={{ color: 'var(--primary-blue)', fontWeight: '600' }}>{apt.dentist_name}</td>
                    <td>{apt.clinic_name}</td>
                    <td>
                      <select
                        className="form-select"
                        style={{ padding: '6px 36px 6px 12px', fontSize: '0.85rem', minWidth: '130px', background: 'transparent' }}
                        value={apt.status || 'Scheduled'}
                        onChange={(e) => handleStatusChange(apt.id, e.target.value)}
                      >
                        <option value="Scheduled">Scheduled</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                        onClick={() => handleDelete(apt.id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button 
            className="page-btn" 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(p => p - 1)}
          >
            &lt;
          </button>
          
          {[...Array(totalPages)].map((_, i) => (
            <button 
              key={i + 1} 
              className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
              onClick={() => setCurrentPage(i + 1)}
            >
               {i + 1}
            </button>
          ))}

          <button 
            className="page-btn" 
            disabled={currentPage === totalPages} 
            onClick={() => setCurrentPage(p => p + 1)}
          >
            &gt;
          </button>
        </div>
      )}

      {toast && (
        <div className="toast-container">
          <div className="toast">
            <div className="toast-icon">
              {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'}
            </div>
            <div className="toast-content">
              <h4>{toast.title}</h4>
              <p>{toast.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
