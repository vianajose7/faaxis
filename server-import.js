/**
 * Server Module Import Helper
 * 
 * This file provides a utility function for safely importing server modules
 * dynamically at runtime, with proper error handling and fallbacks.
 */

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get the directory of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Safely imports a server module by path
 * @param {string} modulePath - Path to the module to import
 * @returns {Promise<any>} - The imported module or null if import fails
 */
export async function importServerModule(modulePath) {
  try {
    // Resolve the absolute path
    const resolvedPath = path.resolve(__dirname, modulePath);
    
    // Check if the file exists
    if (!fs.existsSync(resolvedPath)) {
      console.log(`Module not found at path: ${resolvedPath}`);
      
      // Try alternative paths
      const alternatives = [
        // Relative to cwd
        path.resolve(process.cwd(), modulePath),
        // Without the .js extension
        path.resolve(__dirname, modulePath.replace(/\.js$/, '')),
        // Try dist/server/routes.js
        path.resolve(__dirname, 'dist/server/routes.js'),
        // Try directly from server directory
        path.resolve(__dirname, 'server/routes.js')
      ];
      
      // Find the first existing alternative
      const existingPath = alternatives.find(p => fs.existsSync(p));
      
      if (existingPath) {
        console.log(`Found alternative path: ${existingPath}`);
        const module = await import(existingPath);
        return module;
      }
      
      throw new Error(`Module not found at path: ${resolvedPath} or any alternatives`);
    }
    
    console.log(`Importing module from: ${resolvedPath}`);
    const module = await import(resolvedPath);
    return module;
  } catch (error) {
    console.error(`Error importing module ${modulePath}:`, error.message);
    return null;
  }
}