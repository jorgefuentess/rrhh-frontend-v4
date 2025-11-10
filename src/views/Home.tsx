import { Grid, Typography, Paper, useTheme } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import GroupIcon from '@mui/icons-material/Group'
import WorkHistoryIcon from '@mui/icons-material/WorkHistory'
import EventAvailableIcon from '@mui/icons-material/EventAvailable'

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
      title: 'Licencias',
      desc: 'Registro y control de plazos.',
      icon: <EventAvailableIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      path: '/licencias',
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