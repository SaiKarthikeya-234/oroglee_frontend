import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function BookAppointment() {
  const { dentistId } = useParams();
  const navigate = useNavigate();
  const [dentist, setDentist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [globalError, setGlobalError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    patient_name: '',
    email: '',
    age: '',
    gender: '',
    appointment_date: '',
  });
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchDentist = async () => {
      try {
        const response = await axios.get(`${API}/api/dentists/${dentistId}`);
        setDentist(response.data);
      } catch (error) {
        console.error('Error fetching dentist:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDentist();
  }, [dentistId]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateForm = () => {
    const errors = {};
    if (formData.patient_name.trim().length < 2) errors.patient_name = 'Name must be at least 2 characters';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Please enter a valid email address';
    if (!formData.age || formData.age < 1 || formData.age > 120) errors.age = 'Please enter a valid age';
    if (!formData.gender) errors.gender = 'Please select a gender';
    if (!formData.appointment_date) errors.appointment_date = 'Please select a date';
    else if (new Date(formData.appointment_date) < new Date(today)) errors.appointment_date = 'Date cannot be in the past';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError('');
    if (!validateForm()) return;
    
    setSubmitting(true);
    try {
      const response = await axios.post(`${API}/api/appointments`, {
        ...formData,
        age: parseInt(formData.age),
        dentist_id: dentistId,
        dentist_name: dentist.name,
        clinic_name: dentist.clinic_name,
      });
      setSuccess(response.data);
    } catch (error) {
      console.error('Error booking appointment:', error);
      setGlobalError(error.response?.data?.message || 'Failed to book appointment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  if (loading) {
    return (
      <div className="container form-page">
        <div className="card" style={{ padding: '48px 32px' }}>
          <div className="skeleton" style={{ width: 220, height: 32, margin: '0 auto 12px', borderRadius: 8 }} />
          <div className="skeleton" style={{ width: 160, height: 16, margin: '0 auto 32px', borderRadius: 4 }} />
          {[1, 2, 3, 4].map((i) => (
             <div key={i} style={{ marginBottom: 20 }}>
               <div className="skeleton" style={{ width: 100, height: 14, marginBottom: 8, borderRadius: 4 }} />
               <div className="skeleton" style={{ height: 44, borderRadius: 8 }} />
             </div>
          ))}
        </div>
      </div>
    );
  }

  if (success) {
    const formattedDate = new Date(formData.appointment_date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return (
      <div className="container form-page">
        <div className="card" style={{ padding: '0' }}>
          <div className="success-state">
            <div className="success-check">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h2>Visit Confirmed</h2>
            <p>Your appointment has been securely scheduled.</p>
            <p className="success-detail-row" style={{ borderBottom: 'none', justifyContent: 'center', marginBottom: '24px' }}>
              We sent a confirmation to &nbsp;<strong>{formData.email}</strong>
            </p>

            <div className="success-details-card">
              <div className="success-detail-row">
                <span className="detail-label">Specialist</span>
                <span className="detail-value">{dentist.name}</span>
              </div>
              <div className="success-detail-row">
                <span className="detail-label">Location</span>
                <span className="detail-value">{dentist.clinic_name}</span>
              </div>
              <div className="success-detail-row">
                <span className="detail-label">Date</span>
                <span className="detail-value" style={{ color: 'var(--primary-blue)' }}>{formattedDate}</span>
              </div>
              <div className="success-detail-row">
                <span className="detail-label">Patient Name</span>
                <span className="detail-value">{formData.patient_name}</span>
              </div>
            </div>

            {success.email_preview && (
              <div style={{ marginBottom: '24px' }}>
                <a
                  href={success.email_preview}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost"
                  style={{ fontSize: '0.9rem', color: 'var(--primary-blue)' }}
                >
                  View Email Preview ↗
                </a>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Link to="/" className="btn btn-secondary" style={{ width: 'auto' }}>
                Return to Search
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container form-page">
      <Link to="/" className="back-link">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        Back to search
      </Link>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="form-header">
          <h2>Book Appointment</h2>
          <p>Provide your details to securely schedule your visit</p>
        </div>

        <div className="form-body">
          {globalError && (
            <div className="form-error-text" style={{ padding: '12px', background: 'var(--danger-bg)', borderRadius: '8px', marginBottom: '20px' }}>
              {globalError}
            </div>
          )}

          {dentist && (
            <div className="form-dentist-preview">
              <img src={dentist.photo} alt={dentist.name} />
              <div className="preview-info">
                <h4>{dentist.name}</h4>
                <p>{dentist.qualification} • {dentist.clinic_name}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="patient_name">Legal First & Last Name</label>
              <input
                className={`form-input ${formErrors.patient_name ? 'is-invalid' : ''}`}
                type="text"
                id="patient_name"
                name="patient_name"
                placeholder="E.g., Jane Doe"
                value={formData.patient_name}
                onChange={handleChange}
              />
              {formErrors.patient_name && <div className="form-error-text">{formErrors.patient_name}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input
                className={`form-input ${formErrors.email ? 'is-invalid' : ''}`}
                type="email"
                id="email"
                name="email"
                placeholder="jane.doe@example.com"
                value={formData.email}
                onChange={handleChange}
              />
              {formErrors.email && <div className="form-error-text">{formErrors.email}</div>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="age">Age</label>
                <input
                  className={`form-input ${formErrors.age ? 'is-invalid' : ''}`}
                  type="number"
                  id="age"
                  name="age"
                  placeholder="28"
                  value={formData.age}
                  onChange={handleChange}
                />
                {formErrors.age && <div className="form-error-text">{formErrors.age}</div>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="gender">Gender</label>
                <select
                  className={`form-select ${formErrors.gender ? 'is-invalid' : ''}`}
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {formErrors.gender && <div className="form-error-text">{formErrors.gender}</div>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="appointment_date">Preferred Date</label>
              <input
                className={`form-input ${formErrors.appointment_date ? 'is-invalid' : ''}`}
                type="date"
                id="appointment_date"
                name="appointment_date"
                min={today}
                value={formData.appointment_date}
                onChange={handleChange}
              />
              {formErrors.appointment_date && <div className="form-error-text">{formErrors.appointment_date}</div>}
            </div>
          </form>
        </div>

        <div style={{ padding: '0 32px 32px' }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
            onClick={handleSubmit}
          >
            {submitting ? 'Processing...' : 'Confirm Booking'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookAppointment;
