import axios from 'axios';
axios.get('http://localhost:5000/api/incident/all-teams')
  .then(res => console.log("Success fetch all", res.data?.length))
  .catch(err => console.log("Failed all", err.message));
