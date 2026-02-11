import { PropsWithChildren, useState } from "react";
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  Toolbar,
  Typography,
  Button,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  IconButton,
  Divider,
  useTheme,
} from "@mui/material";
import {
  Home,
  Group,
  WorkHistory,
  CalendarMonth,
  Security,
  Description as DescriptionIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  DarkMode,
  LightMode,
  AdminPanelSettings,
  EventAvailable,
  Person,
  Assignment,
  Notifications,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

const drawerWidth = 240;

export default function DashboardLayout({ children }: PropsWithChildren) {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const toggleDrawer = () => setOpen((prev) => !prev);

  const handleThemeToggle = () => {
    const newMode = isDark ? "light" : "dark";
    localStorage.setItem("themeMode", newMode);
    // tu theme-provider escucha este evento
    window.dispatchEvent(new Event("toggle-theme"));
  };

  const menuItems = [
    { text: "Inicio", icon: <Home />, path: "/" },
    { text: "Personas", icon: <Group />, path: "/personas" }, // ✅ actualizado
    { text: "Servicios", icon: <WorkHistory />, path: "/servicios" },
    { text: "DDJJ", icon: <DescriptionIcon />, path: "/ddjj" },
    { text: "Licencias", icon: <CalendarMonth />, path: "/licencias" },
    {
      text: "Usuarios Sistema",
      icon: <AdminPanelSettings />,
      path: "/auth-users",
      adminOnly: true,
    },
    { text: "Mi Licencia", icon: <EventAvailable />, path: "/milicencia" },
    { text: "No Docente", icon: <Person />, path: "/nodocente" },
    { text: "Servicio No Docente", icon: <Assignment />, path: "/servicionodocente" },
    { text: "Novedades del Mes", icon: <Notifications />, path: "/novedadesdelmes" },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        bgcolor: "background.default",
        minHeight: "100vh",
      }}
    >
      <CssBaseline />

      {/* APP BAR */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: 1201,
          transition: "width 0.3s, margin 0.3s",
          width: open ? `calc(100% - ${drawerWidth}px)` : "100%",
          ml: open ? `${drawerWidth}px` : 0,
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton color="inherit" onClick={toggleDrawer} sx={{ mr: 2 }}>
              {open ? <ChevronLeftIcon /> : <MenuIcon />}
            </IconButton>

            <Typography
              variant="h6"
              noWrap
              sx={{
                cursor: "pointer",
                fontWeight: 700,
                "&:hover": { opacity: 0.8 },
              }}
              onClick={() => navigate("/")}
            >
              Sistema RRHH
            </Typography>
          </Box>

          {user && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Tooltip title={isDark ? "Modo claro" : "Modo oscuro"}>
                <IconButton color="inherit" onClick={handleThemeToggle}>
                  {isDark ? <LightMode /> : <DarkMode />}
                </IconButton>
              </Tooltip>
              <Typography sx={{ fontWeight: 500 }}>
                {user.username} ({user.role})
              </Typography>
              <Button variant="outlined" color="inherit" onClick={logout}>
                Salir
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* DRAWER */}
      <Drawer
        variant="persistent"
        open={open}
        sx={{
          width: open ? drawerWidth : 72,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: open ? drawerWidth : 72,
            boxSizing: "border-box",
            borderRight: "none",
            transition: "width 0.3s",
            overflowX: "hidden",

            // fondo según tema
            bgcolor: isDark ? "#161b22" : "#0B74DE",
            color: isDark ? "#e6edf3" : "#ffffff",

            // forzar color para todo lo que está adentro
            "& .MuiListItemText-root": {
              color: isDark ? "#e6edf3" : "#ffffff",
            },
            "& .MuiListItemIcon-root": {
              color: isDark ? "#e6edf3" : "#ffffff",
            },
            "& .MuiTypography-root": {
              color: isDark ? "#e6edf3" : "#ffffff",
            },
          },
        }}
      >
        <Toolbar sx={{ justifyContent: "center", px: 1 }}>
          {open ? (
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, cursor: "pointer" }}
              onClick={() => navigate("/")}
            >
              Sistema RRHH
            </Typography>
          ) : (
            <Tooltip title="Inicio" placement="right">
              <IconButton color="inherit" onClick={() => navigate("/")}>
                <Home />
              </IconButton>
            </Tooltip>
          )}
        </Toolbar>

        <Divider
          sx={{
            borderColor: isDark
              ? "rgba(255,255,255,0.1)"
              : "rgba(255,255,255,0.3)",
            mb: 1,
          }}
        />

        <List>
          {menuItems.map((item) => {
            if (item.adminOnly && user?.role !== "admin") return null;
            const selected = location.pathname === item.path;

            return (
              <Tooltip
                key={item.text}
                title={open ? "" : item.text}
                placement="right"
              >
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  selected={selected}
                  sx={{
                    borderRadius: 2,
                    mx: 1,
                    mb: 0.5,
                    color: selected
                      ? theme.palette.primary.main
                      : isDark
                      ? "#e6edf3"
                      : "#ffffff",
                    backgroundColor: selected
                      ? isDark
                        ? "rgba(255,255,255,0.1)"
                        : "#ffffff"
                      : "transparent",
                    "&:hover": {
                      backgroundColor: selected
                        ? isDark
                          ? "rgba(255,255,255,0.1)"
                          : "#e8f0fe"
                        : isDark
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(255,255,255,0.15)",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: selected
                        ? theme.palette.primary.main
                        : isDark
                        ? "#e6edf3"
                        : "#ffffff",
                      minWidth: 36,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>

                  {open && (
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontWeight: selected ? 700 : 400,
                        color:
                          selected && !isDark
                            ? theme.palette.primary.main
                            : isDark
                            ? "#e6edf3"
                            : "#ffffff",
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            );
          })}
        </List>
      </Drawer>

      {/* MAIN CONTENT */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          width: open ? `calc(100% - ${drawerWidth}px)` : "100%",
          transition: "margin 0.3s",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
