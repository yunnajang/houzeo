import { FaBars, FaTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  const { currentUser } = useSelector((state) => state.user);

  const navLinks = [
    { label: 'Rent', to: '/search?type=rent' },
    { label: 'Sale', to: '/search?type=sale' },
    { label: 'Entire Homes', to: '/search' },
  ];

  // 👉 Handle mobile menu toggle with animation
  const toggleMenu = () => {
    if (menuOpen) {
      setIsAnimatingOut(true); // triggers slide-out animation
    } else {
      setMenuOpen(true); // open menu instantly
    }
  };

  // 👉 When animating out, close menu after animation ends
  useEffect(() => {
    let timeout;

    if (isAnimatingOut) {
      timeout = setTimeout(() => {
        setMenuOpen(false);
        setIsAnimatingOut(false);
      }, 300);
    }

    return () => clearTimeout(timeout);
  }, [isAnimatingOut]);

  return (
    <header className='tracking-wide font-manrope bg-brand-white text-brand-main sticky top-0 z-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-8'>
        <div className='flex items-center justify-between gap-8 h-16'>
          {/* 👉 Logo (click closes mobile menu if open) */}
          <Link to='/' onClick={() => menuOpen && toggleMenu()}>
            <div
              className='font-bricolage font-extrabold text-2xl'
              role='heading'
            >
              Houzeo
            </div>
          </Link>

          {/* 👉 Desktop navigation */}
          <ul className='hidden sm:flex gap-6 flex-1 text-sm'>
            {navLinks.map(({ label, to }) => (
              <li key={to}>
                <Link to={to} className='link-opacity-hover'>
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          {/* 👉 Desktop user actions (auth/avatar) */}
          <div className='hidden sm:flex items-center gap-6'>
            {currentUser ? (
              <>
                <Link
                  to='/create-listing'
                  className='
                  text-brand-white bg-brand-main
                  button-opacity-hover'
                >
                  Post a Listing
                </Link>
                <Link to='/profile'>
                  <img
                    className='rounded-full h-8 w-8 object-cover'
                    src={currentUser.avatar}
                    alt='profile'
                  />
                </Link>
              </>
            ) : (
              <Link
                to='/sign-in'
                className='text-brand-white bg-brand-main button-opacity-hover'
              >
                Sign In
              </Link>
            )}
          </div>

          {/* 👉 Mobile menu toggle button */}
          <button onClick={toggleMenu} className='sm:hidden'>
            {menuOpen ? (
              <FaTimes className='w-6 h-6' />
            ) : (
              <FaBars className='w-6 h-6' />
            )}
          </button>

          {/* 👉 Mobile dropdown menu */}
          {menuOpen && (
            <div
              className={`fixed top-16 left-0 right-0 bottom-0 bg-brand-white z-50 py-8 px-4 sm:hidden animate-slideDown ${
                isAnimatingOut
                  ? 'animate-slideUpFadeOut'
                  : 'animate-slideDownFadeIn'
              }`}
            >
              <ul className='flex flex-col gap-6 text-lg'>
                {navLinks.map(({ label, to }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className='link-opacity-hover'
                      onClick={toggleMenu}
                    >
                      {label}
                    </Link>
                  </li>
                ))}

                {/* Auth / User actions */}
                {currentUser ? (
                  <>
                    <li>
                      <Link
                        to='/create-listing'
                        onClick={toggleMenu}
                        className='link-opacity-hover'
                      >
                        Post a Listing
                      </Link>
                    </li>
                    <li>
                      <Link
                        to='/profile'
                        onClick={toggleMenu}
                        className='link-opacity-hover'
                      >
                        My Profile
                      </Link>
                    </li>
                  </>
                ) : (
                  <li>
                    <Link
                      to='/sign-in'
                      onClick={toggleMenu}
                      className='link-opacity-hover'
                    >
                      Sign In
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
