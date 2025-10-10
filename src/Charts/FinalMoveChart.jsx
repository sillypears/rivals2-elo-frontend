import { API_BASE_URL } from '@/config';
import React, { useState, useEffect, useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { connectWebSocket, subscribe } from "../utils/websocket";

const chartOptions = {
    cutout: '50%',
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
            onHover: (e, legendItem, legend) => {
                const chart = legend.chart;
                chart.setActiveElements([
                    { datasetIndex: 0, index: legendItem.index },
                ]);
                chart.update();
            },
            onLeave: (e, legendItem, legend) => {
                const chart = legend.chart;
                chart.setActiveElements([]);
                chart.update();
            },
            position: 'bottom'
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

    const fetchSeasons = async () => {
        fetch(`http://${API_BASE_URL}/seasons`)
            .then(res => res.json())
            .then(json => {
                if (json.status === "SUCCESS" && json.data) {
                    setSeasons(json.data);
                    const latestSeason = json.data.find(season => season.latest === true);
                    if (latestSeason) {
                        setSelectedSeason(latestSeason.display_name);
                    }
                    console.log(latestSeason)
                } else {
                    setError(true);
                }
            })
            .catch(() => setError(true));
    };
    const fetchFinalMoves = async () => {
        fetch(`http://${API_BASE_URL}/final-move-stats`)
            .then(res => res.json())
            .then(json => {
                if (json.status === "SUCCESS" && json.data) {
                    setFinalMoves(json.data);
                } else {
                    setError(true);
                }
            })
            .catch(() => setError(true));
    };

    useEffect(() => {
        fetchSeasons();
        fetchFinalMoves();

        connectWebSocket(`ws://${API_BASE_URL}/ws`);
        const unsubscribe = subscribe((message) => {
            if (message.type === "new_match") {
                fetchFinalMoves()
            }
        });

        return () => unsubscribe();
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
                hoverOffset: 30
            },
        ],
    };

    return (
        <Card className="bg-gray-200 text-black flex flex-col">
            <CardHeader className={``}>
                <div className="flex justify-between">
                    <CardTitle className="">Finish Moves</CardTitle>
                    <Select className="" value={selectedSeason} onValueChange={(e) => setSelectedSeason(e)} >
                        <SelectTrigger className=" bg-white">
                            <SelectValue placeholder="Select a timezone" />
                        </SelectTrigger>
                        <SelectContent>
                            {seasons.map(season => (
                                <SelectItem key={season.id} value={season.display_name}>{season.display_name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent className="justify-center items-center flex min-h-[300px]">
                {topMoves.length > 0 ? (
                    <Doughnut data={chartData} options={chartOptions} />
                ) : (
                    <p className="text-muted-foreground">No data</p>
                )}
            </CardContent>
        </Card>
    );
}
