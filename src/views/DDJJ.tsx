import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../state/AuthContext";
import { api } from "../helpers/api";
import { ROLES } from "../config/roles";
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
  persona?: { id: string; apellido: string; nombre: string };
  user?: { id: string; username: string; apellido: string; nombre: string; personaId?: string };
  horas?: number;
  cargosHsPublicos?: number;
  escuela: { id: string; email: string; nombre: string };
};

type Persona = { id: string; apellido: string; nombre: string };

export default function DDJJView() {
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes(ROLES.ADMIN) || false;

  const [rows, setRows] = useState<DDJJ[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [escuelas, setEscuelas] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DDJJ>({
    defaultValues: {
      persona: {
        id: user?.personaId || "",
        nombre: user?.username || "",
        apellido: user?.username || "",
      },
    },
  });
  const [toast, setToast] = useState<string>("");
  const [openForm, setOpenForm] = useState(false);
  const [open, setOpen] = useState(false);

  const currentPersona = personas.find((p) => {
    if (!user?.personaId) return false;
    return p.id === user.personaId;
  });

  // Obtener nombre/apellido de múltiples fuentes
  const personaDisplay = (() => {
    // Si no tiene personaId, está sin vincular
    if (!user?.personaId) {
      return "Sin vincular";
    }
    
    // Prioridad 1: Datos de currentPersona (de /users/{personaId})
    if (currentPersona?.nombre && currentPersona?.apellido) {
      return `${currentPersona.apellido} ${currentPersona.nombre}`;
    }
    
    // Prioridad 2: Datos del primer DDJJ cargado (pero solo si pertenece al usuario actual)
    if (rows && rows.length > 0 && rows[0].user?.nombre && rows[0].user?.apellido) {
      const ddjjUserId = rows[0].user?.id;
      if (ddjjUserId === user?.personaId) {
        return `${rows[0].user.apellido} ${rows[0].user.nombre}`;
      }
    }
    
    // Fallback: username
    return user?.username || "Desconocido";
  })();

  const load = async () => {
    try {
      // Para admin, obtener todas las DDJJ
      // Para docente, obtener solo las suyas
      const ddjjEndpoint = !isAdmin && user?.personaId 
        ? `/ddjj/persona/${user.personaId}`
        : "/ddjj";

      // Cargar DDJJ y Escuelas (críticos)
      const [ddjjRes, escuelasRes] = await Promise.all([
        api.get(ddjjEndpoint),
        api.get("/escuela"),
      ]);

      setRows(ddjjRes.data);
      setEscuelas(escuelasRes.data);

      // Logging detallado de estructura de DDJJ
      if (ddjjRes.data && ddjjRes.data.length > 0) {
        console.log("🔍 Primera DDJJ estructura:", JSON.stringify(ddjjRes.data[0], null, 2));
      }

      // Para docentes, intenta cargar datos de su persona (no crítico)
      if (!isAdmin && user?.personaId) {
        try {
          const personaRes = await api.get(`/users/${user.personaId}`);
          if (personaRes.data) {
            const personaData = personaRes.data;
            const persona: Persona = {
              id: personaData.id || user.personaId,
              nombre: personaData.nombre || user.username || "",
              apellido: personaData.apellido || user.username || "",
            };
            setPersonas([persona]);
            console.log("✅ Datos de persona cargados:", persona);
          }
        } catch (err) {
          // Si falla cargar datos de persona, usar fallback
          console.warn("⚠️ No se pudo cargar datos de persona, usando fallback");
          const docentePersona: Persona = {
            id: user.personaId,
            nombre: user.username || "",
            apellido: user.username || "",
          };
          setPersonas([docentePersona]);
        }
      } else if (isAdmin) {
        // Solo admin carga la lista completa de usuarios
        try {
          const usersRes = await api.get("/users");
          setPersonas(usersRes.data);
          console.log("✅ Usuarios cargados (Admin):", usersRes.data);
        } catch (err) {
          console.error("❌ Error cargando usuarios para admin", err);
        }
      }

      console.log("✅ DDJJ cargadas desde", ddjjEndpoint, ":", ddjjRes.data);
      console.log("✅ Escuelas cargadas:", escuelasRes.data);
    } catch (err) {
      console.error("❌ Error cargando DDJJ o Escuelas (críticos)", err);
      setToast("No se pudo cargar DDJJ/Escuelas");
    }
  };

  useEffect(() => {
    load();
  }, [isAdmin, user?.personaId]);

  // Efecto para establecer persona inicial en el formulario (especialmente para docentes)
  useEffect(() => {
    if (!isAdmin && user?.personaId && personas.length > 0) {
      setValue("persona.id", user.personaId);
    }
  }, [isAdmin, user?.personaId, personas, setValue]);

  const onSubmit = async (data: DDJJ) => {
    const body: any = {
      horas: Number(data.horas),
      escuelaId: data.escuela.id
      // cargosHsPublicos: Number(data.cargosHsPublicos),
    };

    // Si es admin, envía personaId; si no, el backend lo auto-asigna desde JWT
    if (isAdmin && data.persona?.id) {
      body.personaId = data.persona.id;
    }

    console.log("Nueva DDJJ:", body);
    await api.post("/ddjj", body);
    setToast("Declaración jurada registrada");
    reset();
    setOpenForm(false);
    
    // Pequeño delay para asegurar que el backend haya procesado
    // Luego recarga las DDJJ
    setTimeout(() => {
      load();
    }, 500);
  };

  const columns = useMemo<GridColDef[]>(
    () => [
      {
        field: "persona",
        headerName: "Persona",
        flex: 1.5,
        valueGetter: (p) => {
          // Intentar obtener nombre de múltiples fuentes
          const nombre = p.row.user?.nombre || p.row.persona?.nombre || "";
          const apellido = p.row.user?.apellido || p.row.persona?.apellido || "";
          const fullName = `${apellido} ${nombre}`.trim();
          
          // Si aún no hay datos, mostrar el ID como fallback
          if (!fullName) {
            console.warn("⚠️ DDJJ sin datos de persona:", p.row);
            return `ID: ${p.row.id?.substring(0, 8)}...`;
          }
          return fullName;
        },
      },
      { field: "horas", headerName: "Horas", flex: 1 },
      { field: "cargosHsPublicos", headerName: "Hs. Públicos", flex: 1 },
    ],
    [],
  );

  // Filtrar DDJJ según el rol del usuario
  // Nota: Para docentes, el backend ya filtra con /ddjj/persona/{personaId}, así que rows ya está filtrado
  const filteredRows = isAdmin 
    ? rows 
    : rows.filter((r) => {
        // Fallback: Mostrar solo si la DDJJ es del usuario actual
        // El backend retorna user.id como el personaId
        const ddjjUserId = r.user?.id;
        return ddjjUserId === user?.personaId;
      });

  console.log("📊 Filas totales:", rows.length, "| Filas filtradas:", filteredRows.length, "| Admin:", isAdmin);

  return (
    <Grid container spacing={2}>
      {!isAdmin && (
        <Grid item xs={12}>
          <Box sx={{ p: 2, bgcolor: "warning.light", borderRadius: 1 }}>
            <Typography variant="body2">
              ⚠️ <strong>Atención:</strong> Estás logueado como <strong>{user?.username}</strong> (PersonaId: {user?.personaId}) (Persona: {personaDisplay})
            </Typography>
          </Box>
        </Grid>
      )}
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
            rows={filteredRows.map((r, i) => {
              const mappedRow = { id: r.id || i, ...r };
              console.log("📍 Row mapeada:", mappedRow);
              return mappedRow;
            })}
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
          {!isAdmin && (
            <Box sx={{ mb: 2, p: 1.5, bgcolor: "info.light", borderRadius: 1 }}>
              <Typography variant="body2">
                📌 DDJJ será creado para: <strong>{personaDisplay}</strong>
              </Typography>
            </Box>
          )}
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
              disabled={!isAdmin}
              value={isAdmin ? (watch("persona.id") || "") : (user?.personaId || "")}
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
              {escuelas.length === 0 && (
                <MenuItem disabled>
                  <em>No hay escuelas disponibles</em>
                </MenuItem>
              )}
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
