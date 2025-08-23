/**
 * Main ITM React Application
 * Provides Redux store and Material UI theming for the entire app
 * Performs database health check on startup and manages connection status
 */

import React, { useEffect } from 'react'
import { Provider, useDispatch } from 'react-redux'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

import store from './store/index.js'
import MainLayout from './layouts/MainLayout.jsx'
import { DatabaseService } from './services/DatabaseService.js'
import { setLoading, setSuccess, setError, setWarning } from './store/statusSlice.js'

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
 * App content component with database health check
 */
function AppContent() {
  const dispatch = useDispatch()

  useEffect(() => {
    /**
     * Perform database health check on app startup
     */
    const initializeDatabase = async () => {
      dispatch(setLoading('Connecting to database...'))
      
      try {
        const databaseService = DatabaseService.getInstance()
        const healthResult = await databaseService.performHealthCheck()
        
        switch (healthResult.status) {
          case 'success':
            dispatch(setSuccess(healthResult.message))
            // Start periodic health monitoring
            databaseService.startHealthMonitoring(30000, (result) => {
              // Only update status on significant changes to avoid spam
              if (result.status === 'error') {
                dispatch(setError({
                  message: result.message,
                  details: result.details
                }))
              } else if (result.status === 'warning') {
                dispatch(setWarning({
                  message: result.message, 
                  details: result.details
                }))
              }
            })
            break
            
          case 'warning':
            dispatch(setWarning({
              message: healthResult.message,
              details: healthResult.details
            }))
            break
            
          case 'error':
          default:
            dispatch(setError({
              message: healthResult.message,
              details: healthResult.details
            }))
            break
        }
        
      } catch (error) {
        dispatch(setError({
          message: 'Database initialization failed',
          details: error.message
        }))
      }
    }

    // Run database check on app startup
    initializeDatabase()

    // Cleanup function
    return () => {
      const databaseService = DatabaseService.getInstance()
      databaseService.stopHealthMonitoring()
    }
  }, [dispatch])

  return <MainLayout />
}

/**
 * Main App component
 */
function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppContent />
      </ThemeProvider>
    </Provider>
  )
}

export default App