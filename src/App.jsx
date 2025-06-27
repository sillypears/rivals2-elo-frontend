import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MatchHistory from './MatchHistory';  
import ChartsPage from './ChartsPage'; 
import MatchesPage from './MatchesPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MatchHistory />} />
        <Route path="/stats" element={<ChartsPage />} />
        <Route path="/matches" element={<MatchesPage />} />
      </Routes>
    </Router>
  );
}
