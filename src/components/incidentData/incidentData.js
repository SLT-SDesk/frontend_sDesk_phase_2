const incidentData = {
  incidentId: '1250304-043',
  
  
  category: '',
  location: '',
  priority: '',

  affectedUsers: [
    {
      serviceNo: '011121',
      tpNumber: '0703456523',
      name: 'Dilani Urenikkia',
      designation: 'Senior Assistant Engineer A7',
      email: 'dilaniums@slt.com.lk',
    },
 
  ],

  history: [
    {
      assignedTo: 'Subash Udayakumara',
      updatedBy: 'Dilani De Silva',
      updatedOn: '2025-03-04 10:50',
      status: 'Reported',
      comments:
        'Laptop OS issue - ProBook HP 3/5/25 will send 819F2882-71E7-40E1-ADB6-70099142C006 Name-GL-OPM-L11121',
    },

  ],

  updateStatus: {
    updatedBy: 'Dilani De Silva',
    category: 'Software Issue',
    location: 'Galle OPMC',
    priority: 'Critical',
  },
};


incidentData.category = incidentData.updateStatus.category;
incidentData.location = incidentData.updateStatus.location;
incidentData.priority = incidentData.updateStatus.priority;

export default incidentData;
