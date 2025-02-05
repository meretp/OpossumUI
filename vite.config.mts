// SPDX-FileCopyrightText: Meta Platforms, Inc. and its affiliates
// SPDX-FileCopyrightText: TNG Technology Consulting GmbH <https://www.tngtech.com>
//
// SPDX-License-Identifier: Apache-2.0
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import electron from 'vite-plugin-electron';
import svgrPlugin from 'vite-plugin-svgr';
import viteTsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    viteTsconfigPaths(),
    svgrPlugin(),
    ...(mode === 'e2e'
      ? []
      : electron({
          entry: 'src/ElectronBackend/main/main.ts',
        })),
  ],
  build: {
    outDir: 'build',
  },
  optimizeDeps: {
    include: ['@mui/material/Tooltip'], // https://github.com/mui/material-ui/issues/32727
  },
}));
