// src/components/Dashboard/EventData.tsx
import React from 'react';

interface ProductInfo {
  productName: string;
  price: number;
  productId: string;
}

interface EventType {
  eventType: string;
  timestamp: Date;
  eventData: {
    address: string;
    productInfos: ProductInfo[];
  };
}

interface TrackingData {
  userId: {
    name: string;
    email: string;
  };
  events: EventType[];
}

interface EventDataProps {
  trackingData: TrackingData[];
}

const EventData: React.FC<EventDataProps> = ({ trackingData }) => {
  console.log('Tracking Data in EventData:', trackingData); // Debug log

  return (
    <div>
      {trackingData && trackingData.length > 0 ? (
        <ul>
          {trackingData.map((item, index) => (
            <li key={index}>
              <p>
                <strong>Name:</strong> {item.userId.name}
              </p>
              <p>
                <strong>Email:</strong> {item.userId.email}
              </p>
              <ul>
                {item.events.map((event, idx) => (
                  <li
                    key={idx}
                    style={{
                      marginBottom: "20px",
                      padding: "10px",
                      border: "1px solid #ddd",
                      borderRadius: "5px",
                    }}
                  >
                    <p>
                      <strong>Event Type:</strong> {event.eventType}
                    </p>
                    <p>
                      <strong>Timestamp:</strong>{" "}
                      {event.timestamp.toLocaleString()}
                    </p>

                    <h4>Event Data</h4>
                    <p>
                      <strong>Address:</strong> {event.eventData.address}
                    </p>

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
                  </li>
                ))}
              </ul>
              <hr />
            </li>
          ))}
        </ul>
      ) : (
        <p>No tracking data available.</p>
      )}
    </div>
  );
};

export default EventData;
