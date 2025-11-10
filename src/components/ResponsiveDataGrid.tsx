import * as React from 'react'
import { DataGrid, DataGridProps } from '@mui/x-data-grid'
import { Box } from '@mui/material'

type Props = DataGridProps & {
  minWidth?: number
  fill?: boolean
}

export default function ResponsiveDataGrid({ minWidth = 0, fill = false, sx, ...rest }: Props) {
  return (
    <Box sx={{ width: '100%', ...(fill ? { flex: 1, minHeight: 0 } : {}), overflow: 'hidden' }}>
      <DataGrid
        autoHeight={!fill}
        density="standard"
        disableRowSelectionOnClick
        sx={{
          '& .MuiDataGrid-columnHeaders': { borderRadius: 2 },
          '& .MuiDataGrid-virtualScroller': { overflowX: 'hidden' },
          '& .MuiDataGrid-footerContainer': { borderTop: 'none' },
          minWidth,
          ...sx
        }}
        {...rest}
      />
    </Box>
  )
}