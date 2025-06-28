import { useEffect, useState, useRef } from 'react';

function MatchCard({ match }) {
  return (
    <div className="relative bg-gradient-to-b from-orange-300 to-blue-500 text-white rounded-2xl shadow-lg p-4">
      {/* <div className="absolute top-2 right-2 text-l">{match.elo_change > 0 ? '👍' : '👎'}</div> */}

      {/* 🧠 Character icon */}
      <div className="mb-2 flex items-center gap-2">
        <div className="absolute top-2 right-2 flex items-center gap-1">
          <img
            src={`/images/chars/${match.game_1_opponent_pick_image}.png`}
            alt={match.game_1_opponent_pick_name}
            onError={(e) => { e.target.src = '/images/chars/na.png'; }}
            className={`w-8 h-8 object-contain ${match.match_win ? 'grayscale' : ''}`}
            title={match.game_1_opponent_pick_name}
          />
          <span className="text-lg">
            {match.elo_change > 0 ? '👍' : '👎'}
          </span>
        </div>
      </div>

      <div className="text-lg font-bold text-black">Game #{match.ranked_game_number}</div>
      <div className="text-sm text-gray-200">Date: {new Date(`${match.match_date}Z`).toLocaleString("en-US", { timeZone: "America/New_York" })}</div>

      <div className="mt-2">
        <span className="font-semibold text-black">ELO:</span> {match.elo_rank_old}
        <span className={`superscript ${match.elo_change >= 0 ? 'positive' : 'negative'}`}>
          {match.elo_change >= 0 ? '+' : ''}{match.elo_change}
        </span> → {match.elo_rank_new}
      </div>

      <div>
        <span className="font-semibold text-black">Opponent ELO:</span> {match.opponent_elo}
        {match.opponent_estimated_elo > -1 && (
          <span className="superscript"> ({match.opponent_estimated_elo})</span>
        )}
      </div>

      <div>
        <span className="font-semibold text-black">Total Wins:</span> {match.total_wins}
      </div>

      {match.win_streak_value > 0 && (
        <div>
          <span className="font-semibold text-black">Streak:</span> {match.win_streak_value}
        </div>
      )}
    </div>
  );
}


export default function App() {
  const [matches, setMatches] = useState([]);
  const wsRef = useRef(null);

  const fetchMatches = () => {
    fetch('http://192.168.1.30:8005/matches')
      .then((res) => res.json())
      .then((data) => setMatches(data))
      .catch((err) => console.error('Error fetching match data:', err));
  };
  useEffect(() => {
    fetchMatches();
  }, []);

  useEffect(() => {
    const ws = new WebSocket("ws://192.168.1.30:8005/ws");
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("Websocket connected");
    };

    ws.onmessage = (event) => {
      try {
        // Skip empty messages or non-JSON
        if (!event.data || event.data.trim().charAt(0) !== '{') {
          console.log("ping", event.data);
          return;
        }
        const message = JSON.parse(event.data);
        if (message.type === "new_match") {
          console.log("Got new matches")
          fetchMatches();
        }
      } catch (err) {
        console.warn(`couldn't parse ws: `, err)
      }
    };

    ws.onerror = (err) => {
      console.error("websocket error", err);
    };

    ws.onclose = () => {
      ws.close();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <h1 className="text-white text-4xl font-bold mb-6">Match History</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </div>
  );
}
