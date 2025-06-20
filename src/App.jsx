import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MatchHistory from './MatchHistory';  
import ChartsPage from './ChartsPage'; 

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MatchHistory />} />
        <Route path="/stats" element={<ChartsPage />} />
      </Routes>
    </Router>
  );
}
