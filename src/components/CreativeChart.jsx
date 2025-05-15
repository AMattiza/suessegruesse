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
    <div className="bg-white border border-gray-200 shadow-xl rounded-xl p-4 text-sm text-gray-800 space-y-1 w-64">
      <p className="text-base font-semibold text-gray-900 mb-2">{d.monthLabel}</p>

      <div className="grid grid-cols-2 gap-x-3">
        <span className="text-gray-600">Kunden aktiv:</span>
        <span className="text-right font-medium text-gray-800">{fmt(d.activeCustomersTotal)}</span>

        <span className="text-gray-600">Neukunden:</span>
        <span className="text-right text-[#34C759] font-medium">{fmt(d.newCustomers)}</span>

        <span className="text-gray-600">Nachbesteller:</span>
        <span className="text-right text-[#007AFF] font-medium">{fmt(d.reorderCustomers)}</span>

        <span className="text-gray-600">Verkaufseinheiten:</span>
        <span className="text-right font-medium text-gray-800">{fmt(d.totalUnits)}</span>
      </div>

      <hr className="my-2 border-gray-200" />

      <div className="grid grid-cols-2 gap-x-3">
        <span className="text-gray-600">Lizenz 1 brutto:</span>
        <span className="text-right text-[#34C759] font-semibold">{fmt(brutto)} €</span>

        <span className="text-gray-600">− Grafikkosten:</span>
        <span className="text-right text-[#FFD60A] font-semibold">−{fmt(grafik)} €</span>

        <span className="text-gray-600">− Postkartenkosten:</span>
        <span className="text-right text-[#007AFF] font-semibold">−{fmt(postkarte)} €</span>
      </div>

      <div className="mt-2 border-t border-gray-200 pt-2 grid grid-cols-2 gap-x-3 text-base font-bold">
        <span className="text-gray-800">Lizenz 1 netto:</span>
        <span className="text-right text-[#FF9500]">{fmt(netto)} €</span>
      </div>
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
          stroke="#136F63"
          fill="#136F63"
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
