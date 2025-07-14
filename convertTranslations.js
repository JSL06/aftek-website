const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'src', 'locales');

// Get all .ts files
const tsFiles = fs.readdirSync(localesDir).filter(f => f.endsWith('.ts'));

tsFiles.forEach(file => {
  const filePath = path.join(localesDir, file);
  const jsFileName = file.replace('.ts', '.js');
  const jsFilePath = path.join(localesDir, jsFileName);
  
  // Read the TypeScript file
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace export default with module.exports
  content = content.replace(/export default (\w+);/, 'module.exports = $1;');
  
  // Write the JavaScript file
  fs.writeFileSync(jsFilePath, content);
  
  console.log(`Converted ${file} to ${jsFileName}`);
});

console.log('All TypeScript files converted to JavaScript!'); 