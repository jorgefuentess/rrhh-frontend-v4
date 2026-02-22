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

/* =======================
   TIPOS
======================= */

type Caracter = "Titular" | "Interino" | "Suplente";

type Servicio = {
  id?: string;
  user: { id: string };
  nivel: { id: number; nombre?: string };
  seccion?: { id: number; nombre?: string };
  materia?: { id: number; nombre?: string };
  codigoCargo: string;
  cargo: string;
  puntos: number;
  cantHs: number;
  caracter: Caracter;
  fechaToma: string;
};

type CatNivel = { id: number; nombre: string };
type CatSeccion = { id: number; nombre: string; nivel: { id: number } };
type CatMateria = { id: number; nombre: string; seccion: { id: number } };
type SimpleUser = { id: string; apellido: string; nombre: string };

export default function Servicios() {
  const defaultValues: Servicio = {
    user: { id: "" },
    nivel: { id: 0 },
    seccion: { id: 0 },
    materia: { id: 0 },
    codigoCargo: "",
    cargo: "",
    puntos: 0,
    cantHs: 0,
    caracter: "Interino",
    fechaToma: "",
  };

  const { register, handleSubmit, reset, watch, control, setValue } =
    useForm<Servicio>({ defaultValues });

  const [rows, setRows] = useState<Servicio[]>([]);
  const [users, setUsers] = useState<SimpleUser[]>([]);
  const [niveles, setNiveles] = useState<CatNivel[]>([]);
  const [secciones, setSecciones] = useState<CatSeccion[]>([]);
  const [materias, setMaterias] = useState<CatMateria[]>([]);
  const [toast, setToast] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Servicio | null>(null);

  const nivelSel = watch("nivel.id");
  const seccionSel = watch("seccion.id");

  /* =======================
     LOAD DATA
  ======================= */

  const load = async () => {
    const [serv, u, n, s, m] = await Promise.all([
      api.get("/servicios"),
      api.get("/users"),
      api.get("/catalogos/nivel"),
      api.get("/catalogos/seccion"),
      api.get("/catalogos/materia"),
    ]);

    setRows(serv.data);
    setUsers(u.data);
    setNiveles(n.data);
    setSecciones(s.data);
    setMaterias(m.data);
  };

  useEffect(() => {
    load();
  }, []);

  /* =======================
     SELECTS ENCADENADOS
  ======================= */

  useEffect(() => {
    setValue("seccion.id", 0);
    setValue("materia.id", 0);
  }, [nivelSel, setValue]);

  useEffect(() => {
    setValue("materia.id", 0);
  }, [seccionSel, setValue]);

  const filteredSecciones = secciones.filter(
    (s) => s.nivel.id === Number(nivelSel),
  );

  const filteredMaterias = materias.filter(
    (m) => m.seccion.id === Number(seccionSel),
  );

  /* =======================
     SUBMIT
  ======================= */

  const onSubmit = async (data: Servicio) => {
    const body = {
      user: { id: data.user.id },
      nivel: { id: Number(data.nivel.id) },
      seccion: data.seccion?.id ? { id: Number(data.seccion.id) } : null,
      materia: data.materia?.id ? { id: Number(data.materia.id) } : null,
      codigoCargo: data.codigoCargo,
      cargo: data.cargo,
      puntos: Number(data.puntos),
      cantHs: Number(data.cantHs),
      caracter: data.caracter,
      fechaToma: data.fechaToma,
    };

    if (editing?.id) {
      const servicioResponse = await api.put(`/servicios/${editing.id}`, body);

      setToast("Servicio actualizado correctamente");
    } else {
      const servicioResponse = await api.post("/servicios", body);

      setToast("Servicio creado correctamente");
    }

    setOpen(false);
    setEditing(null);
    reset(defaultValues);
    load();
  };

  /* =======================
     EDITAR
  ======================= */

  const onEdit = (row: Servicio) => {
    setEditing(row);

    reset({
      user: { id: row.user.id },
      nivel: { id: row.nivel.id },
      seccion: row.seccion ? { id: row.seccion.id } : { id: 0 },
      materia: row.materia ? { id: row.materia.id } : { id: 0 },
      codigoCargo: row.codigoCargo,
      cargo: row.cargo,
      puntos: row.puntos,
      cantHs: row.cantHs,
      caracter: row.caracter as Caracter,
      fechaToma: row.fechaToma,
    });

    setOpen(true);
  };

  const onDelete = async (row: any) => {
    console.log(row)
    await api.delete(`/remove/${row.id}`);
    setToast("Persona eliminada correctamente");
    load();
  };
  /* =======================
     COLUMNAS
  ======================= */

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
        width: 160,
        renderCell: (params) => (
          // <Button
          //   size="small"
          //   variant="outlined"
          //   onClick={() => onEdit(params.row)}
          // >
          //   Editar
          // </Button>

          <div style={{ display: "flex", gap: 8 }}>
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
              onClick={() => onDelete(params.row)}
            >
              Eliminar
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  /* =======================
     RENDER
  ======================= */

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <PageHeader title="Servicios Docentes" trail={["Inicio", "Servicios Docentes"]} />
      </Grid>

      <Grid item xs={12}>
        <SectionCard>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="h6">Listado</Typography>
            <Button
              variant="contained"
              onClick={() => {
                reset(defaultValues);
                setEditing(null);
                setOpen(true);
              }}
            >
              Nuevo Servicio
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
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editing ? "Editar Servicio" : "Nuevo Servicio"}
        </DialogTitle>

        <DialogContent dividers>
          <Box display="grid" gap={2}>
            <Controller
              name="user.id"
              control={control}
              render={({ field }) => (
                <TextField select label="Usuario" {...field}>
                  {users.map((u) => (
                    <MenuItem key={u.id} value={u.id}>
                      {u.apellido}, {u.nombre}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            <TextField select label="Nivel" {...register("nivel.id")}>
              {niveles.map((n) => (
                <MenuItem key={n.id} value={n.id}>
                  {n.nombre}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Sección"
              {...register("seccion.id")}
              disabled={!nivelSel}
            >
              {filteredSecciones.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.nombre}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Materia"
              {...register("materia.id")}
              disabled={!seccionSel}
            >
              {filteredMaterias.map((m) => (
                <MenuItem key={m.id} value={m.id}>
                  {m.nombre}
                </MenuItem>
              ))}
            </TextField>

            <TextField label="Código Cargo" {...register("codigoCargo")} />
            <TextField label="Cargo" {...register("cargo")} />
            <TextField type="number" label="Puntos" {...register("puntos")} />
            <TextField type="number" label="Cant. Hs" {...register("cantHs")} />

            <Controller
              name="caracter"
              control={control}
              render={({ field }) => (
                <TextField select label="Carácter" {...field}>
                  <MenuItem value="Titular">Titular</MenuItem>
                  <MenuItem value="Interino">Interino</MenuItem>
                  <MenuItem value="Suplente">Suplente</MenuItem>
                </TextField>
              )}
            />

            <TextField
              type="date"
              label="Fecha de Toma"
              InputLabelProps={{ shrink: true }}
              {...register("fechaToma")}
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
        message={toast}
        onClose={() => setToast("")}
      />
    </Grid>
  );
}
