// ------------------------------------------------------------
// 🧠 Auto-detect and build frontend if missing before starting backend

import fs from 'fs';
import { execSync } from 'child_process';

const distPath = './client/dist';

if (!fs.existsSync(distPath) || !fs.existsSync(`${distPath}/index.html`)) {
  console.log('⚙️  Frontend build not found. Building client...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅  Frontend build completed.');
} else {
  console.log('✅  Frontend build already exists.');
}

console.log('🚀  Starting backend server...');
execSync('npm run dev', { stdio: 'inherit' });
