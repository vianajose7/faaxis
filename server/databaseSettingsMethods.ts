// Settings operations for DatabaseStorage
async saveSettings(type: string, settings: any): Promise<void> {
  try {
    // Using a simple key-value approach for settings
    // In a production environment, this would be stored in a proper settings table
    const settingsTable = 'settings';
    
    // Check if settings of this type already exist
    const [existingSettings] = await db.execute(
      `SELECT value FROM ${settingsTable} WHERE type = $1`,
      [type]
    );
    
    if (existingSettings) {
      // Update existing settings
      await db.execute(
        `UPDATE ${settingsTable} SET value = $1, updated_at = $2 WHERE type = $3`,
        [JSON.stringify(settings), new Date().toISOString(), type]
      );
    } else {
      // Insert new settings
      await db.execute(
        `INSERT INTO ${settingsTable} (type, value, created_at, updated_at) VALUES ($1, $2, $3, $4)`,
        [type, JSON.stringify(settings), new Date().toISOString(), new Date().toISOString()]
      );
    }
    
    console.log(`Settings saved for type: ${type}`);
  } catch (error) {
    console.error(`Error saving settings for type ${type}:`, error);
    throw error;
  }
}

async getSettings(type: string): Promise<any> {
  try {
    const settingsTable = 'settings';
    
    const [result] = await db.execute(
      `SELECT value FROM ${settingsTable} WHERE type = $1`,
      [type]
    );
    
    if (result) {
      return JSON.parse(result.value);
    }
    
    return null;
  } catch (error) {
    console.error(`Error getting settings for type ${type}:`, error);
    return null;
  }
}

async getAllSettings(): Promise<Record<string, any>> {
  try {
    const settingsTable = 'settings';
    
    const results = await db.execute(
      `SELECT type, value FROM ${settingsTable}`
    );
    
    const settings: Record<string, any> = {};
    
    for (const row of results) {
      settings[row.type] = JSON.parse(row.value);
    }
    
    return settings;
  } catch (error) {
    console.error('Error getting all settings:', error);
    return {};
  }
}