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

export default function EloHistogram({ matches, className = '' }) {
    const binSize = 25;
    const offset = 25;
    const [minElo, maxElo] = useMemo(() => {
        if (!matches || matches.length === 0) return [0, 0];

        const elos = matches.map(m => m.opponent_elo);
        const min = Math.floor(Math.min(...elos) / binSize) * binSize - offset;
        const max = Math.ceil(Math.max(...elos) / binSize) * binSize + offset;
        return [min, max];
    }, [matches]);

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
    }, [matches, maxElo, minElo]);

    return (
        <div className={`bg-gray-200 text-black p-4 pt-1 rounded-lg h-full w-full ${className}`}>
            <h3 className="text-lg font-bold w-full mb-2">Opponent Elo Distribution</h3>
            <Bar
                data={histogramData}
                options={{
                    responsive: true,
                    aspectRatio: 2.2,
                    maintainAspectRatio: true,
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
