import fs from 'node:fs';
const p=JSON.parse(fs.readFileSync('package.json'));const v=JSON.parse(fs.readFileSync('vercel.json'));if(!p.scripts.build||v.outputDirectory!=='dist'||v.buildCommand!=='npm run build')throw Error('Build configuration is inconsistent');
for(const f of ['public/index.html','public/app.js','public/demo-core.js','api/vendor.js','api/health.js','deployment/fuji.json'])if(!fs.existsSync(f))throw Error('Missing '+f);
console.log('Deployment configuration is ready. Node 22, npm ci, npm run build, dist output.');console.log('No AI runtime, server private keys, database, or mandatory environment variables.');
