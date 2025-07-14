const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'src', 'locales');

// Get all .js files
const jsFiles = fs.readdirSync(localesDir).filter(f => f.endsWith('.js'));

jsFiles.forEach(file => {
  const filePath = path.join(localesDir, file);
  const cjsFileName = file.replace('.js', '.cjs');
  const cjsFilePath = path.join(localesDir, cjsFileName);
  
  // Read the JavaScript file
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Write the CJS file
  fs.writeFileSync(cjsFilePath, content);
  
  console.log(`Converted ${file} to ${cjsFileName}`);
});

console.log('All .js files converted to .cjs files!'); 