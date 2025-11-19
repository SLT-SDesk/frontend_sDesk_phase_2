import React, { useState } from 'react';
import CategorySelector from '../../components/CategorySelector/CategorySelector';
import MonthlyIncidentSummary from '../../components/MonthlyIncidentSummary/MonthlyIncidentSummary';
import BarChartComponent from '../../components/BarChartComponent';
import DateRangePopup from '../../components/AdminDateRangePopup/DateRangePopup';

const KPIReport = () => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const reportedData = [10, 12, 8, 15, 9, 11, 13, 14, 10, 16, 18, 20];
  const clearedData = [8, 10, 9, 12, 7, 10, 11, 12, 9, 14, 15, 18];

  const calculateData = (months, reported, cleared) => {
    const BF = [];
    const CF = [];
    let currentBF = 0;
    months.forEach((_, idx) => {
      BF[idx] = currentBF;
      const cf = currentBF + (reported[idx] || 0) - (cleared[idx] || 0);
      CF[idx] = cf;
      currentBF = cf;
    });
    return { BF, Reported: reported, Cleared: cleared, CF };
  };

  const data = calculateData(months, reportedData, clearedData);

  const barChartData = [
    { name: 'Hardware', value: 12 },
    { name: 'Software', value: 8 },
    { name: 'Network', value: 15 },
    { name: 'Access', value: 5 },
  ];

  const [datePopupOpen, setDatePopupOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState({
    selection: 'Last 30 Days',
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date()
  });

  const handleDateApply = (range) => {
    setSelectedDateRange(range);
    setDatePopupOpen(false);
  };

  return (
    <div style={{ width: '100%', padding: '40px 0 0 40px', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '95%' }}>
        <div>
          <h2 style={{ margin: 0 }}>KPI Report</h2>
          <div style={{ color: '#555', fontSize: '16px', marginTop: '8px' }}>
            View and analyze key performance indicators for incident management with subtle animations.
          </div>
        </div>
        <CategorySelector />
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', margin: '40px 0 30px 0', width: '100%' }}>
        <MonthlyIncidentSummary months={months} data={data} />
      </div>
      <div style={{ margin: '30px 0 0 0', width: '80%' }}>
        <button onClick={() => setDatePopupOpen(true)} style={{ marginBottom: '20px', padding: '8px 16px', borderRadius: '6px', background: 'linear-gradient(90deg, #43ea7c 0%, #2ecc40 100%)', border: '1px solid #43ea7c', color: '#fff', fontWeight: 'bold', boxShadow: '0 2px 8px rgba(67,234,124,0.15)' }}>
          Select Date Range
        </button>
        <DateRangePopup open={datePopupOpen} onClose={() => setDatePopupOpen(false)} onApply={handleDateApply} selectedRange={selectedDateRange} />
        <h3 style={{ marginBottom: '16px', fontWeight: 'bold' }}>Incidents by SubCategory</h3>
        <BarChartComponent data={barChartData} />
      </div>
    </div>
  );
};

export default KPIReport;
