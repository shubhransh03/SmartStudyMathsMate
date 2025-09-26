import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container-app">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-extrabold text-gray-900 tracking-tight">StudyMate</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors">
              Home
            </Link>
            <Link to="/subject/maths" className="text-gray-700 hover:text-blue-600 transition-colors">
              Mathematics
            </Link>
            <Link to="/progress" className="text-gray-700 hover:text-blue-600 transition-colors">
              Progress
            </Link>
            <Link to="/practice" className="text-gray-700 hover:text-blue-600 transition-colors">
              Math Practice
            </Link>
            <Link to="/tips" className="text-gray-700 hover:text-blue-600 transition-colors">
              Tips & Tricks
            </Link>
            <Link to="/subject/maths" className="ml-2 inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">Get Started</Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <Link
              to="/"
              className="block py-2 text-gray-700 hover:text-blue-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            
            <Link
              to="/subject/maths"
              className="block py-2 text-blue-600 font-medium hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Mathematics
            </Link>
            
            <Link
              to="/progress"
              className="block py-2 text-gray-700 hover:text-blue-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Progress
            </Link>
            
            <Link
              to="/tips"
              className="block py-2 text-gray-700 hover:text-blue-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Tips & Tricks
            </Link>

            <Link
              to="/practice"
              className="block py-2 text-gray-700 hover:text-blue-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Math Practice
            </Link>
            <div className="pt-2">
              <Link to="/subject/maths" onClick={() => setIsMenuOpen(false)} className="w-full inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">Get Started</Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;