import { useEffect, useMemo, useState } from "react";
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
import { GridColDef } from "@mui/x-data-grid";
import PageHeader from "../components/PageHeader";
import SectionCard from "../components/SectionCard";
import ResponsiveDataGrid from "../components/ResponsiveDataGrid";
import DataGridToolbarEnhanced from "../components/DataGridToolbarEnhanced";
import { api } from "../helpers/api";
import { useAuth } from "../state/AuthContext";
import { ROLES } from "../config/roles";

const meses = [
  { value: 1, label: "Enero" },
  { value: 2, label: "Febrero" },
  { value: 3, label: "Marzo" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Mayo" },
  { value: 6, label: "Junio" },
  { value: 7, label: "Julio" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Septiembre" },
  { value: 10, label: "Octubre" },
  { value: 11, label: "Noviembre" },
  { value: 12, label: "Diciembre" },
];

export default function RecibosSueldo() {
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes(ROLES.ADMIN) || false;

  const [rows, setRows] = useState<any[]>([]);
  const [toast, setToast] = useState("");
  const [anio, setAnio] = useState<number>(new Date().getFullYear());
  const [mes, setMes] = useState<number>(new Date().getMonth() + 1);
  const [docenteFiltro, setDocenteFiltro] = useState<string>("");

  const [openUpload, setOpenUpload] = useState(false);
  const [openZip, setOpenZip] = useState(false);
  const [docentes, setDocentes] = useState<any[]>([]);
  const [docenteId, setDocenteId] = useState("");
  const [uploadAnio, setUploadAnio] = useState<number>(new Date().getFullYear());
  const [uploadMes, setUploadMes] = useState<number>(new Date().getMonth() + 1);
  const [file, setFile] = useState<File | null>(null);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [noConformeRow, setNoConformeRow] = useState<any>(null);
  const [observacion, setObservacion] = useState("");

  const load = async () => {
    if (!user?.personaId && !isAdmin) return;
    const endpoint = isAdmin
      ? "/recibos"
      : `/recibos/docente/${user?.personaId}?anio=${anio}&mes=${mes}`;

    const res = await api.get(endpoint, {
      params: isAdmin
        ? {
            docenteId: docenteFiltro || undefined,
            anio: anio || undefined,
            mes: mes || undefined,
          }
        : undefined,
    });
    setRows(res.data);

    if (isAdmin) {
      const docentesRes = await api.get("/users");
      setDocentes(docentesRes.data);
    }
  };

  useEffect(() => {
    load();
  }, [anio, mes, docenteFiltro]);

  const handleConformidad = async (row: any, conformidad: "conforme" | "no_conforme") => {
    if (conformidad === "no_conforme") {
      setNoConformeRow(row);
      setObservacion("");
      return;
    }
    await api.put(`/recibos/${row.id}/conformidad`, { conformidad });
    setToast("Conformidad registrada");
    load();
  };

  const confirmarNoConforme = async () => {
    if (!observacion.trim()) {
      setToast("Debe ingresar una observación");
      return;
    }
    await api.put(`/recibos/${noConformeRow.id}/conformidad`, {
      conformidad: "no_conforme",
      observacion,
    });
    setToast("Conformidad registrada");
    setNoConformeRow(null);
    setObservacion("");
    load();
  };

  const download = (row: any) => {
    window.open(`${import.meta.env.VITE_API_URL}/recibos/${row.id}/archivo`, "_blank");
  };

  const upload = async () => {
    if (!docenteId || !file) {
      setToast("Debe seleccionar docente y archivo");
      return;
    }
    const form = new FormData();
    form.append("docenteId", docenteId);
    form.append("anio", String(uploadAnio));
    form.append("mes", String(uploadMes));
    form.append("file", file);

    await api.post("/recibos", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    setToast("Recibo cargado");
    setOpenUpload(false);
    setFile(null);
    load();
  };

  const uploadZip = async () => {
    if (!zipFile) {
      setToast("Debe seleccionar un archivo ZIP");
      return;
    }
    const form = new FormData();
    form.append("file", zipFile);

    await api.post("/recibos/zip", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    setToast("ZIP procesado");
    setOpenZip(false);
    setZipFile(null);
    load();
  };

  const columns = useMemo<GridColDef[]>(
    () => [
      ...(isAdmin
        ? [
            {
              field: "docente",
              headerName: "Docente",
              flex: 1.2,
              valueGetter: (p: any) =>
                `${p.row.docente?.apellido || ""} ${p.row.docente?.nombre || ""}`.trim() || "-",
            },
          ]
        : []),
      { field: "anio", headerName: "Año", width: 80 },
      { field: "mes", headerName: "Mes", width: 80 },
      { field: "archivoNombre", headerName: "Archivo", flex: 1 },
      { field: "conformidad", headerName: "Estado", width: 140 },
      { field: "fechaConformidad", headerName: "Fecha", width: 140 },
      { field: "observacion", headerName: "Observación", flex: 1 },
      {
        field: "actions",
        headerName: "Acciones",
        width: 320,
        renderCell: (params) => (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button size="small" variant="outlined" onClick={() => download(params.row)}>
              Descargar
            </Button>
            {!isAdmin && (
              <>
                <Button size="small" variant="contained" onClick={() => handleConformidad(params.row, "conforme")}>
                  Conforme
                </Button>
                <Button size="small" variant="outlined" color="error" onClick={() => handleConformidad(params.row, "no_conforme")}>
                  No conforme
                </Button>
              </>
            )}
          </Box>
        ),
      },
    ],
    [isAdmin]
  );

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <PageHeader title="Recibos de Sueldo" trail={["Inicio", "Recibos de Sueldo"]} />
      </Grid>

      <Grid item xs={12}>
        <SectionCard>
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField
              select
              label="Mes"
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
              sx={{ width: 180 }}
            >
              {meses.map((m) => (
                <MenuItem key={m.value} value={m.value}>
                  {m.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              type="number"
              label="Año"
              value={anio}
              onChange={(e) => setAnio(Number(e.target.value))}
              sx={{ width: 140 }}
            />

            {isAdmin && (
              <TextField
                select
                label="Docente"
                value={docenteFiltro}
                onChange={(e) => setDocenteFiltro(e.target.value)}
                sx={{ minWidth: 220 }}
              >
                <MenuItem value="">Todos</MenuItem>
                {docentes.map((d) => (
                  <MenuItem key={d.id} value={d.id}>
                    {d.apellido}, {d.nombre}
                  </MenuItem>
                ))}
              </TextField>
            )}

            {isAdmin && (
              <>
                <Button variant="contained" onClick={() => setOpenUpload(true)}>
                  Cargar Recibo
                </Button>
                <Button variant="outlined" onClick={() => setOpenZip(true)}>
                  Cargar ZIP
                </Button>
              </>
            )}
          </Box>

          <ResponsiveDataGrid
            rows={rows.map((r, i) => ({ id: r.id || i, ...r }))}
            columns={columns}
            slots={{ toolbar: DataGridToolbarEnhanced }}
            pageSizeOptions={[5, 10, 20]}
          />
        </SectionCard>
      </Grid>

      {/* Dialog Upload Admin */}
      <Dialog open={openUpload} onClose={() => setOpenUpload(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cargar Recibo</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "grid", gap: 2 }}>
            <TextField
              select
              label="Docente"
              value={docenteId}
              onChange={(e) => setDocenteId(e.target.value)}
            >
              {docentes.map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  {d.apellido}, {d.nombre}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Mes"
              value={uploadMes}
              onChange={(e) => setUploadMes(Number(e.target.value))}
            >
              {meses.map((m) => (
                <MenuItem key={m.value} value={m.value}>
                  {m.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              type="number"
              label="Año"
              value={uploadAnio}
              onChange={(e) => setUploadAnio(Number(e.target.value))}
            />
            <Button variant="outlined" component="label">
              Seleccionar PDF
              <input
                type="file"
                hidden
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </Button>
            {file && <Typography variant="body2">{file.name}</Typography>}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUpload(false)}>Cancelar</Button>
          <Button variant="contained" onClick={upload}>
            Subir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Upload ZIP */}
      <Dialog open={openZip} onClose={() => setOpenZip(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cargar ZIP (dni_anio_mes.pdf)</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "grid", gap: 2 }}>
            <Typography variant="body2">
              El nombre de cada PDF debe ser: <strong>dni_anio_mes.pdf</strong>
            </Typography>
            <Button variant="outlined" component="label">
              Seleccionar ZIP
              <input
                type="file"
                hidden
                accept="application/zip"
                onChange={(e) => setZipFile(e.target.files?.[0] || null)}
              />
            </Button>
            {zipFile && <Typography variant="body2">{zipFile.name}</Typography>}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenZip(false)}>Cancelar</Button>
          <Button variant="contained" onClick={uploadZip}>
            Subir ZIP
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog No Conforme */}
      <Dialog open={!!noConformeRow} onClose={() => setNoConformeRow(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Motivo de No Conformidad</DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Observación"
            value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
            fullWidth
            multiline
            minRows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNoConformeRow(null)}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={confirmarNoConforme}>
            Confirmar
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
