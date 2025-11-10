import { Box, Breadcrumbs, Typography } from '@mui/material'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
export default function PageHeader({ title, trail }:{ title:string; trail?:string[] }){
  return (
    <Box sx={{ mb: 2 }}>
      {trail && (
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: .5, opacity: .8 }}>
          {trail.map((t,i) => <Typography key={i} variant="body2" color="text.secondary">{t}</Typography>)}
        </Breadcrumbs>
      )}
      <Typography variant="h4">{title}</Typography>
    </Box>
  )
}