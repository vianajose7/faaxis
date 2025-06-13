// Admin bypass has been completely removed for security reasons
// This file is kept as a placeholder to avoid breaking imports

// These functions now return false or do nothing to ensure security
export function hasDevAdminBypass(): boolean {
  return false; // Always return false - no bypassing allowed
}

export function setDevAdminBypass(): void {
  // No-op - bypassing has been disabled
  console.warn("Admin bypass functionality has been removed for security reasons");
}

export function clearDevAdminBypass(): void {
  // Clean up any old flags that might exist
  localStorage.removeItem('__faaxis_dev_admin__');
}