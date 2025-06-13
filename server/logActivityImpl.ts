// MemStorage implementation for logActivity
async logActivity(log: {
  userId: number; 
  action: string; 
  entityType: string; 
  entityId?: string | number | null; 
  details?: string;
  timestamp?: Date;
}): Promise<ActivityLog> {
  const { userId, action, entityType, entityId, details, timestamp } = log;
  
  // Find the user to get username
  const user = await this.getUser(userId);
  const username = user ? user.username : "system";
  
  return this.createActivityLog({
    type: entityType,
    action,
    message: details || `${action} on ${entityType}${entityId ? ` (${entityId})` : ''}`,
    user: username,
    timestamp: timestamp || new Date()
  });
}

// DatabaseStorage implementation for logActivity
async logActivity(log: {
  userId: number; 
  action: string; 
  entityType: string; 
  entityId?: string | number | null; 
  details?: string;
  timestamp?: Date;
}): Promise<ActivityLog> {
  const { userId, action, entityType, entityId, details, timestamp } = log;
  
  // Find the user to get username
  const user = await this.getUser(userId);
  const username = user ? user.username : "system";
  
  return this.createActivityLog({
    type: entityType,
    action,
    message: details || `${action} on ${entityType}${entityId ? ` (${entityId})` : ''}`,
    user: username,
    timestamp: timestamp || new Date()
  });
}