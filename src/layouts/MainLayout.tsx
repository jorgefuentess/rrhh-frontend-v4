import { useState } from 'react'
import { Box, CssBaseline, Drawer, AppBar, Toolbar, IconButton, Typography } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import Sidebar from '../components/Sidebar'

const drawerWidth = 240

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true)

  const toggleDrawer = () => setOpen(!open)

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* APP BAR */}
      <AppBar
        position="fixed"
        sx={{
          width: open ? `calc(100% - ${drawerWidth}px)` : '100%',
          ml: open ? `${drawerWidth}px` : 0,
          transition: 'all 0.3s ease',
          backgroundColor: 'primary.main',
        }}
      >
        <Toolbar>
          <IconButton color="inherit" onClick={toggleDrawer} edge="start" sx={{ mr: 2 }}>
            {open ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Sistema RRHH
          </Typography>
        </Toolbar>
      </AppBar>

      {/* SIDEBAR */}
      <Drawer
        variant="persistent"
        anchor="left"
        open={open}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            transition: 'all 0.3s ease',
          },
        }}
      >
        <Sidebar />
      </Drawer>

      {/* CONTENIDO */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          width: open ? `calc(100% - ${drawerWidth}px)` : '100%',
          transition: 'all 0.3s ease',
        }}
      >
        {children}
      </Box>
    </Box>
  )
}