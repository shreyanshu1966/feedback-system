import React from 'react';

const AppHeader = ({ title, subtitle }) => {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold mb-1">{title}</h2>
      {subtitle && <p className="text-white">{subtitle}</p>}
    </div>
  );
};

export default AppHeader;
