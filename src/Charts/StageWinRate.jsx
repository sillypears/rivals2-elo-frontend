import { API_BASE_URL, API_BASE_PORT } from '@/config';
import React, { useEffect, useState, useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { connectWebSocket, subscribe } from "@/utils/websocket";

export default function StageWinLossCard({ className = "" }) {
    const [stageData, setStageData] = useState([]);
    const [seasons, setSeasons] = useState([]);
    const [selectedSeason, setSelectedSeason] = useState("");
    const [error, setError] = useState(false);

    const fetchSeasons = async () => {
        fetch(`http://${API_BASE_URL}:${API_BASE_PORT}/seasons`)
            .then(res => res.json())
            .then(json => {
                if (json.status === "SUCCESS" && json.data) {
                    setSeasons(json.data);
                    const latestSeason = json.data.find(season => season.latest === true);
                    if (latestSeason) {
                        setSelectedSeason(latestSeason.display_name);
                    }
                } else {
                    setError(true);
                }
            })
            .catch(() => setError(true));
    };

    const fetchStageStats = () => {
        fetch(`http://${API_BASE_URL}:${API_BASE_PORT}/stage-stats`)

            .then(res => res.json())
            .then(json => {
                if (json.status === 'SUCCESS' && json.data) {
                    setStageData(json.data);
                } else {
                    setError(true);
                }
            })
            .catch(() => setError(true));
    };

    useEffect(() => {
        fetchSeasons();
        fetchStageStats();
        connectWebSocket(`ws://${API_BASE_URL}:${API_BASE_PORT}/ws`);
        const unsubscribe = subscribe((message) => {
            if (message.type === "new_match") {
                fetchStageStats()
            }
        });

        return () => unsubscribe();
    }, []);

    const filteredData = useMemo(() => {
        const activeSeason = seasons.find(s => s.display_name === selectedSeason);
        return stageData.filter(s => s.season_id === activeSeason?.id);
    }, [stageData, seasons, selectedSeason]);

    if (error) {
        return (
            <Card className="p-6">
                <CardHeader>
                    <CardTitle>Stage Performance</CardTitle>
                </CardHeader>
                <CardContent className="text-red-500">Error loading data.</CardContent>
            </Card>
        );
    }

    if (filteredData.length === 0) {
        return (
            <Card className="p-6">
                <CardHeader>
                    <CardTitle>Stage Performance</CardTitle>
                </CardHeader>
                <CardContent>Loading...</CardContent>
            </Card>
        );
    }

    const labels = filteredData.map((s) => s.stage_name);
    const wins = filteredData.map((s) => parseInt(s.wins));
    const losses = filteredData.map((s) => parseInt(s.losses));

    const colors = [
        "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0",
        "#9966FF", "#FF9F40", "#FFCD56", "#4D5360",
        "#8BC34A", "#F06292"
    ];

    const doughnutOptions = {
        cutout: '40%',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    font: {
                        size: 10
                    },
                    boxWidth: 10,
                    padding: 8,

                },
                position: 'bottom',
                maxHeight: 60, // Limit legend height to prevent overflow

            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const label = context.label || "";
                        const value = context.parsed;
                        const dataset = context.dataset.data;
                        const total = dataset.reduce((a, b) => a + b, 0);
                        const pct = ((value / total) * 100).toFixed(1);
                        return `${label}: ${value} (${pct}%)`;
                    },
                },
            },
        },
    };

    const winData = {
        labels,
        datasets: [
            {
                label: "Wins",
                data: wins,
                backgroundColor: colors,
            },
        ],
    };

    const lossData = {
        labels,
        datasets: [
            {
                label: "Losses",
                data: losses,
                backgroundColor: colors,
            },
        ],
    };

    return (
        <Card className={`bg-gray-200 text-black flex flex-col ${className}`}>
            <CardHeader>
                <div className="flex justify-between">
                    <CardTitle>Stage Performance (Wins vs Losses)</CardTitle>
                    <Select className="" value={selectedSeason} onValueChange={(e) => setSelectedSeason(e)} >
                        <SelectTrigger className=" bg-white">
                            <SelectValue placeholder="Select a season" />
                        </SelectTrigger>
                        <SelectContent>
                            {seasons.map(season => (
                                <SelectItem key={season.id} value={season.display_name}>{season.display_name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4 p-4 min-h-[300px] justify-center items-stretch">
                <div className="flex-1 min-w-0 flex flex-col">
                    <h3 className="text-center font-semibold mb-2">Wins</h3>
                    <div className="flex-1 relative" style={{ minHeight: '200px' }}>
                        <Doughnut data={winData} options={doughnutOptions} />
                    </div>
                </div>

                <div className="flex-1 min-w-0 flex flex-col">
                    <h3 className="text-center font-semibold mb-2">Losses</h3>
                    <div className="flex-1 relative" style={{ minHeight: '200px' }}>
                        <Doughnut data={lossData} options={doughnutOptions} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
