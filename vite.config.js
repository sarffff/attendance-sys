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

    build: {
      minify: 'terser',
      sourcemap: false,
      chunkSizeWarningLimit: 1500,
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.error'],
        },
      },
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
                return 'react-vendor';
              }
              if (id.includes('antd') || id.includes('@ant-design')) {
                return 'antd-vendor';
              }
              if (id.includes('axios') || id.includes('@reduxjs') || id.includes('react-redux') || id.includes('dayjs')) {
                return 'vendor';
              }
            }
          },
        },
      },
    }
  }
})
