// EloHistogram.jsx
import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function EloHistogram({ matches }) {
    const binSize = 25;
    const minElo = 750;
    const maxElo = 1450;

    const histogramData = useMemo(() => {
        const bins = {};

        for (let start = minElo; start <= maxElo; start += binSize) {
            const label = `${start}-${start + binSize - 1}`;
            bins[label] = 0;
        }

        matches.forEach((match) => {
            const elo = match.opponent_elo;
            const binStart = Math.floor(elo / binSize) * binSize;
            const label = `${binStart}-${binStart + binSize - 1}`;
            if (bins[label] !== undefined) {
                bins[label]++;
            }
        });

        return {
            labels: Object.keys(bins),
            datasets: [
                {
                    label: 'Matches vs Opponent Elo',
                    data: Object.values(bins),
                    backgroundColor: 'rgba(255, 206, 86, 0.7)',
                    borderColor: 'rgba(255, 206, 86, 1)',
                    borderWidth: 1,
                }
            ]
        };
    }, [matches]);

    return (
        <div className="bg-white text-black pb-8 pl-4 pt-1 rounded-lg h-96">
            <h3 className="text-lg font-bold mb-2">Opponent Elo Distribution</h3>
            <Bar
                data={histogramData}
                options={{
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: false,
                            ticks: { stepSize: 1 }
                        }
                    },
                    plugins: {
                        legend: { display: true }
                    }
                }}
            />
        </div>
    );
}
