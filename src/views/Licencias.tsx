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
  CircularProgress,
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
  user: any;
  tipo: any;
  fechaInicio: string;
  fechaFin: string;
  observaciones?: string;
  nombre?: string;
};

type SimpleUser = { id: string; apellido: string; nombre: string };

export default function Licencia() {
  const { watch, register, handleSubmit, reset } = useForm<any>({
    defaultValues: {
      user: { id: "" },
      tipo: { id: "" },
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const archivo = watch("archivo");

  const isEditing = Boolean(editingId);

  // =========================
  // LOAD DATA
  // =========================
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

  // =========================
  // OPEN NEW
  // =========================
  const handleNew = () => {
    setEditingId(null);

    reset({
      user: { id: "" },
      tipo: { id: "" },
      fechaInicio: "",
      fechaFin: "",
      observaciones: "",
      archivo: null,
    });

    setOpen(true);
  };

  // =========================
  // EDIT
  // =========================
  const onEdit = (row: any) => {
    console.log("row datos",row)
    setEditingId(row.id);

    reset({
      user: { id: row.user?.id },
      tipo: { id: row.tipo?.id },
      fechaInicio: row.fechaInicio?.split("T")[0],
      fechaFin: row.fechaFin?.split("T")[0],
      observaciones: row.observaciones || "",
      archivo: null,
    });

    setOpen(true);
  };

  // =========================
  // CREATE / UPDATE
  // =========================
  const onSubmit = async (data: any) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("userId", data.user.id);
      formData.append("tipo", data.tipo.id);
      formData.append("fechaInicio", data.fechaInicio);
      formData.append("fechaFin", data.fechaFin);
      formData.append("observaciones", data.observaciones || "");

      if (data.archivo?.length > 0) {
        formData.append("archivo", data.archivo[0]);
      }

      if (isEditing) {
        await api.put(`/milicencias/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        setToast("Licencia actualizada correctamente");
      } else {
        await api.post("/milicencias", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        setToast("Licencia creada correctamente");
      }

      setOpen(false);
      setEditingId(null);
      reset();
      load();
    } catch (error) {
      setToast("Error al guardar licencia");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // VIEW FILE
  // =========================
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
    window.open(url);
  };

  // =========================
  // DOWNLOAD FILE
  // =========================
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
    a.download = "archivo";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  // =========================
  // COLUMNS
  // =========================
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
        valueGetter: (p) => `${p.row.tipo?.nombre || ""}`,
      },
      { field: "fechaSistema", headerName: "Fecha Sistema", flex: 1 },
      { field: "observaciones", headerName: "Observaciones", flex: 1.5 },
      { field: "nombre", headerName: "Nombre Archivo", flex: 1.5 },
      {
        field: "actions",
        headerName: "Acciones",
        flex: 2,
        sortable: false,
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

            <Button
              size="small"
              variant="outlined"
              color="warning"
              onClick={() => onEdit(params.row)}
              sx={{ ml: 1 }}
            >
              Editar
            </Button>
          </>
        ),
      },
    ],
    [],
  );

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <PageHeader title="Licencia" trail={["Inicio", "Licencia"]} />
      </Grid>

      <Grid item xs={12}>
        <SectionCard>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="h6">Listado</Typography>
            <Button variant="contained" onClick={handleNew}>
              Nueva Licencia
            </Button>
          </Box>

          <Box mt={2}>
            <ResponsiveDataGrid
              rows={rows.map((r, i) => ({ id: r.id || i, ...r }))}
              columns={columns}
              slots={{ toolbar: DataGridToolbarEnhanced }}
              pageSizeOptions={[5, 10, 20]}
            />
          </Box>
        </SectionCard>
      </Grid>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {isEditing ? "Editar Licencia" : "Nueva Licencia"}
        </DialogTitle>

        <DialogContent dividers>
          <Box component="form" sx={{ display: "grid", gap: 2 }}>
            <TextField select label="Usuario" {...register("user.id")}>
              {users.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {u.apellido}, {u.nombre}
                </MenuItem>
              ))}
            </TextField>

            <TextField select label="Tipo Licencia" {...register("tipo.id")}>
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
              {...register("fechaInicio")}
            />

            <TextField
              type="date"
              label="Fecha Fin"
              InputLabelProps={{ shrink: true }}
              {...register("fechaFin")}
            />

            <TextField
              label="Observaciones"
              multiline
              rows={2}
              {...register("observaciones")}
            />

            <Button variant="outlined" component="label">
              Subir archivo
              <input type="file" hidden {...register("archivo")} />
            </Button>

            {archivo && archivo.length > 0 && (
              <Typography variant="body2">📎 {archivo[0].name}</Typography>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => {
              setOpen(false);
              setEditingId(null);
              reset();
            }}
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : "Guardar"}
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
