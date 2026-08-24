import React from 'react';

const StatCard = ({ title, value, icon, trend, color }) => {
  const colorVariants = {
    amber: 'bg-amber-100 text-amber-500 shadow-amber-50',
    rose: 'bg-rose-100 text-rose-500 shadow-rose-50',
    green: 'bg-green-100 text-green-500 shadow-green-50',
    purple: 'bg-purple-100 text-purple-500 shadow-purple-50',
  };

  return (
    <div className="bg-amber-50/50 p-6 rounded-3xl border border-amber-50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div className={`p-4 rounded-2xl ${colorVariants[color]} transition-transform duration-300 group-hover:scale-110`}>
          {React.cloneElement(icon, { size: 24 })}
        </div>
        
      </div>
      <div className="mt-5">
        <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-extrabold text-slate-800 mt-1 tracking-tight">{value}</h3>
      </div>
    </div>
  );
};

export default StatCard;
