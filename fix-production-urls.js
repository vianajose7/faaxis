/**
 * Production URL Fix Script
 * 
 * This script fixes the URL references in your production build
 * to ensure all resources load from the correct domain.
 */

import fs from 'fs';
import path from 'path';

const distDir = './dist/public';
const indexPath = path.join(distDir, 'index.html');

// Development URL that needs to be replaced
const devUrl = 'https://b8c736c6-40a1-4bb1-af36-eeb7ad533fdc-00-1sqqkajo6e3i4.worf.replit.dev';

function fixProductionUrls() {
  console.log('🔧 Fixing production URLs...');
  
  try {
    // Read the index.html file
    if (fs.existsSync(indexPath)) {
      let content = fs.readFileSync(indexPath, 'utf8');
      
      // Replace development URLs with relative paths
      content = content.replace(new RegExp(devUrl, 'g'), '');
      
      // Ensure all asset paths are relative
      content = content.replace(/href="\/assets\//g, 'href="./assets/');
      content = content.replace(/src="\/assets\//g, 'src="./assets/');
      
      // Write the fixed content back
      fs.writeFileSync(indexPath, content);
      console.log('✅ Fixed index.html URLs');
    } else {
      console.log('⚠️ index.html not found in dist/public');
    }
    
    // Fix any JavaScript files that might have absolute URLs
    const assetsDir = path.join(distDir, 'assets');
    if (fs.existsSync(assetsDir)) {
      const files = fs.readdirSync(assetsDir);
      
      files.forEach(file => {
        if (file.endsWith('.js')) {
          const filePath = path.join(assetsDir, file);
          let content = fs.readFileSync(filePath, 'utf8');
          
          // Replace any hardcoded development URLs
          if (content.includes(devUrl)) {
            content = content.replace(new RegExp(devUrl, 'g'), '');
            fs.writeFileSync(filePath, content);
            console.log(`✅ Fixed URLs in ${file}`);
          }
        }
      });
    }
    
    console.log('🎉 Production URL fix completed!');
    
  } catch (error) {
    console.error('❌ Error fixing URLs:', error);
  }
}

// Run the fix
fixProductionUrls();