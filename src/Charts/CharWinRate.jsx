import { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
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
export default function CharWinLossChart() {
    const [winData, setWinData] = useState(null);
    const [lossData, setLossData] = useState(null);

    useEffect(() => {
        fetch('http://192.168.1.30:8005/char-stats')
            .then(res => res.json())
            .then(data => {
                const winLabels = [];
                const winValues = [];
                const lossLabels = [];
                const lossValues = [];

                data.forEach(entry => {
                    if (entry.wins > 0) {
                        winLabels.push(entry.opponent_pick);
                        winValues.push(entry.wins);
                    }
                    if (entry.losses > 0) {
                        lossLabels.push(entry.opponent_pick);
                        lossValues.push(entry.losses);
                    }
                });

                const winColors = winLabels.map(() => '#4ade80'); // green
                const lossColors = lossLabels.map(() => '#f87171'); // red

                setWinData({
                    labels: winLabels,
                    datasets: [{
                        label: 'Wins vs Character',
                        data: winValues,
                        backgroundColor: winColors,
                        borderWidth: 1,
                    }]
                });

                setLossData({
                    labels: lossLabels,
                    datasets: [{
                        label: 'Losses vs Character',
                        data: lossValues,
                        backgroundColor: lossColors,
                        borderWidth: 1,
                    }]
                });
            })
            .catch(err => console.error('Failed to fetch char stats', err));
    }, []);

    if (!winData || !lossData) return null;

    return (
        <div className="grid grid-cols-2 gap-4 text-black">
            <div className="bg-white rounded-lg p-4 flex flex-col items-center">
                <h3 className="text-lg font-semibold mb-2">Wins by Character</h3>
                <div className="h-64 w-64">
                    <Pie data={winData} options={chartOptions}/>
                </div>
            </div>
            <div className="bg-white rounded-lg p-4 flex flex-col items-center">
                <h3 className="text-lg font-semibold mb-2">Losses by Character</h3>
                <div className="h-64 w-64">
                    <Pie data={lossData} options={chartOptions} />
                </div>
            </div>
        </div>
    );
}
