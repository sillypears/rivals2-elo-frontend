import { API_BASE_URL, API_BASE_PORT } from '@/config';
import { useEffect, useState } from 'react';
import { connectWebSocket, subscribe } from '../utils/websocket';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function BestWins({ className = '' }) {
    const [bestWins, setBestWins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchBestWinsData = () => {
        setLoading(true);
        fetch(`http://${API_BASE_URL}:${API_BASE_PORT}/best-wins/12`)
            .then(res => res.json())
            .then(json => {
                if (json.status === 'SUCCESS' && json.data) {
                    setBestWins(json.data);
                    setError(false);
                } else {
                    setError(true);
                }
            })
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchBestWinsData();
        connectWebSocket(`ws://${API_BASE_URL}:${API_BASE_PORT}/ws`);
        const unsubscribe = subscribe((message) => {
            if (message.type === "new_match") {
                fetchBestWinsData();
            }
        });
        return () => unsubscribe();
    }, []);

    return (
        <Card className={`bg-gray-200 text-black ${className}`}>
            <CardHeader className="text-center pb-2">
                <CardTitle className="font-semibold text-lg">High Elo Opponents</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <p className="text-center text-gray-600">Loading...</p>
                ) : error ? (
                    <p className="text-center text-red-600">Failed to load data</p>
                ) : bestWins.length === 0 ? (
                    <p className="text-center text-gray-600">No best wins yet</p>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-1 text-xs">
                        {bestWins.map((win, index) => (
                            <div key={index} className="flex flex-col p-1 bg-white rounded" title={win.match_date}>
                                <div className="flex justify-between font-semibold" >
                                    <span>#<a href={`/match/id/${win.id}`}>{win.ranked_game_number}</a></span>
                                    <span className="text-green-600">+{win.elo_change}</span>
                                </div>
                                <div className="text-gray-500">{win.season_display_name}</div>
                                <div className="flex justify-between text-gray-500">
                                    <span>Me: {win.elo_rank_old}</span>
                                    <span class="text-red-400 text-[9px]">-{win.opponent_elo - win.elo_rank_old}-</span>
                                    <span>vs: <span class="font-bold">{win.opponent_elo}</span></span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
