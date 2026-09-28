'use strict';
const {readdirSync}=require('node:fs');
const {spawnSync}=require('node:child_process');
const files=['server.js','playwright.config.js',...['lib','public','scripts'].flatMap(dir=>readdirSync(dir).filter(name=>name.endsWith('.js')).map(name=>`${dir}/${name}`))];
for(const file of files){const result=spawnSync(process.execPath,['--check',file],{stdio:'inherit'});if(result.status!==0)process.exit(result.status || 1);}
console.log(`Syntax checked: ${files.length} JavaScript files.`);
