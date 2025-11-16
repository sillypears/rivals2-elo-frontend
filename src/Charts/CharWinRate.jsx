import { API_BASE_URL, API_BASE_PORT } from '@/config';
import { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    Colors
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, Colors);
const chartOptions = {
    plugins: {
        legend: {
            labels: {
                font: {
                    size: 10 
                },
                boxWidth: 10, 
                padding: 8,  
            },
            position: 'bottom' 
        }
    }
};
export default function CharWinLossChart() {
    const [winData, setWinData] = useState(null);
    const [lossData, setLossData] = useState(null);

    useEffect(() => {
        fetch(`http://${API_BASE_URL}:${API_BASE_PORT}/char-stats`)
            .then(res => res.json())
            .then(data => {
                const winLabels = [];
                const winValues = [];
                const lossLabels = [];
                const lossValues = [];
                data.data.forEach(entry => {
                    if (entry.wins > 0) {
                        winLabels.push(entry.opponent_pick);
                        winValues.push(entry.wins);
                    }
                    if (entry.losses > 0) {
                        lossLabels.push(entry.opponent_pick);
                        lossValues.push(entry.losses);
                    }
                });

                setWinData({
                    labels: winLabels,
                    datasets: [{
                        label: 'Wins vs Character',
                        data: winValues,
                        borderWidth: 1,
                    }]
                });

                setLossData({
                    labels: lossLabels,
                    datasets: [{
                        label: 'Losses vs Character',
                        data: lossValues,
                        borderWidth: 1,
                    }]
                });
            })
            .catch(err => console.error('Failed to fetch char stats', err));
    }, []);

    if (!winData || !lossData) return null;

    return (
        <div className="grid grid-cols-2 gap-2 text-black">
            <div className="bg-gray-200 rounded-lg p-4 flex flex-col items-center">
                <h3 className="text-lg font-semibold mb-2">Wins by Character</h3>
                <div className="h-64 w-64">
                    <Pie data={winData} options={chartOptions}/>
                </div>
            </div>
            <div className="bg-gray-200 rounded-lg p-4 flex flex-col items-center">
                <h3 className="text-lg font-semibold mb-2">Losses by Character</h3>
                <div className="h-64 w-64">
                    <Pie data={lossData} options={chartOptions} />
                </div>
            </div>
        </div>
    );
}
