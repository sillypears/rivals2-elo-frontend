import { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);
const chartOptions = {
    plugins: {
        legend: {
            labels: {
                font: {
                    size: 10  // smaller text
                },
                boxWidth: 10, // smaller color boxes
                padding: 8,   // less padding between items
            },
            position: 'bottom' // or 'right', 'top'
        }
    }
};

export default function GameCountChart() {
    const [winData, setWinData] = useState({
        labels: [],
        datasets: [{
            data: [],
        }]
    });
    const [loseData, setLoseData] = useState({
        labels: [],
        datasets: [{
            data: [],
        }]
    });

    useEffect(() => {
        fetch('http://192.168.1.30:8005/match-stats')
            .then(res => res.json())
            .then(data => {
                const winCounts = {};
                const loseCounts = {};
                data.forEach(entry => {
                    if (entry.match_win === 1) {
                        winCounts[entry.game_count] = entry.match_count;
                    } else if (entry.match_win === 0) {
                        loseCounts[entry.game_count] = entry.match_count;
                    }
                });

                setWinData({
                    labels: Object.keys(winCounts).map(k => `${k} Games`),
                    datasets: [{
                        label: 'Wins',
                        data: Object.values(winCounts),
                        backgroundColor: ['#4ade80', '#22c55e', '#16a34a'],
                        borderWidth: 1,
                    }]
                });

                setLoseData({
                    labels: Object.keys(loseCounts).map(k => `${k} Games`),
                    datasets: [{
                        label: 'Losses',
                        data: Object.values(loseCounts),
                        backgroundColor: ['#f87171', '#ef4444', '#dc2626'],
                        borderWidth: 1,
                    }]
                });
            })
            .catch(err => console.error('Failed to fetch match stats', err));
    }, []);

    return (
        <div className="grid grid-cols-2 gap-4 text-black">
            <div className="bg-white rounded-lg p-4 flex flex-col items-center">
                <h3 className="text-lg font-semibold mb-2">Wins by Game Count</h3>
                <div className="h-64 w-64">
                    <Doughnut data={winData} options={chartOptions}/>
                </div>
            </div>
            <div className="bg-white rounded-lg p-4 flex flex-col items-center">
                <h3 className="text-lg font-semibold mb-2">Losses by Game Count</h3>
                <div className="h-64 w-64">
                    <Doughnut data={loseData} options={chartOptions} />
                </div>
            </div>
        </div>
    );
}
