import { API_BASE_URL } from '@/config';
import { useEffect, useState, useRef, useCallback } from 'react';
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
import { connectWebSocket, subscribe } from './utils/websocket';
import zoomPlugin from 'chartjs-plugin-zoom';
import EloHistogram from './Charts/EloHistogram';
import GameCountChart from './Charts/GameCount';
import CharWinLossChart from './Charts/CharWinRate';
import ForfeitCard from './Charts/ForfeitsCard';
import EloChangeCard from './Charts/EloChangeCard';
import SeasonStatsCard from './Charts/SeasonStatsCard';
import TopFinalMoveCard from './Charts/FinalMoveChart';
import StageWinLossCard from './Charts/StageWinRate';
import TopPlayersCard from './Charts/TopOpponents';

ChartJS.register(
    ScatterController,
    CategoryScale,
    LinearScale,
    TimeScale,
    PointElement,
    CandlestickController,
    CandlestickElement,
    Tooltip,
    Legend,
    zoomPlugin
);

const WinLoseElochartOptions = {
    maintainAspectRatio: false,
    plugins: {
        tooltip: {
            callbacks: {
                label: function (context) {
                    const point = context.raw;
                    return [
                        `Game #: ${point.gameNumber}`,
                        `My Elo: ${point.myElo}`,
                        `Opponent Elo: ${point.y}`
                    ];
                }
            }
        },
        zoom: {
            zoom: {
                wheel: {
                    enabled: true,
                },
                pan: {
                    enabled: true,
                    modifierKey: 'ctrl',
                    onPanStart({ chart, point }) {
                        const area = chart.chartArea;
                        const w25 = area.width * 0.25;
                        const h25 = area.height * 0.25;
                        if (point.x < area.left + w25 || point.x > area.right - w25
                            || point.y < area.top + h25 || point.y > area.bottom - h25) {
                            return false;
                        }
                    },
                },
            },
        },
    },
    scales: {
        x: {
            type: 'linear',
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
    aspectRatio: 2.2,
    maintainAspectRatio: true,
    plugins: {
        legend: {
            display: false,
        },
        zoom: {
            pan: {
                modifierKey: 'ctrl',
                enabled: true,
                onPanStart({ chart, point }) {
                    const area = chart.chartArea;
                    const w25 = area.width * 0.25;
                    const h25 = area.height * 0.25;
                    if (point.x < area.left + w25 || point.x > area.right - w25
                        || point.y < area.top + h25 || point.y > area.bottom - h25) {
                        return false;
                    }
                },
            },
            zoom: {
                wheel: {
                    enabled: true,
                },
                pinch: {
                    enabled: true
                },
                mode: 'xy',
            }
        }
    },
    scales: {
        x: {
            type: 'linear',
            title: {
                display: true,
                text: 'Game Number',
                font: {
                    size: 14,
                    weight: 'bold'
                }
            },
            grid: {
                color: 'rgba(145, 145, 145, 0.1)',
            },
            ticks: {
                autoSkip: true,
                maxRotation: 0,
                minRotation: 0
            },
        },
        y: {
            title: {
                display: true,
                text: 'Elo',
                font: {
                    size: 14,
                    weight: 'bold'
                }
            },
            grid: {
                color: 'rgba(145, 145, 145, 0.2)',
            },
            beginAtZero: false
        }
    }
};

function CandlestickEloChart({ candlestickData }) {
    return (
        <div className="bg-gray-200 text-black pb-10 pl-6 pt-1 rounded-lg h-96">
            <h3 className="text-lg font-bold mb-2">Candles</h3>

            <Chart type="candlestick" data={candlestickData} options={candlestickOptions} />
        </div>
    )
}
function CombinedEloChart({ combinedEloData }) {
    return (
        <div className="bg-gray-200 rounded-lg p-4 text-black h-96">
            <Scatter data={combinedEloData} options={WinLoseElochartOptions} />
        </div>
    );
}

export default function ChartsPage() {
    const [stats, setStats] = useState([]);
    const [WinLoseLimit, setWinLoseLimit] = useState(20);

    const fetchEloStats = useCallback(() => {
        fetch(`http://${API_BASE_URL}/matches${WinLoseLimit ? `/${WinLoseLimit}` : ''}`)
            .then((res) => res.json())
            .then((data) => setStats(data.data))
            .catch((err) => console.error('Error fetching win data:', err));
    }, [WinLoseLimit]);


    useEffect(() => {
        fetchEloStats();
        connectWebSocket(`ws://${API_BASE_URL}/ws`);
        const unsubscribe = subscribe((message) => {
            if (message.type === "new_match") {
                fetchEloStats()
            }
        });

        return () => unsubscribe();

    }, [fetchEloStats]);
    const CombinedEloData = {
        datasets: [
            {
                label: "Opponent Elo for Loses",
                data: stats
                    .filter(match => match.match_win === 0)
                    .map(match => ({
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
                label: "Opponent Elo for Wins",
                data: stats
                    .filter(match => match.match_win === 1)
                    .map(match => ({
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
    const candlestickData = {
        datasets: [
            {
                title: 'Elo Progression',
                data: [...stats]
                    .sort((a, b) => a.id - b.id)
                    .map(match => ({
                        x: match.ranked_game_number,
                        o: match.elo_rank_old,
                        h: Math.max(match.elo_rank_old, (match.opponent_elo == -2) ? match.opponent_estimated_elo : match.opponent_elo),
                        l: Math.min(match.elo_rank_old, (match.opponent_elo == -2) ? match.opponent_estimated_elo : match.opponent_elo),
                        c: match.elo_rank_new
                    })),
                color: {
                    up: '#00ff00',
                    down: '#ff0000',
                    unchanged: '#999999'
                },

            }],
    };
    return (
        <div className=" bg-gray-800 text-white p-2 mb-10">
            <div className="grid">
                <div className="grid grid-cols-2 gap-2 mb-2 justify-center items-center">
                    <h2 className="text-2xl font-bold mb-2">Elo Progression</h2>
                    <div className="flex justify-end">
                        <select className="w-fit p-1 bg-gray-700 text-white rounded"
                            onChange={(e) => { setWinLoseLimit(Number(e.target.value)) }}
                            value={WinLoseLimit}
                        >
                            <option value="10">10 Matches</option>
                            <option value="20">20 Matches</option>
                            <option value="25">25 Matches</option>
                            <option value="50">50 Matches</option>
                            <option value="100">100 Matches</option>
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2 p-1">
                    <CombinedEloChart combinedEloData={CombinedEloData} />
                    <CandlestickEloChart candlestickData={candlestickData} />
                </div>
            </div>
            <div className="grid grid-cols-3 p-1 gap-2 items-start">
                {/* Column 1 */}
                <div className="flex flex-col gap-2">
                    <EloHistogram matches={stats} />
                    <StageWinLossCard className="h-full" />
                </div>

                {/* Column 2 */}
                <div className="flex flex-col gap-2">
                    <TopFinalMoveCard className="h-full" />
                    <TopPlayersCard className="p-2" />
                </div>

                {/* Column 3 */}
                <div className="flex flex-col gap-2 w-full">
                    <ForfeitCard className="h-full" />
                    <SeasonStatsCard className="h-full" />
                    <EloChangeCard className="h-full" />
                </div>
            </div>

            <div className="grid grid-cols-2 p-1 gap-2" >
                <CharWinLossChart />
                <GameCountChart />
            </div>
        </div>
    );
}
