# StatusIndicator Component

A professional, unobtrusive status feedback component for the Graph2 ITM System.

## Overview

The StatusIndicator provides visual feedback for system operations through an animated status dot and accompanying text message, positioned in the application footer for minimal workflow interruption.

## Features

- **🎨 Theme-Aware**: Full Material UI theme integration with `theme.palette` colors
- **✨ Animated**: Glowing effects and status-specific animations
- **🔄 Redux-Connected**: Automatic state management through Redux store
- **📱 Responsive**: Adapts to different screen sizes and themes
- **🛠️ Configurable**: Customizable messages, colors, and timing
- **♿ Accessible**: ARIA-compliant with keyboard navigation support

## File Structure

```
src/ui/components/status/
├── StatusIndicator.jsx           # Main component
├── StatusIndicatorInterface.js   # API documentation & types
└── README.md                     # This file

src/ui/styles/
└── StatusIndicatorStyles.js      # Theme-aware styling
```

## Usage

### Basic Usage

The component automatically connects to Redux state and requires no props:

```jsx
import StatusIndicator from '../components/status/StatusIndicator.jsx'

// Simply include in your layout
<StatusIndicator />
```

### Triggering Status Updates

Use Redux actions to control the status:

```jsx
import { useDispatch } from 'react-redux'
import { 
  setLoading, 
  showTemporarySuccess, 
  setError,
  executeWithStatus 
} from '../store/statusSlice.js'

const MyComponent = () => {
  const dispatch = useDispatch()

  // Loading state
  const handleConnect = () => {
    dispatch(setLoading('Connecting to database...'))
  }

  // Success with auto-clear
  const handleSaveSuccess = () => {
    dispatch(showTemporarySuccess('Graph saved successfully'))
  }

  // Error with details
  const handleError = () => {
    dispatch(setError({ 
      message: 'Connection failed', 
      details: 'Timeout after 5 seconds' 
    }))
  }

  // Async operation with status
  const handleAsyncOperation = () => {
    dispatch(executeWithStatus(
      'Processing data...',
      () => someAsyncOperation(),
      'Processing complete'
    ))
  }
}
```

## Status Types

### Idle/Ready
- **Color**: `theme.palette.success.main` (Green)
- **Animation**: Gentle glow pulse (3s cycle)
- **Usage**: System ready for operations
- **Message**: "Ready" or custom idle message

### Loading  
- **Color**: `theme.palette.primary.main` (Blue)
- **Animation**: Circular progress spinner
- **Usage**: Operations in progress
- **Message**: Operation-specific loading text

### Success
- **Color**: `theme.palette.success.main` (Green)  
- **Animation**: Triple success pulse then glow
- **Usage**: Successful operation completion
- **Auto-clear**: 3 seconds (configurable)

### Warning
- **Color**: `theme.palette.warning.main` (Orange)
- **Animation**: Moderate warning pulse (2s cycle)
- **Usage**: Non-critical advisories
- **Auto-clear**: 5 seconds (configurable)

### Error
- **Color**: `theme.palette.error.main` (Red)
- **Animation**: Urgent error pulse (1s cycle)  
- **Usage**: Operation failures or critical issues
- **Auto-clear**: 8 seconds (configurable)

## Theming Support

The component fully supports Material UI theming:

```jsx
// Colors automatically adapt to theme
const theme = createTheme({
  palette: {
    mode: 'dark', // Component adapts automatically
    success: { main: '#00E676' }, // Custom success color
    error: { main: '#FF1744' }    // Custom error color
  }
})
```

### Theme Integration Points

- **Colors**: Uses `theme.palette.[status].main`
- **Spacing**: Uses `theme.spacing()` for consistent layout
- **Typography**: Uses `theme.typography.caption`
- **Animations**: Glowing effects use `alpha()` for proper opacity
- **Shape**: Uses `theme.shape.borderRadius`

## Development Features

### Debug Mode
In development mode, the component shows additional information:

- **Timestamps**: Last update time for debugging
- **Test Buttons**: Actions panel includes status testing controls
- **Console Logging**: Detailed operation feedback

### Testing
The Actions panel (development only) includes buttons to test all status states:
- Loading, Success, Error, Warning, Idle
- Async Operation simulation

## API Reference

See `StatusIndicatorInterface.js` for comprehensive API documentation including:

- Status types and visual states
- Available Redux actions
- Thunk actions for common patterns  
- Usage examples by scenario
- Animation timing configuration

## Examples

### Database Operations
```jsx
// Connection flow
dispatch(setLoading('Connecting to Neo4j...'))
try {
  await connect()
  dispatch(showTemporarySuccess('Connected to database'))
} catch (error) {
  dispatch(setError({ 
    message: 'Connection failed', 
    details: error.message 
  }))
}
```

### Graph Operations
```jsx
// Save with status feedback
dispatch(executeWithStatus(
  'Saving graph to database...',
  () => saveGraph(graphData),
  'Graph saved successfully'
))
```

### Layout Operations
```jsx
// Reset layout with feedback (already integrated)
const resetLayout = () => {
  dispatch(setLoading('Resetting layout...'))
  // ... reset logic
  dispatch(showTemporarySuccess('Layout reset to defaults'))
}
```

## Performance

- **Efficient Re-renders**: Uses `useSelector` with specific selectors
- **Smooth Animations**: CSS-based animations with hardware acceleration
- **Theme Caching**: Styles are computed once per theme change
- **Memory Efficient**: Auto-cleanup of timeouts and animations

## Accessibility

- **ARIA Tooltips**: Detailed information on hover/focus
- **Keyboard Navigation**: Full keyboard support
- **Color Contrast**: Theme-aware colors ensure proper contrast ratios
- **Screen Readers**: Semantic markup with appropriate roles

## Future Enhancements

Potential improvements for future versions:

- **Sound Notifications**: Optional audio feedback for errors
- **Custom Icons**: Status-specific icons alongside color coding
- **Progress Tracking**: Progress bars for long-running operations  
- **Multiple Status**: Queue for multiple simultaneous operations
- **Persistence**: Remember status across page refreshes