// Simple script to convert SVG to PNG
// Note: This requires additional setup. For now, use an online converter.

const fs = require('fs');
const path = require('path');

console.log('SVG file created at: public/acme-core-logo.svg');
console.log('\nTo convert to PNG, you can:');
console.log('1. Use an online converter like cloudconvert.com');
console.log('2. Open the SVG in a browser and take a screenshot');
console.log('3. Use a design tool like Figma or Sketch');
console.log('\nThe SVG file is ready at:');
console.log(path.join(__dirname, 'public', 'acme-core-logo.svg'));
