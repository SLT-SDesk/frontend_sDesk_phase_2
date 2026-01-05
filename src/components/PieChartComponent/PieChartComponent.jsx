import React, { useState } from 'react';
import { PieChart, Pie, Sector, Cell, Legend } from 'recharts';

  const TEAM_COLORS = {
    IT: '#1E40AF',
    HR: '#FF5F1F',
    Security: '#00FF00',
  };

const renderActiveShape = (props) => {


  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    percent,
    name
  } = props;


  return (
    <g>
      <text x={cx} y={cy} dy={-10} textAnchor="middle" fill={fill}>
        {name}
      </text>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
        {`${(percent * 100).toFixed(2)}%`}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
    </g>
  );
};

const PieChartComponent = ({ data }) => {

  const colors = data.map(
    item => TEAM_COLORS[item.name] || '#9CA3AF'
  );


  const [activeIndex, setActiveIndex] = useState(0);




  const onPieClick = (_, index) => {
    setActiveIndex(index);
  };

  // If no data provided, show empty state
  if (!data || data.length === 0 || data.every(item => item.value === 0)) {
    return (
      <PieChart width={700} height={500}>
        <text x={350} y={250} textAnchor="middle" fill="#666" fontSize="16">
          No data available
        </text>
      </PieChart>
    );
  }

  // Increased chart size and centered the pie
  return (
    <PieChart width={700} height={700}>
      <Pie
        activeIndex={activeIndex}
        activeShape={renderActiveShape}
        data={data} // use provided data
        cx={300} // center horizontally
        cy={200} // move pie lower to reduce upper space
        innerRadius={120} // increased radius
        outerRadius={180} // increased radius
        fill="#8884d8"
        dataKey="value"
        onClick={onPieClick}
      >
        {/* Generate colors based on names */}
        {data.map((entry, index) => (
          <Cell
            key={`cell-${index}`}
            fill={colors[index]}
            opacity={activeIndex === index ? 1 : 0.6}
          />
        ))}


      </Pie>
      <Legend
        layout="vertical"
        iconType="square"
        iconSize={15}
        align="right"
        verticalAlign="top" // move legend to top
        wrapperStyle={{ marginTop: 40 }} // add top margin to reduce upper space
      />
    </PieChart>
  );
};

export default PieChartComponent;