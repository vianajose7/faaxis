/**
 * Database User Verification Tool
 * This script checks if a user exists in the PostgreSQL database
 */

const { Pool } = require('pg');

// User to check
const userEmail = process.argv[2] || 'test.user@example.com';

// Configure PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkUserInDatabase() {
  console.log(`🔍 Checking if user '${userEmail}' exists in the database...`);
  
  try {
    // Get connection
    const client = await pool.connect();
    
    try {
      // Check for user
      const result = await client.query(
        'SELECT id, username, first_name, last_name, is_admin FROM users WHERE username = $1',
        [userEmail]
      );
      
      if (result.rows.length > 0) {
        const user = result.rows[0];
        console.log('✅ User found in database!');
        console.log('User details:');
        console.log(`- ID: ${user.id}`);
        console.log(`- Username: ${user.username}`);
        console.log(`- Name: ${user.first_name} ${user.last_name}`);
        console.log(`- Admin: ${user.is_admin ? 'Yes' : 'No'}`);
        return true;
      } else {
        console.log('❌ User not found in database');
        return false;
      }
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Database error:', error.message);
    return false;
  } finally {
    pool.end();
  }
}

// Run check
checkUserInDatabase()
  .then(found => {
    if (!found) {
      console.log('💡 To create this user, run the registration script or register through the web interface');
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });