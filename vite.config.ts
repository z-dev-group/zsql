import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import electron from 'vite-plugin-electron/simple'


export default defineConfig({
  plugins: [vue(),electron({
    main: {
      entry: './main.js',
    },
    preload: {
      input: './preload.js',
    },
    renderer: {},
  })],
});