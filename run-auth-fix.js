/**
 * Run Authentication Fix Server
 * 
 * This script runs the authentication fix in a separate process
 * while also starting the Vite development server.
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import chalk from 'chalk';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to start a process
function startProcess(command, args, name, options = {}) {
  console.log(chalk.blue(`Starting ${name}...`));
  
  const process = spawn(command, args, {
    stdio: 'pipe',
    ...options
  });
  
  process.stdout.on('data', (data) => {
    console.log(chalk.green(`[${name}] `) + data.toString().trim());
  });
  
  process.stderr.on('data', (data) => {
    console.error(chalk.red(`[${name} ERROR] `) + data.toString().trim());
  });
  
  process.on('close', (code) => {
    if (code !== 0) {
      console.log(chalk.red(`${name} process exited with code ${code}`));
    } else {
      console.log(chalk.yellow(`${name} process closed`));
    }
  });
  
  return process;
}

// Start the authentication fix server
const authFixServer = startProcess('node', ['auth-fix.cjs'], 'Auth Fix Server', {
  env: { ...process.env, PORT: '3001' }
});

// Start the Vite development server
const viteServer = startProcess('npm', ['run', 'dev', '--', '--port', '5173'], 'Vite Dev Server');

// Handle process termination
process.on('SIGINT', () => {
  console.log(chalk.yellow('\nGracefully shutting down...'));
  authFixServer.kill();
  viteServer.kill();
  process.exit(0);
});

console.log(chalk.blue('================================================='));
console.log(chalk.green('Both servers are running!'));
console.log(chalk.green('Auth Fix Server: http://localhost:3001'));
console.log(chalk.green('Vite Dev Server: http://localhost:5173'));
console.log(chalk.blue('================================================='));
console.log(chalk.yellow('Press Ctrl+C to stop all servers'));