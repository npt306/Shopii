const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const readline = require('readline');
const net = require('net');
const config = require('./services.json');

// Create command map for stopping specific services
const runningProcesses = new Map();

// Default ports to check for common microservices
const defaultPorts = {
  'api-gateway': 3000,
  'auth-service': 3003,
  'accounts-service': 3008,
  'product-service': 3001,
  'order-service': 3004,
  'payment-service': 3007,
  'search-service': 3009,
  'shipping-service': 3006,
  'user-service': 3005,
  'voucher-service': 3002,
  'admin-frontend': 8002,
  'buyer-frontend': 8000,
  'seller-frontend': 8001
};

// Setup readline interface for command input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'shopii-dev> '
});

// Color functions for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m"
};

// Helper function for colored logging
function colorLog(color, text) {
  console.log(`${colors[color]}${text}${colors.reset}`);
}

// Function to check if a port is in use
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
}

// Function to check all required ports
async function checkPorts() {
  colorLog('cyan', "Checking ports availability...");
  
  const usedPorts = [];
  const portsToCheck = [];
  
  // Add ports from config or use default ports
  for (const service of config.services) {
    // Check if service has port property or use default
    const port = service.port || defaultPorts[service.name];
    if (port) {
      portsToCheck.push({ name: service.name, port });
    }
  }
  
  // Check each port
  for (const { name, port } of portsToCheck) {
    const isAvailable = await isPortAvailable(port);
    if (!isAvailable) {
      usedPorts.push({ name, port });
    }
  }
  
  // Report results
  if (usedPorts.length > 0) {
    colorLog('yellow', "⚠️ Some ports are already in use:");
    usedPorts.forEach(({ name, port }) => {
      colorLog('yellow', `  - Port ${port} for ${name} is not available`);
    });
    return false;
  } else {
    colorLog('green', "✅ All required ports are available");
    return true;
  }
}

// Function to parse .env files and extract port numbers
function extractPortsFromEnv(servicePath) {
  try {
    const envPath = path.join(servicePath, '.env');
    const envExamplePath = path.join(servicePath, '.env.example');
    
    let content = '';
    if (fs.existsSync(envPath)) {
      content = fs.readFileSync(envPath, 'utf8');
    } else if (fs.existsSync(envExamplePath)) {
      content = fs.readFileSync(envExamplePath, 'utf8');
    } else {
      return null;
    }
    
    // Look for PORT=xxxx pattern
    const portMatch = content.match(/PORT\s*=\s*(\d+)/i);
    if (portMatch && portMatch[1]) {
      return parseInt(portMatch[1], 10);
    }
    
    return null;
  } catch (error) {
    console.log(`Error reading .env file: ${error.message}`);
    return null;
  }
}

// Display available commands
function showHelp() {
  colorLog('bright', "\n=== Shopii Development Environment ===");
  colorLog('cyan', "Available commands:");
  colorLog('green', "  help         - Show this help message");
  colorLog('green', "  list         - List all running services");
  colorLog('green', "  stop [id]    - Stop a specific service by ID");
  colorLog('green', "  stop all     - Stop all running services");
  colorLog('green', "  start [id]   - Start a specific service by ID");
  colorLog('green', "  start all    - Start all services");
  colorLog('green', "  checkports   - Check if required ports are available");
  colorLog('green', "  log [id/name] [lines] - Show logs for a specific service");
  colorLog('green', "  log list      - List services with available logs");
  colorLog('green', "  quit         - Stop all services and exit");
  console.log("");
  rl.prompt();
}

// Add these variables and functions to store logs

// Store recent logs (last 100 lines per service)
const serviceLogs = new Map();
const MAX_LOG_LINES = 100;

// Function to add a log entry
function addLogEntry(serviceName, line, isError = false) {
  if (!serviceLogs.has(serviceName)) {
    serviceLogs.set(serviceName, []);
  }
  
  const logs = serviceLogs.get(serviceName);
  logs.push({ 
    timestamp: new Date().toISOString(), 
    message: line,
    isError
  });
  
  // Keep only the last MAX_LOG_LINES entries
  if (logs.length > MAX_LOG_LINES) {
    logs.shift();
  }
}

// Function to display logs for a specific service
function showServiceLogs(serviceName, lines = MAX_LOG_LINES) {
  if (!serviceLogs.has(serviceName)) {
    colorLog('yellow', `No logs available for ${serviceName}`);
    return;
  }
  
  const logs = serviceLogs.get(serviceName);
  const count = Math.min(logs.length, lines);
  
  colorLog('bright', `\nShowing last ${count} log entries for ${serviceName}:`);
  
  logs.slice(-lines).forEach(log => {
    const timeStr = log.timestamp.split('T')[1].substr(0, 8);
    if (log.isError) {
      console.log(`${colors.yellow}[${timeStr}]${colors.reset} ${colors.red}${log.message}${colors.reset}`);
    } else {
      console.log(`${colors.yellow}[${timeStr}]${colors.reset} ${log.message}`);
    }
  });
}

// Function to start a specific service
async function startService(service, index) {
  if (runningProcesses.has(service.name)) {
    colorLog('yellow', `Service '${service.name}' is already running`);
    return;
  }

  const servicePath = path.resolve(__dirname, service.path);
  
  if (!fs.existsSync(servicePath)) {
    colorLog('red', `Service directory not found: ${servicePath}`);
    return;
  }
  
  // Check port availability
  const port = service.port || defaultPorts[service.name] || extractPortsFromEnv(servicePath);
  if (port) {
    const isAvailable = await isPortAvailable(port);
    if (!isAvailable) {
      colorLog('red', `Cannot start ${service.name}: Port ${port} is already in use!`);
      return;
    }
  }

  colorLog('cyan', `Starting ${service.name} (${index})...`);

  try {
    // Use cross-platform command to start the service
    const childProcess = spawn(service.start, {
      cwd: servicePath,
      shell: true,
      stdio: 'pipe', // Capture output
      detached: false
    });

    // Store the process reference
    runningProcesses.set(service.name, {
      process: childProcess,
      id: index,
      name: service.name,
      port: port
    });

    // Log the output with service name prefix
    childProcess.stdout.on('data', (data) => {
      const lines = data.toString().trim().split('\n');
      lines.forEach(line => {
        if (line.trim()) {
          // Store log
          addLogEntry(service.name, line);
          // Display log
          console.log(`${colors.bright}[${service.name}]${colors.reset} ${line}`);
        }
      });
    });

    childProcess.stderr.on('data', (data) => {
      const lines = data.toString().trim().split('\n');
      lines.forEach(line => {
        if (line.trim()) {
          // Store log as error
          addLogEntry(service.name, line, true);
          // Display log
          console.log(`${colors.red}[${service.name}]${colors.reset} ${line}`);
        }
      });
    });

    childProcess.on('close', (code) => {
      if (code !== null) {
        colorLog('yellow', `Service ${service.name} exited with code ${code}`);
        runningProcesses.delete(service.name);
      }
    });

    childProcess.on('error', (err) => {
      colorLog('red', `Error starting ${service.name}: ${err.message}`);
      runningProcesses.delete(service.name);
    });

  } catch (error) {
    colorLog('red', `Failed to start ${service.name}: ${error.message}`);
  }
}

// Function to start all services
async function startAllServices() {
  // Check ports first
  const portsAvailable = await checkPorts();
  if (!portsAvailable) {
    colorLog('yellow', "⚠️ Some ports are in use. Use 'checkports' for details.");
    colorLog('yellow', "You can still try to start services, but some may fail.");
    const proceed = await askQuestion("Do you want to proceed anyway? (y/n): ");
    if (proceed.toLowerCase() !== 'y' && proceed.toLowerCase() !== 'yes') {
      colorLog('cyan', "Service startup aborted. Please free up the required ports and try again.");
      return;
    }
  }
  
  for (let index = 0; index < config.services.length; index++) {
    await startService(config.services[index], index);
    // Small delay between starting services to prevent resource contention
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

// Helper function to ask questions
function askQuestion(query) {
  const rlTemp = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => {
    rlTemp.question(query, answer => {
      rlTemp.close();
      resolve(answer);
    });
  });
}

// Modify the stopService function to be more aggressive with process termination

function stopService(serviceName) {
  const serviceInfo = runningProcesses.get(serviceName);
  
  if (!serviceInfo) {
    colorLog('yellow', `Service '${serviceName}' is not running`);
    return;
  }

  colorLog('cyan', `Stopping ${serviceName}...`);
  
  // Kill the process
  try {
    if (process.platform === 'win32') {
      // On Windows, we need to be more aggressive with termination
      // First try a more graceful approach
      try {
        serviceInfo.process.kill();
      } catch (e) {
        // Ignore if it fails
      }
      
      // Then use taskkill to force kill the process tree
      const taskkill = spawn('taskkill', ['/pid', serviceInfo.process.pid, '/f', '/t'], {
        stdio: 'ignore',
        shell: true
      });
      
      // Wait for taskkill to complete
      taskkill.on('exit', () => {
        colorLog('green', `Service ${serviceName} stopped successfully`);
      });
    } else {
      // On Unix systems, SIGTERM should work fine
      serviceInfo.process.kill('SIGTERM');
      colorLog('green', `Service ${serviceName} stopped successfully`);
    }
    
    // Remove from tracking regardless of kill success
    runningProcesses.delete(serviceName);
  } catch (error) {
    colorLog('red', `Error stopping ${serviceName}: ${error.message}`);
    
    // Even if there's an error, still remove from tracking
    runningProcesses.delete(serviceName);
  }
}

// Function to stop all services
function stopAllServices() {
  colorLog('cyan', "Stopping all services...");
  
  const serviceNames = Array.from(runningProcesses.keys());
  serviceNames.forEach(serviceName => {
    stopService(serviceName);
  });
  
  if (serviceNames.length === 0) {
    colorLog('yellow', "No running services found");
  } else {
    colorLog('green', "All services stopped");
  }
}

// Function to list running services
function listServices() {
  if (runningProcesses.size === 0) {
    colorLog('yellow', "No services are currently running");
  } else {
    colorLog('bright', "\nRunning services:");
    
    runningProcesses.forEach((info, name) => {
      const portInfo = info.port ? ` (Port: ${info.port})` : '';
      colorLog('green', `  ${info.id}: ${name} (PID: ${info.process.pid})${portInfo}`);
    });
  }
}

// Process command input
rl.on('line', (line) => {
  const args = line.trim().split(' ');
  const command = args[0].toLowerCase();
  
  switch (command) {
    case 'help':
      showHelp();
      break;
      
    case 'list':
      listServices();
      rl.prompt();
      break;
      
    case 'checkports':
      checkPorts().then(() => rl.prompt());
      break;
      
    case 'stop':
      if (args[1] === 'all') {
        stopAllServices();
      } else {
        const serviceId = parseInt(args[1]);
        let found = false;
        
        runningProcesses.forEach((info, name) => {
          if (info.id === serviceId) {
            stopService(name);
            found = true;
          }
        });
        
        if (!found && args[1]) {
          // Try to find by name
          if (runningProcesses.has(args[1])) {
            stopService(args[1]);
          } else {
            colorLog('red', `Service with ID or name '${args[1]}' not found`);
          }
        } else if (!args[1]) {
          colorLog('yellow', "Please specify a service ID/name or 'all'");
        }
      }
      rl.prompt();
      break;
      
    case 'start':
      if (args[1] === 'all') {
        startAllServices().then(() => rl.prompt());
      } else {
        const serviceId = parseInt(args[1]);
        if (isNaN(serviceId) || serviceId < 0 || serviceId >= config.services.length) {
          colorLog('red', `Invalid service ID: ${args[1]}`);
          rl.prompt();
        } else {
          startService(config.services[serviceId], serviceId).then(() => rl.prompt());
        }
      }
      break;
      
    case 'log':
      if (!args[1]) {
        colorLog('yellow', "Please specify a service name or ID to show logs");
      } else if (args[1] === 'list') {
        // List services with available logs
        const servicesWithLogs = Array.from(serviceLogs.keys());
        if (servicesWithLogs.length === 0) {
          colorLog('yellow', "No logs available from any service");
        } else {
          colorLog('bright', "\nServices with available logs:");
          servicesWithLogs.forEach(name => {
            const logCount = serviceLogs.get(name).length;
            colorLog('green', `  ${name} (${logCount} log entries)`);
          });
        }
      } else {
        // Check if argument is an ID
        const serviceId = parseInt(args[1]);
        if (!isNaN(serviceId) && serviceId >= 0 && serviceId < config.services.length) {
          // It's a valid ID, show logs for this service
          showServiceLogs(config.services[serviceId].name, args[2] ? parseInt(args[2]) : MAX_LOG_LINES);
        } else {
          // Try as a service name
          if (serviceLogs.has(args[1])) {
            showServiceLogs(args[1], args[2] ? parseInt(args[2]) : MAX_LOG_LINES);
          } else {
            colorLog('red', `No logs found for service '${args[1]}'`);
          }
        }
      }
      rl.prompt();
      break;
          
    case '':
      rl.prompt();
      break;
      
    default:
      colorLog('red', `Unknown command: ${command}. Type 'help' for available commands.`);
      rl.prompt();
  }
}).on('close', () => {
  console.log('\nThank you for using Shopii Development Environment!');
  process.exit(0);
});

// Modify the SIGINT handler to be more robust
process.on('SIGINT', function() {
  console.log('\n');
  colorLog('bright', "⚠️ Ctrl+C detected. Stopping all services and exiting...");
  
  // Stop all services first
  stopAllServices();
  
  // For Windows, add an extra process cleanup step
  if (process.platform === 'win32' && runningProcesses.size > 0) {
    colorLog('yellow', "Forcing termination of remaining processes...");
    
    // Force kill any remaining Node.js processes related to our services
    try {
      // This is a more aggressive approach to kill possible orphaned processes
      spawn('taskkill', ['/F', '/IM', 'node.exe'], {
        stdio: 'ignore',
        shell: true
      });
    } catch (e) {
      // Ignore errors here
    }
  }
  
  // Give some time for services to stop properly, then exit
  setTimeout(() => {
    console.log('\nThank you for using Shopii Development Environment!');
    process.exit(0);  // Force exit regardless of remaining processes
  }, 3000);
});

// Also, add this exit handler to make sure we clean up on any exit
process.on('exit', () => {
  // Try to clean up any remaining processes
  if (runningProcesses.size > 0) {
    console.log("Cleaning up remaining processes...");
    
    if (process.platform === 'win32') {
      try {
        // One last attempt to kill related processes
        const { execSync } = require('child_process');
        execSync('taskkill /F /IM node.exe /T', { stdio: 'ignore' });
      } catch (e) {
        // Ignore errors
      }
    }
  }
});

// Display initial instructions
console.clear();
colorLog('bright', "=== Shopii Development Environment ===");
colorLog('cyan', "Welcome to development mode");
console.log("Type 'help' for available commands");
console.log("Type 'checkports' to check port availability");
console.log("Type 'start all' to start all services");
console.log("Press Ctrl+C to stop all services and exit\n");

// Initial prompt
setTimeout(() => {
  rl.prompt();
}, 500);