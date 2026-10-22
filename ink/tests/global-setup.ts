import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const inkRoot = path.resolve(__dirname, '..');

export default function setup() {
  execSync('npm run build', { cwd: inkRoot, stdio: 'inherit' });
}
