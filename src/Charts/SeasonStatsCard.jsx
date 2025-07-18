import { useEffect, useState, useRef } from 'react';

export default function SeasonStatsCard({ className = '' }) {
    const [seasonStats, setSeasonStats] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [error, setError] = useState(false);
    const wsRef = useRef(null);

    const fetchSeasonStats = () => {
        fetch('http://192.168.1.30:8005/all-seasons-stats')
            .then(res => res.json())
            .then(json => {
                if (json.status === 'OK' && json.data) {
                    setSeasonStats(json.data);
                } else {
                    setError(true);
                }
            })
            .catch(() => setError(true));
    };

    useEffect(() => {
        fetchSeasonStats();

        const ws = new WebSocket("ws://192.168.1.30:8005/ws");
        wsRef.current = ws;

        ws.onopen = () => console.log("WebSocket connected");

        ws.onmessage = (event) => {
            try {
                if (!event.data || event.data.trim().charAt(0) !== '{') return;
                const message = JSON.parse(event.data);
                if (message.type === "new_match") {
                    fetchSeasonStats();
                }
            } catch (err) {
                console.warn("Error parsing WebSocket message", err);
            }
        };

        ws.onerror = (err) => console.error("WebSocket error", err);

        ws.onclose = () => console.log("WebSocket closed");

        return () => ws.close(); 
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
                    <p>Matches: {selected.total_matches}</p>
                    <p>ELO Δ: {selected.total_elo_change}</p>
                    <p>Wins: {selected.match_wins}</p>
                    <p>Win Rate: {selected.win_rate_percent}%</p>
                    <p>Losses: {selected.match_losses}</p>
                </div>
            ) : (
                <p className="text-center">Loading...</p>
            )}
        </div>
    );
}
