import { Lightbulb, Clock, BookMarked, Target, Brain, Star } from 'lucide-react';

const TipsAndTricks = () => {
  const tips = [
    {
      category: 'Study Techniques',
      icon: Brain,
      color: 'from-purple-500 to-purple-600',
      tips: [
        'Break study sessions into 25-minute chunks (Pomodoro Technique)',
        'Create colorful mind maps for complex topics',
        'Teach someone else what you learned - it helps you remember better!',
        'Use flashcards for quick revision of important formulas and facts'
      ]
    },
    {
      category: 'Time Management',
      icon: Clock,
      color: 'from-blue-500 to-blue-600',
      tips: [
        'Make a daily study schedule and stick to it',
        'Study your most difficult subject when your mind is fresh',
        'Take 5-10 minute breaks between subjects',
        'Prepare a study timetable for exams at least 2 weeks in advance'
      ]
    },
    {
      category: 'Subject-Specific Tips',
      icon: BookMarked,
      color: 'from-green-500 to-green-600',
      tips: [
        'Math: Practice problems daily, don\'t just memorize formulas',
        'English: Read newspapers and novels to improve vocabulary',
        'Science: Connect concepts to real-life examples',
        'Make formula sheets for quick revision before exams'
      ]
    },
    {
      category: 'Exam Preparation',
      icon: Target,
      color: 'from-orange-500 to-orange-600',
      tips: [
        'Solve previous year question papers',
        'Time yourself while practicing to improve speed',
        'Review your mistakes and understand why you made them',
        'Stay calm and read questions carefully during exams'
      ]
    }
  ];

  const motivationalQuotes = [
    { quote: "The expert in anything was once a beginner.", author: "Helen Hayes" },
    { quote: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
    { quote: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" }
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Lightbulb className="h-16 w-16 mx-auto mb-6 animate-pulse" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Study Tips & Tricks ✨
          </h1>
          <p className="text-xl opacity-90">
            Smart strategies to make your learning more effective and fun!
          </p>
        </div>
      </div>

      {/* Tips Categories */}
      <div className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {tips.map((category, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-200 overflow-hidden transform hover:scale-[1.01]"
              >
                <div className={`bg-gradient-to-r ${category.color} p-6 text-white`}>
                  <div className="flex items-center space-x-3">
                    <category.icon className="h-8 w-8" />
                    <h2 className="text-2xl font-bold">{category.category}</h2>
                  </div>
                </div>
                
                <div className="p-6">
                  <ul className="space-y-4">
                    {category.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="flex items-start space-x-3">
                        <Star className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 leading-relaxed">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Motivational Quotes */}
      <div className="bg-gray-50 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Stay Motivated! 🚀
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {motivationalQuotes.map((item, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <div className="text-4xl text-blue-500 mb-4">"</div>
                <p className="text-gray-700 italic mb-4 leading-relaxed">
                  {item.quote}
                </p>
                <p className="text-blue-600 font-semibold">— {item.author}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Study Schedule Template */}
      <div className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Sample Daily Study Schedule 📅
          </h2>
          
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4">
              <h3 className="text-xl font-bold">Recommended Schedule for Class 10 Students</h3>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-gray-800 mb-4">Morning (After School)</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>🕐 4:00 PM - 4:30 PM: Snack & Relax</li>
                    <li>📚 4:30 PM - 5:30 PM: Mathematics</li>
                    <li>☕ 5:30 PM - 5:40 PM: Short Break</li>
                    <li>🧪 5:40 PM - 6:40 PM: Science</li>
                    <li>🎮 6:40 PM - 7:30 PM: Free Time</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-bold text-gray-800 mb-4">Evening</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>🍽️ 7:30 PM - 8:30 PM: Dinner</li>
                    <li>📖 8:30 PM - 9:30 PM: English</li>
                    <li>☕ 9:30 PM - 9:40 PM: Short Break</li>
                    <li>📝 9:40 PM - 10:00 PM: Review & Notes</li>
                    <li>😴 10:00 PM onwards: Wind down for bed</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Study Smarter? 🎯</h2>
          <p className="text-xl mb-6 opacity-90">
            Remember: Consistency beats perfection. Start with small steps!
          </p>
          <div className="text-6xl mb-4">🌟</div>
          <p className="text-lg">
            "Every expert was once a beginner. Every pro was once an amateur."
          </p>
        </div>
      </div>
    </div>
  );
};

export default TipsAndTricks;