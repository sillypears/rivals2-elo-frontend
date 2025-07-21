import React, { useState, useEffect, useRef, useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


const chartOptions = {
    cutout: '50%',
    responsive: true,
    maintainAspectRatio: false,
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
        },
        tooltip: {
            callbacks: {
                label: function (context) {
                    const label = context.label || '';
                    const value = context.parsed;
                    const data = context.dataset.data;
                    const total = data.reduce((sum, val) => sum + val, 0);
                    const percent = total ? ((value / total) * 100).toFixed(1) : 0;

                    return `${label}: ${value} (${percent}%)`;
                }
            }
        }
    },
};

export default function TopFinalMoveCard({ className = '' }) {
    const [finalMoves, setFinalMoves] = useState([]);
    const [error, setError] = useState(false);
    const [seasons, setSeasons] = useState([]);
    const [selectedSeason, setSelectedSeason] = useState("");

    const wsRef = useRef(null);
    const fetchSeasons = async () => {
        fetch("http://192.168.1.30:8005/seasons")
            .then(res => res.json())
            .then(json => {
                if (json.status === "OK" && json.data) {
                    setSeasons(json.data);
                } else {
                    setError(true);
                }
            })
            .catch(() => setError(true));
    };
    const fetchFinalMoves = async () => {
        fetch("http://192.168.1.30:8005/final-move-stats")
            .then(res => res.json())
            .then(json => {
                if (json.status === "OK" && json.data) {
                    setFinalMoves(json.data);
                    if (!selectedSeason) { setSelectedSeason(json.data[0].season_display_name) }
                } else {
                    setError(true);
                }
            })
            .catch(() => setError(true));

    };

    useEffect(() => {
        fetchSeasons();
        fetchFinalMoves();

        const ws = new WebSocket("ws://192.168.1.30:8005/ws");
        wsRef.current = ws;
        ws.onopen = () => console.log("WebSocket connected");
        ws.onmessage = (event) => {
            try {
                if (!event.data || event.data.trim().charAt(0) !== '{') return;
                const message = JSON.parse(event.data);
                if (message.type === "new_match") {
                    fetchFinalMoves();
                }
            } catch (err) {
                console.warn("Error parsing WebSocket message", err);
            }
        };
        ws.onerror = (err) => console.error("WebSocket error", err);
        ws.onclose = () => console.log("WebSocket closed");
        return () => ws.close();
    }, []);


    const topMoves = useMemo(() => {
        const filtered = finalMoves.filter(m => m.season_display_name === selectedSeason);
        return filtered
            .sort((a, b) => b.final_move_count - a.final_move_count)
    }, [finalMoves, selectedSeason]);


    const chartData = {
        labels: topMoves.map(m => m.final_move_name),
        datasets: [
            {
                label: "Finishers",
                data: topMoves.map(m => m.final_move_count),
                backgroundColor: [
                    "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF",
                ],
            },
        ],
    };

    return (
        <Card className="w-full h-[400]-px flex flex-col">
            <CardHeader className={`flex justify-between ${className}`}>
                <CardTitle>Finish Moves</CardTitle>
                <select
                    className="bg-white border rounded-lg px-2 py-1 text-sm"
                    value={selectedSeason}
                    onChange={(e) => setSelectedSeason(e.target.value)}
                >
                    {seasons.map(season => (
                        <option key={season.id} value={season.display_name}>{season.display_name}</option>
                    ))}
                </select>
            </CardHeader>
            <CardContent className="justify-center items-center flex h-[300px] ">
                {topMoves.length > 0 ? (
                    <Doughnut data={chartData} options={chartOptions} />
                ) : (
                    <p className="text-muted-foreground">No data</p>
                )}
            </CardContent>
        </Card>
    );
}
