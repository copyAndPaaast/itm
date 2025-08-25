import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Typography, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Slider, 
  Paper, 
  Grid, 
  Divider,
  FormHelperText,
  Button,
  IconButton,
  Chip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import RefreshIcon from '@mui/icons-material/Refresh';
import { createStylePropertiesFormStyles } from './StylePropertiesFormStyles';

// Cytoscape node style properties with categories
const NODE_STYLE_CATEGORIES = {
  basic: {
    title: 'Basic Properties',
    properties: {
      'background-color': { 
        type: 'color', 
        default: '#757575', 
        label: 'Background Color',
        description: 'Fill color of the node'
      },
      'border-color': { 
        type: 'color', 
        default: '#424242', 
        label: 'Border Color',
        description: 'Color of the node border'
      },
      'width': { 
        type: 'number', 
        default: 60, 
        min: 10, 
        max: 300, 
        label: 'Width',
        description: 'Width of the node in pixels'
      },
      'height': { 
        type: 'number', 
        default: 60, 
        min: 10, 
        max: 300, 
        label: 'Height',
        description: 'Height of the node in pixels'
      }
    }
  },
  shape: {
    title: 'Shape & Appearance',
    properties: {
      'shape': { 
        type: 'select', 
        default: 'ellipse',
        options: [
          'ellipse', 'triangle', 'round-triangle', 'rectangle', 'round-rectangle', 
          'bottom-round-rectangle', 'cut-rectangle', 'barrel', 'rhomboid', 'diamond', 
          'round-diamond', 'pentagon', 'round-pentagon', 'hexagon', 'round-hexagon', 
          'concave-hexagon', 'heptagon', 'round-heptagon', 'octagon', 'round-octagon', 
          'star', 'tag', 'round-tag', 'vee'
        ],
        label: 'Shape',
        description: 'Shape of the node'
      },
      'background-opacity': { 
        type: 'slider', 
        default: 1, 
        min: 0, 
        max: 1, 
        step: 0.1, 
        label: 'Background Opacity',
        description: 'Transparency of the background'
      },
      'border-width': { 
        type: 'number', 
        default: 0, 
        min: 0, 
        max: 20, 
        label: 'Border Width',
        description: 'Thickness of the border in pixels'
      },
      'border-style': { 
        type: 'select', 
        default: 'solid',
        options: ['solid', 'dotted', 'dashed', 'double'],
        label: 'Border Style',
        description: 'Style of the border line'
      },
      'border-opacity': { 
        type: 'slider', 
        default: 1, 
        min: 0, 
        max: 1, 
        step: 0.1, 
        label: 'Border Opacity',
        description: 'Transparency of the border'
      }
    }
  },
  effects: {
    title: 'Visual Effects',
    properties: {
      'opacity': { 
        type: 'slider', 
        default: 1, 
        min: 0, 
        max: 1, 
        step: 0.1, 
        label: 'Node Opacity',
        description: 'Overall transparency of the node'
      },
      'shadow-blur': { 
        type: 'number', 
        default: 0, 
        min: 0, 
        max: 20, 
        label: 'Shadow Blur',
        description: 'Blur radius of the shadow effect'
      },
      'shadow-color': { 
        type: 'color', 
        default: '#000000', 
        label: 'Shadow Color',
        description: 'Color of the shadow'
      },
      'shadow-opacity': { 
        type: 'slider', 
        default: 0, 
        min: 0, 
        max: 1, 
        step: 0.1, 
        label: 'Shadow Opacity',
        description: 'Transparency of the shadow'
      },
      'shadow-offset-x': { 
        type: 'number', 
        default: 0, 
        min: -20, 
        max: 20, 
        label: 'Shadow Offset X',
        description: 'Horizontal offset of the shadow'
      },
      'shadow-offset-y': { 
        type: 'number', 
        default: 0, 
        min: -20, 
        max: 20, 
        label: 'Shadow Offset Y',
        description: 'Vertical offset of the shadow'
      }
    }
  }
};

// Cytoscape edge/relationship style properties with categories
const RELATIONSHIP_STYLE_CATEGORIES = {
  line: {
    title: 'Line Properties',
    properties: {
      'line-color': { 
        type: 'color', 
        default: '#757575', 
        label: 'Line Color',
        description: 'Color of the relationship line'
      },
      'width': { 
        type: 'number', 
        default: 2, 
        min: 1, 
        max: 20, 
        label: 'Line Width',
        description: 'Thickness of the relationship line in pixels'
      },
      'line-style': { 
        type: 'select', 
        default: 'solid',
        options: ['solid', 'dotted', 'dashed'],
        label: 'Line Style',
        description: 'Style of the relationship line'
      },
      'curve-style': { 
        type: 'select', 
        default: 'bezier',
        options: ['straight', 'bezier', 'unbundled-bezier', 'segments', 'taxi'],
        label: 'Curve Style',
        description: 'How the relationship line curves between nodes'
      },
      'line-opacity': { 
        type: 'slider', 
        default: 1, 
        min: 0, 
        max: 1, 
        step: 0.1, 
        label: 'Line Opacity',
        description: 'Transparency of the relationship line'
      }
    }
  },
  arrow: {
    title: 'Arrow Properties',
    properties: {
      'target-arrow-shape': { 
        type: 'select', 
        default: 'triangle',
        options: [
          'triangle', 'triangle-tee', 'circle-triangle', 'triangle-cross', 
          'triangle-backcurve', 'vee', 'tee', 'square', 'circle', 'diamond', 
          'chevron', 'none'
        ],
        label: 'Target Arrow Shape',
        description: 'Shape of the arrow pointing to the target node'
      },
      'source-arrow-shape': { 
        type: 'select', 
        default: 'none',
        options: [
          'none', 'triangle', 'triangle-tee', 'circle-triangle', 'triangle-cross', 
          'triangle-backcurve', 'vee', 'tee', 'square', 'circle', 'diamond', 
          'chevron'
        ],
        label: 'Source Arrow Shape',
        description: 'Shape of the arrow pointing from the source node'
      },
      'target-arrow-color': { 
        type: 'color', 
        default: '#757575', 
        label: 'Target Arrow Color',
        description: 'Color of the target arrow'
      },
      'source-arrow-color': { 
        type: 'color', 
        default: '#757575', 
        label: 'Source Arrow Color',
        description: 'Color of the source arrow'
      },
      'arrow-scale': { 
        type: 'slider', 
        default: 1, 
        min: 0.5, 
        max: 3, 
        step: 0.1, 
        label: 'Arrow Scale',
        description: 'Size multiplier for arrows'
      }
    }
  },
  effects: {
    title: 'Visual Effects',
    properties: {
      'opacity': { 
        type: 'slider', 
        default: 1, 
        min: 0, 
        max: 1, 
        step: 0.1, 
        label: 'Overall Opacity',
        description: 'Overall transparency of the relationship'
      },
      'z-index': { 
        type: 'number', 
        default: 0, 
        min: -100, 
        max: 100, 
        label: 'Z-Index',
        description: 'Layer order (higher values appear on top)'
      },
      'overlay-opacity': { 
        type: 'slider', 
        default: 0, 
        min: 0, 
        max: 1, 
        step: 0.1, 
        label: 'Overlay Opacity',
        description: 'Transparency of overlay effects'
      },
      'underlay-opacity': { 
        type: 'slider', 
        default: 0, 
        min: 0, 
        max: 1, 
        step: 0.1, 
        label: 'Underlay Opacity',
        description: 'Transparency of underlay effects'
      }
    }
  }
};

const StylePropertiesForm = ({ styleProperties = {}, onStyleChange, type = 'asset' }) => {
  const theme = useTheme();
  const styles = createStylePropertiesFormStyles(theme);
  const [currentStyles, setCurrentStyles] = useState({});

  // Initialize form with default values or provided values
  useEffect(() => {
    const initialStyles = {};
    const categories = type === 'asset' ? NODE_STYLE_CATEGORIES : RELATIONSHIP_STYLE_CATEGORIES;
    
    // Populate with defaults first
    Object.values(categories).forEach(category => {
      Object.entries(category.properties).forEach(([property, config]) => {
        initialStyles[property] = config.default;
      });
    });

    // Override with provided styleProperties
    Object.keys(initialStyles).forEach(property => {
      if (styleProperties[property] !== undefined) {
        initialStyles[property] = styleProperties[property];
      }
    });

    setCurrentStyles(initialStyles);
  }, [styleProperties, type]);

  const handleStyleChange = (property, value) => {
    const updatedStyles = { ...currentStyles, [property]: value };
    setCurrentStyles(updatedStyles);
    onStyleChange(updatedStyles);
  };

  const resetToDefaults = () => {
    const defaultStyles = {};
    const categories = type === 'asset' ? NODE_STYLE_CATEGORIES : RELATIONSHIP_STYLE_CATEGORIES;
    
    Object.values(categories).forEach(category => {
      Object.entries(category.properties).forEach(([property, config]) => {
        defaultStyles[property] = config.default;
      });
    });
    setCurrentStyles(defaultStyles);
    onStyleChange(defaultStyles);
  };

  const renderFormControl = (property, config) => {
    const value = currentStyles[property] ?? config.default;

    switch (config.type) {
      case 'color':
        return (
          <Box sx={styles.colorPickerContainer}>
            <TextField
              label={config.label}
              value={value}
              onChange={(e) => handleStyleChange(property, e.target.value)}
              sx={styles.colorInput}
              InputProps={{
                endAdornment: (
                  <Box 
                    sx={{
                      ...styles.colorPreview,
                      backgroundColor: value
                    }}
                  />
                )
              }}
            />
            <FormHelperText>{config.description}</FormHelperText>
          </Box>
        );

      case 'number':
        return (
          <Box>
            <TextField
              type="number"
              label={config.label}
              value={value}
              onChange={(e) => handleStyleChange(property, Number(e.target.value))}
              inputProps={{ 
                min: config.min, 
                max: config.max,
                step: config.step || 1
              }}
              fullWidth
            />
            <FormHelperText>{config.description}</FormHelperText>
          </Box>
        );

      case 'slider':
        return (
          <Box>
            <Typography variant="body2" sx={styles.sliderLabel}>
              {config.label}: {value}
            </Typography>
            <Slider
              value={value}
              onChange={(e, newValue) => handleStyleChange(property, newValue)}
              min={config.min}
              max={config.max}
              step={config.step}
              marks
              sx={styles.slider}
            />
            <FormHelperText>{config.description}</FormHelperText>
          </Box>
        );

      case 'select':
        return (
          <Box>
            <FormControl fullWidth>
              <InputLabel>{config.label}</InputLabel>
              <Select
                value={value}
                onChange={(e) => handleStyleChange(property, e.target.value)}
                label={config.label}
              >
                {config.options.map(option => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormHelperText>{config.description}</FormHelperText>
          </Box>
        );

      default:
        return (
          <Box>
            <TextField
              label={config.label}
              value={value}
              onChange={(e) => handleStyleChange(property, e.target.value)}
              fullWidth
            />
            <FormHelperText>{config.description}</FormHelperText>
          </Box>
        );
    }
  };

  return (
    <Box sx={styles.container}>
      <Box sx={styles.header}>
        <Typography variant="h6">
          {type === 'asset' ? 'Node' : 'Relationship'} Style Properties
        </Typography>
        <Button 
          startIcon={<RefreshIcon />} 
          onClick={resetToDefaults}
          size="small"
          variant="outlined"
        >
          Reset to Defaults
        </Button>
      </Box>
      
      <Divider sx={styles.divider} />

      <Box sx={styles.mainLayout}>
        {/* Properties Column */}
        <Box sx={styles.propertiesColumn}>
          {Object.entries(type === 'asset' ? NODE_STYLE_CATEGORIES : RELATIONSHIP_STYLE_CATEGORIES).map(([categoryKey, category]) => (
            <Paper key={categoryKey} sx={styles.categoryPaper}>
              <Typography variant="subtitle1" sx={styles.categoryTitle}>
                {category.title}
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(category.properties).map(([property, config]) => (
                  <Grid item xs={12} key={property}>
                    <Box sx={styles.formControl}>
                      {renderFormControl(property, config)}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          ))}
        </Box>

        {/* Preview Column - Sticky */}
        <Box sx={styles.previewColumn}>
          <Paper sx={styles.previewPaper}>
            <Typography variant="subtitle1" sx={styles.categoryTitle}>
              Style Preview
            </Typography>
            <Box sx={styles.previewContainer}>
              {type === 'asset' ? (
                // Node Preview
                <Chip 
                  label="Sample Node" 
                  sx={{
                    ...styles.previewNode,
                    backgroundColor: currentStyles['background-color'],
                    borderColor: currentStyles['border-color'],
                    borderWidth: `${currentStyles['border-width']}px`,
                    borderStyle: currentStyles['border-style'],
                    opacity: currentStyles['opacity'],
                    boxShadow: currentStyles['shadow-blur'] > 0 ? 
                      `${currentStyles['shadow-offset-x']}px ${currentStyles['shadow-offset-y']}px ${currentStyles['shadow-blur']}px rgba(0,0,0,${currentStyles['shadow-opacity']})` : 
                      'none'
                  }}
                />
              ) : (
                // Relationship Preview
                <Box sx={styles.relationshipPreview}>
                  <Box sx={styles.previewNode}>A</Box>
                  <Box 
                    sx={{
                      ...styles.previewEdge,
                      borderTopColor: currentStyles['line-color'],
                      borderTopWidth: `${currentStyles['width']}px`,
                      borderTopStyle: currentStyles['line-style'],
                      opacity: currentStyles['opacity'] * (currentStyles['line-opacity'] || 1),
                      '&::after': {
                        borderLeftColor: currentStyles['target-arrow-color'] || currentStyles['line-color'],
                        transform: `scale(${currentStyles['arrow-scale'] || 1})`,
                        display: currentStyles['target-arrow-shape'] === 'none' ? 'none' : 'block'
                      }
                    }}
                  />
                  <Box sx={styles.previewNode}>B</Box>
                </Box>
              )}
              <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', mt: 1 }}>
                Live preview of {type === 'asset' ? 'node' : 'relationship'} styling
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default StylePropertiesForm;