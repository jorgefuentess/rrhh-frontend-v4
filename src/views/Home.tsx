import { Grid, Typography, Paper, useTheme, Box } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { useAuth } from '../state/AuthContext'
import { getVisibleMenuItems } from '../config/menuConfig'
import { getIcon } from '../config/iconMap'

export default function Home() {
  const theme = useTheme()
  const navigate = useNavigate()
  const { user } = useAuth()

  // Obtener menú visible según roles
  const visibleItems = user ? getVisibleMenuItems(user.roles) : []

  // Mapeo de descripción por ruta (para mejorar UX)
  const descriptionMap: Record<string, string> = {
    '/personas': 'Alta y gestión de docentes y agentes.',
    '/servicios': 'Altas, bajas, secciones, materias y carácter.',
    '/ddjj': 'Declaraciones Juradas.',
    '/licencias': 'Registro y control de plazos.',
    '/auth-users': 'Gestión de usuarios y permisos del sistema.',
    '/milicencia': 'Consulta tu licencia personal.',
    '/nodocente': 'Información del personal no docente.',
    '/servicionodocente': 'Servicios del personal no docente.',
    '/novedadesdelmes': 'Últimas novedades y actualizaciones.',
  }

  // Filtrar inicio (siempre visible) y mapear con descripciones
  const cards = visibleItems
    .filter(item => item.path !== '/')
    .map(item => ({
      title: item.text,
      desc: descriptionMap[item.path] || 'Acceder a esta sección',
      iconName: item.iconName,
      path: item.path,
    }))

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
            <Box sx={{ fontSize: 40, color: theme.palette.primary.main }}>
              {getIcon(c.iconName)}
            </Box>
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