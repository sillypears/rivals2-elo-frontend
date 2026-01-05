import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import BottomFooter from './Footer';
import MatchHistory from './MatchHistory';
import ChartsPage from './ChartsPage';
import MatchesPage from './MatchesPage';
import ManualMatchEntry from './MatchEntry';
import MatchDetailPage from './MatchDetailPage';
import HeadToHeadPage from './HeadToHead';
import SeasonsPage from './SeasonsPage';
import SeasonDetailPage from './SeasonDetailPage';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-800 text-gray-900">
        <Navbar />
        <main className="pt-10">
          <Routes>
            <Route path="/history" element={<MatchHistory />} />
            <Route path="/stats" element={<ChartsPage />} />
            <Route path="/matches" element={<MatchesPage />} />
            <Route path="/add-match" element={<ManualMatchEntry />} />
            <Route path="/match/id/:id" element={<MatchDetailPage />} />
            <Route path="/match/date/:date" element={<MatchDetailPage />} />
            <Route path="/head-to-head/" element={<HeadToHeadPage />} />
            <Route path="/seasons" element={<SeasonsPage />} />
            <Route path="/season/:id" element={<SeasonDetailPage />} />

          </Routes>
        </main>
        <BottomFooter />
      </div>
    </Router>

  );
}
