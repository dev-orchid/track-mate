// src/components/Dashboard/EventData.tsx
import React from 'react';



interface profileData {
  userId: {
    name: string;
    phone:number;
    email: string;
  };
}

interface profileDataProps {
  profileData: profileData[];
}

const EventData: React.FC<profileDataProps> = ({ profileData }) => {
  console.log('Tracking Data in EventData:', profileData); // Debug log

  return (
    <div>
      {profileData && profileData.length > 0 ? (
        <ul>
          {profileData.map((item, index) => (
            <li key={index}>
              <p>
                <strong>Name:</strong> {item.name}
              </p>
              <p>
                <strong>Email:</strong> {item.email}
              </p>
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
