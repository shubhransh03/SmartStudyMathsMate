import { BookOpen, Mail, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-200 mt-16">
      <div className="container-app py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-blue-400" />
              <span className="text-xl font-bold text-white">StudyMate</span>
            </div>
            <p className="text-gray-400 text-sm">
              Making learning fun and easy for students up to Class 10. Get clear explanations and interactive tools.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <div className="space-y-2 text-sm">
              <Link to="/" className="text-gray-300 hover:text-white">Home</Link><br/>
              <Link to="/subject/maths" className="text-gray-300 hover:text-white">Mathematics</Link><br/>
              <Link to="/progress" className="text-gray-300 hover:text-white">Progress</Link><br/>
              <Link to="/practice" className="text-gray-300 hover:text-white">Math Practice</Link><br/>
              <Link to="/tips" className="text-gray-300 hover:text-white">Tips & Tricks</Link><br/>
            </div>
          </div>

          {/* About & Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Get in Touch</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-400" />
                <span className="text-gray-300">We help students learn better with guided practice.</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-400" />
                <span className="text-gray-300">contact@studymate.example</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-xs text-gray-500">
          <p>© {new Date().getFullYear()} StudyMate</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;