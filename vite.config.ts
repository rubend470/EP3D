import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  test: {
    include: ['tests/**/*.test.ts'],
    exclude: process.env.FIRESTORE_EMULATOR_HOST ? [] : ['tests/rules.test.ts'],
    fileParallelism: false,
  },
});
