// src/components/Layout/Footer.tsx
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer style={{ background: '#f5f5f5', padding: '1rem', textAlign: 'center' }}>
      <p>&copy; {new Date().getFullYear()} Track Mate</p>
    </footer>
  );
};

export default Footer;
