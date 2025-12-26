import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, Snackbar, TextField, Typography, MenuItem, FormControlLabel, Checkbox
} from '@mui/material'
import { GridColDef } from '@mui/x-data-grid'
import { api } from '../helpers/api'
import SectionCard from '../components/SectionCard'
import PageHeader from '../components/PageHeader'
import ResponsiveDataGrid from '../components/ResponsiveDataGrid'
import DataGridToolbarEnhanced from '../components/DataGridToolbarEnhanced'
import { Chip } from '@mui/material'

type Persona = {
  id?: string
  legajo: string
  apellido: string
  nombre: string
  dni: string
  cuil: string
  fechaNacimiento?: string
  direccion?: string
  telefono?: string
  email?: string
  obraSocial?: string
  sexo?: string
  estadoCivil?: string
  fechaInicioActividad?: string
  titulacion?: string
  pensiones: boolean
  embargo: boolean,
  telefonoCelular?:string
}

export default function Personas() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Persona>({
    defaultValues: {
      legajo: '', apellido: '', nombre: '', dni: '', cuil: '',
      fechaNacimiento: '', direccion: '', telefono: '', email: '',
      obraSocial: '', sexo: '', estadoCivil: '', fechaInicioActividad: '', titulacion: '',
      pensiones: false, embargo: false
    }
  })

  const [rows, setRows] = useState<Persona[]>([])
  const [toast, setToast] = useState('')
  const [open, setOpen] = useState(false)

  const load = async () => {
    const res = await api.get('/users')
    setRows(res.data)
  }
  useEffect(() => { load() }, [])

  const onSubmit = async (data: Persona) => {
    const body = {
      ...data,
    }
    await api.post('/users', body)
    setToast('Persona creada correctamente')
    setOpen(false)
    reset()
    load()
  }

  const columns = useMemo<GridColDef[]>(() => [
    { field: 'legajo', headerName: 'Legajo', flex: 0.8 },
    { field: 'apellido', headerName: 'Apellido', flex: 1 },
    { field: 'nombre', headerName: 'Nombre', flex: 1 },
    { field: 'dni', headerName: 'DNI', flex: 0.8 },
    { field: 'cuil', headerName: 'CUIL', flex: 1 },
    { field: 'telefonoCelular', headerName: 'Teléfonos', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1.3 },
    { field: 'obraSocial', headerName: 'Obra Social', flex: 1 },
    { field: 'sexo', headerName: 'Sexo', flex: 0.8 },
    { field: 'estadoCivil', headerName: 'Estado Civil', flex: 1 },
    { field: 'titulacion', headerName: 'Titulación', flex: 1 },
    {
        field: 'pension',
        headerName: 'Pensión',
        flex: 0.7,
        renderCell: (params) =>
            params.value ? (
            <Chip label="Sí" color="success" size="small" />
            ) : (
            <Chip label="No" color="default" size="small" />
            ),
    },
    {
        field: 'embargo',
        headerName: 'Embargo',
        flex: 0.7,
        renderCell: (params) =>
            params.value ? (
            <Chip label="Sí" color="error" size="small" />
            ) : (
            <Chip label="No" color="default" size="small" />
            ),
    },
  ], [])

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <PageHeader title="Personas" trail={['Inicio', 'Personas']} />
      </Grid>

      <Grid item xs={12}>
        <SectionCard>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={600}>Listado de Personas</Typography>
            <Button variant="contained" onClick={() => setOpen(true)}>Nueva Persona</Button>
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
        <DialogTitle>Nueva Persona</DialogTitle>
        <DialogContent dividers>
          <Box component="form" sx={{ display: 'grid', gap: 2 }}>
            <TextField label="Legajo" {...register('legajo', { required: 'Requerido' })} error={!!errors.legajo} helperText={errors.legajo?.message} />
            <TextField label="Apellido" {...register('apellido', { required: 'Requerido' })} error={!!errors.apellido} helperText={errors.apellido?.message} />
            <TextField label="Nombre" {...register('nombre', { required: 'Requerido' })} error={!!errors.nombre} helperText={errors.nombre?.message} />
            <TextField label="DNI" {...register('dni', { required: 'Requerido' })} error={!!errors.dni} helperText={errors.dni?.message} />
            <TextField label="CUIL" {...register('cuil', { required: 'Requerido' })} error={!!errors.cuil} helperText={errors.cuil?.message} />
            <TextField type="date" label="Fecha de Nacimiento" InputLabelProps={{ shrink: true }} {...register('fechaNacimiento')} />
            <TextField label="Dirección (Prov. – calle – N° – piso – dpto.)" {...register('direccion')} />
            <TextField label="Teléfono" {...register('telefono')} />
            <TextField label="Email" type="email" {...register('email')} />
            <TextField label="Obra Social" {...register('obraSocial')} />
            <TextField select label="Sexo" defaultValue="" {...register('sexo')}>
              <MenuItem value="Masculino">Masculino</MenuItem>
              <MenuItem value="Femenino">Femenino</MenuItem>
              <MenuItem value="Otro">Otro</MenuItem>
            </TextField>
            <TextField select label="Estado Civil" defaultValue="" {...register('estadoCivil')}>
              <MenuItem value="Soltero/a">Soltero/a</MenuItem>
              <MenuItem value="Casado/a">Casado/a</MenuItem>
              <MenuItem value="Divorciado/a">Divorciado/a</MenuItem>
              <MenuItem value="Viudo/a">Viudo/a</MenuItem>
            </TextField>
            <TextField type="date" label="Fecha de Inicio Actividad Laboral" InputLabelProps={{ shrink: true }} {...register('fechaInicioActividad')} />
            <TextField label="Titulación" {...register('titulacion')} />

            <FormControlLabel control={<Checkbox {...register('pensiones')} />} label="Posee pensiones" />
            <FormControlLabel control={<Checkbox {...register('embargo')} />} label="Posee embargo" />
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