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
  Tooltip,
  IconButton,
} from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { api } from "../helpers/api";
import SectionCard from "../components/SectionCard";
import PageHeader from "../components/PageHeader";
import ResponsiveDataGrid from "../components/ResponsiveDataGrid";
import DataGridToolbarEnhanced from "../components/DataGridToolbarEnhanced";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";

type Licencia = {
  id?: string;
  user: { id: string };
  tipo: string;
  fechaInicio: string;
  fechaFin: string;
  observaciones?: string;
};

type SimpleUser = { id: string; apellido: string; nombre: string };

export default function MiLicencia() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<any>({
    defaultValues: {
      user: { id: "" },
      tipo: "",
      fechaInicio: "",
      fechaFin: "",
      observaciones: "",
      archivo: null,
    },
  });

  const [rows, setRows] = useState<Licencia[]>([]);
  const [users, setUsers] = useState<SimpleUser[]>([]);
  const [tipoLicencia, setTipoLicencia] = useState<any[]>([]);
  const [toast, setToast] = useState("");
  const [open, setOpen] = useState(false);

  const load = async () => {
    const [milics, u, tl] = await Promise.all([
      api.get("/milicencias"),
      api.get("/users"),
      api.get("/tipoLicencia"),
    ]);
    console.log(milics.data);
    setRows(milics.data);
    console.log("milicencia",milics.data)
    setUsers(u.data);
    setTipoLicencia(tl.data);
  };
  useEffect(() => {
    load();
  }, []);

const onSubmit = async (data: any) => {
  const formData = new FormData();

  formData.append("userId", data.user.id); // o userId si lo preferís
  formData.append("tipo", data.tipo.id);
  formData.append("fechaInicio", data.fechaInicio);
  formData.append("fechaFin", data.fechaFin);
  formData.append("observaciones", data.observaciones || "");

  if (data.archivo?.length > 0) {
    formData.append("archivo", data.archivo[0]);
  }

  console.log("formData listo");

  await api.post("/milicencias", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  setToast("Licencia creada correctamente");
  setOpen(false);
  reset();
  load();
};

  const handleView = (row: any) => {
    console.log("Ver:", row);
    // abrir modal, navegar, etc
  };

  const handleDownload = (row: any) => {
    console.log("Descargar:", row);
    // lógica de descarga
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
        headerName: "Tipo licencia",
        flex: 1.5,
        valueGetter: (p) =>
          `${p.row.tipo?.nombre || ""} `,
      },
      { field: "fechaSistema", headerName: "Fecha Sistema", flex: 1 },
      // { field: 'fechaFin', headerName: 'Fin', flex: 1 },
      { field: "observaciones", headerName: "Observaciones", flex: 1.5 },
      { field: "nombre", headerName: "Nombre Archivo", flex: 1.5 },

      {
        field: "actions",
        headerName: "Acciones",
        flex: 1.5,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <>
            <Tooltip title="Ver">
              <IconButton
                size="small"
                color="primary"
                onClick={() => handleView(params.row)}
              >
                <VisibilityIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Descargar">
              <IconButton
                size="small"
                color="success"
                onClick={() => handleDownload(params.row)}
              >
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          </>
        ),
      },
    ],
    []
  );

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <PageHeader title="Mi Licencia" trail={["Inicio", "Mi Licencia"]} />
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
              {...register("tipo.id", { required: "Requerido" })}
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

            {/* SUBIR ARCHIVO */}
            <Button variant="outlined" component="label">
              Subir archivo
              <input type="file" hidden {...register("archivo")} />
            </Button>
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
