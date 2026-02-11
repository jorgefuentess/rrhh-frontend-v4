import { Grid, Typography, Paper, useTheme } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import GroupIcon from '@mui/icons-material/Group'
import WorkHistoryIcon from '@mui/icons-material/WorkHistory'
import EventAvailableIcon from '@mui/icons-material/EventAvailable'
import DescriptionIcon from '@mui/icons-material/Description'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import PersonIcon from '@mui/icons-material/Person'
import AssignmentIcon from '@mui/icons-material/Assignment'
import NotificationsIcon from '@mui/icons-material/Notifications'

export default function Home() {
  const theme = useTheme()
  const navigate = useNavigate()

  const cards = [
    {
      title: 'Personas',
      desc: 'Alta y gestión de docentes y agentes.',
      icon: <GroupIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      path: '/personas', // ✅ Actualizado
    },
    {
      title: 'Servicios',
      desc: 'Altas, bajas, secciones, materias y carácter.',
      icon: <WorkHistoryIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      path: '/servicios',
    },
    {
      title: 'DDJJ',
      desc: 'Declaraciones Juradas.',
      icon: <DescriptionIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      path: '/ddjj',
    },
    {
      title: 'Licencias',
      desc: 'Registro y control de plazos.',
      icon: <EventAvailableIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      path: '/licencias',
    },
    {
      title: 'Usuarios Sistema',
      desc: 'Gestión de usuarios y permisos.',
      icon: <AdminPanelSettingsIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      path: '/auth-users',
    },
    {
      title: 'Mi Licencia',
      desc: 'Consulta tu licencia personal.',
      icon: <EventAvailableIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      path: '/milicencia',
    },
    {
      title: 'No Docente',
      desc: 'Información del personal no docente.',
      icon: <PersonIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      path: '/nodocente',
    },
    {
      title: 'Servicio No Docente',
      desc: 'Servicios del personal no docente.',
      icon: <AssignmentIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      path: '/servicionodocente',
    },
    {
      title: 'Novedades del Mes',
      desc: 'Últimas novedades y actualizaciones.',
      icon: <NotificationsIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      path: '/novedadesdelmes',
    },
  ]

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <PageHeader title="Panel principal" trail={['Inicio']} />
      </Grid>

      {cards.map((c) => (
        <Grid item xs={12} sm={6} md={4} key={c.title}>
          <Paper
            onClick={() => navigate(c.path)}
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 3,
              cursor: 'pointer',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              gap: 1.5,
              transition: 'all 0.3s ease',
              background:
                theme.palette.mode === 'dark'
                  ? 'linear-gradient(145deg, #1E293B, #0F172A)'
                  : theme.palette.background.paper,
              color:
                theme.palette.mode === 'dark'
                  ? theme.palette.text.primary
                  : theme.palette.text.primary,
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 25px rgba(11,116,222,0.3)',
              },
            }}
          >
            {c.icon}
            <Typography variant="h6" fontWeight={700}>
              {c.title}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85 }}>
              {c.desc}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  )
}