import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Subject from './pages/Subject';
import TipsAndTricks from './pages/TipsAndTricks';
import Footer from './components/Footer';
import MathTopic from './pages/MathTopic';
import Progress from './pages/Progress';
import Practice from './pages/Practice';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/subject/:subjectName" element={<Subject />} />
            <Route path="/subject/maths/:topicSlug" element={<MathTopic />} />
            <Route path="/tips" element={<TipsAndTricks />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/practice" element={<Practice />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;