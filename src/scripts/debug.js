// Debug script to check file paths and access
// Run with: node src/scripts/debug.js

const fs = require('fs');
const path = require('path');

// Get the project root directory
const projectRoot = path.resolve(process.cwd());
console.log('Project root:', projectRoot);

// Check if backend directory exists
const backendDir = path.join(projectRoot, 'src', 'backend');
console.log('Backend directory exists:', fs.existsSync(backendDir));

// Check if types.ts exists
const typesFile = path.join(backendDir, 'types.ts');
console.log('Types file exists:', fs.existsSync(typesFile));

// Check if we can read the types file
if (fs.existsSync(typesFile)) {
  try {
    const content = fs.readFileSync(typesFile, 'utf8');
    console.log('Types file content length:', content.length);
    console.log('First 100 characters:', content.substring(0, 100));
  } catch (error) {
    console.error('Error reading types file:', error.message);
  }
}

// List all files in the backend directory
if (fs.existsSync(backendDir)) {
  try {
    const files = fs.readdirSync(backendDir);
    console.log('Files in backend directory:', files);
    
    // Check subdirectories
    files.forEach(file => {
      const filePath = path.join(backendDir, file);
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        console.log(`\nFiles in ${file} subdirectory:`, fs.readdirSync(filePath));
      }
    });
  } catch (error) {
    console.error('Error reading backend directory:', error.message);
  }
}

console.log('\nDebugging complete!'); 