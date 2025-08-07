import { API_BASE_URL } from '@/config';
import { useEffect, useState, useRef } from 'react';
import MatchDataTable from './data/MatchDataTable';
import { connectWebSocket, subscribe } from './utils/websocket';
export default function MatchesPage() {
    const wsRef = useRef(null);
    const [matches, setMatches] = useState([]);

    const handleCellUpdate = async (row, gameNumber, key, value) => {
        try {
            const res = await fetch(`http://${API_BASE_URL}/update-match/`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ row_id: row, game_number: gameNumber, key, value }),
            });
            const result = await res.json();

            if (result.status === 'SUCCESS') {
                console.log(`Updated ${key} to "${value}" for game #${gameNumber}`);

                setMatches(prevMatches =>
                    prevMatches.map(match =>
                        match.ranked_game_number === gameNumber
                            ? { ...match, [key]: value }
                            : match
                    )
                );
            } else {
                console.error("Failed to update:", result.message);
            }
        } catch (err) {
            console.error("Error updating match data:", err);
        }
    };

    const fetchMatchStats = () => {
        fetch(`http://${API_BASE_URL}/matches`)
            .then(res => res.json())
            .then((data) => setMatches(data.data))
            .catch(err => console.error('Failed to fetch matches:', err));
    }
    useEffect(() => {
        fetchMatchStats()
    }, []);

      useEffect(() => {
        fetchMatchStats();
        connectWebSocket(`ws://${API_BASE_URL}/ws`);
        const unsubscribe = subscribe((message) => {
          if (message.type === "new_match") {
            fetchMatchStats()
          }
        });
    
        return () => unsubscribe();
      }, []);

    return (
        <div className="min-h-screen bg-gray-800 text-white p-6">
            <h1 className="text-3xl font-bold mb-6">All Matches</h1>
            {matches.length > 0 ? (
                <MatchDataTable matches={matches} onCellUpdate={handleCellUpdate} />
            ) : (
                <p>Loading matches...</p>
            )}
        </div>
    );
}
