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

const fmtEuro = value =>
  new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value) + ' €';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;
  const d = payload[0].payload;

  const fmt = v =>
    new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(v);

  const brutto = d.totalUnits * d.license1Gross;
  const grafik = d.totalUnits * d.graphicShare;
  const postkarte = d.totalUnits * d.postcardCost;
  const netto = brutto - grafik - postkarte;

  return (
    <div className="bg-white p-4 border rounded-lg shadow-md space-y-1 text-sm">
      <p className="font-semibold text-base">{d.monthLabel}</p>

      <p>
        Kunden aktiv: <span className="font-semibold">{fmt(d.activeCustomersTotal)}</span>
      </p>
      <p>
        Neukunden: <span className="font-semibold">{fmt(d.newCustomers)}</span>
      </p>
      <p>
        Nachbesteller: <span className="font-semibold">{fmt(d.reorderCustomers)}</span>
      </p>
      <p>
        Verkaufseinheiten: <span className="font-semibold">{fmt(d.totalUnits)}</span>
      </p>

      <hr className="my-2" />

      <p>
        Lizenz 1 brutto:{' '}
        <span className="font-semibold">{fmt(brutto)} €</span>
      </p>
      <p>
        − Grafikkosten:{' '}
        <span className="font-semibold">−{fmt(grafik)} €</span>
      </p>
      <p>
        − Postkartenkosten:{' '}
        <span className="font-semibold">−{fmt(postkarte)} €</span>
      </p>

      <hr className="my-2" />

      <p className="font-semibold">
        Lizenz 1 netto: {fmt(netto)} €
      </p>
    </div>
  );
};

const CreativeChart = ({ data, license1Gross, postcardCost, graphicShare }) => {
  // Daten erweitern
  const chart = data.map(row => ({
    ...row,
    postkartenKosten: row.totalUnits * postcardCost,
    grafikKosten: row.totalUnits * graphicShare,
    license1Brutto: row.totalUnits * license1Gross,
    totalCustomers: row.newCustomers + row.reorderCustomers,
    postcardCost,
    graphicShare,
    license1Gross
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chart} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
        <XAxis dataKey="month" type="category" />
        <YAxis hide />
        <Tooltip content={<CustomTooltip />} />
        <Legend verticalAlign="top" height={36} />

        {/* Brutto-Lizenz als Basis-Fläche */}
        <Area
          type="monotone"
          dataKey="license1Brutto"
          name="Lizenz 1 brutto"
          stroke="#D1D5DB"
          fill="#D1D5DB"
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
