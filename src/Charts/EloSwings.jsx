import { API_BASE_URL, API_BASE_PORT } from '@/config';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export default function EloSwingCard({ className = '' }) {
    const [chartData, setChartData] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        fetch(`http://${API_BASE_URL}:${API_BASE_PORT}/elo-swing`)
            .then(res => res.json())
            .then(json => {
                if (json.status === 'SUCCESS' && Array.isArray(json.data)) {
                    setChartData({
                        labels: json.data.map(() => ""), 
                        datasets: [{
                            data: json.data.map(d => [d.elo_rank_old, d.elo_rank_old + d.elo_change]),
                            // Store extra data here for the tooltip to access
                            opponents: json.data.map(d => d.opponent_elo),
                            backgroundColor: json.data.map(d => d.elo_change >= 0 ? '#22c55e' : '#ef4444'),
                            borderRadius: 20,
                            borderSkipped: false,
                            barPercentage: 0.3,
                        }]
                    });
                } else {
                    setError(true);
                }
            })
            .catch(() => setError(true));
    }, []);

    const options = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    title: () => "Match Details",
                    label: (context) => {
                        const [start, end] = context.raw;
                        const opponent = context.dataset.opponents[context.dataIndex];
                        const diff = end - start;
                        
                        return [
                            `Swing: ${diff > 0 ? '+' : ''}${diff}`,
                            `Your Elo: ${start} → ${end}`,
                            `Opponent Elo: ${opponent}`
                        ];
                    }
                }
            }
        },
        scales: {
            x: {
                beginAtZero: false,
                grid: { color: 'rgba(0,0,0,0.05)' },
                title: { display: true, text: 'Elo Rating', font: { weight: 'bold' } }
            },
            y: {
                grid: { display: false }
            }
        }
    };

    return (
        <Card className={`bg-gray-200 text-black p-4 rounded-lg h-full w-full ${className}`}>
            <CardHeader className="text-lg font-bold p-0 pb-4">Elo Swings</CardHeader>
            <CardContent className="h-64 p-0">
                {error ? (
                    <div className="text-red-500 text-center">Error loading chart</div>
                ) : chartData ? (
                    <Bar data={chartData} options={options} />
                ) : (
                    <div className="text-center text-gray-500">Loading charts...</div>
                )}
            </CardContent>
        </Card>
    );
}