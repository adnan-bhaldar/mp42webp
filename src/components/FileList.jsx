import React from "react";

const FileList = ({ files, viewMode, thumbnails, outputFiles, onIndividualDownload }) => {
  return (
    <div className="space-y-2">
      {files.map((file, idx) => (
        <div key={idx} className="flex items-center justify-between border p-2 rounded-md dark:border-gray-700">
          <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
          <button
            onClick={() => onIndividualDownload(outputFiles[idx])}
            className="px-2 py-1 bg-indigo-500 text-white rounded-md text-xs"
          >
            Download
          </button>
        </div>
      ))}
    </div>
  );
};

export default FileList;
