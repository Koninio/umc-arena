import {createHash} from 'node:crypto';
import {readFileSync, writeFileSync, unlinkSync, existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root = path.dirname(fileURLToPath(import.meta.url));
process.chdir(root);
const manifest = JSON.parse(readFileSync('source-manifest.json', 'utf8'));
const parts = manifest.parts.map(part => {
  if (!/^source\.part\d{2}$/.test(part.file)) throw Error('Invalid part filename');
  const data = readFileSync(part.file);
  if (data.length !== part.bytes || createHash('sha256').update(data).digest('hex') !== part.sha256) {
    throw Error(`Source integrity check failed: ${part.file}`);
  }
  return data;
});
const archive = Buffer.concat(parts);
if (createHash('sha256').update(archive).digest('hex') !== manifest.sha256) throw Error('Archive checksum mismatch');
const temp = '.umc-source-restore.tar.gz';
if (existsSync(temp)) throw Error('Previous restore archive exists; inspect it before retrying');
writeFileSync(temp, archive, {flag:'wx'});
try {
  execFileSync('tar', ['-xzf', temp], {stdio:'inherit'});
} finally {
  unlinkSync(temp);
}
console.log(`Restored UMC source and art from ${manifest.parts.length} verified parts.`);
if (existsSync('update-manifest.json')) {
  const update = JSON.parse(readFileSync('update-manifest.json', 'utf8'));
  if (update.file !== 'update.tar.gz') throw Error('Invalid update filename');
  const data = readFileSync(update.file);
  if (data.length !== update.bytes || createHash('sha256').update(data).digest('hex') !== update.sha256) {
    throw Error('Update integrity check failed');
  }
  execFileSync('tar', ['-xzf', update.file], {stdio:'inherit'});
  console.log('Applied verified cloud audio and gameplay update.');
}
