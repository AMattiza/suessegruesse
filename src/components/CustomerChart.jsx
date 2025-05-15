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
      <p>Neukunden: {fmt(d.newCustomers)}</p>
      <p>Nachbesteller: {fmt(d.reorderCustomers)}</p>
    </div>
  );
};

const CustomerChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart
        data={data}
        margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
      >
        <XAxis
          dataKey="month"
          type="category"
          padding={{ left: 0, right: 0 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis hide />
        <Tooltip content={<CustomTooltip />} />
        <Legend verticalAlign="top" height={36} />
        <Area
  type="monotone"
  dataKey="reorderCustomers"
  name="Nachbesteller"
  stroke="#007AFF"
  fill="#007AFF"
  strokeWidth={2}
  dot={false}
/>
<Area
  type="monotone"
  dataKey="newCustomers"
  name="Neukunden"
  stroke="#34C759"
  fill="#34C759"
  strokeWidth={2}
  dot={false}
/>
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default CustomerChart;
