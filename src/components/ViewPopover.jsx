import React from "react";

const ViewBox = ({ value, label, icon, currentView, setViewMode, closePopover }) => {
  return (
    <button
      onClick={() => { setViewMode(value); closePopover(false); }}
      className={`flex flex-col items-center px-3 py-2 rounded-md border dark:border-gray-600 
        ${currentView === value ? "bg-indigo-500 text-white" : "bg-gray-100 dark:bg-gray-700"}`}
    >
      <span>{icon}</span>
      <span className="text-xs">{label}</span>
    </button>
  );
};

export default ViewBox;
