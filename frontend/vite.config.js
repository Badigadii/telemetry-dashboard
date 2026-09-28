import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,                    // слушать на всех интерфейсах — иначе порт 5173 наружу не пробросится
    watch: { usePolling: true },   // Windows+Docker: иначе правки кода не видны без перезапуска
    proxy: {
      '/api': 'http://backend:3001',  // «backend» — имя сервиса из compose, как и с clickhouse
    },
  },
});