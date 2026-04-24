// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
// ✏️ Change 'site' to your domain. Set BASE_PATH in your deploy environment if hosting on a subpath.
export default defineConfig({
  site: 'https://jaswinder.cc/',
  base: process.env.BASE_PATH || '/',
  integrations: [],
});
