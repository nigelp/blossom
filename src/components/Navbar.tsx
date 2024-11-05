import { Menu, X, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { auth } from '../lib/firebase';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-blue-600 text-white relative">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button 
              onClick={toggleMenu}
              className="p-2 rounded-lg hover:bg-blue-700 md:hidden"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <Link to="/" className="text-xl font-bold ml-2">Car Share</Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/find-ride" className="hover:text-blue-200">Find Ride</Link>
            <Link to="/create-ride" className="hover:text-blue-200">Create Ride Offer</Link>
            <Link to="/my-rides" className="hover:text-blue-200">My Ride Offers</Link>
            <Link to="/profile" className="hover:text-blue-200">Profile</Link>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 hover:text-blue-200"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-blue-600 border-t border-blue-500 shadow-lg">
            <div className="flex flex-col px-4 py-2">
              <Link 
                to="/find-ride" 
                className="py-2 hover:text-blue-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Find Ride
              </Link>
              <Link 
                to="/create-ride" 
                className="py-2 hover:text-blue-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Create Ride Offer
              </Link>
              <Link 
                to="/my-rides" 
                className="py-2 hover:text-blue-200"
                onClick={() => setIsMenuOpen(false)}
              >
                My Ride Offers
              </Link>
              <Link 
                to="/profile" 
                className="py-2 hover:text-blue-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Profile
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="py-2 text-left flex items-center space-x-2 hover:text-blue-200"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;