import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Sector, Cell, Legend } from 'recharts';
import apiClient from '../../api/axiosInstance'; // Adjust path as needed

const renderActiveShape = (props) => {
  
  
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, percent } = props;

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

  function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    color += ('00' + ((hash >> (i * 8)) & 0xFF).toString(16)).slice(-2);
  }
  return color;
}

const colors = data.map(item => stringToColor(item.name));

  const [activeIndex, setActiveIndex] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [Loading, setLoading] = useState(true);
  const [Error, setError] = useState(null);

  useEffect(() => {
    const fetchMainCategoriesData = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/categories/main');
        const transformedData = response.data.map(category => ({
          name: category.name,
          value: category.subCategories ? category.subCategories.length : 0, // Count subcategories
        }));
        setChartData(transformedData);
      } catch (err) {
        console.error("Error fetching main categories:", err);
        setError("Failed to load chart data.");
      } finally {
        setLoading(false);
      }
    };

    fetchMainCategoriesData();
  }, []); // Empty dependency array means this runs once on mount

  const onPieClick = (_, index) => {
    setActiveIndex(index);
  };

  // If no data provided, show empty state
  if (!data || data.length === 0 || data.every(item => item.total === 0)) {
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
        data={chartData} // Use fetched data
        cx={300} // center horizontally
        cy={200} // move pie lower to reduce upper space
        innerRadius={120} // increased radius
        outerRadius={180} // increased radius
        fill="#8884d8"
        dataKey="value"
        onClick={onPieClick}
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={colors[index]} />
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