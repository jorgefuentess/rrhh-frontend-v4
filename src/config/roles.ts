// Definición de roles y sus permisos
export const ROLES = {
  ADMIN: "admin",
  SECRETARIO: "secretario",
  DOCENTE: "docente",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// Mapeo de roles a permisos (rutas permitidas)
export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  [ROLES.ADMIN]: [
    "/personas",
    "/servicios",
    "/ddjj",
    "/licencias",
    "/auth-users",
    "/milicencia",
    "/nodocente",
    "/servicionodocente",
    "/novedadesdelmes",
  ],
  [ROLES.SECRETARIO]: [
    "/personas",
    "/servicios",
    "/licencias",
    "/nodocente",
    "/servicionodocente",
  ],
  [ROLES.DOCENTE]: [
    "/ddjj",
    "/milicencia",
  ],
};

// Helper para verificar acceso
export function hasAccessToRoute(roles: string[], routePath: string): boolean {
  // Si tiene al menos uno de los roles con acceso a la ruta
  return roles.some((role) => {
    const permissions = ROLE_PERMISSIONS[role as Role];
    return permissions && permissions.includes(routePath);
  });
}

export function hasRole(roles: string[], requiredRoles: string[]): boolean {
  return roles.some((role) => requiredRoles.includes(role));
}
