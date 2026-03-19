import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function DentistList() {
  const [dentists, setDentists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters & Pagination
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
        setError('Failed to load dentists. Please check your connection.');
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
    <div className="container" style={{ paddingTop: '20px' }}>
      <div className="hero">
        <div className="skeleton" style={{ width: 160, height: 32, margin: '0 auto 24px', borderRadius: 20 }} />
        <div className="skeleton" style={{ width: '50%', height: 60, margin: '0 auto 16px', borderRadius: 12 }} />
        <div className="skeleton" style={{ width: '40%', height: 20, margin: '0 auto' }} />
      </div>
      <div className="dentist-grid">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="card skeleton">
            <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
              <div className="skeleton" style={{ width: 64, height: 64, borderRadius: '50%' }} />
              <div style={{ flex: 1, marginTop: 10 }}>
                <div className="skeleton" style={{ width: '70%', height: 20, marginBottom: 8 }} />
                <div className="skeleton" style={{ width: '40%', height: 14 }} />
              </div>
            </div>
            <div className="skeleton" style={{ width: 120, height: 24, borderRadius: 12, marginBottom: 20 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flexGrow: 1, marginBottom: 24 }}>
               <div className="skeleton" style={{ width: '80%', height: 14 }} />
               <div className="skeleton" style={{ width: '60%', height: 14 }} />
               <div className="skeleton" style={{ width: '70%', height: 14 }} />
            </div>
            <div className="skeleton" style={{ height: 44, borderRadius: 8 }} />
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) return renderSkeleton();

  if (error) {
    return (
      <div className="container" style={{ paddingTop: '80px', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: '440px', margin: '0 auto', padding: '48px 32px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚕️</div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Connection Error</h2>
          <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
          <button className="btn btn-primary" style={{ marginTop: '24px', width: 'auto' }} onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="hero">
        <div className="hero-badge">A Better Dental Experience</div>
        <h1>
          Find Your Perfect <br />
          <span style={{ color: 'var(--primary-blue)' }}>Dental Specialist</span>
        </h1>
        <p>Book appointments securely with top-rated professionals near you in just a few clicks.</p>
      </div>

      <div className="filters-bar">
        <div className="filter-group">
          <input 
            type="text" 
            className="form-input-minimal" 
            placeholder="Search by name or clinic..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        <div className="filter-group">
          <select className="form-select-minimal" value={speciality} onChange={e => setSpeciality(e.target.value)}>
            <option value="">Any Speciality</option>
            {specialities.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <select className="form-select-minimal" value={location} onChange={e => setLocation(e.target.value)}>
            <option value="">Any Location</option>
            {locations.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>

      <div className="dentist-grid">
        {currentDentists.map((dentist, index) => (
          <div
            key={dentist._id}
            className="card"
            style={{ animation: `fadeInSlide 0.5s var(--trans-base) ${0.05 * index}s backwards` }}
          >
            <div className="dentist-card-header">
              <div className="dentist-avatar">
                <img src={dentist.photo} alt={dentist.name} />
              </div>
              <div>
                <div className="dentist-name">{dentist.name}</div>
                <div className="dentist-qualification">{dentist.qualification}</div>
              </div>
            </div>

            <div className="experience-badge">
              {dentist.experience} Years Experience
            </div>

            <div className="dentist-info">
              <div className="dentist-info-row">
                <span className="info-icon">🏥</span>
                <span>{dentist.clinic_name}</span>
              </div>
              <div className="dentist-info-row">
                <span className="info-icon">📍</span>
                <span>{dentist.address}</span>
              </div>
              <div className="dentist-info-row">
                <span className="info-icon">🌍</span>
                <span>{dentist.location}</span>
              </div>
            </div>

            <Link
              to={`/book/${dentist._id}`}
              className="btn btn-primary"
            >
              Book Visit
            </Link>
          </div>
        ))}
      </div>

      {filteredDentists.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px', color: 'var(--text-muted)' }}>🔍</div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px', color: 'var(--text-primary)' }}>No Specialists Found</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Try adjusting your search criteria to see more results.</p>
          <button className="btn btn-secondary" style={{ width: 'auto' }} onClick={() => { setSearch(''); setSpeciality(''); setLocation(''); }}>Clear Filters</button>
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button 
            className="page-btn" 
            disabled={currentPage === 1} 
            onClick={() => { setCurrentPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          >
            &lt;
          </button>
          
          {[...Array(totalPages)].map((_, i) => (
            <button 
              key={i + 1} 
              className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
              onClick={() => { setCurrentPage(i + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            >
               {i + 1}
            </button>
          ))}

          <button 
            className="page-btn" 
            disabled={currentPage === totalPages} 
            onClick={() => { setCurrentPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );
}

export default DentistList;