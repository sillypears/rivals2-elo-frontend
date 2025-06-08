import { useEffect, useState } from 'react';

function MatchCard({ match }) {
  return (
    <div className="bg-gradient-to-b from-orange-400 to-blue-600 text-white rounded-2xl shadow-lg p-4">
      <div className="text-lg font-bold">Game #{match.ranked_game_number}</div>
      <div className="text-sm text-gray-300">Date: {new Date(match.match_date).toLocaleString()}</div>
      <div className="mt-2">
        <span className="font-semibold">ELO:</span> {match.elo_rank_old}<span class={`superscript ${match.elo_change >= 0 ? 'positive' : 'negative'}`}>{match.elo_change >= 0 ? '+' : ''}{match.elo_change}</span> → {match.elo_rank_new}
      </div>
      <div>
        <span className="font-semibold">Opponent ELO:</span> {match.opponent_elo}
      </div>
      <div>
        <span className="font-semibold">Total Wins:</span> {match.total_wins}
      </div>
      <div>
        <span className="font-semibold">Streak:</span> {match.win_streak_value}
      </div>
    </div>
  );
}

export default function App() {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8005/matches') // Replace with your actual backend URL and port
      .then((res) => res.json())
      .then((data) => setMatches(data))
      .catch((err) => console.error('Error fetching match data:', err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <h1 className="text-white text-4xl font-bold mb-6">Match History</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </div>
  );
}
