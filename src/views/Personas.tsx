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
  Snackbar,
  TextField,
  Typography,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { api } from "../helpers/api";
import SectionCard from "../components/SectionCard";
import PageHeader from "../components/PageHeader";
import ResponsiveDataGrid from "../components/ResponsiveDataGrid";
import DataGridToolbarEnhanced from "../components/DataGridToolbarEnhanced";
import { Chip } from "@mui/material";

type Persona = {
  id?: string;
  legajo: string;
  apellido: string;
  nombre: string;
  dni: string;
  cuil: string;
  fechaNacimiento?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  obraSocial?: string;
  sexo?: string;
  estadoCivil?: string;
  fechaInicioActividad?: string;
  titulacion?: string;
  pension: boolean;
  embargo: boolean;
  telefonoCelular?: string;
};

export default function Personas() {
  const defaultValues: Persona = {
    legajo: "",
    apellido: "",
    nombre: "",
    dni: "",
    cuil: "",
    fechaNacimiento: "",
    direccion: "",
    telefonoCelular: "",
    email: "",
    obraSocial: "",
    sexo: "",
    estadoCivil: "",
    fechaInicioActividad: "",
    titulacion: "",
    pension: false,
    embargo: false,
  };
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<Persona>({
    defaultValues,
  });

  const [rows, setRows] = useState<Persona[]>([]);
  const [toast, setToast] = useState("");
  const [open, setOpen] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [editing, setEditing] = useState<Persona | null>(null);

  const load = async () => {
    const res = await api.get("/users");
    setRows(res.data);
  };
  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (data: Persona) => {
    if (editing?.id) {
      await api.put(`/users/${editing.id}`, data);
      setToast("Persona actualizada correctamente");
    } else {
      await api.post("/users", data);
      setToast("Persona creada correctamente");
    }
    setToast("Persona creada correctamente");
    setOpen(false);
    setEditing(null);
    reset();
    load();
  };
  const onEdit = (row: Persona) => {
    setEditing(row);
    reset({ ...row });
    setOpen(true);
  };
  
  const onViewDetails = (row: Persona) => {
    setSelectedPersona(row);
    setOpenDetails(true);
  };
  
  const onDelete = async (row: Persona) => {
    await api.delete(`/users/${row.id}`);
    setToast("Persona eliminada correctamente");
    load();
  };

  const columns = useMemo<GridColDef[]>(
    () => [
      { field: "dni", headerName: "DNI", width: 120 },
      { field: "apellido", headerName: "Apellido", flex: 1 },
      { field: "nombre", headerName: "Nombre", flex: 1 },
      {
        field: "actions",
        headerName: "Acciones",
        width: 300,
        sortable: false,
        renderCell: (params) => (
          <div style={{ display: "flex", gap: 8 }}>
            <Button
              size="small"
              variant="contained"
              onClick={() => onViewDetails(params.row)}
            >
              Datos
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
              onClick={() => onDelete(params.row)}
            >
              Eliminar
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <PageHeader title="Docentes" trail={["Inicio", "Docentes"]} />
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
              Listado de Docentes
            </Typography>
            <Button
              variant="contained"
              onClick={() => {
                reset(defaultValues);
                setEditing(null);
                setOpen(true);
              }}
            >
              Nueva Persona
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
        onClose={() => {
          setOpen(false);
          setEditing(null);
          reset();
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editing ? "Editar Persona" : "Nueva Persona"}
        </DialogTitle>
        <DialogContent dividers>
          <Box component="form" sx={{ display: "grid", gap: 2 }}>
            <TextField
              label="Apellido"
              {...register("apellido", { required: "Requerido" })}
              error={!!errors.apellido}
              helperText={errors.apellido?.message}
            />
            <TextField
              label="Nombre"
              {...register("nombre", { required: "Requerido" })}
              error={!!errors.nombre}
              helperText={errors.nombre?.message}
            />
            <TextField
              label="DNI"
              {...register("dni", { required: "Requerido" })}
              error={!!errors.dni}
              helperText={errors.dni?.message}
            />
            <TextField
              label="CUIL"
              {...register("cuil", { required: "Requerido" })}
              error={!!errors.cuil}
              helperText={errors.cuil?.message}
            />
            <TextField
              type="date"
              label="Fecha de Nacimiento"
              InputLabelProps={{ shrink: true }}
              {...register("fechaNacimiento")}
            />
            <TextField
              label="Dirección (Prov. – calle – N° – piso – dpto.)"
              {...register("direccion")}
            />
            <TextField label="Teléfono" {...register("telefonoCelular")} />
            <TextField label="Email" type="email" {...register("email")} />
            <TextField label="Obra Social" {...register("obraSocial")} />
            <Controller
              name="sexo"
              control={control}
              render={({ field }) => (
                <TextField select label="Sexo" {...field}>
                  <MenuItem value="Masculino">Masculino</MenuItem>
                  <MenuItem value="Femenino">Femenino</MenuItem>
                </TextField>
              )}
            />

            <Controller
              name="estadoCivil"
              control={control}
              render={({ field }) => (
                <TextField select label="Estado Civil" {...field}>
                  <MenuItem value="Soltero/a">Soltero/a</MenuItem>
                  <MenuItem value="Casado/a">Casado/a</MenuItem>
                  <MenuItem value="Divorciado/a">Divorciado/a</MenuItem>
                  <MenuItem value="Viudo/a">Viudo/a</MenuItem>
                </TextField>
              )}
            />
            <TextField
              type="date"
              label="Fecha de Inicio Actividad Laboral"
              InputLabelProps={{ shrink: true }}
              {...register("fechaInicioActividad")}
            />
            <TextField label="Titulación" {...register("titulacion")} />

            <FormControlLabel
              control={<Checkbox {...register("pension")} />}
              label="Posee pensiones"
            />
            <FormControlLabel
              control={<Checkbox {...register("embargo")} />}
              label="Posee embargo"
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

      {/* Dialog de Detalles */}
      <Dialog
        open={openDetails}
        onClose={() => setOpenDetails(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Datos del Docente: {selectedPersona?.apellido}, {selectedPersona?.nombre}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "grid", gap: 2, pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  DNI:
                </Typography>
                <Typography variant="body1">{selectedPersona?.dni || "-"}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  CUIL:
                </Typography>
                <Typography variant="body1">{selectedPersona?.cuil || "-"}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Fecha de Nacimiento:
                </Typography>
                <Typography variant="body1">
                  {selectedPersona?.fechaNacimiento || "-"}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Teléfono Celular:
                </Typography>
                <Typography variant="body1">
                  {selectedPersona?.telefonoCelular || "-"}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Email:
                </Typography>
                <Typography variant="body1">{selectedPersona?.email || "-"}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Obra Social:
                </Typography>
                <Typography variant="body1">
                  {selectedPersona?.obraSocial || "-"}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Sexo:
                </Typography>
                <Typography variant="body1">{selectedPersona?.sexo || "-"}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Estado Civil:
                </Typography>
                <Typography variant="body1">
                  {selectedPersona?.estadoCivil || "-"}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Fecha Inicio Actividad:
                </Typography>
                <Typography variant="body1">
                  {selectedPersona?.fechaInicioActividad || "-"}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Titulación:
                </Typography>
                <Typography variant="body1">
                  {selectedPersona?.titulacion || "-"}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Pensión:
                </Typography>
                <Chip
                  label={selectedPersona?.pension ? "Sí" : "No"}
                  color={selectedPersona?.pension ? "success" : "default"}
                  size="small"
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Embargo:
                </Typography>
                <Chip
                  label={selectedPersona?.embargo ? "Sí" : "No"}
                  color={selectedPersona?.embargo ? "error" : "default"}
                  size="small"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetails(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}
