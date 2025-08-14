import { API_BASE_URL } from '@/config';
import { useEffect, useState } from 'react';
import { connectWebSocket, subscribe } from '../utils/websocket';
export default function SeasonStatsCard({ className = '' }) {
    const [seasonStats, setSeasonStats] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [error, setError] = useState(false);

    const fetchSeasonStats = () => {
        fetch(`http://${API_BASE_URL}/all-seasons-stats`)
            .then(res => res.json())
            .then(json => {
                if (json.status === 'SUCCESS' && json.data) {
                    setSeasonStats(json.data);
                } else {
                    setError(true);
                }
            })
            .catch(() => setError(true));
    };

     useEffect(() => {
       fetchSeasonStats();
       connectWebSocket(`ws://${API_BASE_URL}/ws`);
       const unsubscribe = subscribe((message) => {
         if (message.type === "new_match") {
           fetchSeasonStats()
         }
       });
   
       return () => unsubscribe();
     }, []);
    const selected = seasonStats[selectedIndex];

    return (
        <div className={`bg-gray-200 w-full text-black rounded-lg shadow p-3 text-sm ${className}`}>
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-base font-semibold">Season Stats</h2>
                {seasonStats.length > 1 && (
                    <select
                        className="bg-white rounded px-2 py-1 text-sm rounded-lg"
                        value={selectedIndex}
                        onChange={(e) => setSelectedIndex(Number(e.target.value))}
                    >
                        {seasonStats.map((season, i) => (
                            <option key={i} value={i}>
                                {season.season_display_name}
                            </option>
                        ))}
                    </select>
                )}
            </div>
            {error ? (
                <p className="text-red-600 text-center">Error loading data</p>
            ) : selected ? (
                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                    <p><span className="font-semibold">Matches</span>: {selected.total_matches}</p>
                    <p><span className="font-semibold">Min | Max Elo</span>: {selected.min_elo} | {selected.max_elo}</p>
                    <p><span className="font-semibold">Wins</span>: {selected.match_wins}</p>
                    <p><span className="font-semibold">Elo Δ</span>: {selected.total_elo_change}</p>
                    <p><span className="font-semibold">Losses</span>: {selected.match_losses}</p>
                    <p><span className="font-semibold">Win Rate</span>: {selected.win_rate_percent}%</p>
                </div>
            ) : (
                <p className="text-center">Loading...</p>
            )}
        </div>
    );
}
