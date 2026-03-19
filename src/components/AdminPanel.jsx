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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const API = import.meta.env.VITE_API_URL;

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
      setLoginError(err.response?.data?.message || 'Unauthorized access.');
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
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Could not update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this ledger entry permanently?')) return;
    try {
      await axios.delete(`${API}/api/appointments/${id}`);
      setAppointments((prev) => prev.filter((apt) => apt.id !== id));
    } catch (err) {
      console.error('Error deleting appointment:', err);
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
      <div className="auth-wrapper">
        <div className="auth-box">
          <h2 className="serif-text">Admin Login</h2>
          {loginError && <div style={{ color: 'var(--danger)', background: 'var(--danger-bg)', padding: '12px', textAlign: 'center', marginBottom: '24px', fontSize: '0.85rem' }}>{loginError}</div>}
          <form onSubmit={handleLogin}>
            <div className="form-group-lux">
              <label className="label-lux">username</label>
              <input
                className="input-lux"
                type="text"
                value={loginData.username}
                onChange={(e) => setLoginData((p) => ({ ...p, username: e.target.value }))}
                required
                autoFocus
              />
            </div>
            <div className="form-group-lux">
              <label className="label-lux">password</label>
              <input
                className="input-lux"
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData((p) => ({ ...p, password: e.target.value }))}
                required
              />
            </div>
            <button type="submit" className="btn-gold" disabled={loggingIn} style={{ marginTop: '32px' }}>
              {loggingIn ? 'Authenticating...' : 'Access Portal'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container admin-container">
      <div className="admin-header-lux">
        <h1 className="serif-text">Patient Ledger</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <span className="admin-stats">{appointments.length} Active Records</span>
          <button className="btn-outline" onClick={handleLogout} style={{ border: 'none', padding: '12px', width: 'auto' }}>
            Depart
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <input
          type="text"
          className="form-input-luxury"
          placeholder="Filter records..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', maxWidth: '400px' }}
        />
      </div>

      {loading ? (
        <div className="table-wrapper-lux skeleton-lux" style={{ height: '400px', opacity: 0.5 }}></div>
      ) : filteredAppointments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <h2 className="serif-text" style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>No Records Found</h2>
        </div>
      ) : (
        <div className="table-wrapper-lux">
          <div style={{ overflowX: 'auto' }}>
            <table className="table-lux">
              <thead>
                <tr>
                  <th>Client Name</th>
                  <th>Contact</th>
                  <th>Demographics</th>
                  <th>Reservation</th>
                  <th>Specialist</th>
                  <th>Practice</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentAppointments.map((apt) => (
                  <tr key={apt.id}>
                    <td className="lux-th-patient">{apt.patient_name}</td>
                    <td>{apt.email}</td>
                    <td>{apt.age} / {apt.gender.charAt(0)}</td>
                    <td style={{ color: 'var(--accent-gold)' }}>{formatDate(apt.appointment_date)}</td>
                    <td style={{ color: 'var(--text-primary)' }}>{apt.dentist_name}</td>
                    <td>{apt.clinic_name}</td>
                    <td>
                      <select
                        className="lux-status-select"
                        value={apt.status || 'Scheduled'}
                        onChange={(e) => handleStatusChange(apt.id, e.target.value)}
                      >
                        <option value="Scheduled">Scheduled</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>
                      <button className="action-remove" onClick={() => handleDelete(apt.id)}>
                        Revoke
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
        <div className="lux-pagination">
          <button className="lux-page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>&lsaquo;</button>
          {[...Array(totalPages)].map((_, i) => (
            <button key={i + 1} className={`lux-page-btn ${currentPage === i + 1 ? 'active' : ''}`} onClick={() => setCurrentPage(i + 1)}>
               {i + 1}
            </button>
          ))}
          <button className="lux-page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>&rsaquo;</button>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
