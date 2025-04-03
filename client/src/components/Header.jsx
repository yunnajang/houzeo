import { memo, useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import useUserStore from '../store/userStore';

// Desktop navigation component
const DesktopNav = memo(({ navLinks }) => (
  <nav className='hidden sm:block flex-1 text-[15px]'>
    <ul className='flex gap-6'>
      {navLinks.map(({ label, to }) => (
        <li key={to}>
          <Link to={to} className='nav-link-hover'>
            {label}
          </Link>
        </li>
      ))}
    </ul>
  </nav>
));

// Desktop user actions component
const DesktopUserActions = memo(({ currentUser }) => (
  <div className='hidden sm:flex items-center gap-4'>
    {currentUser ? (
      <>
        <Link to='/create-listing' className='button-hover'>
          Post a Listing
        </Link>
        <Link to='/profile'>
          <img
            className='rounded-full h-8 w-8 object-cover box-content border-2 border-transparent hover:border-brand-secondary transition-all duration-200'
            src={currentUser.avatar}
            alt='profile'
          />
        </Link>
      </>
    ) : (
      <Link to='/sign-in' className='button-hover'>
        Sign In
      </Link>
    )}
  </div>
));

// Mobile navigation component
const MobileNav = memo(
  ({ navLinks, currentUser, toggleMenu, isAnimatingOut }) => (
    <nav
      className={`fixed top-16 left-0 right-0 bottom-0 bg-brand-white z-50 py-8 px-5 sm:hidden ${
        isAnimatingOut ? 'animate-slideUpFadeOut' : 'animate-slideDownFadeIn'
      }`}
    >
      <ul className='flex flex-col gap-6 text-lg'>
        {navLinks.map(({ label, to }) => (
          <li key={to}>
            <Link to={to} className='nav-link-hover' onClick={toggleMenu}>
              {label}
            </Link>
          </li>
        ))}

        {/* Auth / User actions */}
        {currentUser ? (
          <>
            <li className='pt-6 border-t border-brand-secondary/20'>
              <Link
                to='/create-listing'
                onClick={toggleMenu}
                className='nav-link-hover'
              >
                Post a Listing
              </Link>
            </li>
            <li>
              <Link
                to='/profile'
                onClick={toggleMenu}
                className='nav-link-hover'
              >
                My Profile
              </Link>
            </li>
          </>
        ) : (
          <li className='pt-6 border-t border-brand-secondary/20'>
            <Link to='/sign-in' onClick={toggleMenu} className='button-hover'>
              Sign In
            </Link>
          </li>
        )}
      </ul>
    </nav>
  )
);

function Header() {
  const { currentUser } = useUserStore();
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Entire Homes', to: '/search' },
    { label: 'Rent', to: '/search?type=rent' },
    { label: 'Sale', to: '/search?type=sale' },
  ];

  // Handle mobile menu toggle with animation
  const toggleMenu = useCallback(() => {
    if (menuOpen) {
      setIsAnimatingOut(true);
    } else {
      setMenuOpen(true);
    }
  }, [menuOpen]);

  // Handle logo click (closes menu if open)
  const handleLogoClick = useCallback(() => {
    if (menuOpen) {
      toggleMenu();
    }
  }, [menuOpen, toggleMenu]);

  // When animating out, close menu after animation ends
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

  // Close menu when screen resizes past breakpoint
  useEffect(() => {
    const handleResize = () => {
      // sm breakpoint in Tailwind is 640px by default
      if (window.innerWidth >= 640) {
        setIsAnimatingOut(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header className='text-brand-main bg-brand-white sticky top-0 z-50'>
      <div className='max-w-6xl mx-auto px-5 sm:px-8 flex items-center justify-between gap-6 h-16 md:h-[72px]'>
        {/* Logo */}
        <Link to='/' onClick={handleLogoClick}>
          <h1 className='font-bricolage font-extrabold text-2xl'>Houzeo</h1>
        </Link>

        {/* Desktop navigation */}
        <DesktopNav navLinks={navLinks} />

        {/* Desktop user actions */}
        <DesktopUserActions currentUser={currentUser} />

        {/* Mobile menu toggle button */}
        <button
          onClick={toggleMenu}
          className='sm:hidden relative group'
          aria-expanded={menuOpen}
          aria-label='Toggle navigation menu'
        >
          <span className='absolute inset-0 rounded-md bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200'></span>
          <span className='relative p-1.5 block'>
            {menuOpen ? (
              <FaTimes className='w-5 h-5' aria-hidden='true' />
            ) : (
              <FaBars className='w-5 h-5' aria-hidden='true' />
            )}
          </span>
        </button>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <MobileNav
            navLinks={navLinks}
            currentUser={currentUser}
            toggleMenu={toggleMenu}
            isAnimatingOut={isAnimatingOut}
          />
        )}
      </div>
    </header>
  );
}

export default Header;
