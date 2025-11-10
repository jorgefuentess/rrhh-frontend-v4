import { useForm } from 'react-hook-form'
import { api } from '../helpers/api'
import { useAuth } from '../state/AuthContext'
import { Alert, Box, Button, Card, CardContent, Container, Divider, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

type LoginForm = { username: string; password: string }

export default function Login(){
  const { register, handleSubmit } = useForm<LoginForm>({ defaultValues: { username:'', password:'' } })
  const { login } = useAuth()
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const onSubmit = async (data:LoginForm) => {
    setError(''); setLoading(true)
    try {
      const res = await api.post('/auth/login', data)
      login(res.data.access_token, res.data.user)
      navigate('/')
    } catch (e:any) {
      setError(e?.response?.data?.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="sm" sx={{ display:'grid', placeItems:'center', minHeight:'100vh' }}>
      <Card sx={{ width:'100%', overflow:'hidden' }}>
        <Box sx={{ height:6, background:'linear-gradient(90deg, #0B74DE, #4FA3FF)' }} />
        <CardContent sx={{ p:4 }}>
          <Stack spacing={2} alignItems="center" sx={{ mb:2 }}>
            <Box sx={{ width:48, height:48, borderRadius:2, bgcolor:'primary.main', display:'grid', placeItems:'center', color:'#fff', fontWeight:800 }}>RH</Box>
            <Typography variant="h5" fontWeight={700}>Ingresar</Typography>
            <Typography variant="body2" color="text.secondary">Autenticación requerida para acceder al sistema</Typography>
          </Stack>

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display:'grid', gap:2 }}>
            <TextField label="Usuario" {...register('username', { required: true })} />
            <TextField label="Contraseña" type="password" {...register('password', { required: true })} />
            <Button type="submit" variant="contained" disabled={loading}>{loading ? 'Validando...' : 'Entrar'}</Button>
            {error && <Alert severity="error">{error}</Alert>}
            <Divider />
            <Typography variant="body2" color="text.secondary" align="center">
              Admin por defecto: <b>admin / admin123</b>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  )
}