import React from "react";
import ThemePopover from "./ThemePopover";

export default function Header({
  themeButtonRef,
  themePopoverRef,
  currentTheme,
  currentThemeClasses,
  showThemePopover,
  setShowThemePopover,
  setShowViewPopover,
}) {
  return (
    <header className="flex justify-between items-center mb-4">
      <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 transition-colors duration-300">
        Batch WebP Converter
      </h1>

      <div className="flex space-x-2">
        <div className="relative">
          <button
            ref={themeButtonRef}
            onClick={() => {
              setShowThemePopover(!showThemePopover);
              setShowViewPopover(false);
            }}
            className={`flex flex-col items-center justify-center p-1 text-xs font-medium rounded-md cursor-pointer transition-all duration-300 w-16 border border-gray-300 dark:border-gray-600 hover:ring-2 hover:ring-indigo-500 hover:z-20 hover:bg-gray-200 dark:hover:bg-gray-600 ${currentThemeClasses}`}
            title="Change Theme"
          >
            <span className="text-base leading-none">
              {currentTheme.icon}
            </span>
            <span className="flex items-center">
              {currentTheme.label}
            </span>
          </button>

          {showThemePopover && (
            <ThemePopover themePopoverRef={themePopoverRef} />
          )}
        </div>
      </div>
    </header>
  );
}
