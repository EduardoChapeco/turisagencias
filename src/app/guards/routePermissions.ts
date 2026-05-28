import { AppRouteContract } from '../router/routeRegistry';

/**
 * Checks if a user with given roles can access the specific route.
 * @param userRoles Array of roles the user possesses (e.g., ['super_admin', 'agent'])
 * @param route The target route configuration
 * @returns boolean
 */
export const canAccessRoute = (userRoles: string[], route: AppRouteContract): boolean => {
  // If no required roles are specified, route is accessible to all
  if (!route.requiredRoles || route.requiredRoles.length === 0) {
    return true;
  }

  // Super admins have access to everything unless specifically restricted (which is rare, but possible)
  if (userRoles.includes('super_admin')) {
    return true;
  }

  // Check if user has at least one of the required roles
  return route.requiredRoles.some(role => userRoles.includes(role));
};

/**
 * Validates if the current environment/session has the required data dependencies
 * to render the route without crashing.
 * 
 * Note: This is a placeholder for a future hook implementation that will cross-reference
 * against active TanStack queries or Stores.
 */
export const validateDataDependencies = (route: AppRouteContract, activeStores: string[]): boolean => {
  if (!route.dataDependencies || route.dataDependencies.length === 0) {
    return true;
  }
  
  return route.dataDependencies.every(dep => activeStores.includes(dep));
};
