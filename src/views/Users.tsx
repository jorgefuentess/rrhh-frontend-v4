import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, Snackbar, TextField, Typography
} from '@mui/material'
import { GridColDef } from '@mui/x-data-grid'
import { api } from '../helpers/api'
import SectionCard from '../components/SectionCard'
import PageHeader from '../components/PageHeader'
import ResponsiveDataGrid from '../components/ResponsiveDataGrid'
import DataGridToolbarEnhanced from '../components/DataGridToolbarEnhanced'

type User = {
  id?: string
  apellido: string
  nombre: string
  dni: string
  cuil: string
  direccion?: string
  telefono?: string
  email?: string
  role?: string
}

export default function Users() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<User>({
    defaultValues: {
      apellido: '', nombre: '', dni: '', cuil: '', direccion: '', telefono: '', email: '', role: 'user'
    }
  })

  const [rows, setRows] = useState<User[]>([])
  const [toast, setToast] = useState('')
  const [open, setOpen] = useState(false)

  const load = async () => {
    const res = await api.get('/users')
    setRows(res.data)
  }
  useEffect(() => { load() }, [])

  const onSubmit = async (data: User) => {
    await api.post('/users', data)
    setToast('Usuario creado correctamente')
    setOpen(false)
    reset()
    load()
  }

  const columns = useMemo<GridColDef[]>(() => [
    { field: 'apellido', headerName: 'Apellido', flex: 1 },
    { field: 'nombre', headerName: 'Nombre', flex: 1 },
    { field: 'dni', headerName: 'DNI', flex: 0.8 },
    { field: 'cuil', headerName: 'CUIL', flex: 1 },
    { field: 'telefono', headerName: 'Teléfono', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1.5 },
    { field: 'role', headerName: 'Rol', flex: 0.8 },
  ], [])

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <PageHeader title="Usuarios" trail={['Inicio', 'Usuarios']} />
      </Grid>

      <Grid item xs={12}>
        <SectionCard>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={600}>Listado</Typography>
            <Button variant="contained" onClick={() => setOpen(true)}>Nuevo Usuario</Button>
          </Box>

          <Box sx={{ mt: 2 }}>
            <ResponsiveDataGrid
              fill
              rows={rows.map((r, i) => ({ id: r.id || i, ...r }))}
              columns={columns}
              slots={{ toolbar: DataGridToolbarEnhanced }}
              initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
              pageSizeOptions={[5, 10, 20]}
            />
          </Box>
        </SectionCard>
      </Grid>

      {/* Modal de alta */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nuevo Usuario</DialogTitle>
        <DialogContent dividers>
          <Box component="form" sx={{ display: 'grid', gap: 2 }}>
            <TextField label="Apellido" {...register('apellido', { required: 'Requerido' })} error={!!errors.apellido} helperText={errors.apellido?.message} />
            <TextField label="Nombre" {...register('nombre', { required: 'Requerido' })} error={!!errors.nombre} helperText={errors.nombre?.message} />
            <TextField label="DNI" {...register('dni', { required: 'Requerido' })} error={!!errors.dni} helperText={errors.dni?.message} />
            <TextField label="CUIL" {...register('cuil', { required: 'Requerido' })} error={!!errors.cuil} helperText={errors.cuil?.message} />
            <TextField label="Dirección" {...register('direccion')} />
            <TextField label="Teléfono" {...register('telefono')} />
            <TextField label="Email" type="email" {...register('email')} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit(onSubmit)}>Guardar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!toast} autoHideDuration={2500} onClose={() => setToast('')} message={toast} />
    </Grid>
  )
}