import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist');
const buildDir = path.resolve('build');

if (fs.existsSync(distDir)) {
  fs.cpSync(distDir, buildDir, { recursive: true });
  console.log('[PostBuild] Successfully synced dist/ to build/');
}
