// src/Charts/CharPickBarCard.jsx
import { API_BASE_URL } from '@/config';
import { useEffect, useState, useMemo } from 'react';
import { connectWebSocket, subscribe } from '@/utils/websocket';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function CharHeatmapCard({ className = '' }) {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState(false);
  const [seasons, setSeasons] = useState({});
  const [selectedSeason, setSelectedSeason] = useState("");

  const fetchSeasons = async () => {
    fetch(`http://${API_BASE_URL}/seasons`)
      .then(res => res.json())
      .then(json => {
        if (json.status === "SUCCESS" && json.data) {
          let d = json.data;
          setSeasons(d.reduce((acc, season) => {
            acc[season.id] = season;
            return acc;
          }, {}))
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true));
  };

  const fetchCharPicks = () => {
    fetch(`http://${API_BASE_URL}/heatmap-data`)
      .then(res => res.json())
      .then(json => {
        if (json.status === 'SUCCESS' && json.data) {
          setRows(json.data);
          if (!selectedSeason && json.data.length > 0) { setSelectedSeason(String(json.data[0].season_id)) }

          setError(false);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true));
  };

  useEffect(() => {
    fetchSeasons();
    fetchCharPicks();
    connectWebSocket(`ws://${API_BASE_URL}/ws`);
    const unsubscribe = subscribe((message) => {
      if (message.type === 'new_match') {
        fetchCharPicks();
      }
    });
    return () => unsubscribe();
  }, []);

  const sortedSeasons = useMemo(() => {
    return Object.values(seasons).sort((a, b) => a.id - b.id);
  }, [seasons]);

  const activeSeasonId = selectedSeason || (sortedSeasons.length > 0 ? String(sortedSeasons.at(-1).id) : "");

  const filteredData = useMemo(() => {
    if (!activeSeasonId) return [];
    return rows.filter(
      (d) => String(d.season_id) === activeSeasonId
    );
  }, [rows, activeSeasonId]);

  if (error) {
    return (
      <Card className={className}>
        <CardHeader><CardTitle>Opponent Picks</CardTitle></CardHeader>
        <CardContent className="text-red-500">Failed to load data</CardContent>
      </Card>
    );
  }

  if (!rows.length || sortedSeasons.length === 0) {
    return (
      <Card className={className}>
        <CardHeader><CardTitle>Opponent Picks</CardTitle></CardHeader>
        <CardContent>Loading...</CardContent>
      </Card>
    );
  }

  const labels = filteredData.map(r => r.char_name);
  const values = filteredData.map(r => r.pick_count);

  // simple color palette (repeat if needed)
  const colors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
    '#FF9F40', '#8BC34A', '#F06292', '#4D5360', '#9CCC65',
    '#BA68C8', '#26C6DA', '#D4E157'
  ];

  const data = {
    labels,
    datasets: [{
      label: 'Picks',
      data: values,
      backgroundColor: labels.map((_, i) => colors[i % colors.length]),
      borderWidth: 0
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || '';
            const value = context.parsed.y ?? context.parsed; // bar uses y
            const dataset = context.chart.data.datasets[0].data;
            const total = dataset.reduce((a, b) => a + b, 0);
            const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
            return `${label}: ${value} picks (${pct}%)`;
          }
        }
      }
    },
    scales: {
      x: {
        title: { display: true, text: 'Character' },
        ticks: { autoSkip: false, maxRotation: 45, minRotation: 0 }
      },
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Pick Count' }
      }
    }
  };

  return (
    <Card className={`bg-gray-200 text-black ${className}`}>
      <CardHeader>
        <CardTitle>Opponent Picks</CardTitle>
        <div className="flex justify-between">
          <Select value={activeSeasonId} onValueChange={setSelectedSeason}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Select season" />
            </SelectTrigger>
            <SelectContent>
              {sortedSeasons.map(season => (
                <SelectItem key={season.id} value={String(season.id)}>{season.display_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

        </div>
      </CardHeader>
      <CardContent style={{ height: 320 }}>
        <Bar data={data} options={options} />
      </CardContent>
    </Card>
  );
}
