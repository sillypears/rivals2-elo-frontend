import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Scatter, Chart } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import {
    Chart as ChartJS,
    ScatterController,
    CategoryScale,
    LinearScale,
    TimeScale,
    PointElement,
    Tooltip,
    Legend
} from 'chart.js';
import {
    CandlestickController,
    CandlestickElement,
} from 'chartjs-chart-financial';
import 'chartjs-chart-financial';

import EloHistogram from './Charts/EloHistogram';
import GameCountChart from './Charts/GameCount';
import CharWinLossChart from './Charts/CharWinRate'; 

ChartJS.register(
    ScatterController,
    CategoryScale,
    LinearScale,
    TimeScale,
    PointElement,
    CandlestickController,
    CandlestickElement,
    Tooltip,
    Legend);

const WinLoseElochartOptions = {
    maintainAspectRatio: false,
    plugins: {
        tooltip: {
            callbacks: {
                label: function (context) {
                    const point = context.raw;
                    return [
                        `Game #: ${point.gameNumber}`,
                        `My ELO: ${point.myElo}`,
                        `Opponent ELO: ${point.y}`
                    ];
                }
            }
        }
    },
    scales: {
        x: {
            type: 'linear',
            // time: {
            //     unit: 'year',
            //     displayFormats: {
            //         day: 'MMM d',
            //     }
            // },
            ticks: {
                autoSkip: true,
                display: false,
                minTicksLimit: 10,
            },
            title: {
                display: true,
                text: 'Date',
            }
        }
    }
};
const candlestickOptions = {
    responsive: true,
    scales: {
        x: {
            type: 'linear',
            ticks: {
                autoSkip: true,
                maxRotation: 0,
                minRotation: 0
            }
        },
        y: {
            beginAtZero: false
        }
    }
};

function WinEloChart({ winEloData }) {
    return (
        <div className="bg-white rounded-lg p-4 text-black">
            <Scatter data={winEloData} options={WinLoseElochartOptions} />
        </div>
    );
}
function LoseEloChart({ loseEloData }) {
    return (
        <div className="bg-white rounded-lg p-4 text-black">
            <Scatter data={loseEloData} options={WinLoseElochartOptions} />
        </div>
    );
}

function CandlestickEloChart({ candlestickData }) {
    return (
        <div className="bg-white rounded-lg p-4 text-black h-96">
            <Chart type="candlestick" data={candlestickData} options={candlestickOptions} />
        </div>
    )
}
function CombinedEloChart({ combinedEloData }) {
    return (
        <div className="bg-white rounded-lg p-4 text-black h-96">
            <Scatter data={combinedEloData} options={WinLoseElochartOptions} />
        </div>
    );
}

export default function ChartsPage() {
    const wsRef = useRef(null);
    const [winStats, setWinStats] = useState([]);
    const [loseStats, setLoseStats] = useState([]);
    const [searchParams] = useSearchParams();
    const WinLoseLimit = searchParams.get('win_lose_limit');

    const fetchWinEloStats = () => {
        fetch(`http://192.168.1.30:8005/stats${WinLoseLimit ? `?limit=${WinLoseLimit}` : ''}`)
            .then((res) => res.json())
            .then((data) => setWinStats(data))
            .catch((err) => console.error('Error fetching win data:', err));
    }

    const fetchLoseEloStats = () => {
        fetch(`http://192.168.1.30:8005/stats?match_win=0${WinLoseLimit ? `&limit=${WinLoseLimit}` : ''}`)
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
                // Skip empty messages or non-JSON
                if (!event.data || event.data.trim().charAt(0) !== '{') {
                    console.log("ping", event.data);
                    return;
                }
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

    const CombinedEloData = {
        datasets: [
            {
                label: "Opponent ELO for Loses",
                data: loseStats.map(match => ({
                    x: new Date(match.match_date),
                    y: match.opponent_elo,
                    myElo: match.elo_rank_old,
                    gameNumber: match.ranked_game_number
                })),
                borderColor: "rgb(0, 0, 0)",
                pointRadius: 5,
                backgroundColor: "rgb(163, 92, 160)",
                tension: 0.1
            }, {
                label: "Opponent ELO for Wins",
                data: winStats.map(match => ({
                    x: new Date(match.match_date),
                    y: match.opponent_elo,
                    myElo: match.elo_rank_old,
                    gameNumber: match.ranked_game_number
                })),
                borderColor: "rgb(0, 0, 0)",
                pointRadius: 5,
                backgroundColor: "rgb(162, 255, 182)",
                tension: 0.1
            }
        ]
    };
    const combinedStats = [...winStats, ...loseStats].sort(
        (a, b) => new Date(a.match_date) - new Date(b.match_date)
    );
    const candlestickData = {
        datasets: [
            {
                label: 'ELO Range per Match',
                data: combinedStats.map((match, index) => ({
                    x: match.ranked_game_number,
                    o: match.elo_rank_old,
                    h: Math.max(match.elo_rank_old, match.opponent_elo),
                    l: Math.min(match.elo_rank_old, match.opponent_elo),
                    c: match.elo_rank_new
                })),
                color: {
                    up: '#00ff00',
                    down: '#ff0000',
                    unchanged: '#999999'
                }
            }
        ]
    };
    return (
        <div className="min-h-screen bg-gray-800 text-white p-6">
            <h2 className="text-3xl font-bold mb-4">ELO Progression</h2>
            <div className="grid grid-cols-2 gap-4 p-2">
                {/* <WinEloChart winEloData={winEloData} />
                <LoseEloChart loseEloData={loseEloData} /> */}
                <CombinedEloChart combinedEloData={CombinedEloData} />
                <CandlestickEloChart candlestickData={candlestickData} />
            </div>
            <div className="grid grid-cols-2 gap-4 p-2">
                <EloHistogram matches={[...winStats, ...loseStats]} />
            </div>
            <div className="grid grid-cols-2 gap-4 p-2">
                <CharWinLossChart />
                <GameCountChart />
            </div>
        </div>
    );
}
