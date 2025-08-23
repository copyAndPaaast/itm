/**
 * StatusIndicator Styles - Material UI themed styles for status feedback
 * 
 * Provides theme-aware styling for status indicators with proper color palette usage
 * and responsive animations that adapt to light/dark themes.
 */

import { alpha } from '@mui/material/styles'

/**
 * Status color mapping using Material UI theme palette
 * This ensures proper theming support and accessibility compliance
 */
export const getStatusColors = (theme) => ({
  idle: theme.palette.success.main,      // Green - system ready
  loading: theme.palette.primary.main,   // Blue - operation in progress  
  success: theme.palette.success.main,   // Green - operation succeeded
  warning: theme.palette.warning.main,   // Orange - advisory message
  error: theme.palette.error.main        // Red - operation failed
})

/**
 * Status indicator sizing configuration
 */
export const StatusSizing = {
  dot: {
    size: 20,           // Main status dot size
    thickness: 3        // Loading spinner thickness
  },
  glow: {
    blur: [10, 20, 30], // Multiple shadow blur levels
    spread: [0, 0, 0],  // Shadow spread
    opacity: [0.4, 0.2, 0.1] // Opacity levels for glow layers
  }
}

/**
 * Animation timing configuration
 */
export const StatusAnimations = {
  glow: {
    duration: '3s',
    timing: 'ease-in-out',
    iteration: 'infinite'
  },
  success: {
    duration: '1.5s',
    timing: 'ease-in-out', 
    count: 3,
    delay: '4.5s'
  },
  error: {
    duration: '1s',
    timing: 'ease-in-out',
    iteration: 'infinite'
  },
  warning: {
    duration: '2s',
    timing: 'ease-in-out', 
    iteration: 'infinite'
  },
  transitions: {
    all: '0.3s ease'
  }
}

/**
 * Generate glowing box-shadow with theme colors
 */
const createGlowShadow = (color, theme, intensity = 'normal') => {
  const { blur, opacity } = StatusSizing.glow
  
  const intensityMultiplier = {
    subtle: 0.5,
    normal: 1,
    strong: 1.5,
    urgent: 2
  }[intensity] || 1

  return blur.map((blurValue, index) => 
    `0 0 ${blurValue}px ${alpha(color, opacity[index] * intensityMultiplier)}`
  ).join(', ')
}

/**
 * Create theme-aware keyframe animations
 */
export const createStatusKeyframes = (theme) => {
  const colors = getStatusColors(theme)
  
  return {
    '@keyframes statusGlow': {
      '0%, 100%': {
        transform: 'scale(1)',
        boxShadow: createGlowShadow(colors.idle, theme, 'normal')
      },
      '50%': {
        transform: 'scale(1.05)',
        boxShadow: createGlowShadow(colors.idle, theme, 'strong')
      }
    },
    
    '@keyframes successPulse': {
      '0%': {
        transform: 'scale(1)',
        boxShadow: createGlowShadow(colors.success, theme, 'normal')
      },
      '50%': {
        transform: 'scale(1.2)',
        boxShadow: createGlowShadow(colors.success, theme, 'urgent')
      },
      '100%': {
        transform: 'scale(1)',
        boxShadow: createGlowShadow(colors.success, theme, 'normal')
      }
    },
    
    '@keyframes errorPulse': {
      '0%, 100%': {
        transform: 'scale(1)',
        boxShadow: createGlowShadow(colors.error, theme, 'strong')
      },
      '50%': {
        transform: 'scale(1.1)',
        boxShadow: createGlowShadow(colors.error, theme, 'urgent')
      }
    },
    
    '@keyframes warningPulse': {
      '0%, 100%': {
        transform: 'scale(1)',
        boxShadow: createGlowShadow(colors.warning, theme, 'normal')
      },
      '50%': {
        transform: 'scale(1.08)',
        boxShadow: createGlowShadow(colors.warning, theme, 'strong')
      }
    }
  }
}

/**
 * Main status indicator styles factory
 * Creates theme-aware styles for the status indicator component
 */
export const createStatusIndicatorStyles = (theme) => {
  const colors = getStatusColors(theme)
  const keyframes = createStatusKeyframes(theme)
  
  return {
    // Container styles
    container: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1.5),
      padding: theme.spacing(0.75, 1.5),
      borderRadius: theme.shape.borderRadius,
      transition: StatusAnimations.transitions.all,
      cursor: 'default',
      height: 40, // Fixed height to prevent footer expansion
      minHeight: 40,
      maxHeight: 40,
      '&.has-details': {
        cursor: 'help',
        '&:hover': {
          backgroundColor: theme.palette.action.hover
        }
      }
    },

    // Status dot styles
    statusDot: {
      width: StatusSizing.dot.size,
      height: StatusSizing.dot.size,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      transition: StatusAnimations.transitions.all,
      
      // Base glow effect
      boxShadow: createGlowShadow(colors.idle, theme, 'normal'),
      
      // Status-specific styles
      '&.idle': {
        backgroundColor: colors.idle,
        animation: `statusGlow ${StatusAnimations.glow.duration} ${StatusAnimations.glow.timing} ${StatusAnimations.glow.iteration}`,
        boxShadow: createGlowShadow(colors.idle, theme, 'normal')
      },
      
      '&.success': {
        backgroundColor: colors.success,
        animation: `successPulse ${StatusAnimations.success.duration} ${StatusAnimations.success.timing} ${StatusAnimations.success.count}, statusGlow ${StatusAnimations.glow.duration} ${StatusAnimations.glow.timing} ${StatusAnimations.glow.iteration} ${StatusAnimations.success.delay}`,
        boxShadow: createGlowShadow(colors.success, theme, 'normal')
      },
      
      '&.error': {
        backgroundColor: colors.error,
        animation: `errorPulse ${StatusAnimations.error.duration} ${StatusAnimations.error.timing} ${StatusAnimations.error.iteration}`,
        boxShadow: createGlowShadow(colors.error, theme, 'strong')
      },
      
      '&.warning': {
        backgroundColor: colors.warning,
        animation: `warningPulse ${StatusAnimations.warning.duration} ${StatusAnimations.warning.timing} ${StatusAnimations.warning.iteration}`,
        boxShadow: createGlowShadow(colors.warning, theme, 'normal')
      },
      
      '&.loading': {
        // Loading spinner handled by CircularProgress component
        backgroundColor: 'transparent',
        boxShadow: 'none'
      }
    },

    // Loading spinner styles
    loadingSpinner: {
      color: colors.loading,
      '& .MuiCircularProgress-circle': {
        strokeLinecap: 'round'
      }
    },

    // Status message text styles
    statusMessage: {
      color: theme.palette.text.secondary,
      fontWeight: 500,
      fontSize: theme.typography.caption.fontSize,
      lineHeight: 1,
      transition: StatusAnimations.transitions.all,
      
      // Status-specific text colors
      '&.error': {
        color: colors.error
      },
      '&.success': {
        color: colors.success
      },
      '&.warning': {
        color: colors.warning
      }
    },

    // Development timestamp styles
    debugTimestamp: {
      color: theme.palette.text.disabled,
      fontSize: '0.7rem',
      fontFamily: theme.typography.fontFamily === 'monospace' ? theme.typography.fontFamily : 'monospace'
    },

    // Add keyframes to the styles object
    ...keyframes
  }
}

/**
 * Tooltip styles for status details
 */
export const createStatusTooltipStyles = (theme) => ({
  tooltip: {
    maxWidth: 300,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: 1.4,
    whiteSpace: 'pre-line' // Allow line breaks in tooltip content
  }
})