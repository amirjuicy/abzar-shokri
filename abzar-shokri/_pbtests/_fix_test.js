const fs = require('fs');
const p = 'C:/Users/INO/Desktop/project/abzar-shokri/abzar-shokri/_pbtests/pdp-buybar.mjs';
const raw = fs.readFileSync(p);
const hadBom = raw[0] === 0xEF && raw[1] === 0xBB && raw[2] === 0xBF;
let text = raw.toString('utf8');
const lines = text.split(/\r?\n/);
// 1-based lines 392..409: the stale duplicate "Wholesale line added from the bar" block
const start = 392, end = 409;
const seg = lines.slice(start - 1, end);
if (!/Wholesale line added from the bar/.test(seg.join('\n'))) {
  console.error('ABORT: segment does not match the expected block:\n' + seg.join('\n'));
  process.exit(1);
}
lines.splice(start - 1, end - start + 1);
text = lines.join('\n');
fs.writeFileSync(p, (hadBom ? '\uFEFF' : '') + text, 'utf8');
console.log('removed ' + (end - start + 1) + ' lines; new total ' + lines.length);
