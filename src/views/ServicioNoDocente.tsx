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
      api.get("/servicios"),
      api.get("/users"),
      api.get("/catalogos/nivel"),
      api.get("/catalogos/seccion"),
      api.get("/catalogos/materia"),
    ]);
    setRows(servi.data);
    console.log("servicio", servi.data);
    setUsers(u.data);
    console.log("user", u.data);
    setNiveles(ns.data);
    console.log("niveles", ns.data);
    setSecciones(ss.data);
    console.log("secciones", ss.data);
    setMaterias(ms.data);
    console.log("materias", ms.data);
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
    const body = {
      user: { id: data.user.id },
      nivel: { id: Number(data.nivel.id) },
      seccion: { id: Number(data.seccion?.id) },
      materia: { id: Number(data.materia?.id) },
      codigoCargo: data.codigoCargo,
      cargo: data.cargo,
      puntos: data.puntos,
      cantHs: data.cantHs,
      caracter: data.caracter,
      fechaToma: data.fechaToma,
    };
    await api.post("/servicios", body);
    setToast("Servicio creado correctamente");
    setOpen(false);
    reset();
    load();
  };
  const onEdit = (row: any) => {
    console.log("servicios", row);
    setEditing(row);
    reset({ ...row });
    setOpen(true);
  };

  const columns = useMemo<GridColDef[]>(
    () => [
      {
        field: "nivel",
        headerName: "Nivel",
        flex: 1,
        valueGetter: (p) => p.row.nivel?.nombre || "",
      },
      {
        field: "seccion",
        headerName: "Sección",
        flex: 1,
        valueGetter: (p) => p.row.seccion?.nombre || "",
      },
      {
        field: "materia",
        headerName: "Materia",
        flex: 1.2,
        valueGetter: (p) => p.row.materia?.nombre || "",
      },
      { field: "codigoCargo", headerName: "Código", flex: 1 },
      { field: "cargo", headerName: "Cargo", flex: 1.4 },
      { field: "puntos", headerName: "Puntos", flex: 0.8 },
      { field: "cantHs", headerName: "Hs", flex: 0.6 },
      { field: "caracter", headerName: "Carácter", flex: 1 },
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
            <Controller
              name="user"
              control={control}
              rules={{ required: "Requerido" }}
              render={({ field }) => (
                <TextField
                  select
                  label="Usuario"
                  fullWidth
                  error={!!errors.user?.id}
                  helperText={errors.user?.message}
                  {...field}
                >                  
                  {users.map((u) => (
                    <MenuItem key={u.id} value={u.id}>
                      {u.apellido}, {u.nombre}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <TextField
              label="Código Cargo"
              {...register("codigoCargo", { required: "Requerido" })}
            />
            <TextField
              label="Cargo"
              {...register("cargo", { required: "Requerido" })}
            />            <TextField type="number" label="Cant. Hs" {...register("cantHs")} />
          
            <TextField
              type="date"
              label="Fecha de Toma"
              InputLabelProps={{ shrink: true }}
              {...register("fechaToma", { required: "Requerido" })}
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
