/**
 * AssetClassesList - List component for displaying and selecting asset classes
 * 
 * Automatically loads asset classes from database and displays them in a selectable list.
 * Clicking an asset class indicates user wants to create a node based on that type.
 */

import React, { useEffect, useState } from 'react'
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Box,
  Chip
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { AssetClassService } from '../../../NodeModule/assetclass/AssetClassService.js'
import { createAssetClassesListStyles } from './AssetClassesListStyles.js'

const AssetClassesList = ({ onAssetClassSelect = () => {} }) => {
  const theme = useTheme()
  const styles = createAssetClassesListStyles(theme)
  
  // Local state for asset classes
  const [assetClasses, setAssetClasses] = useState([])
  const [selectedAssetClassId, setSelectedAssetClassId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Load asset classes on component mount
   */
  useEffect(() => {
    const loadAssetClasses = async () => {
      console.log('📦 Loading asset classes on AssetClassesList mount')
      setIsLoading(true)
      setError(null)
      
      try {
        const assetClassService = new AssetClassService()
        const classes = await assetClassService.getAllAssetClasses()
        console.log('✅ Loaded asset classes:', classes.length)
        setAssetClasses(classes)
        
        // Auto-select first asset class to provide active type for node creation
        if (classes && classes.length > 0) {
          const firstClass = classes[0]
          console.log('🎯 Auto-selecting first AssetClass:', firstClass.className)
          setSelectedAssetClassId(firstClass.classId)
          onAssetClassSelect(firstClass)
        }
      } catch (err) {
        console.error('❌ Failed to load asset classes:', err.message)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadAssetClasses()
  }, [])

  /**
   * Handle asset class selection
   */
  const handleAssetClassClick = (assetClass) => {
    console.log('🎯 AssetClass selected for node creation:', assetClass.className)
    setSelectedAssetClassId(assetClass.classId)
    onAssetClassSelect(assetClass)
  }

  /**
   * Count required and optional properties
   */
  const getPropertyCounts = (assetClass) => {
    const requiredCount = assetClass.requiredProperties?.length || 0
    const totalCount = Object.keys(assetClass.propertySchema || {}).length
    const optionalCount = Math.max(0, totalCount - requiredCount)
    return { required: requiredCount, optional: optionalCount, total: totalCount }
  }

  /**
   * Render loading state
   */
  if (isLoading) {
    return (
      <Box sx={styles.emptyContainer}>
        <Typography variant="body2" color="text.secondary">
          Loading asset classes...
        </Typography>
      </Box>
    )
  }

  /**
   * Render error state
   */
  if (error) {
    return (
      <Box sx={styles.emptyContainer}>
        <Typography variant="body2" color="error">
          Error loading asset classes
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {error}
        </Typography>
      </Box>
    )
  }

  /**
   * Render empty state
   */
  if (!assetClasses || assetClasses.length === 0) {
    return (
      <Box sx={styles.emptyContainer}>
        <Typography variant="body2" color="text.secondary">
          No asset classes found
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Default classes should be created automatically
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={styles.listContainer}>
      <List sx={styles.list} disablePadding>
        {assetClasses.map((assetClass) => {
          const isSelected = selectedAssetClassId === assetClass.classId
          const propertyCounts = getPropertyCounts(assetClass)
          
          return (
            <ListItem 
              key={assetClass.classId} 
              disablePadding
              sx={styles.listItem}
            >
              <ListItemButton
                selected={isSelected}
                onClick={() => handleAssetClassClick(assetClass)}
                sx={{
                  ...styles.listItemButton,
                  ...(isSelected && styles.activeListItemButton)
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={styles.compactRowContainer}>
                      <Typography 
                        variant="body2" 
                        component="span"
                        sx={{
                          ...styles.className,
                          ...(isSelected && styles.activeClassName)
                        }}
                      >
                        {assetClass.className}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        component="span"
                        sx={{
                          ...styles.propertyInfo,
                          ...(isSelected && styles.activePropertyInfo)
                        }}
                      >
                        [{propertyCounts.required}req/{propertyCounts.total}total]
                      </Typography>
                      <Typography 
                        variant="body2" 
                        component="span"
                        sx={{
                          ...styles.createdBy,
                          ...(isSelected && styles.activeCreatedBy)
                        }}
                      >
                        {assetClass.createdBy}
                      </Typography>
                      {isSelected && (
                        <Chip 
                          label="Selected" 
                          size="small" 
                          color="primary" 
                          sx={styles.activeChip}
                        />
                      )}
                    </Box>
                  }
                />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>
    </Box>
  )
}

export default AssetClassesList