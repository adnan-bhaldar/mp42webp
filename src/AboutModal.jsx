import React from 'react';

// --- About Modal Component ---
// This component displays information about the application's client-side privacy model.
const AboutModal = ({ onClose }) => {
    // X icon for closing
    const CloseIcon = () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
    );

    return (
        // Modal overlay (covers the whole screen and handles outside clicks)
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm transition-opacity duration-300"
            onClick={onClose}
        >
            {/* Modal content box */}
            <div 
                className="w-full max-w-lg p-6 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 transition-transform duration-300 transform scale-100 opacity-100"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >
                {/* Header */}
                <div className="flex justify-between items-start mb-4 border-b border-gray-200 dark:border-gray-700 pb-3">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">About This App</h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors duration-200 focus:outline-none"
                        title="Close"
                    >
                        <CloseIcon />
                    </button>
                </div>
                
                {/* Content */}
                <div className="space-y-4 text-gray-700 dark:text-gray-300 text-sm md:text-base">
                    <p>
                        This is a **client-side converter** designed to change MP4 video files into animated WebP images right in your browser. The core motivation is **privacy and security**.
                    </p>
                    <p>
                        When you upload files to typical online converters, your data is sent to a remote server. Observing the growing concerns about **AI training data** and general data privacy, we believe it's safest not to send your media to the cloud at all.
                    </p>
                    <p>
                        This service uses **FFmpeg compiled to WebAssembly (WASM)**. This means the entire conversion process—from reading the video to generating the WebP file—happens directly on your device. Your files **never leave your browser**.
                    </p>
                    <p className="pt-2 text-xs italic text-indigo-600 dark:text-indigo-400">
                        This project is inspired by the movement toward secure, open-source, and local processing tools.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AboutModal;
