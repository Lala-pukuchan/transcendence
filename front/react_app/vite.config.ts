import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    envFilePath: '.env', // 環境変数を定義したファイルのパス
  },
})
