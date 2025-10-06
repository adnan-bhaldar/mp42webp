import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // 🚨 CRITICAL FIX: Exclude FFmpeg from optimization
  optimizeDeps: {
    // Tell Vite to skip pre-bundling the FFmpeg packages
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
  },
})