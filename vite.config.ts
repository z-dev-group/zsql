import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import electron from 'vite-plugin-electron/simple'

import vueJsx from '@vitejs/plugin-vue-jsx'; // Import the plugin



export default defineConfig({
  plugins: [vue(),vueJsx(), electron({
    main: {
      entry: './main.js',
    },
    preload: {
      input: './preload.js',
    },
    renderer: {},
  })],
});