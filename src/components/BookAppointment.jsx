import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function BookAppointment() {
  const { dentistId } = useParams();
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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Please provide a valid email';
    if (!formData.age || formData.age < 1 || formData.age > 120) errors.age = 'Invalid age';
    if (!formData.gender) errors.gender = 'Selection required';
    if (!formData.appointment_date) errors.appointment_date = 'Date is required';
    else if (new Date(formData.appointment_date) < new Date(today)) errors.appointment_date = 'Date must be future';
    
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
      console.error('Error booking:', error);
      setGlobalError(error.response?.data?.message || 'Processing error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  if (loading) {
    return (
      <div className="container form-page">
        <div className="lux-panel skeleton-lux" style={{ height: '600px', opacity: 0.5 }}></div>
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
      <div className="container form-page" style={{ paddingTop: '80px' }}>
        <div className="lux-panel success-box">
          <div className="success-icon-lux">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h2 className="serif-text">Reservation Confirmed</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Your consultation has been secured.</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Details dispatched to <strong>{formData.email}</strong></p>

          <div className="receipt-card">
            <div className="receipt-row">
              <span className="receipt-label">Specialist</span>
              <span className="receipt-val">{dentist.name}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Practice</span>
              <span className="receipt-val">{dentist.clinic_name}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Date</span>
              <span className="receipt-val highlight">{formattedDate}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Client</span>
              <span className="receipt-val">{formData.patient_name}</span>
            </div>
          </div>

          <Link to="/" className="btn-outline">
            Return to Directory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container form-page">
      <Link to="/" className="back-link-lux">
        &lsaquo; Return to Practitioners
      </Link>

      <div className="lux-panel">
        <div className="lux-form-header">
          <h2 className="serif-text">Consultation Request</h2>
          <p>Provide your details to securely arrange your visit</p>
        </div>

        {globalError && (
          <div style={{ color: 'var(--danger)', background: 'var(--danger-bg)', padding: '16px', borderRadius: '4px', marginBottom: '32px', fontSize: '0.9rem', textAlign: 'center' }}>
            {globalError}
          </div>
        )}

        {dentist && (
          <div className="lux-dentist-summary">
            <img src={dentist.photo} alt={dentist.name} />
            <div>
              <h4>{dentist.name}</h4>
              <p>{dentist.qualification} — {dentist.clinic_name}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group-lux">
            <label className="label-lux">Full Legal Name</label>
            <input
              className="input-lux"
              type="text"
              name="patient_name"
              placeholder="e.g. Jane Doe"
              value={formData.patient_name}
              onChange={handleChange}
              style={formErrors.patient_name ? { borderColor: 'var(--danger)' } : {}}
            />
          </div>

          <div className="form-group-lux">
            <label className="label-lux">Email Contact</label>
            <input
              className="input-lux"
              type="email"
              name="email"
              placeholder="jane.doe@example.com"
              value={formData.email}
              onChange={handleChange}
              style={formErrors.email ? { borderColor: 'var(--danger)' } : {}}
            />
          </div>

          <div className="form-row-lux">
            <div className="form-group-lux">
              <label className="label-lux">Age</label>
              <input
                className="input-lux"
                type="number"
                name="age"
                placeholder="28"
                value={formData.age}
                onChange={handleChange}
                style={formErrors.age ? { borderColor: 'var(--danger)' } : {}}
              />
            </div>
            <div className="form-group-lux">
              <label className="label-lux">Identification</label>
              <select
                className="input-lux"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                style={formErrors.gender ? { borderColor: 'var(--danger)' } : {}}
              >
                <option value="">Select...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group-lux">
            <label className="label-lux">Preferred Date</label>
            <input
              className="input-lux"
              type="date"
              name="appointment_date"
              min={today}
              value={formData.appointment_date}
              onChange={handleChange}
              style={formErrors.appointment_date ? { borderColor: 'var(--danger)' } : {}}
            />
          </div>

          <button
            type="submit"
            className="btn-gold"
            disabled={submitting}
            style={{ marginTop: '24px' }}
          >
            {submitting ? 'Authenticating...' : 'Secure Reservation'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default BookAppointment;
