import { createTheme, responsiveFontSizes } from '@mui/material/styles'
import '@mui/x-data-grid/themeAugmentation'

let theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0B74DE',
      light: '#4FA3FF',
      dark: '#084E98',
      contrastText: '#fff',
    },
    secondary: {
      main: '#172B4D',
      light: '#355B8C',
      dark: '#0E1D33',
      contrastText: '#fff',
    },
    background: {
      default: '#F6F8FB',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0E1D33',
      secondary: 'rgba(0,0,0,0.6)',
    },
  },
  typography: {
    fontFamily: 'Inter, Roboto, system-ui, -apple-system, "Segoe UI", Arial, sans-serif',
    h4: { fontWeight: 700, letterSpacing: 0.2 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: 'background 0.3s ease, color 0.3s ease',
          '&.MuiPaper-elevation1': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          },
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: '1px solid rgba(11,116,222,0.1)',
          backgroundColor: '#fff',
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#0B74DE',
            color: '#fff',
            fontWeight: 600,
          },
        },
      },
    },
  },
})

theme = responsiveFontSizes(theme)

export default theme