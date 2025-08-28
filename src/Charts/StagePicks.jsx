import { API_BASE_URL } from '@/config';
import { useEffect, useState } from 'react';
import { connectWebSocket, subscribe } from '@/utils/websocket';
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function StagePickCard({ className = '' }) {
    const [stageData, setStageData] = useState([]);
    const [selectedSeason, setSelectedSeason] = useState(null);
    const [error, setError] = useState(false);

    const fetchStageData = () => {
        fetch(`http://${API_BASE_URL}/stagepick-data`)
            .then(res => res.json())
            .then(json => {
                if (json.status === 'SUCCESS' && json.data) {
                    setStageData(json.data);
                    setError(false);
                } else {
                    setError(true);
                }
            })
            .catch(() => setError(true));
    };  // Group data by season

    useEffect(() => {
        fetchStageData();
        connectWebSocket(`ws://${API_BASE_URL}/ws`);
        const unsubscribe = subscribe((message) => {
            if (message.type === 'new_match') {
                fetchStageData();
            }
        });
        return () => unsubscribe();
    }, []);
    const seasons = [...new Set(stageData.map((d) => d.season_display_name))];
    const stages = [...new Set(stageData.map((d) => d.stage_name))];

    const activeSeason = selectedSeason || seasons[0];
    const filteredData = stageData.filter(
        (d) => d.season_display_name === activeSeason
    );
    const randomColor = () =>
        `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`;
    const datasets = [
        {
            label: activeSeason,
            data: filteredData.map(d => d.pick_count),
            backgroundColor: filteredData.map(() => randomColor()), // random color per bar
            barThickness: 30, // makes bars wider
        }
    ];

    const chartData = {
        labels: filteredData.map(d => d.stage_name),
        datasets
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: false,
                text: `Stage Pick Counts (${activeSeason})`,
            },
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const value = context.raw;
                        const dataset = context.dataset.data;
                        const total = dataset.reduce((a, b) => a + b, 0);
                        const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                        return `${context.dataset.label}: ${value} (${percent}%)`;
                    },
                },
            },
        },
        scales: {
            x: {
                beginAtZero: true,
                barPercentage: 2,      // default is 0.9
                categoryPercentage: 0.8, // default is 0.8
            },
            y: {
                beginAtZero: true,
                title: { display: true, text: "Pick Count" },
            },
        },
    };

    return (
        <Card className={`bg-gray-200 ${className}`} >
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Stage Pick Counts</CardTitle>
                <Select

                    value={activeSeason}
                    onValueChange={(val) => setSelectedSeason(val)}
                >
                    <SelectTrigger className="bg-white h-[20px] w-[180px]">
                        <SelectValue placeholder="Select season" />
                    </SelectTrigger>
                    <SelectContent>
                        {seasons.map((s) => (
                            <SelectItem key={s} value={s}>
                                {s}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent className="h-[200px]">
                {error ? (
                    <p className="text-red-500">Error loading data.</p>
                ) : (
                    <Bar data={chartData} options={options} />
                )}
            </CardContent>
        </Card >
    );
}