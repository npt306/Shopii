const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const config = require('./services.json');

// Function to copy .env.example to .env
function setupEnvFile(servicePath) {
  const envExamplePath = path.join(servicePath, '.env.example');
  const envPath = path.join(servicePath, '.env');
  
  try {
    if (fs.existsSync(envExamplePath)) {
      // Read the content of .env.example
      const content = fs.readFileSync(envExamplePath, 'utf8');
      
      // Write the content to .env
      fs.writeFileSync(envPath, content);
      console.log(`✅ Created .env file for service at ${servicePath}`);
    } else {
      console.log(`ℹ️ No .env.example found for service at ${servicePath}`);
    }
  } catch (error) {
    console.error(`❌ Failed to create .env file for service at ${servicePath}: ${error.message}`);
  }
}

config.services.forEach(service => {
  const servicePath = path.resolve(__dirname, service.path);
  
  // Setup environment file first
  console.log(`\n🔧 Setting up environment for ${service.name}...`);
  setupEnvFile(servicePath);
  
  // Then install dependencies
  console.log(`\n📦 Installing dependencies for ${service.name}...`);
  const result = spawnSync(service.install, {
    cwd: servicePath,
    shell: true,
    stdio: 'inherit'
  });
  if (result.status !== 0) {
    console.error(`❌ Failed to install dependencies for ${service.name}`);
  } else {
    console.log(`✅ Installed dependencies for ${service.name}`);
  }
});

console.log("\n✨ Setup complete! All services have been installed and environment files have been configured.");