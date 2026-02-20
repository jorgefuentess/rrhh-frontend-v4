import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { api } from "../helpers/api";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  Snackbar,
  Typography,
  Grid,
  DialogActions,
} from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import SectionCard from "../components/SectionCard";
import PageHeader from "../components/PageHeader";
import ResponsiveDataGrid from "../components/ResponsiveDataGrid";
import DataGridToolbarEnhanced from "../components/DataGridToolbarEnhanced";

type DDJJ = {
  id?: string;
  persona: { id: string; apellido: string; nombre: string };
  horas?: number;
  cargosHsPublicos?: number;
  escuela: { id: string; apellido: string; nombre: string };
};

type Persona = { id: string; apellido: string; nombre: string };

export default function DDJJView() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DDJJ>();
  const [rows, setRows] = useState<DDJJ[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [escuelas, setEscuelas] = useState<any[]>([]);
  const [toast, setToast] = useState<string>("");
  const [openForm, setOpenForm] = useState(false);
  const [open, setOpen] = useState(false);

  const load = async () => {
    try {
      const [ddjjRes, persRes, escRes] = await Promise.all([
        api.get("/ddjj"),
        api.get("/users"),
        api.get("/escuela"),
      ]);

      setRows(ddjjRes.data);
      setPersonas(persRes.data);
      setEscuelas(escRes.data);
      console.log("escuela",escRes.data)

      
    } catch (err) {
      console.error("❌ Error cargando DDJJ o Personas", err);
      setToast("No se pudo cargar DDJJ/personas");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (data: DDJJ) => {
    const body = {
      personaId: data.persona.id,
      horas: Number(data.horas),
      // cargosHsPublicos: Number(data.cargosHsPublicos),
    };
    await api.post("/ddjj", body);
    setToast("Declaración jurada registrada");
    reset();
    setOpenForm(false);
    load();
  };

  const columns = useMemo<GridColDef[]>(
    () => [
      {
        field: "persona",
        headerName: "Persona",
        flex: 1.5,
        valueGetter: (p) =>
          `${p.row.user?.apellido || ""} ${p.row.user?.nombre || ""}`,
      },
      { field: "horas", headerName: "Horas", flex: 1 },
      { field: "cargosHsPublicos", headerName: "Hs. Públicos", flex: 1 },
    ],
    [],
  );

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <PageHeader
            title="Declaraciones Juradas"
            trail={["Inicio", "DDJJ"]}
          />
          <Button variant="contained" onClick={() => setOpenForm(true)}>
            Nueva DDJJ
          </Button>
        </Box>
      </Grid>

      <Grid item xs={12}>
        <SectionCard>
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
        </SectionCard>
      </Grid>

      <Dialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Nueva DDJJ</DialogTitle>
        <DialogContent>
          <Box
            component="form"
            // onSubmit={handleSubmit(onSubmit)}
            sx={{ display: "grid", gap: 2, mt: 2 }}
          >
            <TextField
              select
              label="Persona"
              {...register("persona.id", { required: "Requerido" })}
              error={!!errors.persona?.id}
              helperText={errors.persona?.id?.message}
            >
              {personas.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.apellido}, {p.nombre}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Escuela"
              {...register("escuela.id", { required: "Requerido" })}
              error={!!errors.escuela?.id}
              helperText={errors.escuela?.id?.message}
            >
              {escuelas.map((e) => (
                <MenuItem key={e.id} value={e.id}>
                
                  {e.nombre}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              type="number"
              label="Horas"
              {...register("horas", { valueAsNumber: true })}
            />
          
            {/* <Button type="submit" variant="contained">
              Guardar
            </Button> */}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>Cancelar</Button>
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
