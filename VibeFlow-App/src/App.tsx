import { useState } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import { TopNavigation, AgentPanel, ErrorBoundary } from './components/common'
import { MainContent } from './components/layout'
import './styles/App.css'

function App() {
  const [darkMode, setDarkMode] = useState(true)

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#4169E1', // Royal blue
      },
      secondary: {
        main: '#1CC8EE',
      },
      background: {
        default: '#000000', // Black background
        paper: '#1a1a1a', // Dark gray for components
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          rounded: {
            borderRadius: 10,
          },
        },
      },
    },
  })

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="app-container">
        <AppBar position="static" elevation={0} sx={{ bgcolor: '#000000', borderBottom: '1px solid rgba(65, 105, 225, 0.2)' }}>
          <Toolbar>
            <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 'bold', color: '#FFFFFF' }}>
              VibeFlow
            </Typography>
            <TopNavigation />
            <IconButton color="inherit" onClick={toggleDarkMode}>
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Toolbar>
        </AppBar>
        <div className="main-content">
          <ErrorBoundary
            fallback={
              <div style={{ padding: 20, margin: 20, border: '1px solid #f44336', borderRadius: 8 }}>
                <h3>Canvas Error</h3>
                <p>There was a problem rendering the canvas. Please refresh the page or contact support.</p>
              </div>
            }
          >
            <MainContent />
          </ErrorBoundary>
          <AgentPanel />
        </div>
      </div>
    </ThemeProvider>
  )
}

export default App
