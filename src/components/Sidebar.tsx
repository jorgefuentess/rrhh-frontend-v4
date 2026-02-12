import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import GroupIcon from "@mui/icons-material/Group";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";
import DescriptionIcon from "@mui/icons-material/Description";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SecurityIcon from "@mui/icons-material/Security";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import PersonIcon from "@mui/icons-material/Person";
import AssignmentIcon from "@mui/icons-material/Assignment";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { text: "Inicio", icon: <HomeIcon />, path: "/" },
    { text: "Usuarios", icon: <GroupIcon />, path: "/usuarios" },
    { text: "Servicios", icon: <WorkHistoryIcon />, path: "/servicios" },
    { text: "DDJJ", icon: <DescriptionIcon />, path: "/ddjj" },
    { text: "Licencias", icon: <CalendarMonthIcon />, path: "/licencias" },
    { text: "Usuarios Sistema", icon: <AdminPanelSettingsIcon />, path: "/authusers" },
    { text: "Mi Licencia", icon: <EventAvailableIcon />, path: "/milicencia" },
    { text: "No Docente", icon: <PersonIcon />, path: "/nodocente" },
    { text: "Servicio No Docente", icon: <AssignmentIcon />, path: "/servicionodocente" },
    { text: "Novedades del Mes", icon: <NotificationsIcon />, path: "/novedadesdelmes" },
  ];

  return (
    <Box
      sx={{
        height: "100%",
        backgroundColor: "#fff",
        borderRight: "1px solid #e0e0e0",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          textAlign: "center",
          py: 2,
          color: "primary.main",
        }}
      >
        Sistema RRHH
      </Typography>

      <List>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.text}
            selected={location.pathname === item.path}
            onClick={() => navigate(item.path)}
            sx={{
              borderRadius: 3,
              mx: 1,
              mb: 1,
              "&.Mui-selected": {
                backgroundColor: "primary.main",
                color: "white",
                "& .MuiListItemIcon-root": { color: "white" },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}
