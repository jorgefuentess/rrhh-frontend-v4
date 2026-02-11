import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  MenuItem,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { api } from "../helpers/api";
import SectionCard from "../components/SectionCard";
import PageHeader from "../components/PageHeader";
import ResponsiveDataGrid from "../components/ResponsiveDataGrid";
import DataGridToolbarEnhanced from "../components/DataGridToolbarEnhanced";

type Licencia = {
  id?: string;
  user: { id: string };
  tipo: string;
  fechaInicio: string;
  fechaFin: string;
  observaciones?: string;
};

type SimpleUser = { id: string; apellido: string; nombre: string };

export default function Licencias() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Licencia>({
    defaultValues: {
      user: { id: "" },
      tipo: "",
      fechaInicio: "",
      fechaFin: "",
      observaciones: "",
    },
  });

  const [rows, setRows] = useState<Licencia[]>([]);
  const [users, setUsers] = useState<SimpleUser[]>([]);
  const [tipoLicencia, setTipoLicencia] = useState<any[]>([]);

  const [toast, setToast] = useState("");
  const [open, setOpen] = useState(false);

  const load = async () => {
    const [lics, u, tl] = await Promise.all([
      api.get("/licencias"),
      api.get("/users"),
      api.get("/tipoLicencia"),
    ]);
    setRows(lics.data);
    setUsers(u.data);
    setTipoLicencia(tl.data);
  };
  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (data: Licencia) => {
    try {
      const bodyLicencia = {
        user: { id: data.user.id },
        tipo: data.tipo,
        fechaInicio: data.fechaInicio,
        fechaFin: data.fechaFin,
        observaciones: data.observaciones,
      };

      // 1️⃣ Crear licencia
      const licenciaResponse = await api.post("/licencias", bodyLicencia);

      console.log("licencia creada", licenciaResponse);
      const licenciaCreada = licenciaResponse.data;

      // 2️⃣ Crear novedad con el id de la licencia
      const bodyNovedad = {
        licenciaId: licenciaCreada.id,
        accion: "CREACIÓN DE LICENCIA",
      };

      await api.post("/novedad", bodyNovedad);

      // 3️⃣ UI
      setToast("Licencia y novedad creadas correctamente");
      setOpen(false);
      reset();
      load();
    } catch (error) {
      console.error(error);
      setToast("Error al crear la licencia");
    }
  };

  const columns = useMemo<GridColDef[]>(
    () => [
      {
        field: "user",
        headerName: "Usuario",
        flex: 1.5,
        valueGetter: (p) =>
          `${p.row.user?.apellido || ""} ${p.row.user?.nombre || ""}`,
      },
      {
        field: "tipo",
        headerName: "Tipo Usuario",
        flex: 1.5,
        valueGetter: (p) =>
          `${p.row.tipo?.descripcion}`,
      },
    
      { field: "fechaInicio", headerName: "Inicio", flex: 1 },
      { field: "fechaFin", headerName: "Fin", flex: 1 },
      { field: "observaciones", headerName: "Observaciones", flex: 1.5 },
    ],
    [],
  );

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <PageHeader title="Licencias" trail={["Inicio", "Licencias"]} />
      </Grid>

      <Grid item xs={12}>
        <SectionCard>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" fontWeight={600}>
              Listado
            </Typography>
            <Button variant="contained" onClick={() => setOpen(true)}>
              Nueva Licencia
            </Button>
          </Box>

          <Box sx={{ mt: 2 }}>
            <ResponsiveDataGrid
              fill
              rows={rows.map((r, i) => ({ id: r.id || i, ...r }))}
              columns={columns}
              slots={{ toolbar: DataGridToolbarEnhanced }}
              initialState={{
                pagination: { paginationModel: { pageSize: 10, page: 0 } },
              }}
              pageSizeOptions={[5, 10, 20]}
            />
          </Box>
        </SectionCard>
      </Grid>

      {/* Modal de alta */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Nueva Licencia</DialogTitle>
        <DialogContent dividers>
          <Box component="form" sx={{ display: "grid", gap: 2 }}>
            <TextField
              select
              label="Usuario"
              {...register("user.id", { required: "Requerido" })}
              error={!!errors.user?.id}
            >
              {users.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {u.apellido}, {u.nombre}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Tipo Licencia"
              {...register("tipo", { required: "Requerido" })}
            >
              {tipoLicencia.map((tl) => (
                <MenuItem key={tl.id} value={tl.id}>
                  {tl.nombre}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              type="date"
              label="Fecha Inicio"
              InputLabelProps={{ shrink: true }}
              {...register("fechaInicio", { required: "Requerido" })}
            />
            <TextField
              type="date"
              label="Fecha Fin"
              InputLabelProps={{ shrink: true }}
              {...register("fechaFin", { required: "Requerido" })}
            />
            <TextField
              label="Observaciones"
              multiline
              rows={2}
              {...register("observaciones")}
            />
          </Box>
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
