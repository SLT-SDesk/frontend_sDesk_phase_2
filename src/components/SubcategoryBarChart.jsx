import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

// Example mock data for subcategories
const data = [
  { name: 'Hardware', value: 12 },
  { name: 'Software', value: 8 },
  { name: 'Network', value: 15 },
  { name: 'Access', value: 5 },
];

const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#a4de6c', '#d0ed57', '#fa8072', '#b8860b', '#20b2aa', '#ffb6c1', '#6a5acd', '#40e0d0', '#ff6347', '#4682b4'
];

const SubcategoryBarChart = ({ subcategoryData = data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={subcategoryData}>
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="value">
        {subcategoryData.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Bar>
    </BarChart>
    {subcategoryData.length === 0 && <div>No data available</div>}
  </ResponsiveContainer>
);

export default SubcategoryBarChart;
