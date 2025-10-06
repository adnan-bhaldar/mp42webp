import React from "react";
import ThemeBox from "./ThemeBox";

export default function ThemePopover({ themePopoverRef }) {
  return (
    <div
      ref={themePopoverRef}
      className="absolute top-12 right-0 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 transition-all duration-200 origin-top-right transform scale-100"
    >
      <div className="flex space-x-2">
        <ThemeBox value="light" label="Light" icon="☀️" />
        <ThemeBox value="dark" label="Dark" icon="🌙" />
        <ThemeBox value="system" label="System" icon="🖥️" />
      </div>
    </div>
  );
}
