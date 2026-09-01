import axios from 'axios';

axios.get('http://127.0.0.1:8000/api/incident/all-teams')
  .then(res => {
    const incidents = res.data;
    const tier3 = incidents.filter(i => i.status?.toLowerCase().includes('tier 3') || i.status?.toLowerCase().includes('tier3') || i.status?.toLowerCase().includes('tier 2') || i.status?.toLowerCase().includes('tier2'));
    console.log("Tier incidents:", tier3.map(i => ({ id: i.incident_number, handler: i.handler, status: i.status })));
  })
  .catch(err => console.log("Failed all", err.message));
