import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Using '.' instead of process.cwd() to avoid TS type issues with 'Process'
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    server: {
      open: true, // This will automatically open the website in your browser
    },
    define: {
      // This enables `process.env.API_KEY` to work in the browser code
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY || env.API_KEY)
    }
  }
})