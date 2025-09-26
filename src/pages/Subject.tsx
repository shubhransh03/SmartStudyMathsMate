import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search, BookOpen, Loader2, CheckCircle, ChevronRight } from 'lucide-react';
import { getEntry, TOPICS } from '../learning/learningModel';
//
 

interface Topic {
  name: string;
  emoji: string;
  description: string;
}

interface SubjectData {
  name: string;
  color: string;
  bgColor: string;
  topics: Topic[];
}

const Subject = () => {
  const { subjectName } = useParams<{ subjectName: string }>();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [explanations, setExplanations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  // slugify not needed here; routing uses canonical slugs from TOPICS

  // Mathematics categories with canonical slugs
  const MATH_CATEGORIES: { name: string; emoji: string; topicSlugs: string[] }[] = [
    {
      name: 'Number Systems',
      emoji: '📐',
      topicSlugs: ['real-numbers','rational-irrational-numbers','number-properties'],
    },
    {
      name: 'Algebra',
      emoji: '📈',
      topicSlugs: ['linear-equations-one-variable','linear-equations-two-variables','quadratic-equations','polynomials'],
    },
    {
      name: 'Geometry',
      emoji: '📐',
      topicSlugs: ['basic-geometry','triangles-congruence','coordinate-geometry','circles','surface-areas-and-volumes'],
    },
    {
      name: 'Statistics & Probability',
      emoji: '📊',
      topicSlugs: ['data-handling','mean-median-mode','probability-theory','statistical-graphs'],
    },
    {
      name: 'Trigonometry',
      emoji: '🔺',
      topicSlugs: ['basic-ratios','trigonometric-identities','heights-and-distances','applications'],
    },
  ];

  const mathCategoryData = MATH_CATEGORIES.map(cat => ({
    ...cat,
    topics: cat.topicSlugs
      .map(slug => TOPICS.find(t => t.slug === slug))
      .filter(Boolean) as { slug: string; name: string }[],
  }));

  const [openCats, setOpenCats] = useState<Record<string, boolean>>({});
  const toggleCat = (name: string) => setOpenCats(prev => ({ ...prev, [name]: !prev[name] }));

  const subjects: Record<string, SubjectData> = {
    maths: {
      name: 'Mathematics',
      color: 'text-blue-600',
      bgColor: 'from-blue-500 to-blue-600',
      // For Mathematics, we'll derive topics from centralized TOPICS list.
      topics: TOPICS.map(t => ({ name: t.name, emoji: '', description: '' }))
    },
    english: {
      name: 'English',
      color: 'text-green-600',
      bgColor: 'from-green-500 to-green-600',
      topics: [
        { name: 'Grammar', emoji: '📝', description: 'Sentence structure and rules' },
        { name: 'Writing Skills', emoji: '✍️', description: 'Essays and creative writing' },
        { name: 'Vocabulary', emoji: '📚', description: 'Word meanings and usage' },
        { name: 'Comprehension', emoji: '🤔', description: 'Reading and understanding' },
        { name: 'Poetry', emoji: '🎭', description: 'Poems, rhymes, and literary devices' },
        { name: 'Letter Writing', emoji: '✉️', description: 'Formal and informal letters' }
      ]
    },
    science: {
      name: 'Science',
      color: 'text-purple-600',
      bgColor: 'from-purple-500 to-purple-600',
      topics: [
        { name: 'Motion', emoji: '🏃', description: 'Speed, velocity, and acceleration' },
        { name: 'Atoms & Molecules', emoji: '⚛️', description: 'Basic chemistry concepts' },
        { name: 'Electricity', emoji: '⚡', description: 'Current, voltage, and circuits' },
        { name: 'Human Body', emoji: '🫀', description: 'Organs and body systems' },
        { name: 'Light', emoji: '💡', description: 'Reflection, refraction, and optics' },
        { name: 'Sound', emoji: '🔊', description: 'Waves, frequency, and vibrations' }
      ]
    }
  };

  const currentSubject = subjectName ? subjects[subjectName] : null;

  // For non-maths subjects, simple filter
  const filteredTopics = currentSubject?.topics.filter(topic =>
    topic.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleTopicClick = async (topicName: string) => {
    if (explanations[topicName]) return;

    setLoading(prev => ({ ...prev, [topicName]: true }));

    try {
      const response = await fetch(
        `http://localhost:3001/api/explain/${subjectName}/${encodeURIComponent(topicName)}?force=gemini`
      );
      const data = await response.json();

      if (data.explanation) {
        let txt = data.explanation;
        if (data.rateLimited && data.retryAfterSeconds != null) {
          txt += `\n\nNote: Detailed AI explanation is rate-limited. Try again in ~${data.retryAfterSeconds}s for more.`;
        }
        setExplanations(prev => ({ ...prev, [topicName]: txt }));
      }
    } catch (error) {
      console.error('Error fetching explanation:', error);
      setExplanations(prev => ({ 
        ...prev, 
        [topicName]: 'Sorry, there was an error getting the explanation. Please make sure the backend server is running on port 3001.' 
      }));
    } finally {
      setLoading(prev => ({ ...prev, [topicName]: false }));
    }
  };

  if (!currentSubject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Subject not found</h1>
          <p className="text-gray-600">Please choose a valid subject from the navigation.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className={`bg-gradient-to-r ${currentSubject.bgColor} text-white py-12 px-4`}>
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {currentSubject.name} 📖
          </h1>
          <p className="text-xl opacity-90 mb-8">
            Click on any topic below to get a simple explanation!
          </p>
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-full text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/30"
            />
          </div>
        </div>
      </div>

      {/* For Mathematics now we only show topic cards that navigate to detail pages */}

      {/* Topics Grid */}
      <div className="py-12">
        <div className="container-app">
          {subjectName === 'maths' ? (
            <div className="space-y-4">
              {mathCategoryData
                .map(cat => ({
                  ...cat,
                  filtered: cat.topics.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()))
                }))
                .filter(cat => searchTerm ? cat.filtered.length > 0 : true)
                .map((cat) => (
                  <div key={cat.name} className="card overflow-hidden transition-all duration-150 hover:shadow-xl">
                    <button
                      onClick={() => toggleCat(cat.name)}
                      className="w-full px-6 py-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors flex items-center gap-3"
                    >
                      <span className="text-2xl">{cat.emoji}</span>
                      <span className={`text-xl font-bold ${currentSubject.color}`}>{cat.name}</span>
                    </button>
                    {(openCats[cat.name] || !!searchTerm) && (
                      <div className="px-6 pb-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {(searchTerm ? cat.filtered : cat.topics).map(t => {
                            const mastery = Math.round(((getEntry(t.slug).score || 0) * 100));
                            const color = mastery >= 80 ? 'bg-green-100 text-green-700' : mastery >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700';
                            return (
                              <button
                                key={t.slug}
                                onClick={() => navigate(`/subject/maths/${t.slug}`)}
                                className="group p-4 bg-white hover:bg-gray-50 border rounded-lg text-left shadow-sm transition-transform duration-150 transform hover:scale-[1.03] hover:shadow-lg will-change-transform"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-gray-800 transition-transform duration-150 delay-0 group-hover:translate-x-0.5">{t.name}</span>
                                  <ChevronRight className="h-4 w-4 text-blue-600 opacity-0 transition-all duration-150 delay-75 group-hover:opacity-100 group-hover:translate-x-0.5" />
                                  <span className={`ml-auto text-xs px-2 py-1 rounded-full ${color} transition-transform duration-150 delay-100 group-hover:scale-105`}>{mastery}%</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
              ))}
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTopics.map((topic, index) => (
                  <div key={index} className="card hover:shadow-lg transition overflow-hidden">
                    {/* Topic Header */}
                    <button
                      onClick={() => handleTopicClick(topic.name)}
                      className="w-full p-6 text-left hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-2xl">{topic.emoji}</span>
                        <h3 className={`text-xl font-bold ${currentSubject.color}`}>
                          {topic.name}
                        </h3>
                        {explanations[topic.name] && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                      <p className="text-gray-600">{topic.description}</p>
                    </button>

                    {/* Explanation for non-maths subjects only */}
                    {loading[topic.name] && (
                      <div className="px-6 pb-6">
                        <div className="flex items-center space-x-2 text-blue-600">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Getting explanation...</span>
                        </div>
                      </div>
                    )}

                    {explanations[topic.name] && !loading[topic.name] && (
                      <div className="px-6 pb-6">
                        <div className="bg-gray-50 rounded-lg p-4 border border-blue-200">
                          <div className="flex items-center space-x-2 mb-2">
                            <BookOpen className="h-4 w-4 text-brand-600" />
                            <span className="font-semibold text-brand-700">Explanation</span>
                          </div>
                          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{explanations[topic.name]}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {filteredTopics.length === 0 && (
                <div className="text-center py-12">
                  <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No topics found</h3>
                  <p className="text-gray-500">Try searching with different keywords.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sample Step-by-Step Solution removed to keep Mathematics page focused on topic navigation */}

      {/* Backend Status Notice */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mx-4 mb-8 rounded">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>Note:</strong> To get AI-powered explanations, make sure to:
              <br />1. Run the backend server with <code className="bg-yellow-100 px-1 rounded">npm run server</code>
              <br />2. Add your Gemini API key to <code className="bg-yellow-100 px-1 rounded">server/.env</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subject;