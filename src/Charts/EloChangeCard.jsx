import { API_BASE_URL } from '@/config';
import { useEffect, useState } from 'react';
import { connectWebSocket, subscribe } from '../utils/websocket';
export default function EloChangeCard({ className = '' }) {
    const [numMatches, setNumMatches] = useState(20);
    const [eloData, setEloData] = useState(null);
    const [error, setError] = useState(false);

    const fetchEloData = (count) => {
        fetch(`http://${API_BASE_URL}/elo-change/${count}`)
            .then(res => res.json())
            .then(json => {
                if (json.status === 'SUCCESS' && json.data) {
                    setEloData(json.data);
                    setError(false);
                } else {
                    setError(true);
                }
            })
            .catch(() => setError(true));
    };

    useEffect(() => {
        fetchEloData(numMatches);
        connectWebSocket(`ws://${API_BASE_URL}/ws`);
        const unsubscribe = subscribe((message) => {
            if (message.type === "new_match") {
                fetchEloData(numMatches);
            }
        });

        return () => unsubscribe();
    }, [numMatches]);
    

    return (
        <div className={`w-full h-full bg-gray-200 text-black p-6 rounded-lg shadow-md text-center flex flex-col items-center justify-center ${className}`}>
            <h2 className="text-xl font-semibold mb-2">Elo Change (Last {numMatches} Matches)</h2>

            <div className="flex items-center gap-2 mb-4">
                <label htmlFor="match-count" className="text-sm font-medium">Match Count:</label>
                <input
                    id="match-count"
                    type="number"
                    min="1"
                    className="w-20 p-1 border rounded text-sm bg-white text-black"
                    value={numMatches}
                    onChange={(e) => setNumMatches(parseInt(e.target.value) || 1)}
                />
            </div>

            {error ? (
                <p className="text-red-600">Failed to load Elo change data.</p>
            ) : eloData ? (
                <div className="space-y-1 text-md">
                    <p><span className="font-semibold text-green-600">+{eloData.elo_change_plus}</span> Elo Gained</p>
                    <p><span className="font-semibold text-red-600">{eloData.elo_change_minus}</span> Elo Lost</p>
                    <p>
                        Net:{" "}
                        <span className={`font-bold ${eloData.difference >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                            {eloData.difference >= 0 ? '+' : ''}
                            {eloData.difference}
                        </span>
                    </p>
                </div>
            ) : (
                <p className="text-gray-600">Loading...</p>
            )}
        </div>
    );
}
