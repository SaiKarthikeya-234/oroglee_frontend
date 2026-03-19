import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function DentistList() {
  const [dentists, setDentists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [search, setSearch] = useState('');
  const [speciality, setSpeciality] = useState('');
  const [location, setLocation] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchDentists = async () => {
      try {
        const response = await axios.get(`${API}/api/dentists`);
        setDentists(response.data);
      } catch (error) {
        console.error('Error fetching dentists:', error);
        setError('Failed to load specialists. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchDentists();
  }, [API]);

  const specialities = [...new Set(dentists.map(d => d.qualification.split('-')[1]?.trim() || d.qualification))].filter(Boolean);
  const locations = [...new Set(dentists.map(d => d.location))].filter(Boolean);

  const filteredDentists = dentists.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.clinic_name.toLowerCase().includes(search.toLowerCase());
    const matchSpeciality = speciality ? d.qualification.includes(speciality) : true;
    const matchLocation = location ? d.location === location : true;
    return matchSearch && matchSpeciality && matchLocation;
  });

  const totalPages = Math.ceil(filteredDentists.length / itemsPerPage);
  const currentDentists = filteredDentists.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, speciality, location]);

  const renderSkeleton = () => (
    <div className="container" style={{ paddingTop: '100px' }}>
      <div className="hero">
        <div className="skeleton-lux" style={{ width: '40%', height: 64, margin: '0 auto 24px', borderRadius: 4 }} />
        <div className="skeleton-lux" style={{ width: '30%', height: 20, margin: '0 auto' }} />
      </div>
      <div className="dentist-grid">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="card-luxury skeleton-lux" style={{ height: '360px', opacity: 0.5 }}>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) return renderSkeleton();

  if (error) {
    return (
      <div className="container" style={{ paddingTop: '140px', textAlign: 'center' }}>
        <div className="lux-panel" style={{ maxWidth: '500px', margin: '0 auto' }}>
          <h2 className="serif-text" style={{ fontSize: '2rem', color: 'var(--accent-gold)', marginBottom: '16px' }}>Service Interruption</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>{error}</p>
          <button className="btn-outline" onClick={() => window.location.reload()}>Attempt Reconnection</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="hero">
        <h1>
          Curated Dental <span>Excellence</span>
        </h1>
        <p>Reserve absolute precision and premium care from our distinguished directory of specialists.</p>
      </div>

      <div className="filters-bar">
        <input 
          type="text" 
          className="form-input-luxury" 
          placeholder="Search practitioner or clinic..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
        />
        <select className="form-select-luxury" value={speciality} onChange={e => setSpeciality(e.target.value)}>
          <option value="">All Specialties</option>
          {specialities.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="form-select-luxury" value={location} onChange={e => setLocation(e.target.value)}>
          <option value="">All Locations</option>
          {locations.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      <div className="dentist-grid">
        {currentDentists.map((dentist, index) => (
          <div
            key={dentist._id}
            className="card-luxury"
            style={{ animation: `fadeUp 0.6s var(--trans-base) ${0.1 * index}s backwards` }}
          >
            <div className="dentist-card-header">
              <div className="dentist-avatar-lux">
                <img src={dentist.photo} alt={dentist.name} />
              </div>
              <div>
                <h3 className="dentist-name-lux">{dentist.name}</h3>
                <div className="dentist-qual-lux">{dentist.qualification}</div>
                <div className="exp-text">Est. Clinic / {dentist.experience}Yrs</div>
              </div>
            </div>

            <div className="dentist-info-lux">
              <div className="lux-info-row">
                <span className="label">Practice</span>
                <span className="value">{dentist.clinic_name}</span>
              </div>
              <div className="lux-info-row">
                <span className="label">Address</span>
                <span className="value" style={{ textTransform: 'capitalize' }}>{dentist.address}, {dentist.location.split(',')[0]}</span>
              </div>
            </div>

            <Link
              to={`/book/${dentist._id}`}
              className="btn-gold"
            >
              Reserve Consultation
            </Link>
          </div>
        ))}
      </div>

      {filteredDentists.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <h2 className="serif-text" style={{ fontSize: '2rem', marginBottom: '12px', color: 'var(--text-primary)' }}>No Specialists Available</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>We could not locate any practitioners matching your distinguished criteria.</p>
          <button className="btn-outline" style={{ maxWidth: '240px', margin: '0 auto' }} onClick={() => { setSearch(''); setSpeciality(''); setLocation(''); }}>Reset Preferences</button>
        </div>
      )}

      {totalPages > 1 && (
        <div className="lux-pagination">
          <button 
            className="lux-page-btn" 
            disabled={currentPage === 1} 
            onClick={() => { setCurrentPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          >
            &lsaquo;
          </button>
          
          {[...Array(totalPages)].map((_, i) => (
            <button 
              key={i + 1} 
              className={`lux-page-btn ${currentPage === i + 1 ? 'active' : ''}`}
              onClick={() => { setCurrentPage(i + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            >
               {i + 1}
            </button>
          ))}

          <button 
            className="lux-page-btn" 
            disabled={currentPage === totalPages} 
            onClick={() => { setCurrentPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          >
            &rsaquo;
          </button>
        </div>
      )}
    </div>
  );
}

export default DentistList;