// frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa' // 引入插件

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: '我的云相册',
        short_name: '云相册',
        description: '基于 AI 的智能图片管理系统',
        theme_color: '#ffffff',
        display: 'standalone', // 关键：开启无地址栏模式
        icons: [
          {
            src: '/pwa-192x192.png', // 注意：你需要找一个png图放在 public 目录下改名为这个
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png', // 同上
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})