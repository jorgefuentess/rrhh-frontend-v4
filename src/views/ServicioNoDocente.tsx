import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
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
import DataGridToolbarEnhanced from "../components/DataGridToolbarEnhanced";
import ResponsiveDataGrid from "../components/ResponsiveDataGrid";

type Servicio = {
  id?: string;
  user: { id: string };
  nivel: { id: number; nombre: string };
  seccion?: { id: number; nombre: string };
  materia?: { id: number; nombre: string };
  codigoCargo: string;
  cargo: string;
  puntos: number;
  cantHs: number;
  caracter: string;
  fechaToma: string;
  boleta?: number;
};

type CatNivel = { id: number; nombre: string };
type CatSeccion = { id: number; nombre: string; nivel: { id: number } };
type CatMateria = { id: number; nombre: string; seccion: { id: number } };
type SimpleUser = { id: string; apellido: string; nombre: string };

export default function ServicioNoDocente() {
  const defaultValues: any = {
    user: { id: "" },
    nivel: { id: 0, nombre: "" },
    seccion: { id: 0, nombre: "" },
    materia: { id: 0, nombre: "" },
    codigoCargo: "",
    cargo: "",
    puntos: 0,
    cantHs: 0,
    caracter: "Interino",
    fechaToma: "",
    boleta: 0,
  };
  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm<Servicio>({
    defaultValues,
  });

  const [rows, setRows] = useState<Servicio[]>([]);
  const [toast, setToast] = useState("");
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<SimpleUser[]>([]);
  const [niveles, setNiveles] = useState<CatNivel[]>([]);
  const [secciones, setSecciones] = useState<CatSeccion[]>([]);
  const [materias, setMaterias] = useState<CatMateria[]>([]);

  const [editing, setEditing] = useState<any | null>(null);

  const nivelSel = watch("nivel.id");
  const seccionSel = watch("seccion.id");

  const load = async () => {
    const [servi, u, ns, ss, ms] = await Promise.all([
      api.get("/servicionodocente"),
      api.get("/nodocente"),
      api.get("/catalogos/nivel"),
      api.get("/catalogos/seccion"),
      api.get("/catalogos/materia"),
    ]);
    setRows(servi.data);
    setUsers(u.data);
    setNiveles(ns.data);
    setSecciones(ss.data);
    setMaterias(ms.data);
  };
  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    setValue("seccion.id", 0);
    setValue("materia.id", 0);
  }, [nivelSel]);
  useEffect(() => {
    setValue("materia.id", 0);
  }, [seccionSel]);

  const filteredSecciones = secciones.filter(
    (s) => String(s.nivel?.id) === String(nivelSel)
  );
  const filteredMaterias = materias.filter(
    (m) => String(m.seccion?.id) === String(seccionSel)
  );

  const onSubmit = async (data: Servicio) => {
    console.log("onSubmit data:", data);
    
    if (!data.user?.id) {
      console.error("No se puede guardar: falta el ID del no docente", data);
      setToast("Error: Debe seleccionar un No Docente");
      return;
    }

    const body = {
      noDocente: { id: data.user.id },
      nivel: data.nivel ? { id: Number(data.nivel.id) } : null,
      seccion: data.seccion ? { id: Number(data.seccion.id) } : null,
      materia: data.materia ? { id: Number(data.materia.id) } : null,
      codigoCargo: data.codigoCargo,
      cargo: data.cargo,
      puntos: data.puntos,
      cantHs: data.cantHs,
      caracter: data.caracter,
      fechaToma: data.fechaToma,
      boleta: data.boleta ? Number(data.boleta) : null,
    };
    
    console.log("body a enviar:", body);
    
    if (editing) {
      await api.put(`/servicionodocente/${editing.id}`, body);
      setToast("Servicio actualizado correctamente");
    } else {
      await api.post("/servicionodocente", body);
      setToast("Servicio creado correctamente");
    }
    
    setOpen(false);
    setEditing(null);
    reset();
    load();
  };
  const onEdit = (row: any) => {
    setEditing(row);
    reset({
      ...row,
      user: { id: row.noDocente?.id || "" },
      boleta: row.boleta ?? 0,
    });
    // Asegurar que el valor se setea correctamente
    setValue("user.id", row.noDocente?.id || "");
    setOpen(true);
  };

  const columns = useMemo<GridColDef[]>(
    () => [
      {
        field: "noDocente",
        headerName: "No Docente",
        flex: 1.5,
        valueGetter: (p) => {
          const apellido = p.row.noDocente?.apellido || "";
          const nombre = p.row.noDocente?.nombre || "";
          return `${apellido} ${nombre}`.trim() || "-";
        },
      },
      {
        field: "dni",
        headerName: "DNI",
        flex: 0.8,
        valueGetter: (p) => p.row.noDocente?.dni || "-",
      },
      { field: "codigoCargo", headerName: "Código", flex: 1 },
      { field: "cargo", headerName: "Cargo", flex: 1.4 },
      { field: "cantHs", headerName: "Hs", flex: 0.6 },
      { field: "boleta", headerName: "Boleta", flex: 0.8 },
      {
        field: "actions",
        headerName: "Acciones",
        width: 220,
        sortable: false,
        renderCell: (params) => (
          <div style={{ display: "flex", gap: 8 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => onEdit(params.row)}
            >
              Editar
            </Button>
            {/*     
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  onClick={() => onDelete(params.row)}
                >
                  Eliminar
                </Button> */}
          </div>
        ),
      },
    ],
    []
  );

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <PageHeader title="Servicio No Docente" trail={["Inicio", "Servicio No Docente"]} />
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
            <Button
              variant="contained"
              onClick={() => {
                reset(defaultValues);
                setEditing(null);
                setOpen(true);
              }}
            >
              Nueva Servicio
            </Button>
            {/* <Button variant="contained" onClick={() => setOpen(true)}>
              Nuevo Servicio
            </Button> */}
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

      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
          setEditing(null);
          reset();
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editing ? "Editar Servicio" : "Nueva Servicio"}
        </DialogTitle>
        <DialogContent dividers>
          <Box component="form" sx={{ display: "grid", gap: 2 }}>
            {/* <TextField
              select
              label="Usuario"
              {...register("user.id", { required: "Requerido" })}
            >
              {users.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {u.apellido}, {u.nombre}
                </MenuItem>
              ))}
            </TextField> */}
            <TextField
              select
              label="No Docente"
              {...register("user.id", { required: "Requerido" })}
              error={!!errors.user?.id}
              helperText={errors.user?.id?.message}
              fullWidth
            >
              {users.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {u.apellido}, {u.nombre}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Código Cargo"
              {...register("codigoCargo", { required: "Requerido" })}
            />
            <TextField
              label="Cargo"
              {...register("cargo", { required: "Requerido" })}
            />
            <TextField type="number" label="Cant. Hs" {...register("cantHs")} />
            <TextField
              type="date"
              label="Fecha de Toma"
              InputLabelProps={{ shrink: true }}
              {...register("fechaToma", { required: "Requerido" })}
            />
            <TextField
              type="number"
              label="Boleta de Sueldo"
              {...register("boleta")}
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
