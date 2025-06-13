import { db } from './db';
import { sql } from 'drizzle-orm';

export async function runDatabaseMigration() {
  console.log('Starting database migration: Adding slug and category columns to firm_profiles...');
  
  try {
    // Check if the column already exists
    const columnsResult = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'firm_profiles' AND column_name = 'slug'
    `);
    
    if (columnsResult.rows?.length === 0) {
      // Add the column if it doesn't exist
      await db.execute(sql`ALTER TABLE firm_profiles ADD COLUMN IF NOT EXISTS slug TEXT`);
      console.log('Added slug column to firm_profiles');
    } else {
      console.log('Slug column already exists in firm_profiles');
    }
    
    // Check if the category column exists
    const categoryColumnResult = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'firm_profiles' AND column_name = 'category'
    `);
    
    if (categoryColumnResult.rows?.length === 0) {
      // Add the category column if it doesn't exist
      await db.execute(sql`ALTER TABLE firm_profiles ADD COLUMN IF NOT EXISTS category TEXT`);
      console.log('Added category column to firm_profiles');
    } else {
      console.log('Category column already exists in firm_profiles');
    }
    
    // Set slug values for all profiles where slug is null
    await db.execute(sql`
      UPDATE firm_profiles 
      SET slug = LOWER(REGEXP_REPLACE(firm, '[^a-zA-Z0-9]', '', 'g'))
      WHERE slug IS NULL
    `);
    console.log('Updated slugs for firm profiles');
    
    console.log('Columns added successfully!');
    return { success: true };
  } catch (error) {
    console.error('Error during migration:', error);
    return { success: false, error };
  }
}