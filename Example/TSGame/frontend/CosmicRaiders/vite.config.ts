import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // module: {
  //   exports: {
  //     devServer: {
  //       proxy: 'http://127.0.0.1:5173',
  //     }
  //   }
  // },
  // headers: {
  //   "Access-Control-Allow-Origin": "*",
  // }
})
