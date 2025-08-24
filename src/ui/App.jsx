/**
 * Main ITM React Application
 * Provides Redux store and Material UI theming for the entire app
 * Performs database health check on startup and manages connection status
 */

import React, { useEffect } from 'react'
import { Provider, useDispatch } from 'react-redux'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

import store from '../store/index.js'
import MainLayout from './layouts/MainLayout.jsx'
import GraphViewerDemo from './components/viewer/GraphViewerDemo.jsx'
import { DatabaseService } from './services/DatabaseService.js'
import { setLoading, setSuccess, setError, setWarning, setIdle } from '../store/statusSlice.js'
import { OverlayProvider } from './components/overlay/OverlayProvider.jsx'

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
     * Perform database connectivity check and initialize default classes on app startup
     */
    const initializeDatabase = async () => {
      dispatch(setLoading('Connecting to database...'))
      
      try {
        const databaseService = DatabaseService.getInstance()
        const healthResult = await databaseService.performHealthCheck()
        
        // If connection is successful, ensure default classes exist
        if (healthResult.status === 'success') {
          dispatch(setLoading('Initializing default classes...'))
          console.log('🚀 Database connection successful, starting default classes initialization...')
          
          try {
            console.log('📞 Calling databaseService.ensureDefaultClasses()...')
            await databaseService.ensureDefaultClasses()
            console.log('✅ Default classes initialization completed successfully')
            
            // Show success result
            dispatch(setSuccess('Database ready with default classes'))
            setTimeout(() => dispatch(setIdle('Ready')), 2000)
            
          } catch (classError) {
            // Default class creation failed - show warning but continue
            console.error('❌ Default class creation failed in App.jsx:')
            console.error('   Error type:', classError.constructor.name)
            console.error('   Error message:', classError.message)
            console.error('   Stack trace:', classError.stack)
            
            dispatch(setWarning({
              message: 'Database connected but default class creation failed',
              details: classError.message
            }))
          }
        } else {
          // Handle connection issues
          switch (healthResult.status) {
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
        }
        
      } catch (error) {
        dispatch(setError({
          message: 'Database initialization failed',
          details: error.message
        }))
      }
    }

    // Run database check once on app startup
    initializeDatabase()
  }, [dispatch])

  // Simple demo routing - check URL for ?demo parameter
  const isDemoMode = window.location.search.includes('demo')
  
  return (
    <OverlayProvider>
      {isDemoMode ? <GraphViewerDemo /> : <MainLayout />}
    </OverlayProvider>
  )
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