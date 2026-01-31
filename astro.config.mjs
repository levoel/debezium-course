// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';

import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  site: 'https://yourusername.github.io', // Will update with actual repo
  base: '/debezium-course', // GitHub Pages base path
  integrations: [react(), mdx()],

  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      langs: ['python', 'yaml', 'sql', 'json', 'javascript', 'typescript', 'java', 'bash', 'dockerfile'],
      wrap: true, // Prevent horizontal scroll on mobile
    },
  },

  vite: {
    plugins: [tailwindcss()]
  }
});