import { useEffect, useState } from 'react';
import { API_BASE_URL, API_BASE_PORT } from '@/config';
import { connectWebSocket, subscribe } from '../utils/websocket';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function OpponentCountBySeasonCard({ className = '' }) {
    const [data, setData] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [initialized, setInitialized] = useState(false);
    const [error, setError] = useState(false);

    const fetchData = () => {
        fetch(`http://${API_BASE_URL}:${API_BASE_PORT}/opponent-count-by-season`)
            .then((res) => res.json())
            .then((json) => {
                if (json.status === 'SUCCESS' && Array.isArray(json.data)) {
                    // Filter out seasons with no data if you want, but keep all for completeness
                    // Sort by season_index to keep chronological order
                    const sorted = [...json.data].sort((a, b) => (a.season_index ?? 0) - (b.season_index ?? 0));
                    setData(sorted);
                    setError(false);
                    if (!initialized && sorted.length > 0) {
                        // Default to latest season: prefer latest flag from /seasons, fallback to highest index or last with matches
                        // Try to find season that is currently latest via /season/latest, but we approximate with last non-empty or max index
                        // Since data doesn't include latest flag, we fetch seasons to determine latest
                        fetch(`http://${API_BASE_URL}:${API_BASE_PORT}/seasons`)
                            .then((r) => r.json())
                            .then((sj) => {
                                if (sj.status === 'SUCCESS' && Array.isArray(sj.data)) {
                                    const latest = sj.data.find((s) => s.latest);
                                    if (latest) {
                                        const idx = sorted.findIndex((d) => d.season_id === latest.id);
                                        if (idx >= 0) setSelectedIndex(idx);
                                        else setSelectedIndex(sorted.length - 1);
                                    } else {
                                        // fallback to last season with matches, else last
                                        const withMatches = sorted.filter((d) => d.total_matches > 0);
                                        if (withMatches.length > 0) {
                                            const lastWith = withMatches[withMatches.length - 1];
                                            setSelectedIndex(sorted.findIndex((d) => d.season_id === lastWith.season_id));
                                        } else {
                                            setSelectedIndex(sorted.length - 1);
                                        }
                                    }
                                }
                            })
                            .catch(() => {
                                setSelectedIndex(sorted.length - 1);
                            })
                            .finally(() => setInitialized(true));
                    }
                } else {
                    setError(true);
                }
            })
            .catch(() => setError(true));
    };

    useEffect(() => {
        fetchData();
        connectWebSocket(`ws://${API_BASE_URL}:${API_BASE_PORT}/ws`);
        const unsubscribe = subscribe((message) => {
            if (message.type === 'new_match' || message.type === 'season_update') {
                setInitialized(false);
                fetchData();
            }
        });
        return () => unsubscribe();
    }, []);

    const selected = data[selectedIndex];

    return (
        <Card className={`bg-gray-200 text-black ${className}`}>
            <CardHeader className="flex flex-row justify-between items-center mb-2 pb-2">
                <CardTitle className="text-base">Opponents by Season</CardTitle>
                {data.length > 1 && (
                    <select
                        className="bg-white rounded px-2 py-1 text-sm border border-gray-300"
                        value={selectedIndex}
                        onChange={(e) => setSelectedIndex(Number(e.target.value))}
                    >
                        {data.map((season, i) => (
                            <option key={season.season_id} value={i}>
                                {season.season_display_name}
                            </option>
                        ))}
                    </select>
                )}
            </CardHeader>
            <CardContent>
                {error ? (
                    <p className="text-red-600 text-center text-sm">Error loading data</p>
                ) : selected ? (
                    <div className="space-y-3">
                        <div className="grid grid-cols-3 text-center gap-2">
                            <div>
                                <div className="text-xl font-bold">{selected.total_unique_opponents ?? selected.total_opponents ?? 0}</div>
                                <div className="text-xs text-gray-600">Unique Opponents</div>
                            </div>
                            <div>
                                <div className="text-xl font-bold">{selected.total_matches}</div>
                                <div className="text-xs text-gray-600">Matches</div>
                            </div>
                            <div>
                                <div className="text-xl font-bold">{selected.win_percentage?.toFixed(1) ?? '0.0'}%</div>
                                <div className="text-xs text-gray-600">Win Rate</div>
                            </div>
                        </div>
                        <div className="text-xs text-center text-gray-500">
                            {selected.total_wins}W - {selected.total_losses}L
                        </div>

                        {selected.top_3 && selected.top_3.length > 0 ? (
                            <div>
                                <div className="text-sm font-semibold mb-1">Top 3 Most Faced</div>
                                <div className="space-y-1">
                                    {selected.top_3.map((opp, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-white rounded px-2 py-1 text-sm">
                                            <div className="flex-1 truncate pr-2">
                                                <span className="font-medium">{idx + 1}. </span>
                                                <a
                                                    href={`/head-to-head?opp=${encodeURIComponent(opp.opponent_name)}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="hover:underline"
                                                >
                                                    {opp.opponent_name}
                                                </a>
                                            </div>
                                            <div className="flex gap-2 text-xs items-center">
                                                <span className="font-semibold">{opp.count}x</span>
                                                <span className="text-green-600">{opp.wins}W</span>
                                                <span className="text-red-600">{opp.losses}L</span>
                                                <span className="text-gray-500">{opp.win_percentage?.toFixed(0)}%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-sm text-gray-500 py-2">No opponents this season</div>
                        )}
                    </div>
                ) : (
                    <p className="text-center text-sm text-gray-600">Loading...</p>
                )}
            </CardContent>
        </Card>
    );
}
