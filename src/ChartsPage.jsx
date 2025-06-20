import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    LineElement,
    CategoryScale,
    LinearScale,
    TimeScale,
    PointElement,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, TimeScale, PointElement, Tooltip, Legend);

const WinLoseElochartOptions = {
    plugins: {
        tooltip: {
            callbacks: {
                label: function (context) {
                    const point = context.raw;
                    return [
                        `Game #: ${point.gameNumber}`,
                        `Opponent ELO: ${point.y}`
                    ];
                }
            }
        }
    },
    scales: {
        x: {
            type: 'category',
            title: {
                display: true,
                text: 'Date',
            }
        }
    }
};


function WinEloChart({ winEloData }) {
    return (
        <div className="bg-white rounded-lg p-4 text-black">
            <Line data={winEloData} options={WinLoseElochartOptions} />
        </div>
    );
}
function LoseEloChart({ loseEloData }) {
    return (
        <div className="bg-white rounded-lg p-4 text-black">
            <Line data={loseEloData} options={WinLoseElochartOptions} />
        </div>
    );
}
export default function ChartsPage() {
    const [winStats, setWinStats] = useState([]);
    const [loseStats, setLoseStats] = useState([]);
    const wsRef = useRef(null);
    const [searchParams] = useSearchParams();
    const WinLoseLimit = searchParams.get('win_lose_limit');

    const fetchWinEloStats = () => {
        fetch(`http://192.168.1.30:8005/stats${WinLoseLimit? `?limit=${WinLoseLimit}`: ''}`)
            .then((res) => res.json())
            .then((data) => setWinStats(data))
            .catch((err) => console.error('Error fetching win data:', err));
    }

    const fetchLoseEloStats = () => {
        fetch(`http://192.168.1.30:8005/stats?match_win=0${WinLoseLimit? `&limit=${WinLoseLimit}`: ''}`)
            .then((res) => res.json())
            .then((data) => setLoseStats(data))
            .catch((err) => console.error('Error fetching win data:', err));
    }

    useEffect(() => {
        fetchWinEloStats()
        fetchLoseEloStats()
    }, [WinLoseLimit]);

    useEffect(() => {
        const ws = new WebSocket("ws://192.168.1.30:8005/ws");
        wsRef.current = ws;

        ws.onopen = () => {
            console.log("Websocket connected");
        };

        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                if (message.type === "new_win_stats") {
                    console.log("Got new win stats")
                    fetchWinEloStats()
                }
                if (message.type === "new_lose_stats") {
                    console.log("Got new lose stats")
                    fetchLoseEloStats()
                }
            } catch (err) {
                console.warn("couldn't parse json event", err, event.data)
            }
        };

        ws.onerror = (err) => {
            console.error("websocket error", err);
        };

        ws.onclose = () => {
            ws.close();
        };
    }, []);

    const winEloData = {
        labels: winStats.map(match =>
            new Date(match.match_date).toLocaleDateString("en-US")
        ),
        datasets: [{
            label: "Opponent ELO for Wins",
            data: winStats.map(match => ({
                x: new Date(match.match_date).toLocaleDateString("en-US"),
                y: match.opponent_elo,
                gameNumber: match.ranked_game_number
            })),
            borderColor: "rgba(75,192,192,1)",
            tension: 0.1
        }]
    };


    const loseEloData = {
        labels: loseStats.map(match =>
            new Date(match.match_date).toLocaleDateString("en-US")
        ),
        datasets: [{
            label: "Opponent ELO for Loses",
            data: loseStats.map(match => ({
                x: new Date(match.match_date).toLocaleDateString("en-US"),
                y: match.opponent_elo,
                gameNumber: match.ranked_game_number
            })),
            borderColor: "rgba(75,192,192,1)",
            tension: 0.1
        }]
    };

    return (
        <div className="min-h-screen bg-gray-800 text-white p-6">
            <h2 className="text-3xl font-bold mb-4">ELO Progression</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <WinEloChart winEloData={winEloData} />
                <LoseEloChart loseEloData={loseEloData} />
            </div>

        </div>
    );
}
