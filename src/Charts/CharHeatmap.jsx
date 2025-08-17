// src/Charts/CharPickBarCard.jsx
import { API_BASE_URL } from '@/config';
import { useEffect, useState } from 'react';
import { connectWebSocket, subscribe } from '@/utils/websocket';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function CharHeatmapCard({ className = '' }) {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState(false);

  const fetchCharPicks = () => {
    fetch(`http://${API_BASE_URL}/heatmap-data`)
      .then(res => res.json())
      .then(json => {
        if (json.status === 'SUCCESS' && json.data) {
          setRows(json.data);
          setError(false);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true));
  };

  useEffect(() => {
    fetchCharPicks();
    connectWebSocket(`ws://${API_BASE_URL}/ws`);
    const unsubscribe = subscribe((message) => {
      if (message.type === 'new_match') {
        fetchCharPicks();
      }
    });
    return () => unsubscribe();
  }, []);

  if (error) {
    return (
      <Card className={className}>
        <CardHeader><CardTitle>Opponent Picks</CardTitle></CardHeader>
        <CardContent className="text-red-500">Failed to load data</CardContent>
      </Card>
    );
  }

  if (!rows.length) {
    return (
      <Card className={className}>
        <CardHeader><CardTitle>Opponent Picks</CardTitle></CardHeader>
        <CardContent>Loading...</CardContent>
      </Card>
    );
  }

  const labels = rows.map(r => r.char_name);
  const values = rows.map(r => r.pick_count);

  // simple color palette (repeat if needed)
  const colors = [
    '#FF6384','#36A2EB','#FFCE56','#4BC0C0','#9966FF',
    '#FF9F40','#8BC34A','#F06292','#4D5360','#9CCC65',
    '#BA68C8','#26C6DA','#D4E157'
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
      <CardHeader><CardTitle>Opponent Picks</CardTitle></CardHeader>
      <CardContent style={{ height: 320 }}>
        <Bar data={data} options={options} />
      </CardContent>
    </Card>
  );
}
