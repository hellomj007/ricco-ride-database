import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: '.',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        tripEntry: resolve(__dirname, 'trip-entry.html'),
        tripsList: resolve(__dirname, 'trips-list.html'),
        manageData: resolve(__dirname, 'manage-data.html'),
        reports: resolve(__dirname, 'reports.html')
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
})
