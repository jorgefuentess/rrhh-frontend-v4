import { ROLES } from "./roles";

export interface MenuItem {
  text: string;
  iconName: string; // Nombre del icono, no el componente JSX
  path: string;
  allowedRoles: string[];
}

export const menuItems: MenuItem[] = [
  {
    text: "Inicio",
    iconName: "Home",
    path: "/",
    allowedRoles: [ROLES.ADMIN, ROLES.SECRETARIO, ROLES.DOCENTE],
  },
  {
    text: "Personas",
    iconName: "Group",
    path: "/personas",
    allowedRoles: [ROLES.ADMIN, ROLES.SECRETARIO],
  },
  {
    text: "Servicios",
    iconName: "WorkHistory",
    path: "/servicios",
    allowedRoles: [ROLES.ADMIN, ROLES.SECRETARIO],
  },
  {
    text: "DDJJ",
    iconName: "Description",
    path: "/ddjj",
    allowedRoles: [ROLES.ADMIN, ROLES.DOCENTE],
  },
  {
    text: "Licencias",
    iconName: "CalendarMonth",
    path: "/licencias",
    allowedRoles: [ROLES.ADMIN, ROLES.SECRETARIO],
  },
  {
    text: "Usuarios Sistema",
    iconName: "AdminPanelSettings",
    path: "/auth-users",
    allowedRoles: [ROLES.ADMIN],
  },
  {
    text: "Mi Licencia",
    iconName: "EventAvailable",
    path: "/milicencia",
    allowedRoles: [ROLES.ADMIN, ROLES.DOCENTE],
  },
  {
    text: "No Docente",
    iconName: "Person",
    path: "/nodocente",
    allowedRoles: [ROLES.ADMIN, ROLES.SECRETARIO],
  },
  {
    text: "Servicio No Docente",
    iconName: "Assignment",
    path: "/servicionodocente",
    allowedRoles: [ROLES.ADMIN, ROLES.SECRETARIO],
  },
  {
    text: "Novedades del Mes",
    iconName: "Notifications",
    path: "/novedadesdelmes",
    allowedRoles: [ROLES.ADMIN],
  },
];

export function getVisibleMenuItems(userRoles: string[] | undefined): MenuItem[] {
  if (!userRoles || !Array.isArray(userRoles)) {
    return [];
  }
  return menuItems.filter((item) =>
    item.allowedRoles.some((role) => userRoles.includes(role))
  );
}
