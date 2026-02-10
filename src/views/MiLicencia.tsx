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
    watch,
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
  // archivo
  const [openArchivo, setOpenArchivo] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);

  const load = async () => {
    const [milics, u, tl] = await Promise.all([
      api.get("/milicencias"),
      api.get("/users"),
      api.get("/tipoLicencia"),
    ]);
    setRows(milics.data);
    setUsers(u.data);
    setTipoLicencia(tl.data);
  };
  useEffect(() => {
    load();
  }, []);
const archivo = watch("archivo");
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

  const handleView = async (id: string) => {
    const res = await api.post(
      "/milicencias/view",
      { id },
      { responseType: "blob" },
    );

    const blob = new Blob([res.data], {
      type: res.headers["content-type"],
    });

    const url = URL.createObjectURL(blob);
    setFileUrl(url);
    setOpenArchivo(true);
  };

  const handleDownload = async (id: string) => {
    const response = await api.post(
      "/milicencias/download",
      { id },
      { responseType: "blob" },
    );

    const blob = new Blob([response.data], {
      type: response.headers["content-type"],
    });

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "archivo"; // opcional
    document.body.appendChild(a);
    a.click();

    a.remove();
    window.URL.revokeObjectURL(url);
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
        valueGetter: (p) => `${p.row.tipo?.nombre || ""} `,
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
                onClick={() => handleView(params.row.id)}
              >
                <VisibilityIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Descargar">
              <IconButton
                size="small"
                color="success"
                onClick={() => handleDownload(params.row.id)}
              >
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          </>
        ),
      },
    ],
    [],
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
              <input type="file"  accept="application/pdf,image/*" hidden {...register("archivo")} />
            </Button>
           {/* Mostrar nombre del archivo */}
           {archivo && archivo.length > 0 && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              📎 Archivo seleccionado: <strong>{archivo[0].name}</strong>
            </Typography>
)}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit(onSubmit)}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openArchivo}
        onClose={() => setOpenArchivo(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Vista previa del archivo</DialogTitle>
        <DialogContent
          dividers
          sx={{
            height: 600,
            overflow: "hidden", // 🔥 clave para quitar scroll
          }}
        >
          {fileUrl && mimeType?.startsWith("image/") && (
            <Box
              sx={{
                width: "50%",
                height: "50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#fafafa",
              }}
            >
              <img
                src={fileUrl}
                alt="archivo"
                style={{
                  maxWidth: "50%",
                  maxHeight: "50%",
                  objectFit: "contain", // 🔥 se ve completa
                }}
              />
            </Box>
          )}

          {fileUrl && !mimeType?.startsWith("image/") && (
            <object
              data={fileUrl}
              type={mimeType || "application/pdf"}
              width="100%"
              height="100%"
            />
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenArchivo(false)}>Cerrar</Button>
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
