#!/usr/bin/env node

// Verify wreq-js native module loads correctly after installation
try {
  const { fetch } = require('wreq-js');
  console.log('✓ wreq-js native module loaded successfully');
  console.log(`  Platform: ${process.platform}`);
  console.log(`  Architecture: ${process.arch}`);
  console.log(`  Node.js: ${process.version}`);
} catch (error) {
  console.error('✗ Failed to load wreq-js native module');
  console.error(`  Platform: ${process.platform}`);
  console.error(`  Architecture: ${process.arch}`);
  console.error(`  Node.js: ${process.version}`);
  console.error(`  Error: ${error.message}`);
  console.error('\nPlease check DEPLOYMENT.md for troubleshooting steps.');
  process.exit(1);
}
