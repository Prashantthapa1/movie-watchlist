import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleLogout = async () => {
    await logout();
    setIsProfileDropdownOpen(false);
    navigate('/login');
  };

  const getUserInitials = () => {
    if (user && user.name) {
      return user.name.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // ✅ DRY navigation + actions - Role-based navigation
  const NAV_LINKS = useMemo(() => {
    if (user?.role === 'admin') {
      return [
        { to: '/admin/dashboard', label: 'Home' },
        { to: '/movies', label: 'All Movies' },
        { to: '/admin/manage-movies', label: "Manage Movies"},
        { to: '/admin/manage-users', label: 'Manage Users' },
        { to: '/admin/analytics', label: 'View Analytics' },
      ];
    }
    
    // User navigation
    return [
      { to: '/dashboard', label: 'Home' },
      { to: '/movies', label: 'Movies' },
      { to: '/favorites', label: 'Favorites' },
      { to: '/watched', label: 'Watched' },
    ];
  }, [user?.role]);

  return (
    <header className="flex justify-between items-center bg-gradient-to-r from-blue-500 via-pink-400 to-indigo-400 text-white px-3 py-5">
      <h2 className="font-bold text-2xl">My Movies</h2>

      {/* Desktop Nav */}
      <nav className="hidden md:flex gap-4 items-center list-none">
        {isAuthenticated && (
          NAV_LINKS.map(link => (
            <li key={link.to}>
              <Link to={link.to} className="p-1 hover:text-pink-300">{link.label}</Link>
            </li>
          ))
        )}

        {isAuthenticated && (
          <div
            className="relative"
            ref={dropdownRef}
            onMouseEnter={() => setIsProfileDropdownOpen(true)}
            onMouseLeave={() => setIsProfileDropdownOpen(false)}
          >
            <button
              onClick={toggleProfileDropdown}
              aria-haspopup="true"
              aria-expanded={isProfileDropdownOpen}
              className="p-1 mx-2 border rounded-full bg-white text-black w-8 h-8 flex items-center justify-center hover:bg-gray-100 focus:outline-none"
            >
              {getUserInitials()}
            </button>
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border">
                <div className="py-1">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    <p className="font-medium">{user?.name || 'User'}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <Link
                    to="/dashboard"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    📊 Dashboard
                  </Link>
                  <hr className="my-1" />
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    🚪 Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {!isAuthenticated && (
          <div className="flex gap-2">
            <Link to="/login" className="px-3 py-1 bg-white text-blue-500 rounded hover:bg-gray-100 text-sm font-medium">Login</Link>
            <Link to="/register" className="px-3 py-1 border border-white text-white rounded hover:bg-white hover:text-blue-500 text-sm font-medium">Register</Link>
          </div>
        )}
      </nav>

      {/* Hamburger Button (Mobile) */}
      <button className="md:hidden block focus:outline-none text-2xl" onClick={toggleMobileMenu}>☰</button>

      {/* Mobile Menu */}
      <div className={`${isMobileMenuOpen ? 'flex' : 'hidden'} flex-col bg-gradient-to-r from-blue-500 via-pink-400 to-indigo-400 text-white p-4 md:hidden`}>
        {isAuthenticated && (
          <>
            {NAV_LINKS.map(link => (
              <Link key={link.to} to={link.to} className="py-2 hover:text-pink-300" onClick={toggleMobileMenu}>{link.label}</Link>
            ))}
            <hr className="my-2 border-white/30" />
            <div className="py-2">
              <p className="text-sm font-medium">{user?.name || 'User'}</p>
              <p className="text-xs text-white/80">{user?.email}</p>
            </div>
            <button
              onClick={() => { handleLogout(); toggleMobileMenu(); }}
              className="py-2 text-left hover:text-pink-300"
            >
              🚪 Logout
            </button>
          </>
        )}
        {!isAuthenticated && (
          <>
            <Link to="/login" className="py-2 hover:text-pink-300" onClick={toggleMobileMenu}>🔑 Login</Link>
            <Link to="/register" className="py-2 hover:text-pink-300" onClick={toggleMobileMenu}>📝 Register</Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;