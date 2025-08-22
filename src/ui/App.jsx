/**
 * Main ITM React Application
 * Provides Redux store and Material UI theming for the entire app
 */

import React from 'react'
import { Provider } from 'react-redux'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { Box, AppBar, Toolbar, Typography, Container } from '@mui/material'

import store from './store/index.js'
import GraphViewerDemo from './components/visualization-v2/GraphViewerV2Demo.jsx'

/**
 * ITM application theme configuration
 */
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0'
    },
    secondary: {
      main: '#dc004e',
      light: '#ff5983',
      dark: '#9a0036'
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff'
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600
    },
    h6: {
      fontWeight: 500
    }
  },
  components: {
    // Custom component styles
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1976d2'
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none' // Prevent uppercase transformation
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8
        }
      }
    }
  }
})

/**
 * Main App component
 */
function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ flexGrow: 1, height: '100vh', display: 'flex', flexDirection: 'column' }}>
          {/* Application Header */}
          <AppBar position="static" elevation={2}>
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                ITM - IT Asset Management System
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Graph Visualization Demo
              </Typography>
            </Toolbar>
          </AppBar>

          {/* Main Content Area */}
          <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
            <Container maxWidth={false} sx={{ height: '100%', p: 0 }}>
              <GraphViewerDemo />
            </Container>
          </Box>
        </Box>
      </ThemeProvider>
    </Provider>
  )
}

export default App