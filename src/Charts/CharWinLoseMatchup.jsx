import { API_BASE_URL, API_BASE_PORT } from '@/config';
import React, { useState, useEffect, useMemo } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { connectWebSocket, subscribe } from "../utils/websocket";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false,
        },
        tooltip: {
            callbacks: {
                label: function (ctx) {
                    const wins = ctx.chart.data.datasets[0].data[ctx.dataIndex];
                    const losses = ctx.chart.data.datasets[1].data[ctx.dataIndex];
                    const total = wins + losses;
                    const value = ctx.raw;
                    const pct = total ? ((value / total) * 100).toFixed(1) : 0;
                    return `${ctx.dataset.label}: ${value} (${pct}%)`;
                },
            },
        },
    },
    scales: {
        x: { stacked: true },
        y: { stacked: true, beginAtZero: true },
    },
};

export default function WinLossByCharacterCard({ className = '' }) {
    const [stats, setStats] = useState([]);
    const [error, setError] = useState(false);
    const [seasons, setSeasons] = useState([]);
    const [selectedSeason, setSelectedSeason] = useState("");
    const [selectedTier, setSelectedTier] = useState("");

    const fetchSeasons = async () => {
        fetch(`http://${API_BASE_URL}:${API_BASE_PORT}/seasons`)
            .then(res => res.json())
            .then(json => {
                if (json.status === "SUCCESS" && json.data) {
                    setSeasons(json.data);
                } else {
                    setError(true);
                }
            })
            .catch(() => setError(true));
    };
    if (error) { 
        console.log(error)
    }
    const fetchTier = async () => {
        fetch(`http://${API_BASE_URL}:${API_BASE_PORT}/current_tier`)
            .then(res => res.json())
            .then(json => {
                if (json.status === "SUCCESS" && json.data) {
                    // setCurrentTier(json.data);
                    setSelectedTier(json.data.tier_short) ;
                } else {
                    setError(true);
                }
            })
            .catch(() => setError(true));
    };
    const fetchStats = async () => {
        fetch(`http://${API_BASE_URL}:${API_BASE_PORT}/character-mu-data`)
            .then(res => res.json())
            .then(json => {
                if (json.status === "SUCCESS" && json.data) {
                    setStats(json.data);
                    if (!selectedSeason && json.data.length > 0) {
                        setSelectedSeason(String(json.data[0].season_id));
                    }
                } else {
                    setError(true);
                }
            })
            .catch(() => setError(true));
    };

    useEffect(() => {
        fetchSeasons();
        fetchTier();
        fetchStats();
        connectWebSocket(`ws://${API_BASE_URL}:${API_BASE_PORT}/ws`);
        const unsubscribe = subscribe((message) => {
            if (message.type === "new_match") {
                fetchStats();
            }
        });

        return () => unsubscribe();
    }, [fetchStats]);
    const tiers = useMemo(() => {
        const seasonRows = stats.filter(s => String(s.season_id) === selectedSeason);
        const uniqueTiers = Array.from(
            new Map(seasonRows.map(r => [r.tier_short_name, r.tier_display_name])).entries()
        ).map(([short, display]) => ({ short, display }));
        return uniqueTiers;
    }, [stats, selectedSeason]);


    const filtered = useMemo(() => {
        return stats
            .filter(
                s =>
                    String(s.season_id) === selectedSeason &&
                    (selectedTier ? s.tier_short_name === selectedTier : true)
            )
            // sort by total games descending:
            .sort(
                (a, b) =>
                    (b.games_won + b.games_lost) - (a.games_won + a.games_lost)
            );

        // or by win percentage:
        // .sort((a, b) => b.win_percentage - a.win_percentage);
    }, [stats, selectedSeason, selectedTier]);

    const labels = filtered.map(d => d.opponent_character);
    const wins = filtered.map(d => d.games_won);
    const losses = filtered.map(d => d.games_lost);

    const chartData = {
        labels,
        datasets: [
            {
                label: "Wins",
                data: wins,
                backgroundColor: "rgba(34,197,94,0.8)",
            },
            {
                label: "Losses",
                data: losses,
                backgroundColor: "rgba(239,68,68,0.8)",
            },
        ],
    };

    return (
        <Card className={`bg-gray-200 text-black flex flex-col ${className}`}>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>W/L By Char</CardTitle>
                <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                    <SelectTrigger className="bg-white h-[20px] w-[180px]">
                        <SelectValue placeholder="Select season" />
                    </SelectTrigger>
                    <SelectContent>
                        {seasons.map(season => (
                            <SelectItem key={season.id} value={String(season.id)}>
                                {season.display_name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={selectedTier} onValueChange={setSelectedTier}>
                    <SelectTrigger className="bg-white h-[20px] w-[180px]">
                        <SelectValue placeholder="All tiers" />
                    </SelectTrigger>
                    <SelectContent>
                        {tiers.map(t => (
                            <SelectItem key={t.short} value={t.short}>{t.display}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent className="justify-center items-center flex min-h-[400px]">
                {filtered.length > 0 ? (
                    <Bar data={chartData} options={chartOptions} />
                ) : (
                    <p className="text-muted-foreground">No data</p>
                )}
            </CardContent>
        </Card>
    );
}
