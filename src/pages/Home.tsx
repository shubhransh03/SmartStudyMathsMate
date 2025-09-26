import { Link } from 'react-router-dom';
import { Calculator, Lightbulb, Search, Star } from 'lucide-react';

const Home = () => {
  const subjects = [
    {
      name: 'Mathematics',
      icon: Calculator,
      color: 'from-blue-500 to-blue-600',
      path: '/subject/maths',
      description: 'Master algebra, geometry, quadratic equations, and more!'
    }
  ];

  const features = [
    {
      icon: Lightbulb,
      title: 'AI-Powered Math Explanations',
      description: 'Get simple, clear explanations for any mathematical concept in seconds!'
    },
    {
      icon: Search,
      title: 'Comprehensive Formula Reference',
      description: 'Quick access to all important formulas with proper mathematical notation.'
    },
    {
      icon: Star,
      title: 'Step-by-Step Solutions',
      description: 'Learn multiple methods to solve problems with detailed breakdowns.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-bounce">
            Master Mathematics with StudyMate! 🎓
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Step-by-step solutions, formula references, interactive tools, and AI-powered explanations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/subject/maths"
              className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-all duration-200 transform hover:scale-105"
            >
              Start Learning Now! 🚀
            </Link>
            <Link 
              to="/tips"
              className="border-2 border-white text-white px-8 py-3 rounded-full font-bold hover:bg-white hover:text-blue-600 transition-all duration-200"
            >
              Study Tips ✨
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Why Choose StudyMate? 🤔
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-xl bg-gray-50 hover:shadow-lg transition-all duration-200">
                <feature.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subjects Section */}
      <div className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Explore Mathematics Topics 📚
          </h2>
          <div className="grid grid-cols-1 gap-8 max-w-md mx-auto">
            {subjects.map((subject, index) => (
              <Link
                key={index}
                to={subject.path}
                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <div className={`bg-gradient-to-br ${subject.color} p-8 text-white`}>
                  <subject.icon className="h-12 w-12 mb-4 group-hover:scale-110 transition-transform duration-200" />
                  <h3 className="text-2xl font-bold mb-2">{subject.name}</h3>
                  <p className="opacity-90">{subject.description}</p>
                  <div className="absolute top-0 right-0 p-4 text-4xl opacity-20">
                    🔢
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-16 px-4 bg-gradient-to-r from-orange-400 to-red-500 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Ace Your Studies? 🏆</h2>
          <p className="text-xl mb-8 opacity-90">
            Join students who are already improving their grades with StudyMate!
          </p>
          <Link 
            to="/subject/maths"
            className="bg-white text-orange-500 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105"
          >
            Get Started Today! 🎯
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;