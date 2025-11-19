import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';

const BarChartComponent = ({ data }) => {
  // Ensure every entry has a name
  const processedData = data.map((entry, idx) => ({
    ...entry,
    name: entry.name ? entry.name : `Unnamed ${idx + 1}`,
  }));

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

  return (
    <div style={{ marginTop: 40, width: 1000, height: 450, textAlign: 'center' }}>
     
      <BarChart
        width={1000}
        height={400}
        data={processedData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 70,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="value">
          {processedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index]} />
          ))}
        </Bar>
      </BarChart>
    </div>
  );
};

export default BarChartComponent;