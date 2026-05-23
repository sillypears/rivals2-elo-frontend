import { API_BASE_URL, API_BASE_PORT } from '@/config';
import { useEffect, useState } from 'react';
import { connectWebSocket, subscribe } from '../utils/websocket';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

function getScore(match) {
    if (match.game_3_winner === -1) return match.match_win ? '2-0' : '0-2';
    return match.match_win ? '2-1' : '1-2';
}

export default function SeasonStatsCard({ className = '' }) {
    const [lastMatch, setLastMatch] = useState([]);
    const [error, setError] = useState(false);

    const fetchLatestMatch = () => {
        fetch(`http://${API_BASE_URL}:${API_BASE_PORT}/matches/1`)
            .then(res => res.json())
            .then(json => {
                if (json.status === 'SUCCESS' && json.data) {
                    setLastMatch(json.data[0]);
                } else {
                    setError(true);
                }
            })
            .catch(() => setError(true));
    };

    useEffect(() => {
        fetchLatestMatch();
        connectWebSocket(`ws://${API_BASE_URL}:${API_BASE_PORT}/ws`);
        const unsubscribe = subscribe((message) => {
            if (message.type === "new_match") {
                fetchLatestMatch()
            }
        });

        return () => unsubscribe();
    }, []);

    const isWin = lastMatch.match_win;

    return (
        <Card className={`bg-gray-200 text-black ${className}`}>
            <CardHeader className="text-center pb-1">
                <CardTitle className="font-semibold text-sm">Last Match</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
                {error ? (
                    <p className="text-red-600">No Last Game</p>
                ) : (
                    <div className="space-y-1 text-xs">
                        <div className="flex items-center justify-center gap-2">
                            <span className={`font-bold text-base ${isWin ? 'text-green-700' : 'text-red-700'}`}>
                                {isWin ? 'Win' : 'Loss'}
                            </span>
                            <span className="font-mono font-semibold">
                                {lastMatch.elo_change > 0 ? `+${lastMatch.elo_change}` : lastMatch.elo_change}
                            </span>
                        </div>
                        <div className="font-semibold truncate">
                            vs {lastMatch.opponent_name} ({lastMatch.opponent_elo})
                        </div>
                        <div>
                            <span className="font-medium">{lastMatch.game_1_opponent_pick_name || '-'}</span>
                            <span className="mx-1">·</span>
                            <span>{getScore(lastMatch)}</span>
                        </div>
                        {lastMatch.match_date && (
                            <div className="text-gray-500">
                                {new Date(lastMatch.match_date).toLocaleDateString()}
                            </div>
                        )}
                        <div className="pt-1 flex items-center justify-center gap-2">
                            <a href={`/match/id/${lastMatch.id}`} target="_blank" className="text-blue-600 hover:underline">ID</a>
                            <a href={`/head-to-head?opp=${encodeURIComponent(lastMatch.opponent_name)}`} target="_blank" className="text-blue-600 hover:underline">H2H</a>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
