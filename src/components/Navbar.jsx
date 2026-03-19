import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <div className="navbar-brand-dot"></div>
          DENTIFY
        </Link>
        <div className="navbar-links">
          <Link
            to="/"
            className={location.pathname === '/' ? 'active' : ''}
          >
            Specialists
          </Link>
          <Link
            to="/admin"
            className={location.pathname === '/admin' ? 'active' : ''}
          >
            Concierge Desk
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
