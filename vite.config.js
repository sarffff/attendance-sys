import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const apiBaseUrl = env.VITE_API_BASE_URL

  return {
    plugins: [react()],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },

    server: {
      host: 'localhost',
      port: 5173,
      open: true,

      proxy: apiBaseUrl
        ? {
          '/files': {
            target: apiBaseUrl,
            changeOrigin: true,
            secure: false,
          },
        }
        : undefined,
    },

    // build: {
    //   minify: 'terser',
    //   sourcemap: false,
    //   chunkSizeWarningLimit: 1500,
    //   terserOptions: {
    //     compress: {
    //       drop_console: true,
    //       drop_debugger: true,
    //     },
    //   },
    //   rollupOptions: {
    //     output: {
    //       manualChunks: {
    //         react: ['react', 'react-dom', 'react-router-dom'],
    //         vendor: ['axios'],
    //       },
    //     },
    //   },
    // }
  }
})
