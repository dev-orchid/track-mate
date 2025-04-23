import React from 'react';

const Dashboard = ({ trackingData }) => (
  <div>
    {trackingData && trackingData.length > 0 ? (
      <ul>
        {trackingData.map((item, index)=> (
          <div key={index}>
          <p><strong>Name:</strong> {item.eventType}</p>
          <p><strong>Email:</strong> {item.sessionId}</p>
          <ul>
          {item.events.map((event, index) => (
            <div key={index} style={{ marginBottom: "20px", padding: "10px", border: "1px solid #ddd", borderRadius: "5px" }}>
              <p><strong>Event Type:</strong> {event.eventType}</p>
              <p><strong>Timestamp:</strong> {event.timestamp.toLocaleString()}</p>
              
              <h4>Event Data</h4>
              <p><strong>Address:</strong> {event.eventData.address}</p>

              <h4>Products Involved</h4>
              <ul>
                {event.eventData.productInfos.map((product, idx) => (
                  <li key={idx}>
                    <strong>Product:</strong> {product.productName}  
                    <br />
                    <strong>Price:</strong> ${product.price}  
                    <br />
                    <strong>Product ID:</strong> {product.productId}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          </ul>
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

