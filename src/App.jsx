import React, { useState, useEffect } from 'react';
import InputMask from './components/InputMask';
import LicenseChart from './components/LicenseChart';

function CollapsibleSection({ title, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="w-full border rounded-2xl bg-white mb-6">
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-4 text-left font-semibold"
      >
        {title} <span>{open ? '−' : '+'}</span>
      </button>
      {open && <div className="p-6">{children}</div>}
    </div>
  );
}

export default function App() {
  const [data, setData] = useState({
    months: 120,
    startDate: '2025-07',
    costPrice: 6.9,
    sellPrice: 12.9,
    uvp: 19.9,
    salesCost: 1.5,
    logisticsCost: 0.5,
    unitsPerDisplay: 32,
    newPartners: 12,
    increaseInterval: 3,
    increaseAmount: 1,
    reorderRate: 75,
    reorderCycle: 4,
    license1Gross: 1.4,
    postcardCost: 0.1,
    graphicShare: 0.3,
    license2: 1,
    license2Threshold: 10,
    marginPerUnit: 0,
    deckungsbeitragPerUnit: 0
  });

  useEffect(() => {
    const { sellPrice, costPrice, salesCost, logisticsCost } = data;
    const margin = parseFloat((sellPrice - costPrice).toFixed(2));
    const deck = parseFloat((margin - salesCost - logisticsCost).toFixed(2));
    setData(d => ({ ...d, marginPerUnit: margin, deckungsbeitragPerUnit: deck }));
  }, [data.sellPrice, data.costPrice, data.salesCost, data.logisticsCost]);

  const {
    months,
    startDate,
    costPrice,
    sellPrice,
    salesCost,
    logisticsCost,
    unitsPerDisplay,
    newPartners,
    increaseInterval,
    increaseAmount,
    reorderRate,
    reorderCycle,
    license1Gross,
    postcardCost,
    graphicShare,
    license2,
    license2Threshold
  } = data;

  // Dynamische Labels für Info-Texte basierend auf dem Planungszeitraum
  const monthLabel = months === 1 ? 'Monat' : 'Monaten';
  const infoTexts = {
    totalNew: `Gesamtzahl neuer Partner über den Planungszeitraum von ${months} ${monthLabel}.`,
    reorders: `Anzahl der Partner, die im Planungszeitraum von ${months} ${monthLabel} mindestens einmal nachbestellt haben.`,
    activeLastMonth: `Kunden im letzten Monat der Planung.`,
    avgUnitsFirstYear: `Mittlere Anzahl bestellter Einheiten pro Partner im ersten Jahr nach Erstkauf.`,
    avgRevenueFirstYear: `Mittlerer Umsatz pro Partner im ersten Jahr, basierend auf dem Verkaufspreis.`,
    lastMonthRevenue: `Alle Einnahmen im letzten Monat der Planung.`,
    totalUnitsAll: `Gesamtzahl aller verkauften Einheiten über den Planungszeitraum von ${months} ${monthLabel}.`,
    avgUnitsPerMonth: `Ø verkaufte Einheiten pro Monat (über ${months} ${monthLabel}).`,
    lastMonthUnits: `Alle VE im letzten Monat der Planung.`,
    salesCostTotal: `Gesamte Vertriebskosten über den Planungszeitraum von ${months} ${monthLabel}.`,
    salesCostAvg: `Ø Vertriebskosten pro Monat (über ${months} ${monthLabel}).`,
    salesCostLast: `Vertriebskosten im letzten Planungsmonat.`,
    logisticsCostTotal: `Gesamte Logistikkosten über den Planungszeitraum von ${months} ${monthLabel}.`,
    logisticsCostAvg: `Ø Logistikkosten pro Monat (über ${months} ${monthLabel}).`,
    logisticsCostLast: `Logistikkosten im letzten Planungsmonat.`,
    license1Total: `Anzahl verkaufter Tier-1-Lizenzen über den Planungszeitraum von ${months} ${monthLabel}.`,
    license1Avg: `Ø verkaufte Tier-1-Lizenzen pro Monat (über ${months} ${monthLabel}).`,
    license1Last: `Verkaufte Tier-1-Lizenzen im letzten Planungsmonat.`,
    license2Total: `Anzahl verkaufter Tier-2-Lizenzen über den Planungszeitraum von ${months} ${monthLabel}.`,
    license2Avg: `Ø verkaufte Tier-2-Lizenzen pro Monat (über ${months} ${monthLabel}).`,
    license2Last: `Verkaufte Tier-2-Lizenzen im letzten Planungsmonat.`
  };

  const [startYear, startMonth] = startDate.split('-').map(Number);

  const newPartnersPerMonth = Array.from(
    { length: months },
    (_, j) => newPartners + (increaseInterval > 0 ? Math.floor(j / increaseInterval) * increaseAmount : 0)
  );

  // Berechnung: aktive Kunden im letzten Monat
  const lastMonthIndex = months - 1;
  let activeCustomersInLastMonth = 0;
  for (let cohort = 0; cohort <= lastMonthIndex; cohort++) {
    const age = lastMonthIndex - cohort;
    let isActive = age === 0;
    if (!isActive && reorderCycle > 0 && age >= reorderCycle && age % reorderCycle === 0) {
      isActive = true;
    }
    if (isActive) {
      activeCustomersInLastMonth += newPartnersPerMonth[cohort];
    }
  }

  // … restliche Berechnungen und chartData, KPIs etc. bleiben unverändert …

  return (
    <div className="relative min-h-screen bg-gray-50 p-8">
      {/* … Header & CollapsibleSections … */}

      <CollapsibleSection title="Übersicht – Kundenzahlen">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-gray-100 rounded-xl text-center">
            <h3 className="font-medium">Gesamt Neukunden</h3>
            <p className="mt-2 text-2xl font-semibold">{fmtNum(totalNew)}</p>
            <p className="text-sm text-gray-500">{infoTexts.totalNew}</p>
          </div>
          <div className="p-4 bg-gray-100 rounded-xl text-center">
            <h3 className="font-medium">Kunden mit ≥1 Nachbestellung</h3>
            <p className="mt-2 text-2xl font-semibold">{fmtNum(reorders)}</p>
            <p className="text-sm text-gray-500">{infoTexts.reorders}</p>
          </div>
          <div className="p-4 bg-gray-100 rounded-xl text-center">
            <h3 className="font-medium">Kunden gesamt (letzter Monat)</h3>
            <p className="mt-2 text-2xl font-semibold">{fmtNum(activeCustomersInLastMonth)}</p>
            <p className="text-sm text-gray-500">{infoTexts.activeLastMonth}</p>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Übersicht – Durchschnittswerte">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-gray-100 rounded-xl text-center">
            <h3 className="font-medium">Ø VE pro Händler/Jahr</h3>
            <p className="mt-2 text-2xl font-semibold">{fmtNum(avgUnitsFirstYear)}</p>
            <p className="text-sm text-gray-500">{infoTexts.avgUnitsFirstYear}</p>
          </div>
          <div className="p-4 bg-gray-100 rounded-xl text-center">
            <h3 className="font-medium">Ø Umsatz pro Händler/Jahr</h3>
            <p className="mt-2 text-2xl font-semibold">{fmt(avgRevenueFirstYear)}</p>
            <p className="text-sm text-gray-500">{infoTexts.avgRevenueFirstYear}</p>
          </div>
          <div className="p-4 bg-gray-100 rounded-xl text-center">
            <h3 className="font-medium">Umsatz gesamt (letzter Monat)</h3>
            <p className="mt-2 text-2xl font-semibold">{fmt(lastMonthRevenue)}</p>
            <p className="text-sm text-gray-500">{infoTexts.lastMonthRevenue}</p>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Übersicht – Gesamt VE">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-gray-100 rounded-xl text-center">
            <h3 className="font-medium">VE insgesamt Ende Planungszeitraum</h3>
            <p className="mt-2 text-2xl font-semibold">{fmtNum(totalUnitsAll)}</p>
            <p className="text-sm text-gray-500">{infoTexts.totalUnitsAll}</p>
          </div>
          <div className="p-4 bg-gray-100 rounded-xl text-center">
            <h3 className="font-medium">Ø VE pro Monat</h3>
            <p className="mt-2 text-2xl font-semibold">{fmtNum(totalUnitsAll / months)}</p>
            <p className="text-sm text-gray-500">{infoTexts.avgUnitsPerMonth}</p>
          </div>
          <div className="p-4 bg-gray-100 rounded-xl text-center">
            <h3 className="font-medium">VE gesamt (letzter Monat)</h3>
            <p className="mt-2 text-2xl font-semibold">{fmtNum(lastMonthUnits)}</p>
            <p className="text-sm text-gray-500">{infoTexts.lastMonthUnits}</p>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Kostenübersicht – Vertrieb & Logistik">
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-3 gap-6">
          <div className="p-4 bg-gray-100 rounded-xl text-center">
            <h3 className="font-medium">Gesamte Vertriebskosten</h3>
            <p className="mt-2 text-2xl font-semibold">{fmt(totalSalesCost)}</p>
            <p className="text-sm text-gray-500">{infoTexts.salesCostTotal}</p>
          </div>
          <div className="p-4 bg-gray-100 rounded-xl text-center">
            <h3 className="font-medium">Ø Vertriebskosten je Monat</h3>
            <p className="mt-2 text-2xl font-semibold">{fmt(avgSalesCostPerMonth)}</p>
            <p className="text-sm text-gray-500">{infoTexts.salesCostAvg}</p>
          </div>
          <div className="p-4 bg-gray-100 rounded-xl text-center">
            <h3 className="font-medium">Vertriebskosten (letzter Monat)</h3>
            <p className="mt-2 text-2xl font-semibold">{fmt(lastSalesCost)}</p>
            <p className="text-sm text-gray-500">{infoTexts.salesCostLast}</p>
          </div>
          <div className="p-4 bg-gray-100 rounded-xl text-center">
            <h3 className="font-medium">Gesamte Logistikkosten</h3>
            <p className="mt-2 text-2xl font-semibold">{fmt(totalLogisticsCost)}</p>
            <p className="text-sm text-gray-500">{infoTexts.logisticsCostTotal}</p>
          </div>
          <div className="p-4 bg-gray-100 rounded-xl text-center">
            <h3 className="font-medium">Ø Logistikkosten je Monat</h3>
            <p className="mt-2 text-2xl font-semibold">{fmt(avgLogisticsCostPerMonth)}</p>
            <p className="text-sm text-gray-500">{infoTexts.logisticsCostAvg}</p>
          </div>
          <div className="p-4 bg-gray-100 rounded-xl text-center">
            <h3 className="font-medium">Logistikkosten (letzter Monat)</h3>
            <p className="mt-2 text-2xl font-semibold">{fmt(lastLogisticsCost)}</p>
            <p className="text-sm text-gray-500">{infoTexts.logisticsCostLast}</p>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Lizenz-KPIs">
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-3 gap-6">
          <div className="p-4 bg-gray-100 rounded-xl text-center">
            <h3 className="font-medium">Gesamt Erlös Lizenz 1</h3>
            <p className="mt-2 text-2xl font-semibold">{fmt(totalLicense1)}</p>
            <p className="text-sm text-gray-500">{infoTexts.license1Total}</p>
          </div>
          <div className="p-4 bg-gray-100 rounded-xl text-center">
            <h3 className="font-medium">Ø monatlicher Erlös Lizenz 1</h3>
            <p className="mt-2 text-2xl font-semibold">{fmt(totalLicense1 / months)}</p>
            <p className="text-sm text-gray-500">{infoTexts.license1Avg}</p>
          </div>
          <div className="p-4 bg-gray-100 rounded-xl text-center">
            <h3 className="font-medium">Erlös Lizenz 1 (letzter Monat)</h3>
            <p className="mt-2 text-2xl font-semibold">{fmt(lastLicense1)}</p>
            <p className="text-sm text-gray-500">{infoTexts.license1Last}</p>
          </div>
          <div className="p-4 bg-gray-100 rounded-xl text-center">
            <h3 className="font-medium">Gesamt Erlös Lizenz 2</h3>
            <p className="mt-2 text-2xl font-semibold">{fmt(totalLicense2)}</p>
            <p className="text-sm text-gray-500">{infoTexts.license2Total}</p>
          </div>
          <div className="p-4 bg-gray-100 rounded-xl text-center">
            <h3 className="font-medium">Ø monatlicher Erlös Lizenz 2</h3>
            <p className="mt-2 text-2xl font-semibold">{fmt(totalLicense2 / months)}</p>
            <p className="text-sm text-gray-500">{infoTexts.license2Avg}</p>
          </div>
          <div className="p-4 bg-gray-100 rounded-xl text-center">
            <h3 className="font-medium">Erlös Lizenz 2 (letzter Monat)</h3>
            <p className="mt-2 text-2xl font-semibold">{fmt(lastLicense2)}</p>
            <p className="text-sm text-gray-500">{infoTexts.license2Last}</p>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Einnahmen & Marge">
        <LicenseChart
          data={chartData}
          startYear={startYear}
          startMonth={startMonth}
          dataKey="tier1"
          strokeColor="#34C759"
          name="Lizenz 1 Erlös"
          dataKey2="tier2"
          strokeColor2="#007AFF"
          name2="Lizenz 2 Erlös"
          dataKey3="deckungsbeitragII"
          strokeColor3="#FFD60A"
          name3="Deckungsbeitrag II"
          dataKey4="restgewinn"
          strokeColor4="#FF9500"
          name4="Restgewinn"
        />
      </CollapsibleSection>
    </div>
  );
}
