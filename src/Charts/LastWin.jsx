import { API_BASE_URL, API_BASE_PORT } from '@/config';
import { useEffect, useState } from 'react';
import { connectWebSocket, subscribe } from '../utils/websocket';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/ui/table';

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
    return (
        <Card className={`bg-gray-200 text-black ${className}`}>
            <CardHeader>
                <CardTitle className="font-semibold text-sm">Last Match</CardTitle>
            </CardHeader>
            <CardContent>
                {error ? (
                    <p className="text-red-600">No Last Game</p>
                ) : (
                    <div>
                        <div>
                            {lastMatch.match_win ? "Win" : "Loss"}
                        </div>
                        <div>
                            {lastMatch.elo_change > 0 ? `+${lastMatch.elo_change}` : lastMatch.elo_change}
                        </div>
                        <span>
                            <a href={`/match/${lastMatch.id}`} target="_blank"> ID</a>
                            <a href={`/head-to-head?opp=${lastMatch.opponent_name}`} target="_blank"> H2H </a>
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
