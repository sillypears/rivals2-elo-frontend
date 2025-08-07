import { API_BASE_URL } from '@/config';
import { useEffect, useState } from 'react';
import { connectWebSocket, subscribe } from '../utils/websocket';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function TopPlayersCard({ className = '' }) {
    const [players, setPlayers] = useState([]);
    const [error, setError] = useState(false);

    const fetchPlayerData = () => {
        fetch(`${API_BASE_URL}/head-to-head/top`)
            .then(res => res.json())
            .then(json => {
                if (json.status === 'SUCCESS' && json.data) {
                    setPlayers(json.data.slice(0, 5));
                    setError(false);
                } else {
                    setError(true);
                }
            })
            .catch(() => setError(true));
    };

    useEffect(() => {
        fetchPlayerData();
        connectWebSocket(`ws://${API_BASE_URL}/ws`);
        const unsubscribe = subscribe((message) => {
            if (message.type === "new_match") {
                fetchPlayerData();
            }
        });

        return () => unsubscribe();
    }, []);


    return (
        <Card className={`${className}`}>
            <CardTitle className="text-2xl font-bold text-center">
                Top {players.length} Opponent{players.length != 1 ? 's' : ''}
            </CardTitle>
            <CardContent className="grid grid-cols-5 text-center pt-2 gap-4">
                {players.map((player) =>
                        <div>
                            <div className="text-xl font-semibold">{player.count}</div>
                            <div className="text-sm">{player.opponent_name}</div>
                        </div>
                )}
            </CardContent>
        </Card>
    );
}
