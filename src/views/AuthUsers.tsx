import { useEffect, useMemo, useState } from "react";
import { api } from "../helpers/api";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useForm, Controller } from "react-hook-form";
import SectionCard from "../components/SectionCard";
import PageHeader from "../components/PageHeader";
import DataGridToolbarEnhanced from "../components/DataGridToolbarEnhanced";

type AuthUser = {
  id?: number;
  username: string;
  role: "admin" | "docente" | "secretario";
  activo: boolean;
  password?: string;
  personaId?: string;
};

type Persona = {
  id: string;
  apellido: string;
  nombre: string;
  dni: string;
  legajo?: string;
};

export default function AuthUsers() {
  const [rows, setRows] = useState<AuthUser[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AuthUser | null>(null);
  const [toast, setToast] = useState("");

  const { register, handleSubmit, reset, control, watch } = useForm<AuthUser>({
    defaultValues: {
      username: "",
      role: "docente",
      activo: true,
      password: "",
      personaId: "",
    },
  });

  const load = async () => {
    const res = await api.get("/auth/users");
    setRows(res.data);
  };

  const loadPersonas = async () => {
    try {
      const res = await api.get("/users");
      setPersonas(res.data);
    } catch (error) {
      console.error("Error cargando personas:", error);
    }
  };

  useEffect(() => {
    load();
    loadPersonas();
  }, []);

  const columns = useMemo<GridColDef[]>(
    () => [
      { field: "id", headerName: "ID", width: 90 },
      { field: "username", headerName: "Usuario", flex: 1 },
      { field: "role", headerName: "Rol", flex: 1 },
      {
        field: "activo",
        headerName: "Activo",
        flex: 1,
        valueGetter: (p) => (p.row.activo ? "Sí" : "No"),
      },
      {
        field: "actions",
        headerName: "Acciones",
        width: 280,
        renderCell: (params) => (
          <div style={{ display: "flex", gap: 8 }}>
            <Button
              size="small"
              variant="contained"
              onClick={() => onCreate()}
            >
              Nuevo
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => onEdit(params.row)}
            >
              Editar
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={() => onDelete(params.row.id)}
            >
              Eliminar
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  const onCreate = () => {
    setEditing(null);
    reset({
      username: "",
      role: "docente",
      activo: true,
      password: "",
      personaId: "",
    });
    setOpen(true);
  };

  const onEdit = (row: AuthUser) => {
    setEditing(row);
    reset({
      ...row,
      password: "",
    });
    setOpen(true);
  };

  const onDelete = async (id: number) => {
    await api.delete(`/auth/users/${id}`);
    setToast("Eliminado correctamente");
    load();
  };

  const onSubmit = async (data: AuthUser) => {
    if (editing?.id) {
      // Editar: puede actualizar rol, activo, password y personaId
      const updateData: any = {
        role: data.role,
        activo: data.activo,
      };
      if (data.password) updateData.password = data.password;
      if (data.personaId) updateData.personaId = data.personaId;
      
      await api.put(`/auth/users/${editing.id}`, updateData);
      setToast("Actualizado correctamente");
    } else {
      // Crear: si tiene personaId usa endpoint de vinculación, sino crea solo usuario
      if (data.personaId) {
        // Vincular usuario con persona
        await api.post("/auth/users/link-persona", {
          username: data.username,
          password: data.password,
          role: data.role,
          personaId: data.personaId,
        });
        setToast("Usuario vinculado a persona correctamente");
      } else {
        // Crear solo usuario (sin persona)
        await api.post("/auth/users", {
          username: data.username,
          password: data.password,
          role: data.role,
          activo: true,
        });
        setToast("Usuario creado correctamente");
      }
    }

    setOpen(false);
    load();
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <PageHeader
          title="Usuarios del Sistema"
          trail={["Inicio", "Administración", "Usuarios del Sistema"]}
        />
      </Grid>

      <Grid item xs={12}>
        <SectionCard>
          <div style={{ height: 560, width: "100%" }}>
            <DataGrid
              rows={rows.map((r) => ({ id: r.id, ...r }))}
              columns={columns}
              slots={{ toolbar: DataGridToolbarEnhanced }}
              initialState={{
                pagination: { paginationModel: { pageSize: 10, page: 0 } },
              }}
              pageSizeOptions={[5, 10, 20]}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: 12,
            }}
          >
          </div>
        </SectionCard>
      </Grid>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editing ? "Editar usuario" : "Nuevo usuario"}
        </DialogTitle>

        <DialogContent sx={{ pt: 1, display: "grid", gap: 2 }}>
          {/* Selector de modo (solo si está creando) */}
          {!editing && (
            <Box sx={{ p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                📌 Opciones:
              </Typography>
              <Typography variant="body2" sx={{ color: "#666" }}>
                Crea un usuario de sistema. Opcionalmente puedes vincularlo a una persona existente.
              </Typography>
            </Box>
          )}

          <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 600 }}>
            📋 Datos de Autenticación
          </Typography>

          <TextField
            label="Usuario"
            fullWidth
            disabled={!!editing}
            {...register("username", { required: true })}
          />

          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <TextField select label="Rol" fullWidth {...field}>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="docente">Docente</MenuItem>
                <MenuItem value="secretario">Secretario</MenuItem>
              </TextField>
            )}
          />

          <Controller
            name="activo"
            control={control}
            render={({ field }) => (
              <TextField
                select
                label="Activo"
                fullWidth
                value={field.value ? "true" : "false"}
                onChange={(e) => field.onChange(e.target.value === "true")}
              >
                <MenuItem value="true">Sí</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </TextField>
            )}
          />

          <TextField
            label="Contraseña"
            type="password"
            fullWidth
            helperText={editing ? "Dejar vacío para no cambiar" : ""}
            {...register("password")}
          />

          {/* ========== PERSONA EXISTENTE (Opcional) ========== */}
          <Typography variant="subtitle2" sx={{ mt: 3, fontWeight: 600 }}>
            👤 Vincular a Persona (Opcional)
          </Typography>

          <Controller
            name="personaId"
            control={control}
            render={({ field, fieldState }) => (
              <>
                <TextField
                  select
                  label="Persona"
                  fullWidth
                  {...field}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message || "Dejar en blanco si prefieres crear sin persona"}
                >
                  <MenuItem value="">-- Sin vincular --</MenuItem>
                  {personas.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.apellido}, {p.nombre} (DNI: {p.dni})
                    </MenuItem>
                  ))}
                </TextField>
              </>
            )}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit(onSubmit)}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!toast}
        autoHideDuration={2500}
        onClose={() => setToast("")}
        message={toast}
      />
    </Grid>
  );
}
