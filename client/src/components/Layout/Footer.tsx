// src/components/Layout/Footer.tsx
import React from "react";
const date = new Date().getFullYear();
const Footer: React.FC = () => {
  return (
    <footer className="sticky-footer bg-white">
      <div className="container my-auto">
        <div className="copyright text-center my-auto">
          	<span>Copyright &copy; {date} Track Mate</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
