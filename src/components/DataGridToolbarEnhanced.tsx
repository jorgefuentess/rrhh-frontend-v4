import { GridToolbarContainer, GridToolbarQuickFilter, GridToolbarExport, useGridApiContext } from '@mui/x-data-grid'
import { Box, Button } from '@mui/material'
export default function DataGridToolbarEnhanced(){
  const apiRef = useGridApiContext()
  return (
    <GridToolbarContainer>
      <Box sx={{ display:'flex', alignItems:'center', gap:1, width:'100%', p:1 }}>
        <GridToolbarQuickFilter debounceMs={300} />
        <Box sx={{ flexGrow: 1 }} />
        <Button size="small" onClick={()=>apiRef.current.setDensity('compact')}>Compacta</Button>
        <Button size="small" onClick={()=>apiRef.current.setDensity('standard')}>Estándar</Button>
        <Button size="small" onClick={()=>apiRef.current.setDensity('comfortable')}>Cómoda</Button>
        <GridToolbarExport printOptions={{ disableToolbarButton: true }} />
      </Box>
    </GridToolbarContainer>
  )
}