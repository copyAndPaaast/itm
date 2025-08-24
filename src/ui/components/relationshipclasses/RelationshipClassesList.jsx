/**
 * RelationshipClassesList - List component for displaying and selecting relationship classes
 * 
 * Automatically loads relationship classes from database and displays them in a selectable list.
 * Clicking a relationship class indicates user wants to create an edge based on that type.
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
import { RelationshipClassService } from '../../../RelationModule/relationshipclass/RelationshipClassService.js'
import { createRelationshipClassesListStyles } from './RelationshipClassesListStyles.js'

const RelationshipClassesList = ({ onRelationshipClassSelect = () => {} }) => {
  const theme = useTheme()
  const styles = createRelationshipClassesListStyles(theme)
  
  // Local state for relationship classes
  const [relationshipClasses, setRelationshipClasses] = useState([])
  const [selectedRelationshipClassId, setSelectedRelationshipClassId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Load relationship classes on component mount
   */
  useEffect(() => {
    const loadRelationshipClasses = async () => {
      console.log('📦 Loading relationship classes on RelationshipClassesList mount')
      setIsLoading(true)
      setError(null)
      
      try {
        const relationshipClassService = new RelationshipClassService()
        const classes = await relationshipClassService.getAllRelationshipClasses()
        console.log('✅ Loaded relationship classes:', classes.length)
        setRelationshipClasses(classes)
        
        // Auto-select first relationship class to provide active type for edge creation
        if (classes && classes.length > 0) {
          const firstClass = classes[0]
          console.log('🔗 Auto-selecting first RelationshipClass:', firstClass.relationshipType)
          setSelectedRelationshipClassId(firstClass.classId)
          onRelationshipClassSelect(firstClass)
        }
      } catch (err) {
        console.error('❌ Failed to load relationship classes:', err.message)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadRelationshipClasses()
  }, [])

  /**
   * Handle relationship class selection
   */
  const handleRelationshipClassClick = (relationshipClass) => {
    console.log('🎯 RelationshipClass selected for edge creation:', relationshipClass.relationshipType)
    setSelectedRelationshipClassId(relationshipClass.classId)
    onRelationshipClassSelect(relationshipClass)
  }

  /**
   * Count required and optional properties
   */
  const getPropertyCounts = (relationshipClass) => {
    const requiredCount = relationshipClass.requiredProperties?.length || 0
    const totalCount = Object.keys(relationshipClass.propertySchema || {}).length
    return { required: requiredCount, total: totalCount }
  }

  /**
   * Get connection types summary
   */
  const getConnectionSummary = (relationshipClass) => {
    const fromTypes = relationshipClass.allowedFromTypes || ['Asset']
    const toTypes = relationshipClass.allowedToTypes || ['Asset']
    
    // If both are just ['Asset'], show simplified version
    if (fromTypes.length === 1 && toTypes.length === 1 && 
        fromTypes[0] === 'Asset' && toTypes[0] === 'Asset') {
      return 'Any→Any'
    }
    
    return `${fromTypes.join('|')}→${toTypes.join('|')}`
  }

  /**
   * Render loading state
   */
  if (isLoading) {
    return (
      <Box sx={styles.emptyContainer}>
        <Typography variant="body2" color="text.secondary">
          Loading relationship classes...
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
          Error loading relationship classes
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
  if (!relationshipClasses || relationshipClasses.length === 0) {
    return (
      <Box sx={styles.emptyContainer}>
        <Typography variant="body2" color="text.secondary">
          No relationship classes found
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
        {relationshipClasses.map((relationshipClass) => {
          const isSelected = selectedRelationshipClassId === relationshipClass.classId
          const propertyCounts = getPropertyCounts(relationshipClass)
          const connectionSummary = getConnectionSummary(relationshipClass)
          
          return (
            <ListItem 
              key={relationshipClass.classId} 
              disablePadding
              sx={styles.listItem}
            >
              <ListItemButton
                selected={isSelected}
                onClick={() => handleRelationshipClassClick(relationshipClass)}
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
                          ...styles.relationshipType,
                          ...(isSelected && styles.activeRelationshipType)
                        }}
                      >
                        {relationshipClass.relationshipType}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        component="span"
                        sx={{
                          ...styles.connectionSummary,
                          ...(isSelected && styles.activeConnectionSummary)
                        }}
                      >
                        [{connectionSummary}]
                      </Typography>
                      <Typography 
                        variant="body2" 
                        component="span"
                        sx={{
                          ...styles.propertyInfo,
                          ...(isSelected && styles.activePropertyInfo)
                        }}
                      >
                        {propertyCounts.total}props
                      </Typography>
                      {isSelected && (
                        <Chip 
                          label="Selected" 
                          size="small" 
                          color="secondary" 
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

export default RelationshipClassesList