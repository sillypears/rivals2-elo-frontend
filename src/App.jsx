import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import MatchHistory from './MatchHistory';
import ChartsPage from './ChartsPage';
import MatchesPage from './MatchesPage';
import ManualMatchEntry from './MatchEntry';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 text-gray-900">
        <Navbar />
        <main className="pt-10">
          <Routes>
            <Route path="/" element={<MatchHistory />} />
            <Route path="/stats" element={<ChartsPage />} />
            <Route path="/matches" element={<MatchesPage />} />
            <Route path="/add-match" element={<ManualMatchEntry />} />

          </Routes>
        </main>
      </div>
    </Router>
  );
}
