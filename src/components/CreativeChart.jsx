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

const CustomTooltip = ({ active, payload, license1Gross, postcardCost, graphicShare }) => {
  if (!active || !payload || payload.length === 0) return null;
  const d = payload[0].payload;

  const bruttoLizenz1 = d.totalUnits * license1Gross;
  const grafikKosten = d.totalUnits * graphicShare;
  const postkartenKosten = d.totalUnits * postcardCost;

  return (
    <div className="bg-white p-4 border rounded-lg shadow-md">
      <p className="font-semibold">{d.monthLabel}</p>

      <p>Neukunden: {fmt(d.newCustomers)}</p>
      <p>Nachbesteller: {fmt(d.reorderCustomers)}</p>
      <p>VE gesamt: {fmt(d.totalUnits)}</p>

      <hr className="my-2" />

      <p>Lizenz 1 brutto: {fmt(bruttoLizenz1)}</p>
      <p>− Grafikkosten: {fmt(grafikKosten)}</p>
      <p>− Postkartenkosten: {fmt(postkartenKosten)}</p>
      <p className="font-semibold mt-2">= Lizenz 1 netto: {fmt(d.tier1)}</p>
    </div>
  );
};

const CreativeChart = ({ data, license1Gross, postcardCost, graphicShare }) => {
  const chart = data.map(row => ({
    ...row,
    postkartenKosten: row.totalUnits * postcardCost,
    grafikKosten: row.totalUnits * graphicShare
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chart} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
        <XAxis dataKey="month" type="category" padding={{ left: 0, right: 0 }} />
        <YAxis hide />
        <Tooltip
          content={
            <CustomTooltip
              license1Gross={license1Gross}
              postcardCost={postcardCost}
              graphicShare={graphicShare}
            />
          }
        />
        <Legend verticalAlign="top" height={36} />

        {/* Reihenfolge: hinten → vorne */}
        <Area
          type="monotone"
          dataKey="tier1"
          name="Lizenz 1 netto"
          stroke="#34C759"
          fill="#34C759"
          strokeWidth={2}
          dot={false}
        />
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
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default CreativeChart;
