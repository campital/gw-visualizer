import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vite.dev/config/
export default defineConfig({
  server: {
    allowedHosts: [
      'a2048429c75d.ngrok-free.app'
    ]
  },
  plugins: [svelte()],
})
