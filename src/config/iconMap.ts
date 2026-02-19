import React from "react";
import * as MuiIcons from "@mui/icons-material";

export function getIcon(iconName: string): React.ReactNode {
  const iconMap: Record<string, React.ComponentType<any>> = {
    Home: MuiIcons.Home,
    Group: MuiIcons.Group,
    WorkHistory: MuiIcons.WorkHistory,
    Description: MuiIcons.Description,
    CalendarMonth: MuiIcons.CalendarMonth,
    AdminPanelSettings: MuiIcons.AdminPanelSettings,
    EventAvailable: MuiIcons.EventAvailable,
    Person: MuiIcons.Person,
    Assignment: MuiIcons.Assignment,
    Notifications: MuiIcons.Notifications,
  };

  const IconComponent = iconMap[iconName];
  return IconComponent ? React.createElement(IconComponent) : null;
}
