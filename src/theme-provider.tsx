import { createTheme, ThemeProvider, CssBaseline } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { PropsWithChildren } from 'react'

export default function ThemeProviderCustom({ children }: PropsWithChildren) {
  const [mode, setMode] = useState<'light' | 'dark'>(
    (localStorage.getItem('themeMode') as 'light' | 'dark') || 'light'
  )

  useEffect(() => {
    const handler = () => {
      const newMode = localStorage.getItem('themeMode') as 'light' | 'dark'
      setMode(newMode)
    }
    window.addEventListener('toggle-theme', handler)
    return () => window.removeEventListener('toggle-theme', handler)
  }, [])

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'light'
            ? {
                primary: { main: '#0B74DE' },
                background: {
                  default: '#f6f8fb',
                  paper: '#ffffff',
                },
              }
            : {
                primary: { main: '#1e88e5' },
                background: {
                  default: '#0d1117', // fondo general
                  paper: '#161b22',   // cards y drawer
                },
                text: {
                  primary: '#e6edf3',
                  secondary: '#a1a1aa',
                },
              }),
        },
        shape: { borderRadius: 12 },
        components: {
          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundColor: mode === 'dark' ? '#161b22' : '#0B74DE',
              },
            },
          },
          MuiDrawer: {
            styleOverrides: {
              paper: {
                backgroundColor: mode === 'dark' ? '#161b22' : '#0B74DE',
                color: mode === 'dark' ? '#e6edf3' : '#ffffff',
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                backgroundColor: mode === 'dark' ? '#1e293b' : '#ffffff',
                boxShadow:
                  mode === 'dark'
                    ? '0 2px 12px rgba(0,0,0,0.4)'
                    : '0 4px 20px rgba(11,116,222,0.05)',
              },
            },
          },
        },
      }),
    [mode]
  )

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}