import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import BottomFooter from './Footer';
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
            <Route path="/history" element={<MatchHistory />} />
            <Route path="/stats" element={<ChartsPage />} />
            <Route path="/matches" element={<MatchesPage />} />
            <Route path="/add-match" element={<ManualMatchEntry />} />
          </Routes>
          <div className="p-10">
            <a href="/history">History</a>
            <a href="/stats">Charts</a>
            <a href="/matches">Matches</a>
          </div>
        </main>
        <BottomFooter />
      </div>
    </Router>

  );
}
