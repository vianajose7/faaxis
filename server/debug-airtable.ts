import Airtable from 'airtable';
import { log } from './vite';

// Initialize Airtable with API key
Airtable.configure({
  apiKey: process.env.AIRTABLE_API_KEY
});

// Constants for the Airtable base
const BASE_ID = 'appmVisf1pJhVLAhx';

// Initialize the base
const base = Airtable.base(BASE_ID);

// Function to list all tables in the base
export async function listAirtableTables() {
  try {
    log('Attempting to connect to Airtable base...', 'airtable');
    
    // The meta API isn't directly exposed, so we'll just try to access the base
    const response = await fetch(`https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables`, {
      headers: {
        'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${await response.text()}`);
    }
    
    const data = await response.json();
    log('Successfully fetched tables info', 'airtable');
    return data;
  } catch (error: any) {
    log(`Error fetching tables: ${error.message}`, 'airtable');
    throw error;
  }
}

// Function to directly test reading a table
export async function testReadTable(tableName: string) {
  try {
    log(`Testing read from table: ${tableName}`, 'airtable');
    
    // Try to read a few records
    const records = await base(tableName).select({
      maxRecords: 3,
      view: 'Grid view'
    }).firstPage();
    
    log(`Successfully read ${records.length} records from ${tableName}`, 'airtable');
    
    // Return record IDs and field names
    return records.map(record => ({
      id: record.id,
      fields: Object.keys(record.fields)
    }));
  } catch (error: any) {
    log(`Error reading from table ${tableName}: ${error.message}`, 'airtable');
    throw error;
  }
}