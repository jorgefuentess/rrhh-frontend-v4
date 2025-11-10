import { useEffect, useMemo, useState } from 'react'
import { api } from '../helpers/api'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem, Snackbar, TextField } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { useForm } from 'react-hook-form'
import SectionCard from '../components/SectionCard'
import PageHeader from '../components/PageHeader'
import DataGridToolbarEnhanced from '../components/DataGridToolbarEnhanced'

type AuthUser = { id?: number; username: string; role: 'admin' | 'docente'; activo: boolean; password?: string }

export default function AuthUsers(){
  const [rows, setRows] = useState<AuthUser[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<AuthUser | null>(null)
  const [toast, setToast] = useState('')
  const { register, handleSubmit, reset } = useForm<AuthUser>({ defaultValues: { username:'', role:'docente', activo:true, password:'' } })

  const load = async()=> { const res = await api.get('/auth/users'); setRows(res.data) }
  useEffect(()=>{ load() }, [])

  const columns = useMemo<GridColDef[]>(() => [
    { field:'id', headerName:'ID', width:90 },
    { field:'username', headerName:'Usuario', flex:1 },
    { field:'role', headerName:'Rol', flex:1 },
    { field:'activo', headerName:'Activo', flex:1, valueGetter: (p)=> p.row.activo ? 'Sí' : 'No' },
    { field:'actions', headerName:'Acciones', width:220, renderCell:(params)=>(
      <div style={{display:'flex', gap:8}}>
        <Button size="small" variant="outlined" onClick={()=>onEdit(params.row)}>Editar</Button>
        <Button size="small" variant="outlined" color="error" onClick={()=>onDelete(params.row.id)}>Eliminar</Button>
      </div>
    ) },
  ], [])

  const onCreate = ()=>{ setEditing(null); reset({ username:'', role:'docente', activo:true, password:'' }); setOpen(true) }
  const onEdit = (row:AuthUser)=>{ setEditing(row); reset({ ...row, password:'' }); setOpen(true) }
  const onDelete = async(id:number)=>{ await api.delete(`/auth/users/${id}`); setToast('Eliminado'); load() }

  const onSubmit = async (data:AuthUser)=>{
    if(editing?.id){ await api.put(`/auth/users/${editing.id}`, data); setToast('Actualizado') }
    else { await api.post('/auth/users', data); setToast('Creado') }
    setOpen(false); load()
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <PageHeader title="Usuarios del Sistema" trail={['Inicio','Administración','Usuarios del Sistema']} />
      </Grid>
      <Grid item xs={12}>
        <SectionCard>
          <div style={{ height: 560, width: '100%' }}>
            <DataGrid
              rows={rows.map(r => ({ id:r.id, ...r }))}
              columns={columns}
              slots={{ toolbar: DataGridToolbarEnhanced }}
              initialState={{ pagination:{ paginationModel:{ pageSize:10, page:0 } } }}
              pageSizeOptions={[5,10,20]}
            />
          </div>
          <div style={{ display:'flex', justifyContent:'flex-end', marginTop:12 }}>
            <Button variant="contained" onClick={onCreate}>Nuevo</Button>
          </div>
        </SectionCard>
      </Grid>

      <Dialog open={open} onClose={()=>setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Editar usuario' : 'Nuevo usuario'}</DialogTitle>
        <DialogContent sx={{ pt:1, display:'grid', gap:2 }}>
          <TextField label="Usuario" {...register('username', { required: true })} />
          <TextField select label="Rol" defaultValue="docente" {...register('role')}>
            <MenuItem value="admin">admin</MenuItem>
            <MenuItem value="docente">docente</MenuItem>
          </TextField>
          <TextField select label="Activo" defaultValue="true" {...register('activo')}>
            <MenuItem value="true">Sí</MenuItem>
            <MenuItem value="false">No</MenuItem>
          </TextField>
          <TextField label="Contraseña" type="password" helperText={editing ? 'Dejar vacío para no cambiar' : ''} {...register('password')} />
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit(onSubmit)}>Guardar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!toast} autoHideDuration={2500} onClose={()=>setToast('')} message={toast} />
    </Grid>
  )
}