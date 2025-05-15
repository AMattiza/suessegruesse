import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';

const fmt = value =>
  new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white p-4 border rounded-lg shadow-md">
      <p className="font-semibold">{d.monthLabel}</p>
      <p>Lizenz 1: {fmt(d.tier1)}</p>
      <p>Postkartenkosten: {fmt(d.postkartenKosten)}</p>
      <p>Grafikkosten: {fmt(d.grafikKosten)}</p>
    </div>
  );
};

const CreativeChart = ({ data }) => {
  // Werte vorberechnen (Postkarten & Grafik pro Monat)
  const chart = data.map(row => ({
    ...row,
    postkartenKosten: row.totalUnits * row.postcardCost,
    grafikKosten: row.totalUnits * row.graphicShare
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chart} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
        <XAxis dataKey="month" type="category" padding={{ left: 0, right: 0 }} />
        <YAxis hide />
        <Tooltip content={<CustomTooltip />} />
        <Legend verticalAlign="top" height={36} />
        
        {/* Kosten zuerst, damit sie hinten liegen */}
        <Area
          type="monotone"
          dataKey="grafikKosten"
          name="Grafikkosten"
          stroke="#FFD60A"
          fill="#FFD60A"
          strokeWidth={2}
          dot={false}
        />
        <Area
          type="monotone"
          dataKey="postkartenKosten"
          name="Postkartenkosten"
          stroke="#007AFF"
          fill="#007AFF"
          strokeWidth={2}
          dot={false}
        />
        {/* Lizenz vorne */}
        <Area
          type="monotone"
          dataKey="tier1"
          name="Lizenz 1"
          stroke="#34C759"
          fill="#34C759"
          strokeWidth={2}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default CreativeChart;
