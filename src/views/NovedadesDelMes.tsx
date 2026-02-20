import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, MenuItem, Snackbar, TextField, Typography
} from '@mui/material'
import { GridColDef } from '@mui/x-data-grid'
import { api } from '../helpers/api'
import SectionCard from '../components/SectionCard'
import PageHeader from '../components/PageHeader'
import ResponsiveDataGrid from '../components/ResponsiveDataGrid'
import DataGridToolbarEnhanced from '../components/DataGridToolbarEnhanced'

type Novedad = {
  id?: string
  accion: string
  usuario: string
  tipoLicencia?: string | null
  observaciones?: string | null
  cambios?: Record<string, any> | null
  fechaSistema?: string | null
  fechaModificacion?: string | null
  miLicencia?: any
  licencia?: any
  servicio?: any
}

type SimpleUser = { id: string; apellido: string; nombre: string }

export default function NovedadesDelMes() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<any>({
    defaultValues: {
      user: { id: '' }, tipo: '', fechaInicio: '', fechaFin: '', observaciones: ''
    }
  })

  const [rows, setRows] = useState<Novedad[]>([])
  const [users, setUsers] = useState<SimpleUser[]>([])
  const [toast, setToast] = useState('')
  const [open, setOpen] = useState(false)

  const load = async () => {
    const [lics, u] = await Promise.all([
      api.get('/novedad'),
      api.get('/users'),
    ])
    console.log("datos novedad",lics.data)
    setRows(lics.data)
    setUsers(u.data)
  }
  useEffect(() => { load() }, [])

  const onSubmit = async (data: any) => {
    const body = {
      user: { id: data.user.id },
      tipo: data.tipo,
      fechaInicio: data.fechaInicio,
      fechaFin: data.fechaFin,
      observaciones: data.observaciones
    }
    await api.post('/licencias', body)
    setToast('Licencia creada correctamente')
    setOpen(false)
    reset()
    load()
  }

  const columns = useMemo<GridColDef[]>(() => [
    { field: 'accion', headerName: 'Acción', flex: 1.2 },
    { field: 'usuario', headerName: 'Usuario', flex: 1.2 },
    { field: 'tipoLicencia', headerName: 'Tipo Licencia', flex: 1.2 },
    { field: 'observaciones', headerName: 'Observaciones', flex: 1.5 },
    {
      field: 'cambios',
      headerName: 'Cambios',
      flex: 2,
      valueGetter: (p) => {
        const cambios = p.row.cambios
        if (!cambios) return ''
        return Object.entries(cambios)
          .map(([k, v]) => `${k}: ${v}`)
          .join(' | ')
      }
    },
    { field: 'fechaSistema', headerName: 'Fecha Sistema', flex: 1 },
    { field: 'fechaModificacion', headerName: 'Fecha Modificación', flex: 1 },
  ], [])

  const userNameById = useMemo(() => {
    const map = new Map<string, string>()
    users.forEach((u) => {
      const fullName = `${u.apellido || ''} ${u.nombre || ''}`.trim()
      map.set(u.id, fullName)
    })
    return map
  }, [users])

  const resolveUsuario = (r: Novedad) => {
    const raw = r.usuario
    const normalized = raw && raw !== 'undefined' && raw !== 'null' ? raw : ''
    if (normalized) return normalized

    const fromUser = (u?: any) =>
      u ? `${u.apellido || ''} ${u.nombre || ''}`.trim() : ''

    const nestedUserName =
      fromUser(r.miLicencia?.user) ||
      fromUser(r.licencia?.user) ||
      fromUser((r as any).user)

    if (nestedUserName) return nestedUserName

    const userId =
      r.miLicencia?.userId ||
      r.miLicencia?.user?.id ||
      r.licencia?.userId ||
      r.licencia?.user?.id ||
      (r as any).userId ||
      (r as any).user?.id

    if (userId && userNameById.has(userId)) {
      return userNameById.get(userId) || ''
    }

    return ''
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <PageHeader title="Novedades del Mes" trail={['Inicio', 'Novedades del Mes']} />
      </Grid>

      <Grid item xs={12}>
        <SectionCard>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={600}>Listado</Typography>
            {/* <Button variant="contained" onClick={() => setOpen(true)}>Nueva Licencia</Button> */}
          </Box>

          <Box sx={{ mt: 2 }}>
            <ResponsiveDataGrid
              fill
              rows={rows.map((r, i) => ({
                id: r.id || i,
                accion: r.accion,
                usuario: resolveUsuario(r),
                tipoLicencia: r.tipoLicencia || r.miLicencia?.tipo?.nombre || r.licencia?.tipo?.nombre || '',
                observaciones: r.observaciones || r.miLicencia?.observaciones || r.licencia?.observaciones || '',
                cambios: r.cambios,
                fechaSistema: r.fechaSistema || r.miLicencia?.fechaSistema || r.licencia?.fechaSistema || '',
                fechaModificacion: r.fechaModificacion || '',
                miLicencia: r.miLicencia,
                licencia: r.licencia,
                servicio: r.servicio,
              }))}
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
        {/* <DialogTitle>Nueva </DialogTitle> */}
        <DialogContent dividers>
          <Box component="form" sx={{ display: 'grid', gap: 2 }}>
            <TextField select label="Usuario" {...register('user.id', { required: 'Requerido' })} error={!!(errors as any).user?.id}>
              {users.map(u => <MenuItem key={u.id} value={u.id}>{u.apellido}, {u.nombre}</MenuItem>)}
            </TextField>
            <TextField label="Tipo" {...register('tipo', { required: 'Requerido' })} error={!!(errors as any).tipo} helperText={(errors as any).tipo?.message} />
            <TextField type="date" label="Fecha Inicio" InputLabelProps={{ shrink: true }} {...register('fechaInicio', { required: 'Requerido' })} />
            <TextField type="date" label="Fecha Fin" InputLabelProps={{ shrink: true }} {...register('fechaFin', { required: 'Requerido' })} />
            <TextField label="Observaciones" multiline rows={2} {...register('observaciones')} />
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