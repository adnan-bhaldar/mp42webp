import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const CORE_FILES = {
    baseURL: '/ffmpeg-core',
};

const THEMES = ['light', 'dark', 'system'];
const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && THEMES.includes(savedTheme)) {
        return savedTheme;
    }
    return 'system';
};
const applyTheme = (theme) => {
    const root = document.documentElement;
    let effectiveTheme = theme;
    if (theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        effectiveTheme = prefersDark ? 'dark' : 'light';
    }
    if (effectiveTheme === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
};

// --- File View Modes Configuration ---
const FILE_VIEWS = [
    { value: 'details', label: 'List', icon: '≡' },
    { value: 'content', label: 'Content', icon: '📝' },
];

// --- File View Component (Handles displaying input files or converted output files) ---
const FileList = ({ files, viewMode, thumbnails, outputFiles, onIndividualDownload }) => {
    const VideoIcon = (props) => (
        <svg className={`text-indigo-500 flex-shrink-0 ${props.className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.55 2.275a.5.5 0 010 .89L15 15l-4.55-2.275a.5.5 0 010-.89L15 10zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
    );
    const DownloadIcon = () => (
        <svg className='w-6 h-6' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="Interface / Download"><path id="Vector" d="M6 21H18M12 3V17M12 17L17 12M12 17L7 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></g></svg>
    );
    // REMOVED 'p-2' from baseClass to allow control of padding in specific views
    const baseClass = "rounded-md bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 truncate text-gray-700 dark:text-gray-200 transition-colors duration-300";

    const listToDisplay = outputFiles && outputFiles.length > 0 ? outputFiles : files;

    const renderFile = (file, index) => {
        const isConverted = file.blob instanceof Blob;
        const name = file.name;
        // NEW CORRECTED LINE:
        const size = file.size
            ? (file.size / 1024 / 1024).toFixed(2) + ' MB'
            : (file.blob ? (file.blob.size / 1024 / 1024).toFixed(2) + ' MB' : '');
        const thumbnailSrc = thumbnails[isConverted ? file.name.replace(/\.webp$/, '.mp4') : name];
        const FileImage = ({ className }) => {
            if (thumbnailSrc) {
                return <img src={thumbnailSrc} alt="Thumbnail" className={`object-contain ${className} rounded-sm`} />;
            }
            return <VideoIcon className={className} />;
        };

        const NameDisplay = ({ className }) => (
            <span title={name} className={`text-xs font-medium truncate w-full ${className} flex items-center justify-between mt-auto`}>
                <span className="truncate">{name}</span>
                {isConverted && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onIndividualDownload(file.name, file.blob);
                        }}
                        className="ml-1 text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors flex-shrink-0"
                        title={`Download ${file.name}`}
                    >
                        <DownloadIcon />
                    </button>
                )}
            </span>
        );

        switch (viewMode) {
            case 'details':
                // Adjusted width and minimal padding for flush left look
                return (
                    <div key={index} className={`${baseClass} py-1 px-1 flex items-center justify-between col-span-full`}>
                        <div className="flex items-center w-4/6 truncate">
                            <FileImage className="w-6 h-4 flex-shrink-0" />
                            <span title={name} className="text-sm truncate font-medium ml-1">{name}</span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 w-1/6 text-right transition-colors duration-300">
                            {size}
                        </span>
                        <div className="w-1/6 text-right flex justify-end">
                            {isConverted && (
                                <button onClick={(e) => { e.stopPropagation(); onIndividualDownload(file.name, file.blob); }} className="text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors flex-shrink-0 p-1" title={`Download ${file.name}`}><DownloadIcon /></button>
                            )}
                            {!isConverted && <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline transition-colors duration-300">{file.type.split('/')[1]}</span>}
                        </div>
                    </div>
                );
            case 'content':
                // Minimal padding for flush left look & fixed download button visibility
                return (
                    <div key={index} className={`${baseClass} p-1 flex items-start col-span-full`}>
                        <FileImage className="w-12 h-8 flex-shrink-0 mt-1" />

                        <div className="flex flex-col flex-grow truncate ml-2">
                            <div className="flex items-center justify-between">
                                {/* File Name: Takes up most of the space and truncates if needed */}
                                <span title={name} className="text-sm font-medium truncate flex-grow">
                                    {name}
                                </span>

                                {/* Download Button: Fixed width, visible even if name truncates */}
                                {isConverted && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onIndividualDownload(file.name, file.blob); }}
                                        className="ml-2 mr-1 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors flex-shrink-0 p-1"
                                        title={`Download ${file.name}`}
                                    >
                                        <DownloadIcon />
                                    </button>
                                )}
                            </div>

                            <span className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">Size: {size}</span>
                        </div>
                    </div>
                );
            default:
                // Defaulting to icons
                return (
                    <div key={index} className={`${baseClass} p-2 flex flex-col h-24`}>
                        <div className="flex-grow flex items-center justify-center p-1 bg-white dark:bg-gray-800 rounded-sm mb-1 border border-gray-200 dark:border-gray-600">
                            <FileImage className="w-full h-full max-h-10 object-contain" />
                        </div>
                        <NameDisplay className="text-center" />
                    </div>
                );
        }
    };

    const getGridClass = () => {
        switch (viewMode) {
            case 'icons': return "grid-cols-3 gap-3"; // UPDATED VIEW MODE NAME
            case 'details': case 'content': return "grid-cols-1 gap-1";
            default: return "grid-cols-3 gap-3";
        }
    };

    return (
        <div className={`grid ${getGridClass()} max-h-48 overflow-y-auto pr-1 no-scrollbar`}>
            {listToDisplay.map(renderFile)}
        </div>
    );
};

// --- View Selection Popover Component ---
const ViewBox = ({ value, label, icon, currentView, setViewMode, closePopover }) => {
    const isSelected = currentView === value;
    const baseClasses = "flex flex-col items-center justify-center p-1 text-xs font-medium rounded-md cursor-pointer transition-all duration-300 w-16";

    return (
        <div
            onClick={() => { setViewMode(value); closePopover(false); }}
            className={`${baseClasses} 
            ${isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-300/50 dark:shadow-indigo-900/50'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`
            }
        >
            <span className="text-base">{icon}</span>
            <span>{label}</span>
        </div>
    );
};


function App() {
    const [theme, setTheme] = useState(getInitialTheme);
    const [fileViewMode, setFileViewMode] = useState('content');
    const [loaded, setLoaded] = useState(false);
    const [videoFiles, setVideoFiles] = useState([]); // Original files
    const [convertedFiles, setConvertedFiles] = useState([]); // Converted output files (Blobs)
    const [fileThumbnails, setFileThumbnails] = useState({});

    // PROGRESS/BATCH STATES
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState('');
    const [isConverting, setIsConverting] = useState(false);
    const [totalFilesToConvert, setTotalFilesToConvert] = useState(0);
    const [filesConvertedCount, setFilesConvertedCount] = useState(0);

    const [downloadUrl, setDownloadUrl] = useState(null);

    const ffmpegRef = useRef(new FFmpeg());
    const fileInputRef = useRef(null);

    // POPUP STATES
    const [showThemePopover, setShowThemePopover] = useState(false);
    const [showViewPopover, setShowViewPopover] = useState(false);

    const [isDragOver, setIsDragOver] = useState(false);

    // POPUP REFS
    const themePopoverRef = useRef(null);
    const themeButtonRef = useRef(null);
    const viewPopoverRef = useRef(null);
    const viewButtonRef = useRef(null);


    // --- Theme Management Hook ---
    useEffect(() => {
        applyTheme(theme);
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleSystemChange = () => {
            if (theme === 'system') {
                applyTheme(theme);
            }
        };
        mediaQuery.addEventListener('change', handleSystemChange);
        return () => {
            mediaQuery.removeEventListener('change', handleSystemChange);
        };
    }, [theme]);


    // --- Click outside handler for Popovers ---
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check Theme Popover
            if (showThemePopover && themePopoverRef.current && !themePopoverRef.current.contains(event.target) && !themeButtonRef.current.contains(event.target)) {
                setShowThemePopover(false);
            }
            // Check View Popover 
            if (showViewPopover && viewPopoverRef.current && !viewPopoverRef.current.contains(event.target) && !viewButtonRef.current.contains(event.target)) {
                setShowViewPopover(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showThemePopover, showViewPopover]);


    // --- Thumbnail Generation Function ---
    const generateThumbnail = useCallback(async (file) => {
        const ffmpeg = ffmpegRef.current;
        const inputName = 'thumb_input_' + file.name;
        const outputName = 'thumb_output_' + file.name + '.png';

        try {
            await ffmpeg.writeFile(inputName, await fetchFile(file));

            await ffmpeg.exec([
                '-i', inputName,
                '-ss', '00:00:01',
                '-vframes', '1',
                '-f', 'image2',
                '-vf', 'scale=100:-1',
                outputName,
            ]);

            const data = await ffmpeg.readFile(outputName);
            const blob = new Blob([data.buffer], { type: 'image/png' });
            const url = URL.createObjectURL(blob);

            await ffmpeg.deleteFile(inputName);
            await ffmpeg.deleteFile(outputName);

            return url;
        } catch (e) {
            console.error(`Failed to generate thumbnail for ${file.name}:`, e);
            return null;
        }
    }, []);


    // --- FFmpeg Load Logic ---
    const loadFFmpeg = async () => {
        setMessage('🚀 Initializing FFmpeg...');
        const ffmpeg = ffmpegRef.current;

        // This handler is now ONLY for loading FFmpeg
        ffmpeg.on('progress', ({ progress }) => {
            const percent = Math.floor(progress * 100);
            // Set a low initial progress for the loading bar
            if (!loaded) {
                setProgress(Math.max(1, Math.min(99, percent)));
            }
        });
        ffmpeg.on('log', ({ message }) => {
            if (message.startsWith('frame=')) {
                console.log(`FFmpeg Frame Progress: ${message}`);
            }
        });

        try {
            await ffmpeg.load(CORE_FILES);
            setLoaded(true);
            setMessage('✅ FFmpeg ready! Select MP4 file(s).');
            setProgress(0); // Clear loading progress
        } catch (e) {
            setMessage(`❌ Failed to load FFmpeg. Please check console for errors.`);
            console.error('FFmpeg Load Error:', e);
        }
    };

    useEffect(() => {
        loadFFmpeg();
    }, []);

    // --- Individual Download Handler (using file-saver) ---
    const handleIndividualDownload = (fileName, fileBlob) => {
        saveAs(fileBlob, fileName);
    };

    // --- Batch Download Handler (using jszip and file-saver) ---
    const handleBatchDownload = async () => {
        if (convertedFiles.length === 0) return;

        setMessage('Creating ZIP file...');

        const zip = new JSZip();

        // Add each converted file (Blob) to the ZIP
        convertedFiles.forEach(file => {
            zip.file(file.name, file.blob);
        });

        try {
            // Generate the ZIP file as a Blob with compression
            const content = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });

            // Trigger the download
            saveAs(content, "webp_batch_download.zip");
            setMessage(`📥 Batch download started for ${convertedFiles.length} files. Check your downloads folder.`);
            setTimeout(() => {
                setMessage('');
            }, 3000);
        } catch (error) {
            setMessage('❌ Error creating batch download.');
            console.error('ZIP generation failed:', error);
        }
    };

    // --- Clear Logic ---
    const handleClear = () => {
        const fileInput = document.getElementById('file-upload');
        if (fileInput) {
            fileInput.value = '';
        }

        // Revoke object URLs created for thumbnails
        Object.values(fileThumbnails).forEach(url => URL.revokeObjectURL(url));

        setVideoFiles([]);
        setConvertedFiles([]); // Clear converted files
        setFileThumbnails({});
        setProgress(0);
        setMessage('Ready to go!');
        setTotalFilesToConvert(0);
        setFilesConvertedCount(0);

        if (downloadUrl) {
            URL.revokeObjectURL(downloadUrl.url);
            setDownloadUrl(null);
        }
    };

    // --- File Selection Logic ---
    const handleFileSelection = async (files) => {

        // Clean up previous state
        Object.values(fileThumbnails).forEach(url => URL.revokeObjectURL(url));
        setFileThumbnails({});
        setVideoFiles([]);
        setConvertedFiles([]);

        if (!loaded) {
            setMessage('⚠️ FFmpeg is not yet loaded. Please wait.');
            return;
        }

        const filesArray = Array.from(files).filter(file => file.type.startsWith('video/mp4'));

        if (filesArray.length > 0) {
            setVideoFiles(filesArray);
            setMessage(`📄 Selected ${filesArray.length} MP4 file(s). Generating thumbnails...`);
            setProgress(0);
            setTotalFilesToConvert(0);
            setFilesConvertedCount(0);

            // Generate thumbnails sequentially
            for (const file of filesArray) {
                const url = await generateThumbnail(file);
                if (url) {
                    setFileThumbnails(prev => ({ ...prev, [file.name]: url }));
                }
            }

            setMessage(``);
        } else {
            setMessage('⚠️ Please select one or more valid MP4 files.');
        }
    };


    // --- Drag & Drop Handlers ---
    const handleDragOver = (e) => {
        e.preventDefault();
        if (!isDisabled) {
            setIsDragOver(true);
        }
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        setIsDragOver(false);
        if (!loaded || isConverting) return;

        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles.length > 0) {
            handleFileSelection(droppedFiles);
        }
    };


    // --- Convert Logic (Sequential Execution with Combined Progress) ---
    const convertToWebP = async () => {
        if (videoFiles.length === 0 || !loaded || isConverting) return;

        setIsConverting(true);
        setDownloadUrl(null);
        setConvertedFiles([]);

        const totalFiles = videoFiles.length;
        setTotalFilesToConvert(totalFiles);
        setFilesConvertedCount(0);

        const ffmpeg = ffmpegRef.current;

        setMessage(`🔄 Converting ${totalFiles} file(s) `);
        setProgress(1);

        const successfulConversions = [];

        // RE-REGISTER FFmpeg progress listener to calculate combined progress.
        ffmpeg.on('progress', ({ progress: fileProgress }) => {
            // fileProgress is 0-1 (0% to 100%) for the current file.
            // filesConvertedCount is 0-indexed count of completed files.
            if (totalFiles > 0) {
                // Calculate actual progress based on sequential file completion
                const overallProgress = (filesConvertedCount + fileProgress) / totalFiles;
                setProgress(Math.floor(overallProgress * 100));
            }
        });


        // 2. Process files SEQUENTIALLY using a loop
        for (let i = 0; i < totalFiles; i++) {
            const videoFile = videoFiles[i];
            const inputFileName = `input_${i}_${videoFile.name}`;
            const outputFileName = videoFile.name.replace(/\.[^/.]+$/, "") + '.webp';

            try {
                // Write the file
                await ffmpeg.writeFile(inputFileName, await fetchFile(videoFile));

                // Execute the conversion command 
                await ffmpeg.exec([
                    '-i', inputFileName,
                    '-vcodec', 'libwebp',
                    '-filter:v', 'fps=fps=15',
                    '-lossless', '0',
                    '-q:v', '70',
                    '-loop', '0',
                    outputFileName,
                ]);

                // Read the output file
                const data = await ffmpeg.readFile(outputFileName);
                const webpBlob = new Blob([data.buffer], { type: 'image/webp' });

                // Store success
                successfulConversions.push({
                    success: true,
                    name: outputFileName,
                    blob: webpBlob
                });

            } catch (error) {
                console.error(`Conversion failed for ${videoFile.name}:`, error);

            } finally {
                // Cleanup virtual files regardless of success/fail
                try { await ffmpeg.deleteFile(inputFileName); } catch { }
                try { await ffmpeg.deleteFile(outputFileName); } catch { }

                // 3. Increment file count *after* the file has finished processing.
                setFilesConvertedCount(i + 1);
            }
        } // End of file loop

        // Conversion finished
        setConvertedFiles(successfulConversions);
        setVideoFiles([]);

        setMessage(`🎉 Conversion complete! ${successfulConversions.length} file(s) ready for download.`);
        setIsConverting(false);
        setProgress(100);

        // Remove the progress handler after conversion
        ffmpeg.off('progress', () => { });
    };

    const isDisabled = !loaded || videoFiles.length === 0 || isConverting;

    // --- Theme UI Components (Unchanged) ---
    const ThemeBox = ({ value, label, icon }) => {
        const isSelected = theme === value;
        const baseClasses = "flex flex-col items-center justify-center p-1 text-xs font-medium rounded-md cursor-pointer transition-all duration-300 w-16";

        return (
            <div
                onClick={() => { setTheme(value); setShowThemePopover(false); }}
                className={`${baseClasses} 
                ${isSelected
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-300/50 dark:shadow-indigo-900/50'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`
                }
            >
                <span className="text-base leading-none">{icon}</span>
                <span>{label}</span>
            </div>
        );
    };

    const getCurrentThemeDetails = () => {
        switch (theme) {
            case 'light': return { icon: '☀️', label: 'Light' };
            case 'dark': return { icon: '🌙', label: 'Dark' };
            case 'system': return { icon: '🖥️', label: 'System' };
            default: return { icon: '🎨', label: 'Theme' };
        }
    };

    const getCurrentViewDetails = () => {
        const view = FILE_VIEWS.find(v => v.value === fileViewMode);
        return view || { icon: '▦', label: 'View' };
    }

    const currentTheme = getCurrentThemeDetails();
    const currentView = getCurrentViewDetails();
    const currentThemeClasses = 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';


    return (
        <div className="h-screen w-screen bg-gray-50 dark:bg-gray-900 flex pt-10 justify-center transition-colors duration-300">
            <div className="relative z-10 w-full px-4 flex flex-col h-full">

                {/* --- HEADER AND UTILITY POP-UPS --- */}
                <header className="flex justify-between items-center mb-4">
                    <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 transition-colors duration-300">
                        Batch WebP Converter
                    </h1>

                    {/* UTILITY BUTTONS (Theme & View) */}
                    <div className="flex space-x-2">

                        {/* THEME BUTTON */}
                        <div className="relative">
                            <button
                                ref={themeButtonRef}
                                onClick={() => { setShowThemePopover(!showThemePopover); setShowViewPopover(false); }}
                                className={`flex flex-col items-center justify-center p-1 text-xs font-medium rounded-md cursor-pointer transition-all duration-300 w-16 border border-gray-300 dark:border-gray-600 hover:ring-2 hover:ring-indigo-500 hover:z-20 hover:bg-gray-200 dark:hover:bg-gray-600 ${currentThemeClasses}`}
                                title="Change Theme"
                            >
                                <span className="text-base leading-none">{currentTheme.icon}</span>
                                <span className="flex items-center">
                                    {currentTheme.label}
                                </span>
                            </button>

                            {showThemePopover && (
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
                            )}
                        </div>
                    </div>
                </header>

                <p className="text-center text-gray-500 dark:text-gray-400 mb-8 text-sm transition-colors duration-300">
                    Select MP4 files to convert them all to WebP using FFmpeg.WASM.
                </p>

                {/* Status Message transition */}
                {message && (
                    <div className="mb-8 p-3 max-w-lg mx-auto bg-indigo-50 dark:bg-indigo-900/50 rounded text-center text-sm font-medium text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-colors duration-300">
                        {message}
                    </div>
                )}

                {/* File Input & Buttons Container */}
                <div className="flex flex-col items-center space-y-4">

                    {/* File Selection Area - Only visible if no files are selected AND no converted files exist */}
                    {videoFiles.length === 0 && convertedFiles.length === 0 && (
                        <label
                            htmlFor="file-upload"
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}

                            className={`w-full max-w-lg mx-auto cursor-pointer flex flex-col items-center px-4 py-8 rounded-md border-2 border-dashed transition duration-300 
                            ${!loaded || isConverting
                                    ? 'opacity-70 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                    : isDragOver
                                        ? 'bg-indigo-100 dark:bg-indigo-900/40 border-indigo-400 dark:border-indigo-500 ring-4 ring-indigo-200 dark:ring-indigo-800 text-indigo-700 dark:text-indigo-300'
                                        : 'bg-gray-100 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-indigo-400 dark:hover:border-indigo-500'}`}
                        >
                            <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.888 7.64M15 12V6a4 4 0 00-4-4H5a4 4 0 00-4 4v16a4 4 0 004 4h4m14-4a4 4 0 01-4-4V6a4 4 0 00-4-4h-4"></path></svg>

                            <span className="text-base leading-normal font-semibold">
                                {'Drag & Drop or Click to Select MP4s'}
                            </span>
                            <input
                                id="file-upload"
                                type="file"
                                className="hidden"
                                accept="video/mp4"
                                onChange={(e) => handleFileSelection(e.target.files)}
                                disabled={!loaded || isConverting}
                                multiple
                                ref={fileInputRef}
                            />
                        </label>
                    )}

                    {/* FILE VIEW MODE SWITCHER & FILE LIST */}
                    {(videoFiles.length > 0 || convertedFiles.length > 0) && (
                        <div className="w-full  p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900/40 transition-colors duration-300 flex-grow">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors duration-300">
                                    {convertedFiles.length > 0 ? `Converted Files (${convertedFiles.length}):` : `Files to Convert (${videoFiles.length}):`}
                                </h3>

                                {/* VIEW MODE BUTTON AND POPOVER */}
                                <div className="relative">
                                    <button
                                        ref={viewButtonRef}
                                        onClick={() => { setShowViewPopover(!showViewPopover); setShowThemePopover(false); }}
                                        className={`flex flex-col items-center justify-center p-1 text-xs font-medium rounded-md cursor-pointer transition-all duration-300 w-16 border border-gray-300 dark:border-gray-600 hover:ring-2 hover:ring-indigo-500 hover:z-20 hover:bg-gray-200 dark:hover:bg-gray-600 ${currentThemeClasses}`}
                                        title="Change View"
                                    >
                                        <span className="text-base leading-none">{currentView.icon}</span>
                                        <span className="flex items-center">
                                            {currentView.label}
                                        </span>
                                    </button>

                                    {showViewPopover && (
                                        <div
                                            ref={viewPopoverRef}
                                            className="absolute top-8 right-0 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 transition-all duration-200 origin-top-right transform scale-100"
                                        >
                                            <div className="flex space-x-2">
                                                {FILE_VIEWS.map((view) => (
                                                    <ViewBox
                                                        key={view.value}
                                                        value={view.value}
                                                        label={view.label}
                                                        icon={view.icon}
                                                        currentView={fileViewMode}
                                                        setViewMode={setFileViewMode}
                                                        closePopover={setShowViewPopover}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <FileList
                                files={videoFiles}
                                viewMode={fileViewMode}
                                thumbnails={fileThumbnails}
                                outputFiles={convertedFiles}
                                onIndividualDownload={handleIndividualDownload}
                            />
                        </div>
                    )}

                    {/* Convert Button OR Batch Download Button (The dynamic feature) */}
                    <div className="w-full max-w-lg mx-auto">
                        {convertedFiles.length === 0 ? (
                            <button
                                onClick={convertToWebP}
                                disabled={isDisabled}
                                className={`w-full py-3 rounded-md text-white font-semibold transition duration-200 
                                ${!isDisabled
                                        ? 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50'
                                        : 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'}`}
                            >
                                {isConverting ? `Converting... [${Math.min(100, progress)}%]` : 'Start Conversion'}
                            </button>
                        ) : (
                            <button
                                onClick={handleBatchDownload}
                                className="w-full py-3 rounded-md text-white font-semibold transition duration-200 bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200 dark:shadow-green-900/50"
                            >
                                📥 Batch Download ({convertedFiles.length} Files)
                            </button>
                        )}

                        {/* Clear Button */}
                        {(videoFiles.length > 0 || convertedFiles.length > 0 || message.includes('complete')) ? (
                            <button
                                onClick={handleClear}
                                disabled={isConverting}
                                className={`w-full py-2 rounded-md font-semibold transition duration-200 border-2 mt-2
                                ${isConverting
                                        ? 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed transition-colors duration-300'
                                        : 'border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-300'}`}
                            >
                                Clear All
                            </button>
                        ) : null}
                    </div>

                </div>

                {/* Progress Bar */}
                {isConverting && (
                    <div className="mt-6 max-w-lg mx-auto">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 transition-colors duration-300">
                            <div
                                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                {/* --- FOOTER --- */}
        <footer className="mt-auto py-4 text-gray-500 dark:text-gray-400 text-sm border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div className="flex justify-center space-x-4">
                <a href="https://github.com/adnan-bhaldar/mp42webp" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                    About
                </a>
                <a href="https://github.com/adnan-bhaldar/mp42webp" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                    Source code
                </a>
            </div>
        </footer>
            </div>

        </div>
    );
}

export default App;