import React from 'react';

const Dashboard = ({ trackingData }) => (
  <div>
  <i>Profile Data: </i>
    {trackingData && trackingData.length > 0 ? (
      <ul>
        {trackingData.map((item, index)=> (
          <div key={index}>
          <p><strong>Name:</strong> {item.name}</p>
          <p><strong>Email:</strong> {item.email}</p>
          {item.phone && <p><strong>Phone:</strong> {item.phone}</p>}
          <hr />
          </div>
    ))}
      </ul>
    ) : (
      <p>No tracking data available.</p>
    )}
  </div>
);

export default Dashboard;
