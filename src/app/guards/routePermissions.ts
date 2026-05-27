import { APP_ROUTES } from '../router/routeRegistry';

export const ROLE_HIERARCHY = {
 super_admin: 100,
 org_admin: 80,
 finance: 60,
 supervisor: 55,
 support: 50,
 agent: 40,
 client: 20,
 public: 0,
} as const;

export type AppRole = keyof typeof ROLE_HIERARCHY;

export function canAccessRoute(routeId: string, userRoles: string[]): boolean {
 const route = APP_ROUTES.find(r => r.id === routeId);
 if (!route) return false;
 if (route.requiredRoles.length === 0) return true;
 return userRoles.some(role => route.requiredRoles.includes(role));
}

export function hasMinimumRole(userRoles: string[], minimumRole: AppRole): boolean {
 const minLevel = ROLE_HIERARCHY[minimumRole];
 return userRoles.some(role => {
 const level = ROLE_HIERARCHY[role as AppRole] ?? 0;
 return level >= minLevel;
 });
}

export function isSuperAdmin(roles: string[]): boolean {
 return roles.includes('super_admin');
}

export function isOrgAdmin(roles: string[]): boolean {
 return roles.includes('org_admin') || roles.includes('super_admin');
}

export function isAgent(roles: string[]): boolean {
 return roles.includes('agent') || roles.includes('org_admin') || roles.includes('super_admin');
}
