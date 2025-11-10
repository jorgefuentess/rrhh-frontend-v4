import { Card, CardContent, SxProps, Theme } from '@mui/material'
import { PropsWithChildren } from 'react'

type Props = PropsWithChildren<{
  sx?: SxProps<Theme>
}>

/**
 * Contenedor con estilo de tarjeta uniforme para secciones del sistema RRHH.
 * Acepta prop `sx` para sobrescribir estilos (compatible con DataGrid responsive).
 */
export default function SectionCard({ children, sx }: Props) {
  return (
    <Card
      elevation={2}
      sx={{
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(11,116,222,0.05)',
        backgroundColor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        ...sx, // <- importante: propaga el estilo recibido
      }}
    >
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </CardContent>
    </Card>
  )
}
