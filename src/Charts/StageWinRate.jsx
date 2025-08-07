import { API_BASE_URL } from '@/config';
import React, { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { connectWebSocket, subscribe } from "@/utils/websocket";

export default function StageWinLossCard({ className = ""}) {
    const [stageData, setStageData] = useState([]);
    const [error, setError] = useState(false);

    const fetchStageStats = () => {
        fetch(`http://${API_BASE_URL}/stage-stats`)

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
        fetchStageStats();
        connectWebSocket(`ws://${API_BASE_URL}/ws`);
        const unsubscribe = subscribe((message) => {
            if (message.type === "new_match") {
                fetchStageStats()
            }
        });

        return () => unsubscribe();
    }, []);


    if (stageData.length === 0) {
        return (
            <Card className="p-6">
                <CardHeader>
                    <CardTitle>Stage Performance</CardTitle>
                </CardHeader>
                <CardContent>Loading...</CardContent>
            </Card>
        );
    }

    const labels = stageData.map((s) => s.stage_name);
    const wins = stageData.map((s) => parseInt(s.wins));
    const losses = stageData.map((s) => parseInt(s.losses));

    const colors = [
        "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0",
        "#9966FF", "#FF9F40", "#FFCD56", "#4D5360",
        "#8BC34A", "#F06292"
    ];

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                position: "bottom",
                labels: { font: { size: 10 } },
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
                <CardTitle>Stage Performance (Wins vs Losses)</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center items-center">
                <div className=" ">
                    <h3 className="text-center font-semibold ">Wins</h3>
                    <Doughnut data={winData} options={doughnutOptions} />
                </div>
                <div className=" ">
                    <h3 className="text-center font-semibold ">Losses</h3>
                    <Doughnut data={lossData} options={doughnutOptions} />
                </div>
            </CardContent>
        </Card>
    );
}
